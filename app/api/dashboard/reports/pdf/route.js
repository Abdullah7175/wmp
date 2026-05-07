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



    const { reportType, dateFrom, dateTo, showWorkType, showTownDetails, towns, districts, divisions, departments, workTypes } = await request.json();

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



    // 1. First, determine the base grouping based on reportType

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



    // 2. Initialize SQL column arrays AFTER groupCol is set

    let selectCols = [`${groupCol} as name`];

    let groupCols = [groupCol];



    // Set flag for detailed view if either checkbox is active

    isDetailedReport = showWorkType || showTownDetails;



    // 3. Add dynamic columns for Town Details or Work Types

    if (reportType === 'district' && showTownDetails) {

      selectCols.push("t.town as town_name");

      groupCols.push("t.town");

    }



    if (showWorkType) {

      selectCols.push("cs.subtype_name as work_type");

      groupCols.push("cs.subtype_name");

    }



    // 4. Construct the query

    if (isDetailedReport) {

      sqlQuery = `

        SELECT 

          ${selectCols.join(', ')}, 

          ${baseSelect}

        FROM work_requests wr

        ${groupJoin}

        ${showWorkType ? 'JOIN complaint_subtypes cs ON wr.complaint_subtype_id = cs.id' : ''}

        LEFT JOIN status s ON wr.status_id = s.id

        ${whereString}

        GROUP BY ${groupCols.join(', ')}

        ORDER BY ${groupCols.join(', ')}

      `;

    } else {

      sqlQuery = `

        SELECT ${groupCol} as name, ${baseSelect} 

        FROM work_requests wr 

        ${groupJoin} 

        LEFT JOIN status s ON wr.status_id = s.id 

        ${whereString} 

        GROUP BY ${groupCol}

        ORDER BY ${groupCol}

      `;

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

    // Define columns based on active flags

    const activeColumns = [groupLabel];

    if (showTownDetails) activeColumns.push('Town');

    if (showWorkType) activeColumns.push('Work Type');

    activeColumns.push('Total', 'Completed', 'Active', 'Pending');



    // Calculate dynamic widths: Total width 500

    const dynamicCount = (showTownDetails ? 1 : 0) + (showWorkType ? 1 : 0) + 1; // +1 for GroupLabel

    const labelWidth = dynamicCount === 3 ? 100 : (dynamicCount === 2 ? 150 : 300);

    const statWidth = 50;



    const colWidths = [

      ...Array(dynamicCount).fill(labelWidth),

      statWidth, statWidth, statWidth, statWidth

    ];



    const headers = activeColumns;



    // --- 2. ENHANCED DRAW ROW FUNCTION ---

    const drawRow = (y, items, type = 'normal') => {

      doc.fontSize(10);

      if (type === 'header') {

        doc.fillColor('#1e3a8a').rect(50, y - 5, 500, 20).fill();

        doc.fillColor('white');

      } else if (type === 'total') {

        doc.fillColor('#f1f5f9').rect(50, y - 5, 500, 20).fill();

        doc.fillColor('#1e3a8a');

      } else if (type === 'town-total') {

        // Start at 50 and width 500 to match the table exactly

        doc.fillColor('#c9f5ce').rect(50, y - 5, 500, 20).fill();

        doc.fillColor('#1a9c2a');

      } else {

        doc.fillColor('black');

      }



      items.forEach((text, i) => {

        let xPos = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);

        let displayValue = text;



        if (i < dynamicCount) {

          displayValue = (text === "0" || !text) ? "" : text;

        }



        doc.text(displayValue || "", xPos, y, {

          width: colWidths[i],

          align: i < dynamicCount ? 'left' : 'center',

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

      const groupedData = reportData.reduce((acc, row) => {

        if (!acc[row.name]) acc[row.name] = { total: 0, completed: 0, active: 0, pending: 0, children: {} };

        acc[row.name].total += parseInt(row.total);

        acc[row.name].completed += parseInt(row.completed);

        acc[row.name].active += parseInt(row.active);

        acc[row.name].pending += parseInt(row.pending);



        const childKey = showTownDetails ? row.town_name : (showWorkType ? row.work_type : null);



        if (childKey) {

          if (!acc[row.name].children[childKey]) {

            acc[row.name].children[childKey] = { total: 0, completed: 0, active: 0, pending: 0, workTypes: [] };

          }

          const child = acc[row.name].children[childKey];

          child.total += parseInt(row.total);

          child.completed += parseInt(row.completed);

          child.active += parseInt(row.active);

          child.pending += parseInt(row.pending);



          if (showTownDetails && showWorkType) {

            child.workTypes.push(row);

          }

        }

        return acc;

      }, {});



      Object.entries(groupedData).forEach(([distName, distData]) => {

        // Check if District Header will fit (Needs at least 60px for Header + one Town)

        if (currentY > 700) {

          doc.addPage();

          currentY = 50;

          drawRow(currentY, headers, 'header');

          currentY += 25;

        }



        // 1. District Header

        const distRow = [distName.toUpperCase()];

        if (showTownDetails) distRow.push("");

        if (showWorkType) distRow.push("");

        distRow.push(

          distData.total.toString(),

          distData.completed.toString(),

          distData.active.toString(),

          distData.pending.toString()

        );



        drawRow(currentY, distRow, 'total');

        currentY += 20;



        Object.entries(distData.children).forEach(([childName, childData]) => {

          // Check page overflow before Town Row

          if (currentY > 730) {

            doc.addPage();

            currentY = 50;

            drawRow(currentY, headers, 'header');

            currentY += 25;

          }

          // 2. Town/Child Row

          const childRow = [""]; // Indent under district

          childRow.push(childName);

          if (showWorkType && showTownDetails) childRow.push(""); // Spacer if work type exists

          childRow.push(childData.total.toString(), childData.completed.toString(), childData.active.toString(), childData.pending.toString());



          // Use 'town-total' styling if we are showing work types under it, else normal

          drawRow(currentY, childRow, (showWorkType && showTownDetails) ? 'town-total' : 'normal');

          currentY += 20;



          // 3. Work Types (Only if BOTH checked)

          if (showTownDetails && showWorkType) {

            childData.workTypes.forEach(wt => {

              if (currentY > 750) { doc.addPage(); currentY = 50; drawRow(currentY, headers, 'header'); currentY += 25; }



              drawRow(currentY, ["", "", wt.work_type, wt.total.toString(), wt.completed.toString(), wt.active.toString(), wt.pending.toString()], 'normal');

              currentY += 18;

            });

          }

        });

        currentY += 10;

      });

      // Add Grand Total for Detailed Report

      if (currentY > 730) { doc.addPage(); currentY = 50; }

      doc.moveDown(1);

      drawRow(currentY, [

        "GRAND TOTAL",

        ...(showTownDetails ? [""] : []),

        ...(showWorkType ? [""] : []),

        grandTotals.total.toString(),

        grandTotals.completed.toString(),

        grandTotals.active.toString(),

        grandTotals.pending.toString()

      ], 'total');

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