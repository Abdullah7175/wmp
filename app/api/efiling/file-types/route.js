import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger } from '@/lib/efilingActionLogger';

export async function GET(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const categoryId = searchParams.get('categoryId');



        client = await connectToDatabase();

        if (id) {
            // Fetch single file type
            const result = await client.query(`
                SELECT 
                    ft.*,
                    fc.name as category_name,
                    fc.description as category_description,
                    d.name as department_name,
                    d.code as department_code
                FROM efiling_file_types ft
                LEFT JOIN efiling_file_categories fc ON ft.category_id = fc.id
                LEFT JOIN efiling_departments d ON ft.department_id = d.id
                WHERE ft.id = $1
            `, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: 'File type not found' },
                    { status: 404 }
                );
            }

            // Log the action
            try {
                            await eFileActionLogger.logAction({
                entityId: null,
                userId: 'system',
                action: 'FILE_TYPE_VIEWED',
                entityType: 'efiling_file_type',
                details: { 
                    fileTypeId: id, 
                    name: result.rows[0].name,
                    description: `File type "${result.rows[0].name}" viewed`
                }
            });
            } catch (logError) {
                console.error('Error logging file type view action:', logError);
            }

            return NextResponse.json(result.rows[0]);

        } else {
            // Fetch all file types
            let query = `
                SELECT 
                    ft.*,
                    fc.name as category_name,
                    fc.description as category_description,
                    d.name as department_name,
                    d.code as department_code
                FROM efiling_file_types ft
                LEFT JOIN efiling_file_categories fc ON ft.category_id = fc.id
                LEFT JOIN efiling_departments d ON ft.department_id = d.id
                WHERE 1=1
            `;
            
            const params = [];
            let paramCount = 1;

            if (categoryId) {
                query += ` AND ft.category_id = $${paramCount}`;
                params.push(categoryId);
                paramCount++;
            }



            query += ` ORDER BY ft.name ASC`;

            const result = await client.query(query, params);

            // Log the action
            try {
                            await eFileActionLogger.logAction({
                entityId: null,
                userId: 'system',
                action: 'FILE_TYPES_LISTED',
                entityType: 'efiling_file_type',
                details: { 
                    count: result.rows.length,
                    description: `File types list viewed (${result.rows.length} types)`
                }
            });
            } catch (logError) {
                console.error('Error logging file types list action:', logError);
            }

            return NextResponse.json({
                success: true,
                fileTypes: result.rows
            });
        }

    } catch (error) {
        console.error('Error fetching file types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch file types' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function POST(request) {
    let client;
    try {
        const body = await request.json();
        const { 
            name, 
            description, 
            categoryId, 
            code, 
            requiresApproval, 
            createdBy, 
            ipAddress, 
            userAgent 
        } = body;

        // Input validation
        if (!name || !categoryId || !code) {
            return NextResponse.json(
                { error: 'Name, category ID, and code are required' },
                { status: 400 }
            );
        }



        client = await connectToDatabase();

        // Check if code already exists
        const existingCode = await client.query(`
            SELECT id FROM efiling_file_types WHERE code = $1
        `, [code]);

        if (existingCode.rows.length > 0) {
            return NextResponse.json(
                { error: 'File type code already exists' },
                { status: 409 }
            );
        }

        // Create file type
        const result = await client.query(`
            INSERT INTO efiling_file_types (
                name, description, category_id, code, requires_approval, 
                created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
        `, [
            name,
            description,
            categoryId,
            code,
            requiresApproval !== false
        ]);

        const fileType = result.rows[0];

        // Log the action
        try {
            await eFileActionLogger.logAction({
                entityId: null,
                userId: createdBy || 'system',
                action: 'FILE_TYPE_CREATED',
                entityType: 'efiling_file_type',
                details: {
                    fileTypeName: name,
                    code,
                    categoryId,
                    requiresApproval,
                    description: `File type "${name}" (${code}) created`
                }
            });
        } catch (logError) {
            console.error('Error logging file type creation action:', logError);
        }

        return NextResponse.json({
            success: true,
            fileType: {
                id: fileType.id,
                name: fileType.name,
                description: fileType.description,
                code: fileType.code,
                categoryId: fileType.category_id,
                requiresApproval: fileType.requires_approval
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating file type:', error);
        return NextResponse.json(
            { error: 'Failed to create file type' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function PUT(request) {
    let client;
    try {
        const body = await request.json();
        const { id, name, description, code, requires_approval, department_id } = body;
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
        const userAgent = request.headers.get('user-agent');

        if (!id || !name || !code) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();

        // Check if code already exists for other file types
        const existingCode = await client.query(`
            SELECT id FROM efiling_file_types WHERE code = $1 AND id != $2
        `, [code, id]);

        if (existingCode.rows.length > 0) {
            return NextResponse.json(
                { error: 'File type code already exists' },
                { status: 409 }
            );
        }

        // Update file type
        const result = await client.query(`
            UPDATE efiling_file_types SET
                name = $1,
                description = $2,
                code = $3,
                requires_approval = $4,
                department_id = $5,
                updated_at = NOW()
            WHERE id = $6
            RETURNING *
        `, [
            name,
            description,
            code,
            requires_approval,
            department_id,
            id
        ]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'File type not found' },
                { status: 404 }
            );
        }

        const fileType = result.rows[0];

        // Log the action
        try {
            await eFileActionLogger.logAction({
                entityId: null,
                userId: 'system',
                action: 'FILE_TYPE_UPDATED',
                entityType: 'efiling_file_type',
                details: {
                    fileTypeName: name,
                    code,
                    requires_approval,
                    department_id,
                    description: `File type "${name}" (${code}) updated`
                }
            });
        } catch (logError) {
            console.error('Error logging file type update action:', logError);
        }

        return NextResponse.json({
            success: true,
            fileType: fileType
        });

    } catch (error) {
        console.error('Error updating file type:', error);
        return NextResponse.json(
            { error: 'Failed to update file type' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function DELETE(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
        const userAgent = request.headers.get('user-agent');

        if (!id) {
            return NextResponse.json(
                { error: 'File type ID is required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();

        // Check if file type exists
        const existingFileType = await client.query(`
            SELECT name FROM efiling_file_types WHERE id = $1
        `, [id]);

        if (existingFileType.rows.length === 0) {
            return NextResponse.json(
                { error: 'File type not found' },
                { status: 404 }
            );
        }

        // Check if file type is being used by any files
        const filesUsingType = await client.query(`
            SELECT COUNT(*) as count FROM efiling_files WHERE file_type_id = $1
        `, [id]);

        if (parseInt(filesUsingType.rows[0].count) > 0) {
            return NextResponse.json(
                { error: 'Cannot delete file type that is being used by existing files' },
                { status: 409 }
            );
        }

        // Delete file type
        await client.query(`
            DELETE FROM efiling_file_types WHERE id = $1
        `, [id]);

        // Log the action
        try {
            await eFileActionLogger.logAction({
                entityId: null,
                userId: 'system',
                action: 'FILE_TYPE_DELETED',
                entityType: 'efiling_file_type',
                details: {
                    fileTypeName: existingFileType.rows[0].name,
                    description: `File type "${existingFileType.rows[0].name}" deleted`
                }
            });
        } catch (logError) {
            console.error('Error logging file type deletion action:', logError);
        }

        return NextResponse.json({
            success: true,
            message: 'File type deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting file type:', error);
        return NextResponse.json(
            { error: 'Failed to delete file type' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
