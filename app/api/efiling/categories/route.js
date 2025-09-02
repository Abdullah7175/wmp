import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const department_id = searchParams.get('department_id');
    const is_active = searchParams.get('is_active');
    
    let client;
    try {
        client = await connectToDatabase();
        console.log('Database connected successfully');
        
        // First, check if the efiling_file_categories table exists
        try {
            const tableCheck = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'efiling_file_categories'
                );
            `);
            console.log('Categories table exists check:', tableCheck.rows[0]);
            
            if (!tableCheck.rows[0].exists) {
                console.log('efiling_file_categories table does not exist - returning empty array');
                return NextResponse.json([]);
            }
        } catch (tableError) {
            console.error('Error checking categories table existence:', tableError);
            // Return empty array instead of error
            return NextResponse.json([]);
        }
        
        if (id) {
            const query = `
                SELECT c.*, d.name as department_name
                FROM efiling_file_categories c
                LEFT JOIN efiling_departments d ON c.department_id = d.id
                WHERE c.id = $1
            `;
            const result = await client.query(query, [id]);
            
            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Category not found' }, { status: 404 });
            }
            
            return NextResponse.json(result.rows[0]);
        } else {
            let query = `
                SELECT c.*, d.name as department_name
                FROM efiling_file_categories c
                LEFT JOIN efiling_departments d ON c.department_id = d.id
            `;
            const params = [];
            const conditions = [];
            let paramIndex = 1;
            
            if (department_id) {
                conditions.push(`c.department_id = $${paramIndex}`);
                params.push(department_id);
                paramIndex++;
            }
            
            if (is_active !== null && is_active !== undefined) {
                conditions.push(`c.is_active = $${paramIndex}`);
                params.push(is_active === 'true');
                paramIndex++;
            }
            
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            query += ` ORDER BY c.name ASC`;
            
            console.log('Executing categories query:', query);
            console.log('Query parameters:', params);
            
            const result = await client.query(query, params);
            console.log('Categories query result rows:', result.rows.length);
            
            return NextResponse.json(result.rows);
        }
    } catch (error) {
        console.error('Database error in GET /api/efiling/categories:', error);
        console.error('Error stack:', error.stack);
        // Return empty array instead of 500 error to prevent frontend crash
        return NextResponse.json([]);
    } finally {
        if (client) {
            await client.release();
        }
    }
} 