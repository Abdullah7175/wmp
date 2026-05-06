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
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { reportType, dateFrom, dateTo, showWorkType, towns, districts, divisions, departments, workTypes } = await request.json();
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'arial.ttf');
    const fontBuffer = fs.readFileSync(fontPath);

    // Dynamic Query Logic (Unchanged from your working code)
    let sqlQuery = "";
    let groupLabel = "Category";
    let isDetailedReport = showWorkType;

    const baseSelect = `
  COUNT(wr.id) as total,
  COUNT(CASE WHEN s.name = 'Completed' THEN 1 END) as completed,
  COUNT(CASE WHEN s.name = 'In Progress' THEN 1 END) as active,
  COUNT(CASE WHEN s.name = 'Pending' THEN 1 END) as pending
`;

    // Build Dynamic WHERE Clause
    let whereClauses = ["1=1"]; // Start with a true condition to simplify AND joins

    if (towns && towns.length > 0) {
      // Ensure IDs are numbers to prevent SQL errors
      const townIds = towns.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (townIds.length > 0) {
        whereClauses.push(`wr.town_id IN (${townIds.join(',')})`);
      }
    }

    // Add District/Division/Dept to WHERE clause logic
    if (districts?.length > 0) {
      whereClauses.push(`t.district_id IN (${districts.join(',')})`);
    }
    if (divisions?.length > 0) {
      whereClauses.push(`wr.division_id IN (${divisions.join(',')})`);
    }
    if (departments?.length > 0) {
      whereClauses.push(`wr.complaint_type_id IN (${departments.join(',')})`);
    }

    if (workTypes && workTypes.length > 0) {
      const typeIds = workTypes.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (typeIds.length > 0) {
        whereClauses.push(`wr.complaint_subtype_id IN (${typeIds.join(',')})`);
      }
    }

    // Add Date Filters if they exist
    // if (dateFrom) whereClauses.push(`wr.created_at >= '${dateFrom}'`);
    // if (dateTo) whereClauses.push(`wr.created_at <= '${dateTo}'`);

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    let groupCol = "";
    let groupJoin = "";

    if (reportType === 'town') {
      groupCol = "t.town";
      groupJoin = "JOIN town t ON wr.town_id = t.id";
      groupLabel = "Town Name";
    } else if (reportType === 'district') {
      groupCol = "d.title";
      groupJoin = "JOIN town t ON wr.town_id = t.id JOIN district d ON t.district_id = d.id";
      groupLabel = "District Name";
    } else if (reportType === 'division') {
      groupCol = "div.name";
      groupJoin = "JOIN divisions div ON wr.division_id = div.id";
      groupLabel = "Division Name";
    } else {
      groupCol = "ct.type_name";
      groupJoin = "JOIN complaint_types ct ON wr.complaint_type_id = ct.id";
      groupLabel = "Department";
    }

    if (isDetailedReport) {
      sqlQuery = `
      SELECT 
        ${groupCol} as name, 
        cs.subtype_name as work_type,
        ${baseSelect}
      FROM work_requests wr
      ${groupJoin}
      JOIN complaint_subtypes cs ON wr.complaint_subtype_id = cs.id
      LEFT JOIN status s ON wr.status_id = s.id
      ${whereString}
      GROUP BY ${groupCol}, cs.subtype_name
      ORDER BY ${groupCol}, cs.subtype_name
    `;
    } else {
      sqlQuery = `SELECT ${groupCol} as name, ${baseSelect} FROM work_requests wr ${groupJoin} LEFT JOIN status s ON wr.status_id = s.id ${whereString} GROUP BY ${groupCol}`;
    }

    const dbResult = await query(sqlQuery);
    const reportData = dbResult.rows;

    // --- 1. CALCULATE GRAND TOTALS ---
    const grandTotals = reportData.reduce((acc, row) => {
      acc.total += parseInt(row.total || 0);
      acc.completed += parseInt(row.completed || 0);
      acc.active += parseInt(row.active || 0);
      acc.pending += parseInt(row.pending || 0);
      return acc;
    }, { total: 0, completed: 0, active: 0, pending: 0 });

    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.font(fontBuffer);

    // Header
    doc.fontSize(20).text('KW&SC Performance Report', { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Category: ${reportType.toUpperCase()} Summary`, { align: 'center' });
    doc.moveDown(2);

    // Table Setup
    const tableTop = 150;
    const colWidths = isDetailedReport ? [120, 120, 65, 65, 65, 65] : [180, 80, 80, 80, 80];
    const headers = isDetailedReport
      ? ['Town', 'Work Type', 'Total', 'Completed', 'Active', 'Pending']
      : [groupLabel, 'Total', 'Completed', 'Active', 'Pending'];

    // --- 2. ENHANCED DRAW ROW FUNCTION ---
    const drawRow = (y, items, type = 'normal') => {
      if (type === 'header') {
        doc.fillColor('#1e3a8a').rect(50, y - 5, 500, 20).fill();
        doc.fillColor('white').fontSize(10);
      } else if (type === 'total') {
        doc.fillColor('#f1f5f9').rect(50, y - 5, 500, 20).fill(); // Light highlight
        doc.fillColor('#1e3a8a').fontSize(10); // Bold-like color
      } else {
        doc.fillColor('black').fontSize(10);
      }

      items.forEach((text, i) => {
        let xPos = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        let displayValue = text;
        if (!text || text === "0" || text === 0) {
          displayValue = (i < 2 && isDetailedReport) ? "" : "0";
        }

        doc.text(displayValue, xPos, y, {
          width: colWidths[i],
          align: i === 0 ? 'left' : 'center',
          lineBreak: false
        });
      });
    };

    // Draw Header
    drawRow(tableTop, headers, 'header');
    let currentY = tableTop + 25;

    if (isDetailedReport) {
      let lastTown = "";

      // Group data by town for totaling
      const groupedByTown = reportData.reduce((acc, row) => {
        if (!acc[row.name]) acc[row.name] = { subtypes: [], total: 0, completed: 0, active: 0, pending: 0 };
        acc[row.name].subtypes.push(row);
        acc[row.name].total += parseInt(row.total);
        acc[row.name].completed += parseInt(row.completed);
        acc[row.name].active += parseInt(row.active);
        acc[row.name].pending += parseInt(row.pending);
        return acc;
      }, {});

      Object.entries(groupedByTown).forEach(([townName, data]) => {
        // 1. Draw Town Total Row (Bold)
        drawRow(currentY, [
          townName.toUpperCase(),
          "",
          data.total.toString(),
          data.completed.toString(),
          data.active.toString(),
          data.pending.toString()
        ], 'total');
        currentY += 20;

        // 2. Draw Work Type rows for this town
        data.subtypes.forEach(sub => {
          if (currentY > 700) { doc.addPage(); currentY = 50; }
          drawRow(currentY, [
            "",
            sub.work_type,
            sub.total.toString(),
            sub.completed.toString(),
            sub.active.toString(),
            sub.pending.toString()
          ]);
          currentY += 20;
        });

        currentY += 10; // Extra spacing between town blocks
      });
    } else {

      // Draw Data Rows
      reportData.forEach((row) => {
        drawRow(currentY, [
          row.name,
          row.total.toString(),
          row.completed.toString(),
          row.active.toString(),
          row.pending.toString()
        ]);
        currentY += 20;
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
          // Optional: Re-draw header on new page
          drawRow(currentY, [groupLabel, 'Total', 'Completed', 'Active', 'Pending'], 'header');
          currentY += 25;
        }
      });

      // --- 3. DRAW GRAND TOTAL ROW ---
      doc.moveDown(0.5);
      drawRow(currentY, [
        "GRAND TOTAL",
        grandTotals.total.toString(),
        grandTotals.completed.toString(),
        grandTotals.active.toString(),
        grandTotals.pending.toString()
      ], 'total');
    }
    doc.end();
    await new Promise(resolve => doc.on('end', resolve));
    return new NextResponse(Buffer.concat(chunks), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="KWSC_${reportType}_Report.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}