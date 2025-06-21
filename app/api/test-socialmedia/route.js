import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
    let client;
    try {
        client = await connectToDatabase();
        
        // Test if socialmediaperson table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'socialmediaperson'
            );
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        
        if (!tableExists) {
            return NextResponse.json({ 
                success: false, 
                error: 'socialmediaperson table does not exist' 
            });
        }
        
        // Get count of socialmediaperson records
        const countResult = await client.query('SELECT COUNT(*) as count FROM socialmediaperson');
        const count = countResult.rows[0].count;
        
        // Get sample data (first 5 records)
        const sampleResult = await client.query('SELECT id, name, email, role FROM socialmediaperson LIMIT 5');
        const sampleData = sampleResult.rows;
        
        return NextResponse.json({ 
            success: true, 
            message: 'socialmediaperson table exists',
            count: count,
            sampleData: sampleData
        });
    } catch (error) {
        console.error('Test error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    } finally {
        if (client && client.release) {
            client.release();
        }
    }
} 