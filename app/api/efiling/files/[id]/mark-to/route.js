import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction, ENTITY_TYPES } from '@/lib/actionLogger';

export async function POST(request, { params }) {
    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        const { user_ids, remarks } = body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 });
        }

        client = await connectToDatabase();

        // Start transaction
        await client.query('BEGIN');

        try {
            // Update file status to 'In Progress' if it's currently 'Draft'
            const fileUpdate = await client.query(`
                UPDATE efiling_files 
                SET status_id = (
                    SELECT id FROM efiling_file_status WHERE code = 'IN_PROGRESS'
                ), updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND status_id = (
                    SELECT id FROM efiling_file_status WHERE code = 'DRAFT'
                )
                RETURNING id
            `, [id]);

            // Create file movements for each user
            const movementPromises = user_ids.map(async (userId) => {
                return await client.query(`
                    INSERT INTO efiling_file_movements (
                        file_id, from_user_id, to_user_id, action_type, remarks
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                `, [id, null, userId, 'forward', remarks]);
            });

            const movements = await Promise.all(movementPromises);

            // Commit transaction
            await client.query('COMMIT');

            // Log the action
            await logAction(request, 'MARK_TO', ENTITY_TYPES.EFILING_FILE, {
                entityId: id,
                entityName: `File ${id}`,
                details: { 
                    user_ids: user_ids, 
                    remarks: remarks,
                    movements_created: movements.length 
                }
            });

            return NextResponse.json({ 
                message: `File marked to ${user_ids.length} user(s) successfully`,
                movements: movements.map(m => m.rows[0])
            });

        } catch (error) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function GET(request, { params }) {
    let client;
    try {
        const { id } = await params;
        client = await connectToDatabase();

        // Get file movements for the specified file
        const result = await client.query(`
            SELECT 
                fm.*,
                u1.name as from_user_name,
                u2.name as to_user_name,
                d1.name as from_department_name,
                d2.name as to_department_name
            FROM efiling_file_movements fm
            LEFT JOIN efiling_users u1 ON fm.from_user_id = u1.id
            LEFT JOIN efiling_users u2 ON fm.to_user_id = u2.id
            LEFT JOIN efiling_departments d1 ON fm.from_department_id = d1.id
            LEFT JOIN efiling_departments d2 ON fm.to_department_id = d2.id
            WHERE fm.file_id = $1
            ORDER BY fm.created_at DESC
        `, [id]);

        return NextResponse.json({
            file_id: id,
            movements: result.rows
        });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) {
            await client.release();
        }
    }
}
