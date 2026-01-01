import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// GET - Get all daak categories
export async function GET(request) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const is_active = searchParams.get('is_active');

        client = await connectToDatabase();

        if (id) {
            // Get single category
            const result = await client.query(
                'SELECT * FROM efiling_daak_categories WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Category not found' }, { status: 404 });
            }

            return NextResponse.json({ category: result.rows[0] });
        } else {
            // Get all categories
            let query = 'SELECT * FROM efiling_daak_categories';
            const params = [];
            const conditions = [];
            let paramIndex = 1;

            if (is_active !== null && is_active !== undefined) {
                conditions.push(`is_active = $${paramIndex}`);
                params.push(is_active === 'true');
                paramIndex++;
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ' ORDER BY name ASC';

            const result = await client.query(query, params);
            return NextResponse.json({ categories: result.rows });
        }
    } catch (error) {
        console.error('Error fetching daak categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

// POST - Create new daak category
export async function POST(request) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { name, code, description, color, is_active = true } = body;

        if (!name || !code) {
            return NextResponse.json(
                { error: 'Name and code are required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();

        // Check if code already exists
        const existingCheck = await client.query(
            'SELECT id FROM efiling_daak_categories WHERE code = $1',
            [code]
        );

        if (existingCheck.rows.length > 0) {
            return NextResponse.json(
                { error: 'Category code already exists' },
                { status: 400 }
            );
        }

        // Insert new category
        const result = await client.query(
            `INSERT INTO efiling_daak_categories (name, code, description, color, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, code, description || null, color || null, is_active]
        );

        return NextResponse.json({
            success: true,
            category: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating daak category:', error);
        return NextResponse.json(
            { error: 'Failed to create category', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

// PUT - Update daak category
export async function PUT(request) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { id, name, code, description, color, is_active } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();

        // Check if category exists
        const existingCheck = await client.query(
            'SELECT id FROM efiling_daak_categories WHERE id = $1',
            [id]
        );

        if (existingCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Check if code already exists (for another category)
        if (code) {
            const codeCheck = await client.query(
                'SELECT id FROM efiling_daak_categories WHERE code = $1 AND id != $2',
                [code, id]
            );

            if (codeCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: 'Category code already exists' },
                    { status: 400 }
                );
            }
        }

        // Build update query dynamically
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex}`);
            params.push(name);
            paramIndex++;
        }

        if (code !== undefined) {
            updates.push(`code = $${paramIndex}`);
            params.push(code);
            paramIndex++;
        }

        if (description !== undefined) {
            updates.push(`description = $${paramIndex}`);
            params.push(description);
            paramIndex++;
        }

        if (color !== undefined) {
            updates.push(`color = $${paramIndex}`);
            params.push(color);
            paramIndex++;
        }

        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex}`);
            params.push(is_active);
            paramIndex++;
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(id);

        const query = `
            UPDATE efiling_daak_categories
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await client.query(query, params);

        return NextResponse.json({
            success: true,
            category: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating daak category:', error);
        return NextResponse.json(
            { error: 'Failed to update category', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

// DELETE - Delete daak category
export async function DELETE(request) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();

        // Check if category exists
        const existingCheck = await client.query(
            'SELECT id FROM efiling_daak_categories WHERE id = $1',
            [id]
        );

        if (existingCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Check if category is being used
        const usageCheck = await client.query(
            'SELECT COUNT(*) as count FROM efiling_daak WHERE category_id = $1',
            [id]
        );

        if (parseInt(usageCheck.rows[0].count) > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category that is in use. Deactivate it instead.' },
                { status: 400 }
            );
        }

        // Delete category
        await client.query(
            'DELETE FROM efiling_daak_categories WHERE id = $1',
            [id]
        );

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting daak category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}
