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
            townId,
            townName,
            ucs,
            workTypes,
            naturesOfWork
        } = await request.json();

        if (!townId) return NextResponse.json({ success: false, message: "Town selection is required" }, { status: 400 });

        const fontPath = path.join(process.cwd(), 'public', 'fonts', 'arial.ttf');
        const fontBuffer = fs.readFileSync(fontPath);

        // 1. Build SQL WHERE Clause
        let whereClauses = [`wr.town_id = ${parseInt(townId)}`];
        if (ucs?.length > 0) whereClauses.push(`st.id IN (${ucs.map(id => parseInt(id)).join(',')})`);

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

        const whereString = `WHERE ${whereClauses.join(' AND ')}`;

        // 2. Build Dynamic Query
        let sqlQuery = "";
        const isDetailed = showWorkType || showNatureOfWork;

        // Determine what the sub-item is based on which toggle is active
        const subItemExpression = showWorkType
            ? "cs.subtype_name"
            : "COALESCE(wr.nature_of_work, 'Unspecified')";

        if (isDetailed) {
            sqlQuery = `
            SELECT 
                st.subtown as name, 
                ${subItemExpression} as sub_item,
                COUNT(wr.id) as total,
                COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
                COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
                COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending,
                SUM(COUNT(wr.id)) OVER(PARTITION BY st.subtown) as uc_total_count,
                SUM(COUNT(CASE WHEN s.name = 'Completed' THEN 1 END)) OVER(PARTITION BY st.subtown) as uc_completed,
                SUM(COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END)) OVER(PARTITION BY st.subtown) as uc_active,
                SUM(COUNT(CASE WHEN s.name = 'Pending' THEN 1 END)) OVER(PARTITION BY st.subtown) as uc_pending
            FROM work_requests wr
            JOIN subtown st ON wr.subtown_id = st.id
            ${showWorkType ? 'JOIN complaint_subtypes cs ON wr.complaint_subtype_id = cs.id' : ''}
            LEFT JOIN status s ON wr.status_id = s.id
            ${whereString}
            GROUP BY st.subtown, ${subItemExpression}
            ORDER BY st.subtown, sub_item`;
        } else {
            sqlQuery = `
            SELECT st.subtown as name, COUNT(wr.id) as total, 
            COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
            COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
            COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending
            FROM work_requests wr
            JOIN subtown st ON wr.subtown_id = st.id
            LEFT JOIN status s ON wr.status_id = s.id
            ${whereString}
            GROUP BY st.subtown ORDER BY st.subtown`;
        }

        const dbResult = await query(sqlQuery);
        const reportData = dbResult.rows;

        // 3. PDF Generation
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.registerFont('Arial', fontBuffer);
        doc.font('Arial');

        // Restore Missing Header UI
        doc.fillColor('black').fontSize(14).text('KARACHI WATER & SEWERAGE CORPORATION', 50, 50);
        doc.fontSize(10).text('Works Management Portal', 50, 68);

        const timestamp = new Date().toLocaleString();
        doc.fillColor('#666666').fontSize(8);
        doc.text(`Generated On: ${timestamp}`, 350, 50, { align: 'right', width: 200, oblique: true });
        doc.text('Generated via WMP Portal', 350, 62, { align: 'right', width: 200, oblique: true });

        doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#cccccc').lineWidth(1).stroke();

        doc.moveDown(3);
        const reportTitle = `UC-WISE PERFORMANCE REPORT OF ${townName.toUpperCase()}`;
        doc.fillColor('black').fontSize(12).text(reportTitle, 50, 115, { align: 'center', bold: true });

        if (dateFrom && dateTo) {
            doc.fontSize(10).text(`Period: ${dateFrom} to ${dateTo}`, { align: 'center' });
        }
        doc.moveDown(0.75);

        // 4. Table Logic
        const subHeaderLabel = showWorkType ? 'Work Type' : (showNatureOfWork ? 'Nature of Work' : '');

        const colWidths = isDetailed ? [130, 170, 50, 50, 50, 45] : [295, 50, 50, 50, 50];
        const headers = isDetailed
            ? ['UC Name', subHeaderLabel, 'Total', 'Completed', 'Active', 'Pending']
            : ['UC Name', 'Total', 'Completed', 'Active', 'Pending'];

        const drawRow = (y, items, type = 'normal') => {
            let x = 50;
            let maxHeight = 0;
            items.forEach((text, i) => {
                const options = { width: colWidths[i], align: i === 0 ? 'left' : 'center' };
                const textHeight = doc.heightOfString(text?.toString() || '', options);
                if (textHeight > maxHeight) maxHeight = textHeight;
            });

            const rowHeight = maxHeight + 15;
            if (type === 'header') {
                doc.fillColor('#1e3a8a').rect(50, y - 5, 495, rowHeight).fill();
                doc.fillColor('white').fontSize(10);
            } else if (type === 'highlight') {
                doc.fillColor('#e2e8f0').rect(50, y - 5, 495, rowHeight).fill();
                doc.fillColor('#1e3a8a').fontSize(10);
            } else if (type === 'grand_total') {
                doc.fillColor('black').rect(50, y - 5, 495, rowHeight).fill();
                doc.fillColor('white').fontSize(10);
            } else {
                doc.fillColor('black').fontSize(9);
            }

            x = 50;
            items.forEach((text, i) => {
                doc.text(text?.toString() || '', x, y, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
                x += colWidths[i];
            });
            return rowHeight;
        };

        let currentY = doc.y + 15;
        const hHeight = drawRow(currentY, headers, 'header');
        currentY += hHeight + 10;

        let grandTotal = { t: 0, c: 0, a: 0, p: 0 };
        let lastUC = "";

        reportData.forEach((row) => {
            if (currentY > 720) {
                doc.addPage();
                currentY = 50;
                // Redraw header on new page if you want, or just reset Y
                const hHeight = drawRow(currentY, headers, 'header');
                currentY += hHeight + 10;
            }

            if (isDetailed) {
                if (row.name !== lastUC) {
                    // PRE-CHECK: If we are near the bottom, don't start a new UC section 
                    // unless we can fit the header AND the first detail row.
                    if (currentY > 680) {
                        doc.addPage();
                        currentY = 50;
                        const hHeight = drawRow(currentY, headers, 'header');
                        currentY += hHeight + 10;
                    }

                    const rowH = drawRow(currentY, [
                        row.name.toUpperCase(),
                        "",
                        row.uc_total_count,
                        row.uc_completed,
                        row.uc_active,
                        row.uc_pending
                    ], 'highlight');
                    currentY += rowH + 5;
                    lastUC = row.name;

                    grandTotal.t += parseInt(row.uc_total_count || 0);
                    grandTotal.c += parseInt(row.uc_completed || 0);
                    grandTotal.a += parseInt(row.uc_active || 0);
                    grandTotal.p += parseInt(row.uc_pending || 0);
                }

                // Standard detail row check
                if (currentY > 740) {
                    doc.addPage();
                    currentY = 50;
                    const hHeight = drawRow(currentY, headers, 'header');
                    currentY += hHeight + 10;
                }

                const rowR = drawRow(currentY, ["", row.sub_item, row.total, row.completed, row.active, row.pending]);
                currentY += rowR + 2;
            } else {
                const rowR = drawRow(currentY, [row.name, row.total, row.completed, row.active, row.pending]);
                currentY += rowR + 5;
                grandTotal.t += parseInt(row.total || 0);
                grandTotal.c += parseInt(row.completed || 0);
                grandTotal.a += parseInt(row.active || 0);
                grandTotal.p += parseInt(row.pending || 0);
            }
        });

        if (currentY > 730) { doc.addPage(); currentY = 50; }
        drawRow(currentY + 10, ["GRAND TOTAL", ...(isDetailed ? [""] : []), grandTotal.t, grandTotal.c, grandTotal.a, grandTotal.p], 'grand_total');

        doc.end();
        const pdfBuffer = await new Promise(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))));

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="UC_Report_${townName}.pdf"`
            }
        });

    } catch (error) {
        console.error("PDF Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}