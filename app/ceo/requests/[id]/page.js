import { Suspense } from "react";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import RequestApprovalForm from "./components/RequestApprovalForm";

async function getRequestDetails(requestId) {
  try {
    const request = await query(`
      SELECT 
        wr.id,
        wr.request_date,
        wr.description,
        wr.address,
        wr.contact_number,
        wr.created_date,
        wr.nature_of_work,
        wr.budget_code,
        wr.file_type,
        wr.executive_engineer_id,
        wr.contractor_id,
        ct.type_name as complaint_type,
        cst.subtype_name as complaint_subtype,
        t.town,
        st.subtown,
        d.title as district,
        u.name as creator_name,
        u.email as creator_email,
        wra.approval_status,
        wra.created_at as approval_request_date,
        wra.ceo_comments,
        s.name as status_name,
        ee.name as executive_engineer_name,
        c.name as contractor_name
      FROM work_requests wr
      LEFT JOIN work_request_approvals wra ON wr.id = wra.work_request_id
      LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
      LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
      LEFT JOIN town t ON wr.town_id = t.id
      LEFT JOIN subtown st ON wr.subtown_id = st.id
      LEFT JOIN district d ON t.district_id = d.id
      LEFT JOIN users u ON wr.creator_id = u.id
      LEFT JOIN status s ON wr.status_id = s.id
      LEFT JOIN agents ee ON wr.executive_engineer_id = ee.id
      LEFT JOIN agents c ON wr.contractor_id = c.id
      WHERE wr.id = $1
    `, [requestId]);

    if (!request.rows || request.rows.length === 0) {
      return null;
    }

    // Get all media for this request
    const [beforeContent, images, videos, finalVideos] = await Promise.all([
      query(`
        SELECT 
          id,
          link,
          description,
          created_at,
          creator_name,
          content_type
        FROM before_content 
        WHERE work_request_id = $1
        ORDER BY created_at DESC
      `, [requestId]),
      query(`
        SELECT 
          id,
          link,
          description,
          created_at,
          creator_type
        FROM images 
        WHERE work_request_id = $1
        ORDER BY created_at DESC
      `, [requestId]),
      query(`
        SELECT 
          id,
          link,
          description,
          created_at,
          creator_type
        FROM videos 
        WHERE work_request_id = $1
        ORDER BY created_at DESC
      `, [requestId]),
      query(`
        SELECT 
          id,
          link,
          description,
          created_at,
          creator_type
        FROM final_videos 
        WHERE work_request_id = $1
        ORDER BY created_at DESC
      `, [requestId])
    ]);

    return {
      request: request.rows[0],
      beforeContent: beforeContent.rows || [],
      images: images.rows || [],
      videos: videos.rows || [],
      finalVideos: finalVideos.rows || []
    };
  } catch (error) {
    console.error('Error fetching request details:', error);
    return null;
  }
}

export default async function RequestViewPage({ params }) {
  const requestData = await getRequestDetails(params.id);

  if (!requestData) {
    notFound();
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Work Details</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          View work #{requestData.request.id} and add CEO comments
        </p>
      </div>

      <Suspense fallback={<div>Loading work details...</div>}>
        <RequestApprovalForm requestData={requestData} />
      </Suspense>
    </div>
  );
}
