import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { actionLogger, ENTITY_TYPES } from '@/lib/actionLogger';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const creator_id = searchParams.get('creator_id');
    const creator_type = searchParams.get('creator_type');
    const assigned_smagent_id = searchParams.get('assigned_smagent_id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const offset = (page - 1) * limit;
    const filter = searchParams.get('filter') || '';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    if (id && !Number.isInteger(Number(id))) {
        return NextResponse.json(
            { error: 'Invalid request ID format' },
            { status: 400 }
        );
    }
    const client = await connectToDatabase();
    try {
        if (id) {
            const numericId = Number(id);
            const query = `
                SELECT 
                    wr.*,
                    ST_Y(wr.geo_tag) as latitude,
                    ST_X(wr.geo_tag) as longitude,
                    t.town as town_name,
                    st.subtown as subtown_name,
                    ct.type_name as complaint_type,
                    cst.subtype_name as complaint_subtype,
                    COALESCE(u.name, ag.name, sm.name) as creator_name,
                    wr.creator_type,
                    a.name as assigned_to_name,
                    s.name as status_name,
                    d.title as district_name,
                    exen.name as executive_engineer_name,
                    contractor.name as contractor_name,
                    assistant.name as assistant_name,
                    (
                        SELECT name FROM socialmediaperson WHERE id IN (
                            SELECT socialmedia_agent_id FROM request_assign_smagent WHERE work_requests_id = wr.id AND (role = 1 OR role = 3) LIMIT 1
                        )
                    ) as videographer_name,
                    (
                        SELECT link FROM final_videos WHERE work_request_id = wr.id LIMIT 1
                    ) as final_video_link,
                    wr.updated_date as completion_date
                FROM work_requests wr
                LEFT JOIN town t ON wr.town_id = t.id
                LEFT JOIN subtown st ON wr.subtown_id = st.id
                LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
                LEFT JOIN users u ON wr.creator_type = 'user' AND wr.creator_id = u.id
                LEFT JOIN agents ag ON wr.creator_type = 'agent' AND wr.creator_id = ag.id
                LEFT JOIN socialmediaperson sm ON wr.creator_type = 'socialmedia' AND wr.creator_id = sm.id
                LEFT JOIN users a ON wr.assigned_to = a.id
                LEFT JOIN status s ON wr.status_id = s.id
                LEFT JOIN district d ON t.district_id = d.id
                LEFT JOIN agents exen ON wr.executive_engineer_id = exen.id AND exen.role = 1
                LEFT JOIN agents contractor ON wr.contractor_id = contractor.id AND contractor.role = 2
                LEFT JOIN users assistant ON wr.creator_type = 'user' AND wr.creator_id = assistant.id AND assistant.role = 5
                WHERE wr.id = $1
            `;
            const result = await client.query(query, [numericId]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Request not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            // Paginated with optional filter and creator filters
            let countQuery = `
                SELECT COUNT(*) FROM work_requests wr
                LEFT JOIN town t ON wr.town_id = t.id
                LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                LEFT JOIN status s ON wr.status_id = s.id
                LEFT JOIN users u ON wr.creator_type = 'user' AND wr.creator_id = u.id
                LEFT JOIN agents ag ON wr.creator_type = 'agent' AND wr.creator_id = ag.id
                LEFT JOIN socialmediaperson sm ON wr.creator_type = 'socialmedia' AND wr.creator_id = sm.id
            `;
            
            let dataQuery = `
                SELECT 
                    wr.id, 
                    wr.request_date, 
                    wr.address,
                    ST_Y(wr.geo_tag) as latitude, 
                    ST_X(wr.geo_tag) as longitude, 
                    t.town as town_name, 
                    ct.type_name as complaint_type, 
                    cst.subtype_name as complaint_subtype, 
                    wr.complaint_subtype_id, 
                    s.name as status_name,
                    s.id as status_id,
                    COALESCE(u.name, ag.name, sm.name) as creator_name,
                    wr.creator_type
                FROM work_requests wr
                LEFT JOIN town t ON wr.town_id = t.id
                LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
                LEFT JOIN status s ON wr.status_id = s.id
                LEFT JOIN users u ON wr.creator_type = 'user' AND wr.creator_id = u.id
                LEFT JOIN agents ag ON wr.creator_type = 'agent' AND wr.creator_id = ag.id
                LEFT JOIN socialmediaperson sm ON wr.creator_type = 'socialmedia' AND wr.creator_id = sm.id
            `;
            
            // Add JOIN for assigned social media agents if filtering by assigned_smagent_id
            if (assigned_smagent_id) {
                countQuery += ' JOIN request_assign_smagent ras ON wr.id = ras.work_requests_id';
                dataQuery += ' JOIN request_assign_smagent ras ON wr.id = ras.work_requests_id';
            }
            
            let whereClauses = [];
            let params = [];
            let paramIdx = 1;
            
            if (creator_id && creator_type === 'agent') {
                whereClauses.push(`(wr.contractor_id = $${paramIdx} OR wr.executive_engineer_id = $${paramIdx})`);
                params.push(creator_id);
                paramIdx += 1;
            } else if (creator_id && creator_type) {
                whereClauses.push(`wr.creator_id = $${paramIdx} AND wr.creator_type = $${paramIdx + 1}`);
                params.push(creator_id, creator_type);
                paramIdx += 2;
            }
            
            if (assigned_smagent_id) {
                whereClauses.push(`ras.socialmedia_agent_id = $${paramIdx}`);
                params.push(assigned_smagent_id);
                paramIdx += 1;
            }
            
            if (filter) {
                whereClauses.push(`(
                    CAST(wr.id AS TEXT) ILIKE $${paramIdx} OR
                    wr.address ILIKE $${paramIdx} OR
                    t.town ILIKE $${paramIdx} OR
                    ct.type_name ILIKE $${paramIdx} OR
                    s.name ILIKE $${paramIdx} OR
                    COALESCE(u.name, ag.name, sm.name) ILIKE $${paramIdx}
                )`);
                params.push(`%${filter}%`);
                paramIdx++;
            }
            
            if (dateFrom) {
                whereClauses.push(`wr.request_date >= $${paramIdx}`);
                params.push(dateFrom);
                paramIdx++;
            }
            
            if (dateTo) {
                whereClauses.push(`wr.request_date <= $${paramIdx}`);
                params.push(dateTo);
                paramIdx++;
            }
            
            let dataWhereClauses = [];
            let dataParamIdx = 1;
            let dataParams = [];
            
            if (creator_id && creator_type === 'agent') {
                dataWhereClauses.push(`(wr.contractor_id = $${dataParamIdx} OR wr.executive_engineer_id = $${dataParamIdx})`);
                dataParams.push(creator_id);
                dataParamIdx += 1;
            } else if (creator_id && creator_type) {
                dataWhereClauses.push(`wr.creator_id = $${dataParamIdx} AND wr.creator_type = $${dataParamIdx + 1}`);
                dataParams.push(creator_id, creator_type);
                dataParamIdx += 2;
            }
            
            if (assigned_smagent_id) {
                dataWhereClauses.push(`ras.socialmedia_agent_id = $${dataParamIdx}`);
                dataParams.push(assigned_smagent_id);
                dataParamIdx += 1;
            }
            
            if (filter) {
                dataWhereClauses.push(`(
                    CAST(wr.id AS TEXT) ILIKE $${dataParamIdx} OR
                    wr.address ILIKE $${dataParamIdx} OR
                    t.town ILIKE $${dataParamIdx} OR
                    ct.type_name ILIKE $${dataParamIdx} OR
                    s.name ILIKE $${dataParamIdx} OR
                    COALESCE(u.name, ag.name, sm.name) ILIKE $${dataParamIdx}
                )`);
                dataParams.push(`%${filter}%`);
                dataParamIdx++;
            }
            
            if (dateFrom) {
                dataWhereClauses.push(`wr.request_date >= $${dataParamIdx}`);
                dataParams.push(dateFrom);
                dataParamIdx++;
            }
            
            if (dateTo) {
                dataWhereClauses.push(`wr.request_date <= $${dataParamIdx}`);
                dataParams.push(dateTo);
                dataParamIdx++;
            }
            
            if (whereClauses.length > 0) {
                countQuery += ' WHERE ' + whereClauses.join(' AND ');
            }
            if (dataWhereClauses.length > 0) {
                dataQuery += ' WHERE ' + dataWhereClauses.join(' AND ');
            }
            dataQuery += ` ORDER BY wr.request_date DESC`;
            if (limit > 0) {
                dataQuery += ` LIMIT $${dataParamIdx} OFFSET $${dataParamIdx + 1}`;
                dataParams.push(limit, offset);
            }
            const countResult = await client.query(countQuery, params);
            const total = parseInt(countResult.rows[0].count, 10);
            const result = await client.query(dataQuery, dataParams);
            return NextResponse.json({ data: result.rows, total }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
}

export async function POST(req) {
    const client = await connectToDatabase();
    try {
        const body = await req.json();
        const {
            town_id,
            subtown_id,
            subtown_ids, // array of additional subtowns
            complaint_type_id,
            complaint_subtype_id,
            contact_number,
            address,
            description,
            latitude,
            longitude,
            creator_id,
            creator_type, // 'user', 'agent', 'socialmedia'
            executive_engineer_id,
            contractor_id,
            nature_of_work,
            budget_code,
            file_type
        } = body;
        // Validate required fields
        if (!town_id || !complaint_type_id || !contact_number || !address || !description || !creator_id || !creator_type) {
            return NextResponse.json({
                error: 'Missing required fields',
                details: {
                    town_id, complaint_type_id, contact_number, address, description, creator_id, creator_type
                }
            }, { status: 400 });
        }
        // Validate creator type
        const allowedCreatorTypes = ['user', 'agent', 'socialmedia'];
        if (!allowedCreatorTypes.includes(creator_type)) {
            return NextResponse.json({
                error: 'Invalid creator type. Must be user, agent, or socialmedia',
                received: creator_type
            }, { status: 400 });
        }
        // Validate that the creator_id exists in the correct table
        let validationQuery;
        switch (creator_type) {
            case 'user':
                validationQuery = 'SELECT id FROM users WHERE id = $1';
                break;
            case 'agent':
                validationQuery = 'SELECT id FROM agents WHERE id = $1';
                break;
            case 'socialmedia':
                validationQuery = 'SELECT id FROM socialmediaperson WHERE id = $1';
                break;
        }
        const validationResult = await client.query(validationQuery, [creator_id]);
        if (validationResult.rows.length === 0) {
            return NextResponse.json({
                error: `Invalid ${creator_type} ID`,
                received: creator_id
            }, { status: 400 });
        }
        let geoTag = null;
        if (latitude && longitude) {
            geoTag = `SRID=4326;POINT(${longitude} ${latitude})`;
        }
        // --- Auto-fill contractor/executive engineer IDs for agent submissions ---
        let final_contractor_id = contractor_id;
        let final_executive_engineer_id = executive_engineer_id;
        if (creator_type === 'agent') {
            // Fetch agent role
            const agentRoleRes = await client.query('SELECT role FROM agents WHERE id = $1', [creator_id]);
            const agentRole = agentRoleRes.rows[0]?.role;
            if (Number(agentRole) === 2) {
                // Contractor: set contractor_id to own id, executive_engineer_id from form
                final_contractor_id = creator_id;
            } else if (Number(agentRole) === 1) {
                // Executive Engineer: set executive_engineer_id to own id, contractor_id from form
                final_executive_engineer_id = creator_id;
            }
        }
        // Prepare extra fields for executive_engineer_id, contractor_id, nature_of_work, budget_code, file_type
        let extraFields = '';
        let extraValues = '';
        let extraParams = [];
        if (final_executive_engineer_id) {
            extraFields += ', executive_engineer_id';
            extraValues += ', $' + (10 + extraParams.length + (geoTag ? 1 : 0));
            extraParams.push(final_executive_engineer_id);
        }
        if (final_contractor_id) {
            extraFields += ', contractor_id';
            extraValues += ', $' + (10 + extraParams.length + (geoTag ? 1 : 0));
            extraParams.push(final_contractor_id);
        }
        if (nature_of_work) {
            extraFields += ', nature_of_work';
            extraValues += ', $' + (10 + extraParams.length + (geoTag ? 1 : 0));
            extraParams.push(nature_of_work);
        }
        if (budget_code) {
            extraFields += ', budget_code';
            extraValues += ', $' + (10 + extraParams.length + (geoTag ? 1 : 0));
            extraParams.push(budget_code);
        }
        if (file_type) {
            extraFields += ', file_type';
            extraValues += ', $' + (10 + extraParams.length + (geoTag ? 1 : 0));
            extraParams.push(file_type);
        }
        const query = `
            INSERT INTO work_requests (
                town_id,
                subtown_id,
                complaint_type_id,
                complaint_subtype_id,
                contact_number,
                address,
                description,
                creator_id,
                creator_type,
                geo_tag${extraFields}
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ${geoTag ? `$10` : 'NULL'}${extraValues})
            RETURNING id;
        `;
        const params = [
            town_id,
            subtown_id,
            complaint_type_id,
            complaint_subtype_id,
            contact_number,
            address,
            description,
            creator_id,
            creator_type
        ];
        if (geoTag) params.push(geoTag);
        params.push(...extraParams);
        await client.query('BEGIN');
        const result = await client.query(query, params);
        const workRequestId = result.rows[0].id;
        // Insert into work_request_subtowns if subtown_ids is present and is an array
        if (Array.isArray(subtown_ids) && subtown_ids.length > 0) {
            for (const stId of subtown_ids) {
                await client.query(
                    'INSERT INTO work_request_subtowns (work_request_id, subtown_id) VALUES ($1, $2)',
                    [workRequestId, stId]
                );
            }
        }
        await client.query('COMMIT');
        
        // Log the request creation action
        await actionLogger.create(req, ENTITY_TYPES.REQUEST, workRequestId, `Request #${workRequestId}`, {
            town_id,
            complaint_type_id,
            complaint_subtype_id,
            creator_type,
            creator_id,
            hasLocation: !!(latitude && longitude),
            subtownCount: Array.isArray(subtown_ids) ? subtown_ids.length : 0,
            executive_engineer_id: final_executive_engineer_id,
            contractor_id: final_contractor_id
        });
        
        // Insert notifications for relevant users
        try {
            // Get creator info
            let creatorName = '';
            if (creator_type === 'agent') {
                const res = await client.query('SELECT name, role FROM agents WHERE id = $1', [creator_id]);
                creatorName = res.rows[0]?.name || '';
                const creatorRole = res.rows[0]?.role;
                
                // Notify the other agent (contractor <-> executive engineer)
                if (Number(creatorRole) === 2 && final_executive_engineer_id && final_executive_engineer_id !== creator_id) {
                    // Contractor created, notify executive engineer
                    await client.query(
                        'INSERT INTO notifications (agent_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
                        [final_executive_engineer_id, 'request', workRequestId, `New work request from ${creatorName} for you.`]
                    );
                } else if (Number(creatorRole) === 1 && final_contractor_id && final_contractor_id !== creator_id) {
                    // Executive engineer created, notify contractor
                    await client.query(
                        'INSERT INTO notifications (agent_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
                        [final_contractor_id, 'request', workRequestId, `New work request from ${creatorName} for you.`]
                    );
                }
                
                // Notify all managers (role=1 or 2) and admins
                const managers = await client.query('SELECT id FROM users WHERE role IN (1,2)');
                for (const mgr of managers.rows) {
                    await client.query(
                        'INSERT INTO notifications (user_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
                        [mgr.id, 'request', workRequestId, `New work request from ${creatorName} (Agent).`]
                    );
                }
            } else if (creator_type === 'user') {
                const res = await client.query('SELECT name FROM users WHERE id = $1', [creator_id]);
                creatorName = res.rows[0]?.name || 'Manager';
                
                // Manager created, notify both contractor and executive engineer if present
                if (final_contractor_id && final_contractor_id !== creator_id) {
                    await client.query(
                        'INSERT INTO notifications (agent_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
                        [final_contractor_id, 'request', workRequestId, `New work request from ${creatorName} for you.`]
                    );
                }
                if (final_executive_engineer_id && final_executive_engineer_id !== creator_id) {
                    await client.query(
                        'INSERT INTO notifications (agent_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
                        [final_executive_engineer_id, 'request', workRequestId, `New work request from ${creatorName} for you.`]
                    );
                }
            }
        } catch (notifErr) {
            // Log but don't fail request
            console.error('Notification creation failed:', notifErr);
        }
        return NextResponse.json({
            message: 'Work request submitted successfully',
            id: workRequestId
        }, { status: 200 });
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('Error submitting work request:', error);
        return NextResponse.json({ error: 'Failed to submit work request', details: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(req) {
    const client = await connectToDatabase();

    try {
        const body = await req.json();
        const { 
            id,
            assigned_to,
            status_id,
            assigned_sm_agents,
            shoot_date,
            executive_engineer_id,
            contractor_id,
            budget_code,
            file_type,
            nature_of_work
        } = body;

        // Fetch current status_id and assigned_to if not provided
        let finalStatusId = status_id;
        let finalAssignedTo = assigned_to;
        if (!status_id || !assigned_to) {
            const current = await client.query('SELECT status_id, assigned_to FROM work_requests WHERE id = $1', [id]);
            if (current.rows.length > 0) {
                if (!status_id) finalStatusId = current.rows[0].status_id;
                if (!assigned_to) finalAssignedTo = current.rows[0].assigned_to;
            }
        }

        await client.query('BEGIN');

        // If shoot_date is present, update it
        if (shoot_date) {
            await client.query(
                'UPDATE work_requests SET shoot_date = $1 WHERE id = $2',
                [shoot_date, id]
            );
        }

        // Update extra fields
        const updateFields = [];
        const updateParams = [];
        let paramIdx = 3; // 1: assigned_to, 2: status_id, 3: id
        if (executive_engineer_id !== undefined) {
            updateFields.push(`executive_engineer_id = $${++paramIdx}`);
            updateParams.push(executive_engineer_id);
        }
        if (contractor_id !== undefined) {
            updateFields.push(`contractor_id = $${++paramIdx}`);
            updateParams.push(contractor_id);
        }
        if (budget_code !== undefined) {
            updateFields.push(`budget_code = $${++paramIdx}`);
            updateParams.push(budget_code);
        }
        if (file_type !== undefined) {
            updateFields.push(`file_type = $${++paramIdx}`);
            updateParams.push(file_type);
        }
        if (nature_of_work !== undefined) {
            updateFields.push(`nature_of_work = $${++paramIdx}`);
            updateParams.push(nature_of_work);
        }

        let updateQuery = `
            UPDATE work_requests
            SET 
                assigned_to = $1,
                status_id = $2`;
        if (updateFields.length > 0) {
            updateQuery += ', ' + updateFields.join(', ');
        }
        updateQuery += `
            WHERE id = $3
            RETURNING *;
        `;

        const updateResult = await client.query(updateQuery, [
            finalAssignedTo,
            finalStatusId,
            id,
            ...updateParams
        ]);

        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // Handle social media agent assignments
        if (assigned_sm_agents && assigned_sm_agents.length > 0) {
            await client.query('DELETE FROM request_assign_smagent WHERE work_requests_id = $1', [id]);
            for (const smAgent of assigned_sm_agents) {
                await client.query(
                    'INSERT INTO request_assign_smagent (work_requests_id, socialmedia_agent_id, status) VALUES ($1, $2, $3)',
                    [id, smAgent.sm_agent_id, smAgent.status || 1]
                );
                // Insert notification for the assigned smagent
                await client.query(
                    'INSERT INTO notifications (socialmedia_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
                    [smAgent.sm_agent_id, 'assignment', id, `You have been assigned to request #${id}.`]
                );
            }
        }

        await client.query('COMMIT');

        // Log the request update action
        await actionLogger.update(req, ENTITY_TYPES.REQUEST, id, `Request #${id}`, {
            assigned_to: finalAssignedTo,
            status_id: finalStatusId,
            shoot_date,
            executive_engineer_id,
            contractor_id,
            budget_code,
            file_type,
            nature_of_work,
            smAgentsAssigned: assigned_sm_agents ? assigned_sm_agents.length : 0
        });

        return NextResponse.json({ 
            message: 'Work request updated successfully', 
            request: updateResult.rows[0] 
        }, { status: 200 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating work request:', error);
        return NextResponse.json({ error: 'Failed to update work request' }, { status: 500 });
    } finally {
        client.release();
    }
}