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
            towns, 
            workTypes, 
            naturesOfWork 
        } = await request.json();

        const fontPath = path.join(process.cwd(), 'public', 'fonts', 'arial.ttf');
        const fontBuffer = fs.readFileSync(fontPath);

        // 1. Build SQL WHERE Clause
        let whereClauses = ["1=1"];
        if (towns?.length > 0) whereClauses.push(`wr.town_id IN (${towns.map(id => parseInt(id)).join(',')})`);
        
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
        const isDetailed = showWorkType || showNatureOfWork;
        const subItemExpression = showWorkType 
            ? "cs.subtype_name" 
            : "COALESCE(wr.nature_of_work, 'Unspecified')";

        let sqlQuery = isDetailed ? `
            SELECT 
                t.town as name, 
                ${subItemExpression} as sub_item,
                COUNT(wr.id) as total,
                COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
                COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
                COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending,
                SUM(COUNT(wr.id)) OVER(PARTITION BY t.town) as town_total_count,
                SUM(COUNT(CASE WHEN s.name = 'Completed' THEN 1 END)) OVER(PARTITION BY t.town) as town_completed,
                SUM(COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END)) OVER(PARTITION BY t.town) as town_active,
                SUM(COUNT(CASE WHEN s.name = 'Pending' THEN 1 END)) OVER(PARTITION BY t.town) as town_pending
            FROM work_requests wr 
            JOIN town t ON wr.town_id = t.id
            ${showWorkType ? 'JOIN complaint_subtypes cs ON wr.complaint_subtype_id = cs.id' : ''}
            LEFT JOIN status s ON wr.status_id = s.id 
            ${whereString}
            GROUP BY t.town, ${subItemExpression} 
            ORDER BY t.town, sub_item` 
        : `
            SELECT t.town as name, COUNT(wr.id) as total,
            COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
            COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
            COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending
            FROM work_requests wr JOIN town t ON wr.town_id = t.id
            LEFT JOIN status s ON wr.status_id = s.id ${whereString}
            GROUP BY t.town ORDER BY t.town`;

        const dbResult = await query(sqlQuery);
        const reportData = dbResult.rows;

        // 3. PDF Generation
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.font(fontBuffer);

        // Header
        doc.fillColor('black').fontSize(14).text('KARACHI WATER & SEWERAGE CORPORATION', 50, 50);
        doc.fontSize(10).text('Works Management Portal', 50, 68);
        const timestamp = new Date().toLocaleString();
        doc.fillColor('#666666').fontSize(8);
        doc.text(`Generated On: ${timestamp}`, 350, 50, { align: 'right', width: 200, oblique: true });
        doc.text('Generated via WMP Portal', 350, 62, { align: 'right', width: 200, oblique: true });
        doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#cccccc').lineWidth(1).stroke();

        doc.moveDown(3);
        doc.fillColor('black').fontSize(14).text('TOWN-WISE PERFORMANCE REPORT', 50, 115, { align: 'center'});
        if (dateFrom && dateTo) doc.fontSize(10).text(`Period: ${dateFrom} to ${dateTo}`, { align: 'center' });
        doc.moveDown(0.75);

        // Table UI Logic
        const subHeaderLabel = showWorkType ? 'Work Type' : (showNatureOfWork ? 'Nature of Work' : '');
        const colWidths = isDetailed ? [130, 170, 50, 50, 50, 45] : [295, 50, 50, 50, 50];
        const headers = isDetailed
            ? ['Town Name', subHeaderLabel, 'Total', 'Completed', 'Active', 'Pending']
            : ['Town Name', 'Total', 'Completed', 'Active', 'Pending'];

        const drawRow = (y, items, type = 'normal') => {
            let x = 50;
            if (type === 'header') {
                doc.fillColor('#1e3a8a').rect(50, y - 5, 495, 20).fill();
                doc.fillColor('white').fontSize(10);
            } else if (type === 'total') {
                doc.fillColor('#f1f5f9').rect(50, y - 5, 495, 20).fill();
                doc.fillColor('#1e3a8a').fontSize(10);
            } else if (type === 'grand_total') {
                doc.fillColor('black').rect(50, y - 5, 495, 20).fill();
                doc.fillColor('white').fontSize(10);
            } else {
                doc.fillColor('black').fontSize(9);
            }

            items.forEach((text, i) => {
                doc.text(text?.toString() || '', x, y, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
                x += colWidths[i];
            });
        };

        let currentY = doc.y + 15;
        drawRow(currentY, headers, 'header');
        currentY += 25;

        let grandTotal = { t: 0, c: 0, a: 0, p: 0 };
        let lastTown = "";

        reportData.forEach((row) => {
            if (currentY > 750) { doc.addPage(); currentY = 50; }

            if (isDetailed) {
                if (row.name !== lastTown) {
                    drawRow(currentY, [row.name.toUpperCase(), "", row.town_total_count, row.town_completed, row.town_active, row.town_pending], 'total');
                    currentY += 20;
                    lastTown = row.name;
                    grandTotal.t += parseInt(row.town_total_count || 0);
                    grandTotal.c += parseInt(row.town_completed || 0);
                    grandTotal.a += parseInt(row.town_active || 0);
                    grandTotal.p += parseInt(row.town_pending || 0);
                }
                if (currentY > 750) { doc.addPage(); currentY = 50; }
                drawRow(currentY, ["", row.sub_item, row.total, row.completed, row.active, row.pending]);
                currentY += 18;
            } else {
                drawRow(currentY, [row.name, row.total, row.completed, row.active, row.pending]);
                currentY += 18;
                grandTotal.t += parseInt(row.total || 0);
                grandTotal.c += parseInt(row.completed || 0);
                grandTotal.a += parseInt(row.active || 0);
                grandTotal.p += parseInt(row.pending || 0);
            }
        });

        if (currentY > 750) { doc.addPage(); currentY = 50; }
        drawRow(currentY + 10, ["GRAND TOTAL", ...(isDetailed ? [""] : []), grandTotal.t, grandTotal.c, grandTotal.a, grandTotal.p], 'grand_total');

        doc.end();
        const pdfBuffer = await new Promise(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))));

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Town_Report.pdf"'
            }
        });

    } catch (error) {
        console.error("PDF Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}