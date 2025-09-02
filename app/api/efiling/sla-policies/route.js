import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ENTITY_TYPES, EFILING_ACTION_TYPES } from '@/lib/efilingActionLogger';
import { validateEFileAccess, checkEFileRateLimit } from '@/lib/efilingSecurity';

export async function GET(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const fileTypeId = searchParams.get('fileTypeId');
        const isActive = searchParams.get('is_active');
        const userId = searchParams.get('userId');
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');

        // Rate limiting
        const rateLimit = checkEFileRateLimit(userId || 'anonymous', 'api', userId);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // Validate access
        const accessValidation = await validateEFileAccess(userId, 'sla_policy', null, 'VIEW_SLA_POLICIES');
        if (!accessValidation.allowed) {
            return NextResponse.json(
                { error: accessValidation.reason },
                { status: 403 }
            );
        }

        client = await connectToDatabase();

        if (id) {
            // Fetch single SLA policy
            const result = await client.query(`
                SELECT 
                    sp.*,
                    ft.name as file_type_name,
                    ft.code as file_type_code
                FROM efiling_sla_policies sp
                LEFT JOIN efiling_file_types ft ON sp.file_type_id = ft.id
                WHERE sp.id = $1
            `, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: 'SLA policy not found' },
                    { status: 404 }
                );
            }

            // Log the action
            await eFileActionLogger.logAction({
                entityType: 'SLA_POLICY',
                entityId: id,
                action: 'SLA_POLICY_VIEWED',
                userId: userId || 'anonymous',
                details: { slaPolicyId: id },
                ipAddress
            });

            return NextResponse.json(result.rows[0]);

        } else {
            // Fetch all SLA policies
            let query = `
                SELECT 
                    sp.*,
                    ft.name as file_type_name,
                    ft.code as file_type_code
                FROM efiling_sla_policies sp
                LEFT JOIN efiling_file_types ft ON sp.file_type_id = ft.id
                WHERE 1=1
            `;
            
            const params = [];
            let paramCount = 1;

            if (fileTypeId) {
                query += ` AND sp.file_type_id = $${paramCount}`;
                params.push(fileTypeId);
                paramCount++;
            }

            if (isActive !== null) {
                query += ` AND sp.is_active = $${paramCount}`;
                params.push(isActive === 'true');
                paramCount++;
            }

            query += ` ORDER BY sp.name ASC`;

            const result = await client.query(query, params);

            // Log the action
            await eFileActionLogger.logAction({
                entityType: 'SLA_POLICY',
                entityId: null,
                action: 'SLA_POLICY_VIEWED',
                userId: userId || 'anonymous',
                details: { count: result.rows.length },
                ipAddress
            });

            return NextResponse.json({
                success: true,
                slaPolicies: result.rows
            });
        }

    } catch (error) {
        console.error('Error fetching SLA policies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch SLA policies' },
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
            fileTypeId, 
            stages, 
            escalationRules, 
            createdBy, 
            ipAddress, 
            userAgent 
        } = body;

        // Input validation
        if (!name || !fileTypeId || !stages || !Array.isArray(stages)) {
            return NextResponse.json(
                { error: 'Name, file type ID, and stages array are required' },
                { status: 400 }
            );
        }

        // Rate limiting
        const rateLimit = checkEFileRateLimit(createdBy, 'workflow_action', createdBy);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // Validate access
        const accessValidation = await validateEFileAccess(createdBy, 'sla_policy', null, 'CREATE_SLA_POLICY');
        if (!accessValidation.allowed) {
            return NextResponse.json(
                { error: accessValidation.reason },
                { status: 403 }
            );
        }

        client = await connectToDatabase();

        // Create SLA policy
        const result = await client.query(`
            INSERT INTO efiling_sla_policies (
                name, description, file_type_id, stages, escalation_rules, 
                is_active, created_by, created_at
            ) VALUES ($1, $2, $3, $4, $5, true, $6, NOW())
            RETURNING *
        `, [
            name,
            description,
            fileTypeId,
            JSON.stringify(stages),
            JSON.stringify(escalationRules || {}),
            createdBy
        ]);

        const slaPolicy = result.rows[0];

        // Log the action
        await eFileActionLogger.logAction({
            entityType: 'SLA_POLICY',
            entityId: slaPolicy.id,
            action: 'SLA_POLICY_CREATED',
            userId: createdBy,
            details: {
                slaPolicyName: name,
                fileTypeId,
                stageCount: stages.length
            },
            ipAddress,
            userAgent
        });

        return NextResponse.json({
            success: true,
            slaPolicy: {
                id: slaPolicy.id,
                name: slaPolicy.name,
                description: slaPolicy.description,
                fileTypeId: slaPolicy.file_type_id,
                stages: slaPolicy.stages,
                escalationRules: slaPolicy.escalation_rules
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating SLA policy:', error);
        return NextResponse.json(
            { error: 'Failed to create SLA policy' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
