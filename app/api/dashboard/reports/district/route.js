import { NextResponse } from "next/server";
import { auth } from "@/auth";
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import fs from 'fs';
import path from 'path';
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

        const {
            dateFrom,
            dateTo,
            showWorkType,
            showNatureOfWork,
            showTownDetails,
            districts,
            workTypes,
            naturesOfWork
        } = await request.json();

        const fontPath = path.join(process.cwd(), 'public', 'fonts', 'arial.ttf');
        const fontBuffer = fs.readFileSync(fontPath);

        // 1. Build SQL WHERE Clause
        let whereClauses = ["1=1"];
        if (districts?.length > 0) whereClauses.push(`t.district_id IN (${districts.map(id => parseInt(id)).join(',')})`);

        if (showWorkType && workTypes?.length > 0) {
            whereClauses.push(`wr.complaint_subtype_id IN (${workTypes.map(id => parseInt(id)).join(',')})`);
        }

        if (showNatureOfWork && naturesOfWork?.length > 0) {
            const formattedNatures = naturesOfWork.map(val => val === "null" ? "NULL" : `'${val}'`);
            if (formattedNatures.includes("NULL")) {
                const nonNull = formattedNatures.filter(v => v !== "NULL");
                whereClauses.push(nonNull.length > 0
                    ? `(wr.nature_of_work IN (${nonNull.join(',')}) OR wr.nature_of_work IS NULL)`
                    : `wr.nature_of_work IS NULL`);
            } else {
                whereClauses.push(`wr.nature_of_work IN (${formattedNatures.join(',')})`);
            }
        }

        if (dateFrom) whereClauses.push(`wr.request_date >= '${dateFrom}'`);
        if (dateTo) whereClauses.push(`wr.request_date <= '${dateTo}'`);

        const isDetailed = showWorkType || showNatureOfWork;
        const subItemExpression = showWorkType
            ? "cs.subtype_name"
            : "COALESCE(wr.nature_of_work, 'Unspecified')";

        // FIX: Only group by town if showTownDetails is checked
        const sql = `
            SELECT 
                d.title as district_name,
                ${showTownDetails ? 't.town as town_name,' : ''}
                ${isDetailed ? `${subItemExpression} as sub_item,` : ''}
                COUNT(wr.id) as total,
                COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
                COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
                COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending
            FROM work_requests wr
            JOIN town t ON wr.town_id = t.id
            JOIN district d ON t.district_id = d.id
            ${showWorkType ? 'JOIN complaint_subtypes cs ON wr.complaint_subtype_id = cs.id' : ''}
            LEFT JOIN status s ON wr.status_id = s.id
            WHERE ${whereClauses.join(' AND ')}
            GROUP BY d.title ${showTownDetails ? ', t.town' : ''} ${isDetailed ? `, ${subItemExpression}` : ''}
            ORDER BY d.title ${showTownDetails ? ', t.town' : ''} ${isDetailed ? ', sub_item' : ''}
        `;

        const dbResult = await query(sql);
        const rows = dbResult.rows;

        // 2. Build Hierarchy for Grouping
        const hierarchy = rows.reduce((acc, row) => {
            if (!acc[row.district_name]) {
                acc[row.district_name] = { total: 0, completed: 0, active: 0, pending: 0, towns: {}, directDetails: [] };
            }
            const dist = acc[row.district_name];
            dist.total += parseInt(row.total);
            dist.completed += parseInt(row.completed);
            dist.active += parseInt(row.active);
            dist.pending += parseInt(row.pending);

            if (showTownDetails) {
                const townKey = row.town_name;
                if (!dist.towns[townKey]) {
                    dist.towns[townKey] = { total: 0, completed: 0, active: 0, pending: 0, details: [] };
                }
                const town = dist.towns[townKey];
                town.total += parseInt(row.total);
                town.completed += parseInt(row.completed);
                town.active += parseInt(row.active);
                town.pending += parseInt(row.pending);
                if (isDetailed) town.details.push(row);
            } else {
                // FIX: If no towns, push details directly into the district bucket
                if (isDetailed) dist.directDetails.push(row);
            }
            return acc;
        }, {});

        // 3. PDF Generation Setup
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.registerFont('Arial', fontBuffer);
        doc.font('Arial');

        // Header and Title
        doc.fillColor('black').fontSize(14).text('KARACHI WATER & SEWERAGE CORPORATION', 50, 50);
        doc.fontSize(10).text('Works Management Portal', 50, 68);
        const timestamp = new Date().toLocaleString();
        doc.fillColor('#666666').fontSize(8);
        doc.text(`Generated On: ${timestamp}`, 350, 50, { align: 'right', width: 200, oblique: true });
        doc.text('Generated via WMP Portal', 350, 62, { align: 'right', width: 200, oblique: true });
        doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#cccccc').lineWidth(1).stroke();

        doc.moveDown(3);
        doc.fillColor('black').fontSize(12).text('DISTRICT-WISE PERFORMANCE REPORT', 50, 115, { align: 'center' });
        if (dateFrom && dateTo) doc.fontSize(10).text(`Period: ${dateFrom} to ${dateTo}`, { align: 'center' });
        doc.moveDown(0.75);

        // Table Columns
        const subHeaderLabel = showWorkType ? 'Work Type' : (showNatureOfWork ? 'Nature of Work' : '');
        let headers = ['District'];
        if (showTownDetails) headers.push('Town');
        if (isDetailed) headers.push(subHeaderLabel);
        headers.push('Total', 'Completed', 'Active', 'Pending');

        const metricWidth = 50;
        const remainingWidth = 495 - (metricWidth * 4);
        const dynamicColsCount = headers.length - 4;
        const colWidth = remainingWidth / dynamicColsCount;
        const colWidths = [...Array(dynamicColsCount).fill(colWidth), metricWidth, metricWidth, metricWidth, metricWidth];

        const drawRow = (y, items, type = 'normal') => {
            if (y > 750) { doc.addPage(); y = 50; }
            let x = 50;

            // 1. Calculate the maximum height needed for this row based on content
            let maxHeight = 20;
            items.forEach((text, i) => {
                const textHeight = doc.heightOfString(text?.toString() || '', { width: colWidths[i] });
                if (textHeight + 10 > maxHeight) maxHeight = textHeight + 10; // Adding small padding
            });

            if (type === 'header') {
                doc.fillColor('#1e3a8a').rect(50, y - 5, 495, maxHeight).fill();
                doc.fillColor('white').fontSize(9);
            } else if (type === 'dist_highlight') {
                doc.fillColor('#e2e8f0').rect(50, y - 5, 495, maxHeight).fill();
                doc.fillColor('#1e3a8a').fontSize(9);
            } else if (type === 'town_highlight') {
                doc.fillColor('#c9f5ce').rect(50, y - 5, 495, maxHeight).fill();
                doc.fillColor('#1a9c2a').fontSize(8.5);
            } else if (type === 'grand_total') {
                doc.fillColor('black').rect(50, y - 5, 495, maxHeight).fill();
                doc.fillColor('white').fontSize(10);
            } else {
                doc.fillColor('black').fontSize(8);
            }

            items.forEach((text, i) => {
                doc.text(text?.toString() || '', x, y, {
                    width: colWidths[i],
                    align: i < dynamicColsCount ? 'left' : 'center'
                });
                x += colWidths[i];
            });

            // Return the actual bottom position of this row
            return y + maxHeight;
        };

        let currentY = 160;
        currentY = drawRow(currentY, headers, 'header') + 5;

        let grandTotal = { t: 0, c: 0, a: 0, p: 0 };

        Object.entries(hierarchy).forEach(([distName, distData]) => {
            const isJustDistricts = !showTownDetails && !isDetailed;
            const distLabel = [distName.toUpperCase()];
            while (distLabel.length < dynamicColsCount) distLabel.push("");

            currentY = drawRow(currentY, [...distLabel, distData.total, distData.completed, distData.active, distData.pending], isJustDistricts ? 'normal' : 'dist_highlight');

            if (showTownDetails) {
                Object.entries(distData.towns).forEach(([townName, townData]) => {
                    const townLabel = ["", townName];
                    while (townLabel.length < dynamicColsCount) townLabel.push("");
                    currentY = drawRow(currentY, [...townLabel, townData.total, townData.completed, townData.active, townData.pending], isDetailed ? 'town_highlight' : 'normal');

                    if (isDetailed) {
                        townData.details.forEach(detail => {
                            // currentY is updated dynamically here to prevent overlap
                            currentY = drawRow(currentY, ["", "", detail.sub_item, detail.total, detail.completed, detail.active, detail.pending], 'normal');
                        });
                    }
                });
            }
            else if (isDetailed) {
                distData.directDetails.forEach(detail => {
                    currentY = drawRow(currentY, ["", detail.sub_item, detail.total, detail.completed, detail.active, detail.pending], 'normal');
                });
            }

            grandTotal.t += distData.total;
            grandTotal.c += distData.completed;
            grandTotal.a += distData.active;
            grandTotal.p += distData.pending;
            currentY += 5;
        });

        // Grand Total
        const footerLabel = ["GRAND TOTAL"];
        while (footerLabel.length < dynamicColsCount) footerLabel.push("");
        drawRow(currentY + 10, [...footerLabel, grandTotal.t, grandTotal.c, grandTotal.a, grandTotal.p], 'grand_total');

        doc.end();
        const pdfBuffer = await new Promise(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))));

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=District_Performance_Report.pdf'
            }
        });

    } catch (error) {
        console.error("PDF Generation Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}