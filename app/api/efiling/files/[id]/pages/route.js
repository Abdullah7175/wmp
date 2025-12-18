import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { canAddPages, getWorkflowState } from '@/lib/efilingWorkflowStateManager';
import { isSEOrCEAssistant } from '@/lib/efilingTeamManager';

/**
 * POST /api/efiling/files/[id]/pages
 * Add a new page to file (SE/CE and their assistants only)
 * Body: { page_title, page_content, page_type }
 */
export async function POST(request, { params }) {
    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        const { page_title, page_content, page_type = 'MAIN', notes } = body;
        
        if (!page_title && !page_content) {
            return NextResponse.json(
                { error: 'page_title or page_content is required' },
                { status: 400 }
            );
        }
        
        const session = await auth(request);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        client = await connectToDatabase();
        await client.query('BEGIN');
        
        // Get current user's efiling info
        const currentUserRes = await client.query(`
            SELECT eu.id, eu.efiling_role_id, r.code as role_code
            FROM efiling_users eu
            JOIN users u ON eu.user_id = u.id
            LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
            WHERE u.id = $1 AND eu.is_active = true
        `, [session.user.id]);
        
        if (currentUserRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'User not found in e-filing system' }, { status: 403 });
        }
        
        const currentUser = currentUserRes.rows[0];
        const currentUserRoleCode = (currentUser.role_code || '').toUpperCase();
        
        // Check if user can add pages
        const canAdd = await canAddPages(client, id, currentUser.id);
        if (!canAdd) {
            await client.query('ROLLBACK');
            return NextResponse.json({
                error: 'Only SE/CE and their assistants can add pages to files assigned to SE/CE',
                code: 'PERMISSION_DENIED'
            }, { status: 403 });
        }
        
        // Get file info
        const fileRes = await client.query(`
            SELECT id, page_count
            FROM efiling_files
            WHERE id = $1
        `, [id]);
        
        if (fileRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        const file = fileRes.rows[0];
        const newPageNumber = (file.page_count || 0) + 1;
        
        // Determine addition type
        let additionType = 'CE_PAGE';
        if (currentUserRoleCode === 'SE') {
            additionType = 'SE_PAGE';
        } else {
            // Check if user is assistant
            const assistantInfo = await isSEOrCEAssistant(client, currentUser.id);
            if (assistantInfo) {
                if (assistantInfo.manager_role_code === 'SE') {
                    additionType = 'SE_ASSISTANT_PAGE';
                } else if (assistantInfo.manager_role_code === 'CE') {
                    additionType = 'CE_ASSISTANT_PAGE';
                }
            }
        }
        
        // Create new page
        const pageRes = await client.query(`
            INSERT INTO efiling_document_pages (
                file_id, page_number, page_title, page_content, page_type, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, page_number, page_title, page_type, created_at
        `, [id, newPageNumber, page_title || null, page_content || null, page_type, currentUser.id]);
        
        const newPage = pageRes.rows[0];
        
        // Update file page count
        await client.query(`
            UPDATE efiling_files
            SET page_count = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [newPageNumber, id]);
        
        // Log page addition
        await client.query(`
            INSERT INTO efiling_file_page_additions (
                file_id, page_id, added_by, added_by_role_code, addition_type, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [id, newPage.id, currentUser.id, currentUserRoleCode, additionType, notes || null]);
        
        await client.query('COMMIT');
        
        return NextResponse.json({
            success: true,
            message: 'Page added successfully',
            page: newPage,
            addition_type: additionType
        });
        
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error adding page:', error);
        return NextResponse.json(
            { error: 'Failed to add page', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

/**
 * GET /api/efiling/files/[id]/pages
 * Get all pages for a file including addition history
 */
export async function GET(request, { params }) {
    let client;
    try {
        const { id } = await params;
        client = await connectToDatabase();
        
        // Get all pages
        const pagesRes = await client.query(`
            SELECT 
                p.*,
                u.name as created_by_name,
                r.code as created_by_role_code
            FROM efiling_document_pages p
            LEFT JOIN efiling_users eu ON p.created_by = eu.id
            LEFT JOIN users u ON eu.user_id = u.id
            LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
            WHERE p.file_id = $1 AND p.is_active = true
            ORDER BY p.page_number ASC
        `, [id]);
        
        // Get page addition history
        const additionsRes = await client.query(`
            SELECT 
                pa.*,
                u.name as added_by_name,
                r.code as added_by_role_code
            FROM efiling_file_page_additions pa
            JOIN efiling_users eu ON pa.added_by = eu.id
            JOIN users u ON eu.user_id = u.id
            LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
            WHERE pa.file_id = $1
            ORDER BY pa.added_at ASC
        `, [id]);
        
        return NextResponse.json({
            success: true,
            pages: pagesRes.rows,
            additions: additionsRes.rows
        });
        
    } catch (error) {
        console.error('Error fetching pages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pages', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

