import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Get e-filing user by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();

        try {
            // Get user data with joins to get related information
            const userResult = await client.query(
                `SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.contact_number,
                    u.created_date,
                    u.updated_date,
                    eu.id as efiling_user_id,
                    eu.employee_id,
                    eu.designation,
                    eu.address,
                    eu.department_id,
                    eu.efiling_role_id,
                    eu.supervisor_id,
                    eu.approval_level,
                    eu.approval_amount_limit,
                    eu.can_sign,
                    eu.can_create_files,
                    eu.can_approve_files,
                    eu.can_reject_files,
                    eu.can_transfer_files,
                    eu.max_concurrent_files,
                    eu.preferred_signature_method,
                    eu.signature_settings,
                    eu.notification_preferences,
                    eu.is_active,
                    eu.created_at,
                    eu.updated_at,
                    eu.google_email,
                    d.name as department_name,
                    r.name as role_name
                FROM users u
                JOIN efiling_users eu ON u.id = eu.user_id
                LEFT JOIN efiling_departments d ON eu.department_id = d.id
                LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                WHERE eu.id = $1`,
                [id]
            );

            if (userResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'E-filing user not found' },
                    { status: 404 }
                );
            }

            const user = userResult.rows[0];

            // Parse JSON fields
            if (user.signature_settings) {
                try {
                    user.signature_settings = JSON.parse(user.signature_settings);
                } catch (e) {
                    user.signature_settings = {};
                }
            }

            if (user.notification_preferences) {
                try {
                    user.notification_preferences = JSON.parse(user.notification_preferences);
                } catch (e) {
                    user.notification_preferences = {};
                }
            }

            return NextResponse.json(user);

        } finally {
            await client.release();
        }

    } catch (error) {
        console.error('Error fetching e-filing user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch e-filing user', details: error.message },
            { status: 500 }
        );
    }
}

