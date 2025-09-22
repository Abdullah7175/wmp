import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query } from "@/lib/db";
import { logUserAction } from "@/lib/userActionLogger";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow CE users (role 7) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 7) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. CE access required." },
        { status: 401 }
      );
    }

    // Get CE user departments (complaint types)
    const ceUserQuery = await query(`
      SELECT 
        cu.id as ce_user_id,
        cu.user_id,
        cu.designation,
        cu.address,
        array_agg(cud.complaint_type_id) as department_ids
      FROM ce_users cu
      LEFT JOIN ce_user_departments cud ON cu.id = cud.ce_user_id
      WHERE cu.user_id = $1
      GROUP BY cu.id, cu.user_id, cu.designation, cu.address
    `, [session.user.id]);

    if (ceUserQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "CE user not found or no departments assigned." },
        { status: 404 }
      );
    }

    const ceUser = ceUserQuery.rows[0];
    const departmentIds = ceUser.department_ids.filter(id => id !== null);

    if (departmentIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        ce_user: {
          id: ceUser.ce_user_id,
          designation: ceUser.designation,
          departments: []
        },
        message: "No departments assigned to this CE user."
      });
    }

    // Get department names
    const departmentNamesQuery = await query(`
      SELECT id, type_name FROM complaint_types WHERE id = ANY($1)
    `, [departmentIds]);

    const departmentNames = departmentNamesQuery.rows.reduce((acc, dept) => {
      acc[dept.id] = dept.type_name;
      return acc;
    }, {});

    // Log CE request list access
    await logUserAction({
      user_id: session.user.id,
      user_type: 'ce',
      user_role: 7,
      user_name: session.user.name || 'CE',
      user_email: session.user.email,
      action_type: 'VIEW_REQUESTS',
      entity_type: 'WORK_REQUESTS',
      entity_id: null,
      details: `CE viewed requests for departments: ${departmentIds.join(', ')}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Build the WHERE clause for department filtering
    const departmentPlaceholders = departmentIds.map((_, index) => `$${index + 1}`).join(',');
    
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
        wr.creator_type,
        ct.type_name as complaint_type,
        ct.id as complaint_type_id,
        cst.subtype_name as complaint_subtype,
        t.town,
        st.subtown,
        d.title as district,
        CASE 
          WHEN wr.creator_type = 'user' THEN u.name
          WHEN wr.creator_type = 'agent' THEN a.name
          WHEN wr.creator_type = 'socialmedia' THEN sm.name
          ELSE 'Unknown'
        END as creator_name,
        CASE 
          WHEN wr.creator_type = 'user' THEN u.email
          WHEN wr.creator_type = 'agent' THEN a.email
          WHEN wr.creator_type = 'socialmedia' THEN sm.email
          ELSE NULL
        END as creator_email,
        CASE 
          WHEN wr.creator_type = 'user' THEN r.title
          WHEN wr.creator_type = 'agent' THEN a.designation
          WHEN wr.creator_type = 'socialmedia' THEN 'Social Media Agent'
          ELSE 'Unknown'
        END as creator_designation,
        CASE 
          WHEN wr.creator_type = 'user' THEN u.role
          WHEN wr.creator_type = 'agent' THEN a.role
          WHEN wr.creator_type = 'socialmedia' THEN sm.role
          ELSE NULL
        END as creator_role,
        ceo_approval.approval_status,
        ceo_approval.approved_at as approval_date,
        ceo_approval.comments as ceo_comments,
        coo_approval.approval_status as coo_approval_status,
        coo_approval.comments as coo_comments,
        coo_approval.approved_at as coo_approval_date,
        ce_approval.approval_status as ce_approval_status,
        ce_approval.comments as ce_comments,
        ce_approval.approved_at as ce_approval_date,
        s.name as status_name,
        COALESCE(bi_count.count, 0) as before_images_count,
        COALESCE(img_count.count, 0) as images_count,
        COALESCE(vid_count.count, 0) as videos_count,
        COALESCE(fv_count.count, 0) as final_videos_count
      FROM work_requests wr
      LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
      LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
      LEFT JOIN town t ON wr.town_id = t.id
      LEFT JOIN subtown st ON wr.subtown_id = st.id
      LEFT JOIN district d ON t.district_id = d.id
      LEFT JOIN users u ON wr.creator_id = u.id AND wr.creator_type = 'user'
      LEFT JOIN agents a ON wr.creator_id = a.id AND wr.creator_type = 'agent'
      LEFT JOIN socialmediaperson sm ON wr.creator_id = sm.id AND wr.creator_type = 'socialmedia'
      LEFT JOIN role r ON u.role = r.id
      LEFT JOIN status s ON wr.status_id = s.id
      LEFT JOIN work_request_soft_approvals ceo_approval ON wr.id = ceo_approval.work_request_id AND ceo_approval.approver_type = 'ceo'
      LEFT JOIN work_request_soft_approvals coo_approval ON wr.id = coo_approval.work_request_id AND coo_approval.approver_type = 'coo'
      LEFT JOIN work_request_soft_approvals ce_approval ON wr.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      LEFT JOIN (
        SELECT work_request_id, COUNT(*) as count 
        FROM before_content 
        GROUP BY work_request_id
      ) bi_count ON wr.id = bi_count.work_request_id
      LEFT JOIN (
        SELECT work_request_id, COUNT(*) as count 
        FROM images 
        GROUP BY work_request_id
      ) img_count ON wr.id = img_count.work_request_id
      LEFT JOIN (
        SELECT work_request_id, COUNT(*) as count 
        FROM videos 
        GROUP BY work_request_id
      ) vid_count ON wr.id = vid_count.work_request_id
      LEFT JOIN (
        SELECT work_request_id, COUNT(*) as count 
        FROM final_videos 
        GROUP BY work_request_id
      ) fv_count ON wr.id = fv_count.work_request_id
      WHERE wr.complaint_type_id IN (${departmentPlaceholders})
      ORDER BY wr.created_date DESC
    `, departmentIds);

    return NextResponse.json({
      success: true,
      data: requests.rows || [],
      ce_user: {
        id: ceUser.ce_user_id,
        designation: ceUser.designation,
        departments: departmentIds.map(id => ({
          id: id,
          type_name: departmentNames[id]
        }))
      }
    });

  } catch (error) {
    console.error('Error in CE requests API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}