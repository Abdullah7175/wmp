import { Suspense } from "react";
import { query } from "@/lib/db";
import ApprovedRequestsList from "./components/ApprovedRequestsList";

async function getApprovedRequests() {
  try {
    const requests = await query(`
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
        ct.type_name as complaint_type,
        cst.subtype_name as complaint_subtype,
        t.town,
        st.subtown,
        d.title as district,
        u.name as creator_name,
        u.email as creator_email,
        wra.approval_status,
        wra.approval_date,
        wra.ceo_comments,
        s.name as status_name
      FROM work_requests wr
      LEFT JOIN work_request_approvals wra ON wr.id = wra.work_request_id
      LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
      LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
      LEFT JOIN town t ON wr.town_id = t.id
      LEFT JOIN subtown st ON wr.subtown_id = st.id
      LEFT JOIN district d ON t.district_id = d.id
      LEFT JOIN users u ON wr.creator_id = u.id
      LEFT JOIN status s ON wr.status_id = s.id
      WHERE wra.approval_status = 'approved'
      ORDER BY wra.approval_date DESC
    `);

    return requests.rows || [];
  } catch (error) {
    console.error('Error fetching approved requests:', error);
    return [];
  }
}

export default async function ApprovedRequestsPage() {
  const approvedRequests = await getApprovedRequests();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Approved Requests</h1>
        <p className="text-gray-600 mt-2">
          Work requests that have been approved by CEO and are ready for execution
        </p>
      </div>

      <Suspense fallback={<div>Loading approved requests...</div>}>
        <ApprovedRequestsList requests={approvedRequests} />
      </Suspense>
    </div>
  );
}
