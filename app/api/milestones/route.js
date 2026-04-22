import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { actionLogger, ENTITY_TYPES } from '@/lib/actionLogger';

export const dynamic = 'force-dynamic';

// GET: Fetch all definitions or a specific one
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const natureOfWork = searchParams.get('nature_of_work');
    
    const client = await connectToDatabase();
    try {
        if (id) {
            const query = 'SELECT * FROM milestone_definitions WHERE id = $1';
            const result = await client.query(query, [id]);
            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Definition not found' }, { status: 404 });
            }
            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            let query = 'SELECT * FROM milestone_definitions';
            let params = [];

            if (natureOfWork) {
                query += ' WHERE nature_of_work = $1';
                params.push(natureOfWork);
            }

            // Order by nature of work then sequence so the table is organized
            query += ' ORDER BY nature_of_work ASC, order_sequence ASC';
            
            const result = await client.query(query, params);
            return NextResponse.json({ data: result.rows }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching milestone definitions:', error);
        return NextResponse.json({ error: 'Failed to fetch definitions' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
}

// POST: Admin adds a new milestone definition
export async function POST(req) {
    try {
        const { auth } = await import('@/auth');
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check for Admin Role (1)
        if (parseInt(session.user.role) !== 1) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
        const body = await req.json();
        const { nature_of_work, milestone_name, order_sequence } = body;

        // Basic validation
        if (!nature_of_work || !milestone_name || !order_sequence) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await connectToDatabase();

        const query = `
            INSERT INTO milestone_definitions (nature_of_work, milestone_name, order_sequence)
            VALUES ($1, $2, $3) RETURNING *;
        `;
        
        const { rows } = await client.query(query, [
            nature_of_work,
            milestone_name,
            parseInt(order_sequence, 10)
        ]);

        await actionLogger.create(req, 'MILESTONE_DEFINITION', rows[0].id, rows[0].milestone_name, {
            nature: rows[0].nature_of_work,
            sequence: rows[0].order_sequence
        });

        return NextResponse.json({
            message: 'Milestone definition added successfully',
            data: rows[0],
        }, { status: 201 });

    } catch (error) {
        console.error('Error saving definition:', error);
        return NextResponse.json({ error: error.message || 'Error saving definition' }, { status: 500 });
    }
}

// PUT: Admin updates an existing milestone definition
export async function PUT(req) {
    try {
        const { auth } = await import('@/auth');
        const session = await auth();
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // --- FIX: Added Admin Role Check ---
        // If only Admins (1) can add, they should probably be the only ones to edit.
        if (parseInt(session.user.role) !== 1) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        const { id, nature_of_work, milestone_name, order_sequence } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const client = await connectToDatabase();

        const query = `
            UPDATE milestone_definitions 
            SET nature_of_work = $1, milestone_name = $2, order_sequence = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *;
        `;
        
        const { rows } = await client.query(query, [
            nature_of_work, 
            milestone_name, 
            parseInt(order_sequence, 10), 
            id
        ]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Definition not found' }, { status: 404 });
        }

        await actionLogger.update(req, 'MILESTONE_DEFINITION', rows[0].id, rows[0].milestone_name, {
            nature: rows[0].nature_of_work
        });

        return NextResponse.json({ 
            message: 'Definition updated successfully', 
            data: rows[0] 
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating definition:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Admin removes a definition
export async function DELETE(req) {
    try {
        const { auth } = await import('@/auth');
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await req.json();
        
        // Ensure user has admin/supervisor role (1 or 2)
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const client = await connectToDatabase();
        const query = 'DELETE FROM milestone_definitions WHERE id = $1 RETURNING *;';
        const { rows } = await client.query(query, [id]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Definition not found' }, { status: 404 });
        }

        await actionLogger.delete(req, 'MILESTONE_DEFINITION', rows[0].id, rows[0].milestone_name);

        return NextResponse.json({ message: 'Definition deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting definition:', error);
        return NextResponse.json({ error: 'Error deleting definition' }, { status: 500 });
    }
}