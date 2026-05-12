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
            showNatureOfWork, // Destructure this
            departments,
            workTypes,
            naturesOfWork // Destructure this
        } = await request.json();

        const fontPath = path.join(process.cwd(), 'public', 'fonts', 'arial.ttf');
        const fontBuffer = fs.readFileSync(fontPath);

        // 1. Build SQL WHERE Clause
        let whereClauses = ["1=1"];
        if (departments?.length > 0) {
            whereClauses.push(`wr.complaint_type_id IN (${departments.map(id => parseInt(id)).join(',')})`);
        }
        if (showWorkType && workTypes?.length > 0) {
            whereClauses.push(`wr.complaint_subtype_id IN (${workTypes.map(id => parseInt(id)).join(',')})`);
        }
        // Filter by Nature of Work if provided
        if (showNatureOfWork && naturesOfWork?.length > 0) {
            const natureList = naturesOfWork.map(n => n === 'null' ? 'NULL' : `'${n}'`).join(',');
            whereClauses.push(`wr.nature_of_work IN (${natureList})`);
        }

        if (dateFrom) whereClauses.push(`wr.request_date >= '${dateFrom}'`);
        if (dateTo) whereClauses.push(`wr.request_date <= '${dateTo}'`);

        const whereString = `WHERE ${whereClauses.join(' AND ')}`;

        // 2. Build Query - Use a combined flag for "Detailed" view
        const isDetailed = showWorkType || showNatureOfWork;
        let sqlQuery = "";

        if (isDetailed) {
            // Select either subtype_name OR nature_of_work based on the toggle
            const subItemColumn = showWorkType ? 'cs.subtype_name' : 'wr.nature_of_work';
            const joinSubtype = showWorkType ? 'JOIN complaint_subtypes cs ON wr.complaint_subtype_id = cs.id' : '';

            sqlQuery = `
                SELECT 
                    ct.type_name as name, 
                    COALESCE(${subItemColumn}, 'Unspecified') as sub_item,
                    COUNT(wr.id) as total,
                    COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
                    COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending,
                    SUM(COUNT(wr.id)) OVER(PARTITION BY ct.type_name) as dept_total_count,
                    SUM(COUNT(CASE WHEN s.name = 'Completed' THEN 1 END)) OVER(PARTITION BY ct.type_name) as dept_completed,
                    SUM(COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END)) OVER(PARTITION BY ct.type_name) as dept_active,
                    SUM(COUNT(CASE WHEN s.name = 'Pending' THEN 1 END)) OVER(PARTITION BY ct.type_name) as dept_pending
                FROM work_requests wr
                JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                ${joinSubtype}
                LEFT JOIN status s ON wr.status_id = s.id
                ${whereString}
                GROUP BY ct.type_name, ${subItemColumn}
                ORDER BY ct.type_name, sub_item`;
        } else {
            sqlQuery = `
                SELECT 
                    ct.type_name as name, 
                    COUNT(wr.id) as total,
                    COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
                    COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending
                FROM work_requests wr
                JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                LEFT JOIN status s ON wr.status_id = s.id
                ${whereString}
                GROUP BY ct.type_name
                ORDER BY ct.type_name`;
        }

        const dbResult = await query(sqlQuery);
        const reportData = dbResult.rows;

        // 3. PDF Generation Setup
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.registerFont('Arial', fontBuffer);
        doc.font('Arial');

        // Header UI
        doc.fillColor('black').fontSize(14).text('KARACHI WATER & SEWERAGE CORPORATION', 50, 50);
        doc.fontSize(10).text('Works Management Portal', 50, 68);

        const timestamp = new Date().toLocaleString();
        doc.fillColor('#666666').fontSize(8);
        doc.text(`Generated On: ${timestamp}`, 350, 50, { align: 'right', width: 200, oblique: true });
        doc.text('Generated via WMP Portal', 350, 62, { align: 'right', width: 200, oblique: true });

        doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#cccccc').lineWidth(1).stroke();

        doc.moveDown(3);
        doc.fillColor('black').fontSize(12).text('DEPARTMENT-WISE PERFORMANCE REPORT', 50, 115, { align: 'center', bold: true });

        if (dateFrom && dateTo) {
            doc.fontSize(10).text(`Period: ${dateFrom} to ${dateTo}`, { align: 'center' });
        }
        doc.moveDown(0.75);

        // Table Constants
        const colWidths = isDetailed ? [130, 170, 50, 50, 50, 45] : [295, 50, 50, 50, 50];
        const dynamicHeader = showWorkType ? 'Work Type' : 'Nature of Work';
        const headers = isDetailed
            ? ['Department', dynamicHeader, 'Total', 'Completed', 'Active', 'Pending']
            : ['Department Name', 'Total', 'Completed', 'Active', 'Pending'];

        const drawRow = (y, items, type = 'normal') => {
            let x = 50;
            let maxHeight = 0;
            // Calculate dynamic height based on text wrapping
            items.forEach((text, i) => {
                const options = { width: colWidths[i], align: i === 0 ? 'left' : 'center' };
                const textHeight = doc.heightOfString(text?.toString() || '', options);
                if (textHeight > maxHeight) maxHeight = textHeight;
            });

            const rowHeight = maxHeight + 10;

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
        let lastDept = "";

        reportData.forEach((row) => {
            if (currentY > 730) { doc.addPage(); currentY = 50; }

            if (isDetailed) {
                if (row.name !== lastDept) {
                    const rowH = drawRow(currentY, [
                        row.name.toUpperCase(),
                        "",
                        row.dept_total_count,
                        row.dept_completed,
                        row.dept_active,
                        row.dept_pending
                    ], 'highlight');
                    currentY += rowH + 5;
                    lastDept = row.name;

                    grandTotal.t += parseInt(row.dept_total_count || 0);
                    grandTotal.c += parseInt(row.dept_completed || 0);
                    grandTotal.a += parseInt(row.dept_active || 0);
                    grandTotal.p += parseInt(row.dept_pending || 0);
                }
                if (currentY > 730) { doc.addPage(); currentY = 50; }
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
        drawRow(currentY + 10, ["GRAND TOTAL", ...(showWorkType ? [""] : []), grandTotal.t, grandTotal.c, grandTotal.a, grandTotal.p], 'grand_total');

        doc.end();
        const pdfBuffer = await new Promise(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))));

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Department_Performance_Report.pdf"'
            }
        });

    } catch (error) {
        console.error("PDF Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}