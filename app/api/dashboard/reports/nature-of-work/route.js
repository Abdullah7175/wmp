import { NextResponse } from "next/server";
import { auth } from "@/auth";
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import fs from 'fs';
import path from 'path';
import { query } from "@/lib/db";

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ success: false }, { status: 403 });

        const { dateFrom, dateTo, groupBy } = await request.json();
        const fontPath = path.join(process.cwd(), 'public', 'fonts', 'arial.ttf');
        const fontBuffer = fs.readFileSync(fontPath);

        // 1. Build Query Logic
        let whereClauses = ["1=1"];
        if (dateFrom) whereClauses.push(`wr.request_date >= '${dateFrom}'`);
        if (dateTo) whereClauses.push(`wr.request_date <= '${dateTo}'`);

        // Fix: Ensure we don't get empty rows for the sub_item
        if (groupBy === 'district') whereClauses.push("d.title IS NOT NULL");
        if (groupBy === 'town') whereClauses.push("t.town IS NOT NULL");
        if (groupBy === 'department') whereClauses.push("ct.type_name IS NOT NULL");

        const whereString = `WHERE ${whereClauses.join(' AND ')}`;

        let sqlQuery = "";
        let groupingLabel = "";
        let groupColumn = "";

        if (groupBy === 'district') { groupColumn = "d.title"; groupingLabel = "District"; }
        else if (groupBy === 'department') { groupColumn = "ct.type_name"; groupingLabel = "Department"; }
        else if (groupBy === 'town') { groupColumn = "t.town"; groupingLabel = "Town"; }

        if (groupBy) {
            sqlQuery = `
                SELECT 
                    COALESCE(wr.nature_of_work, 'Unspecified') as name,
                    ${groupColumn} as sub_item,
                    COUNT(wr.id) as total,
                    COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
                    COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending,
                    -- Window functions for group totals
                    SUM(COUNT(wr.id)) OVER(PARTITION BY wr.nature_of_work) as group_total_count,
                    SUM(COUNT(CASE WHEN s.name = 'Completed' THEN 1 END)) OVER(PARTITION BY wr.nature_of_work) as group_completed,
                    SUM(COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END)) OVER(PARTITION BY wr.nature_of_work) as group_active,
                    SUM(COUNT(CASE WHEN s.name = 'Pending' THEN 1 END)) OVER(PARTITION BY wr.nature_of_work) as group_pending
                FROM work_requests wr
                LEFT JOIN status s ON wr.status_id = s.id
                LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                LEFT JOIN town t ON wr.town_id = t.id
                LEFT JOIN district d ON t.district_id = d.id
                ${whereString}
                GROUP BY wr.nature_of_work, ${groupColumn}
                ORDER BY wr.nature_of_work, ${groupColumn}`;
        } else {
            sqlQuery = `
                SELECT 
                    COALESCE(wr.nature_of_work, 'Unspecified') as name,
                    COUNT(wr.id) as total,
                    COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
                    COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending
                FROM work_requests wr
                LEFT JOIN status s ON wr.status_id = s.id
                ${whereString}
                GROUP BY wr.nature_of_work
                ORDER BY wr.nature_of_work`;
        }

        const dbResult = await query(sqlQuery);
        const reportData = dbResult.rows;

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.registerFont('Arial', fontBuffer);
        doc.font('Arial');

        // Header Section
        doc.fillColor('black').fontSize(14).text('KARACHI WATER & SEWERAGE CORPORATION', 50, 50);
        doc.fontSize(10).text('Works Management Portal', 50, 68);

        const timestamp = new Date().toLocaleString();
        doc.fillColor('#666666').fontSize(8);
        doc.text(`Generated On: ${timestamp}`, 350, 50, { align: 'right', width: 200, oblique: true });
        doc.text('Generated via WMP Portal', 350, 62, { align: 'right', width: 200, oblique: true });

        doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#cccccc').lineWidth(1).stroke();

        // Title and Date Range
        doc.moveDown(3);
        // 1. Determine the dynamic title
        let reportTitle = 'NATURE OF WORK DISTRIBUTION REPORT';
        if (groupBy === 'district') reportTitle += ' (DISTRICT WISE)';
        else if (groupBy === 'department') reportTitle += ' (DEPARTMENT WISE)';
        else if (groupBy === 'town') reportTitle += ' (TOWN WISE)';

        // 2. Apply the dynamic title to the PDF
        doc.moveDown(3);
        doc.fillColor('black').fontSize(12).text(reportTitle, 50, 115, { align: 'center', bold: true });

        if (dateFrom && dateTo) {
            doc.fontSize(10).text(`Period: ${dateFrom} to ${dateTo}`, { align: 'center' });
        }

        // Reset currentY to start table below the header
        let currentY = 160;
        const colWidths = groupBy ? [130, 170, 50, 50, 50, 45] : [295, 50, 50, 50, 50];
        const headers = groupBy ? ['Nature of Work', groupingLabel, 'Total', 'Comp', 'Act', 'Pen'] : ['Nature of Work', 'Total', 'Completed', 'Active', 'Pending'];

        // Grand Total Tracker
        const grandTotal = { t: 0, c: 0, a: 0, p: 0 };

        const drawRow = (y, items, type = 'normal') => {
            let x = 50;
            if (type === 'header') {
                doc.fillColor('#1e3a8a').rect(50, y - 5, 495, 20).fill();
                doc.fillColor('white').fontSize(10);
            }
            else if (type === 'highlight') {
                doc.fillColor('#f1f5f9').rect(50, y - 5, 495, 20).fill();
                doc.fillColor('#1e3a8a').fontSize(9).font('Arial');
            }
            else if (type === 'grand_total') {
                doc.fillColor('black').rect(50, y - 5, 495, 20).fill();
                doc.fillColor('white').fontSize(10).font('Arial');
            }
            else {
                doc.fillColor('black').fontSize(9);
            }

            items.forEach((text, i) => {
                doc.text(text?.toString() || '', x, y, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
                x += colWidths[i];
            });
            return 20;
        };

        currentY += drawRow(currentY, headers, 'header');
        let lastNature = "";

        reportData.forEach((row) => {
            if (currentY > 730) { doc.addPage(); currentY = 50; }

            if (groupBy) {
                if (row.name !== lastNature) {
                    // Nature of Work Header Row (Fixed Active/Pending totals)
                    currentY += drawRow(currentY, [row.name.toUpperCase(), "", row.group_total_count, row.group_completed, row.group_active, row.group_pending], 'highlight');
                    lastNature = row.name;

                    // Only add to Grand Total once per nature of work group
                    grandTotal.t += parseInt(row.group_total_count || 0);
                    grandTotal.c += parseInt(row.group_completed || 0);
                    grandTotal.a += parseInt(row.group_active || 0);
                    grandTotal.p += parseInt(row.group_pending || 0);
                }
                currentY += drawRow(currentY, ["", row.sub_item, row.total, row.completed, row.active, row.pending]);
            } else {
                currentY += drawRow(currentY, [row.name, row.total, row.completed, row.active, row.pending]);
                grandTotal.t += parseInt(row.total || 0);
                grandTotal.c += parseInt(row.completed || 0);
                grandTotal.a += parseInt(row.active || 0);
                grandTotal.p += parseInt(row.pending || 0);
            }
        });

        // Add Grand Total Row
        if (currentY > 730) { doc.addPage(); currentY = 50; }
        currentY += 10;
        drawRow(currentY, ["GRAND TOTAL", ...(groupBy ? [""] : []), grandTotal.t, grandTotal.c, grandTotal.a, grandTotal.p], 'grand_total');

        doc.end();
        const pdfBuffer = await new Promise(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))));
        return new NextResponse(pdfBuffer, { headers: { 'Content-Type': 'application/pdf' } });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}