// Update e-filing user
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const {
            name,
            email,
            password,
            contact_number,
            address,
            employee_id,
            designation,
            department_id,
            efiling_role_id,
            supervisor_id,
            approval_level,
            approval_amount_limit,
            can_sign,
            can_create_files,
            can_approve_files,
            can_reject_files,
            can_transfer_files,
            max_concurrent_files,
            preferred_signature_method,
            signature_settings,
            notification_preferences,
            is_active,
            google_email
        } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();

        try {
            // Get current user info
            const currentUser = await client.query(
                `SELECT u.id, u.email, eu.employee_id 
                 FROM users u 
                 JOIN efiling_users eu ON u.id = eu.user_id 
                 WHERE eu.id = $1`,
                [id]
            );

            if (currentUser.rows.length === 0) {
                return NextResponse.json(
                    { error: 'E-filing user not found' },
                    { status: 404 }
                );
            }

            const userId = currentUser.rows[0].id;
            const currentEmail = currentUser.rows[0].email;
            const currentEmployeeId = currentUser.rows[0].employee_id;

            // Check if email already exists (if changed)
            if (email && email !== currentEmail) {
                const existingUser = await client.query(
                    'SELECT id FROM users WHERE email = $1 AND id != $2',
                    [email, userId]
                );

                if (existingUser.rows.length > 0) {
                    return NextResponse.json(
                        { error: 'User with this email already exists' },
                        { status: 400 }
                    );
                }
            }

            // Check if employee_id already exists (if changed)
            if (employee_id && employee_id !== currentEmployeeId) {
                const existingEmployee = await client.query(
                    'SELECT id FROM efiling_users WHERE employee_id = $1 AND id != $2',
                    [employee_id, id]
                );

                if (existingEmployee.rows.length > 0) {
                    return NextResponse.json(
                        { error: 'Employee ID already exists' },
                        { status: 400 }
                    );
                }
            }

            // Start transaction
            await client.query('BEGIN');

            // Update main user table
            let userUpdateQuery = 'UPDATE users SET updated_date = NOW()';
            let userParams = [];
            let paramCount = 1;

            if (name) {
                userUpdateQuery += `, name = $${paramCount}`;
                userParams.push(name);
                paramCount++;
            }

            if (email) {
                userUpdateQuery += `, email = $${paramCount}`;
                userParams.push(email);
                paramCount++;
            }

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 12);
                userUpdateQuery += `, password = $${paramCount}`;
                userParams.push(hashedPassword);
                paramCount++;
            }

            if (contact_number !== undefined) {
                userUpdateQuery += `, contact_number = $${paramCount}`;
                userParams.push(contact_number);
                paramCount++;
            }

            // Note: address is now handled in efiling_users table

            userUpdateQuery += ` WHERE id = $${paramCount}`;
            userParams.push(userId);

            if (userParams.length > 1) {
                await client.query(userUpdateQuery, userParams);
            }

            // Update e-filing user table
            let efilingUpdateQuery = 'UPDATE efiling_users SET updated_at = NOW()';
            let efilingParams = [];
            paramCount = 1;

            if (employee_id !== undefined) {
                efilingUpdateQuery += `, employee_id = $${paramCount}`;
                efilingParams.push(employee_id);
                paramCount++;
            }

            if (designation !== undefined) {
                efilingUpdateQuery += `, designation = $${paramCount}`;
                efilingParams.push(designation);
                paramCount++;
            }

            if (department_id !== undefined) {
                efilingUpdateQuery += `, department_id = $${paramCount}`;
                efilingParams.push(department_id);
                paramCount++;
            }

            if (efiling_role_id !== undefined) {
                efilingUpdateQuery += `, efiling_role_id = $${paramCount}`;
                efilingParams.push(efiling_role_id);
                paramCount++;
            }

            if (supervisor_id !== undefined) {
                efilingUpdateQuery += `, supervisor_id = $${paramCount}`;
                efilingParams.push(supervisor_id);
                paramCount++;
            }

            if (approval_level !== undefined) {
                efilingUpdateQuery += `, approval_level = $${paramCount}`;
                efilingParams.push(approval_level);
                paramCount++;
            }

            if (approval_amount_limit !== undefined) {
                efilingUpdateQuery += `, approval_amount_limit = $${paramCount}`;
                efilingParams.push(approval_amount_limit);
                paramCount++;
            }

            if (can_sign !== undefined) {
                efilingUpdateQuery += `, can_sign = $${paramCount}`;
                efilingParams.push(can_sign);
                paramCount++;
            }

            if (can_create_files !== undefined) {
                efilingUpdateQuery += `, can_create_files = $${paramCount}`;
                efilingParams.push(can_create_files);
                paramCount++;
            }

            if (can_approve_files !== undefined) {
                efilingUpdateQuery += `, can_approve_files = $${paramCount}`;
                efilingParams.push(can_approve_files);
                paramCount++;
            }

            if (address !== undefined) {
                efilingUpdateQuery += `, address = $${paramCount}`;
                efilingParams.push(address);
                paramCount++;
            }

            if (can_reject_files !== undefined) {
                efilingUpdateQuery += `, can_reject_files = $${paramCount}`;
                efilingParams.push(can_reject_files);
                paramCount++;
            }

            if (can_transfer_files !== undefined) {
                efilingUpdateQuery += `, can_transfer_files = $${paramCount}`;
                efilingParams.push(can_transfer_files);
                paramCount++;
            }

            if (max_concurrent_files !== undefined) {
                efilingUpdateQuery += `, max_concurrent_files = $${paramCount}`;
                efilingParams.push(max_concurrent_files);
                paramCount++;
            }

            if (preferred_signature_method !== undefined) {
                efilingUpdateQuery += `, preferred_signature_method = $${paramCount}`;
                efilingParams.push(preferred_signature_method);
                paramCount++;
            }

            if (signature_settings !== undefined) {
                efilingUpdateQuery += `, signature_settings = $${paramCount}`;
                efilingParams.push(JSON.stringify(signature_settings));
                paramCount++;
            }

            if (notification_preferences !== undefined) {
                efilingUpdateQuery += `, notification_preferences = $${paramCount}`;
                efilingParams.push(JSON.stringify(notification_preferences));
                paramCount++;
            }

            if (google_email !== undefined) {
                efilingUpdateQuery += `, google_email = $${paramCount}`;
                efilingParams.push(google_email);
                paramCount++;
            }

            if (is_active !== undefined) {
                efilingUpdateQuery += `, is_active = $${paramCount}`;
                efilingParams.push(is_active);
                paramCount++;
            }

            efilingUpdateQuery += ` WHERE id = $${paramCount}`;
            efilingParams.push(id);

            if (efilingParams.length > 1) {
                await client.query(efilingUpdateQuery, efilingParams);
            }

            // Commit transaction
            await client.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'E-filing user updated successfully'
            });

        } catch (error) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.release();
        }

    } catch (error) {
        console.error('Error updating e-filing user:', error);
        return NextResponse.json(
            { error: 'Failed to update e-filing user', details: error.message },
            { status: 500 }
        );
    }
}

// Delete e-filing user
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();

        try {
            // Get user info for deletion
            const userInfo = await client.query(
                `SELECT u.id, u.email, eu.employee_id 
                 FROM users u 
                 JOIN efiling_users eu ON u.id = eu.user_id 
                 WHERE eu.id = $1`,
                [id]
            );

            if (userInfo.rows.length === 0) {
                return NextResponse.json(
                    { error: 'E-filing user not found' },
                    { status: 404 }
                );
            }

            const userId = userInfo.rows[0].id;

            // Start transaction
            await client.query('BEGIN');

            // Soft delete from efiling_users (set is_active = false)
            await client.query(
                'UPDATE efiling_users SET is_active = false, updated_at = NOW() WHERE id = $1',
                [id]
            );

            // Soft delete from main users table (set role = null or add a deleted flag)
            await client.query(
                'UPDATE users SET role = NULL, updated_date = NOW() WHERE id = $1',
                [userId]
            );

            // Commit transaction
            await client.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'E-filing user deleted successfully'
            });

        } catch (error) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.release();
        }

    } catch (error) {
        console.error('Error deleting e-filing user:', error);
        return NextResponse.json(
            { error: 'Failed to delete e-filing user', details: error.message },
            { status: 500 }
        );
    }
}
