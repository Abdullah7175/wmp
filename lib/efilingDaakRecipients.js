// File: lib/efilingDaakRecipients.js
//
// Shared recipient logic for editing a draft daak. Mirrors what POST /api/efiling/daak does
// (expand roles / role groups / departments / everyone into users, TO wins over CC).

// Expand a recipient (user, role, role group, team, department, everyone) into efiling_users ids
export async function expandRecipients(client, recipientType, recipientId) {
    let users = [];

    switch (recipientType) {
        case 'USER':
            if (recipientId) {
                const user = await client.query(
                    'SELECT id FROM efiling_users WHERE id = $1 AND is_active = true',
                    [recipientId]
                );
                if (user.rows.length > 0) users.push(user.rows[0].id);
            }
            break;

        case 'ROLE':
            if (recipientId) {
                const roleUsers = await client.query(
                    'SELECT id FROM efiling_users WHERE efiling_role_id = $1 AND is_active = true',
                    [recipientId]
                );
                users = roleUsers.rows.map((r) => r.id);
            }
            break;

        case 'ROLE_GROUP':
            if (recipientId) {
                const groupRes = await client.query(
                    `SELECT role_codes FROM efiling_role_groups WHERE id = $1 AND is_active = true`,
                    [recipientId]
                );
                if (groupRes.rows.length > 0 && groupRes.rows[0].role_codes) {
                    const roleCodes = Array.isArray(groupRes.rows[0].role_codes)
                        ? groupRes.rows[0].role_codes
                        : JSON.parse(groupRes.rows[0].role_codes);

                    if (roleCodes.length > 0) {
                        const roleUsers = await client.query(
                            `SELECT eu.id
                             FROM efiling_users eu
                             JOIN efiling_roles r ON eu.efiling_role_id = r.id
                             WHERE r.code = ANY($1::text[]) AND eu.is_active = true`,
                            [roleCodes]
                        );
                        users = roleUsers.rows.map((r) => r.id);
                    }
                }
            }
            break;

        case 'TEAM':
            if (recipientId) {
                const teamMembers = await client.query(
                    `SELECT DISTINCT team_member_id as id
                     FROM efiling_user_teams
                     WHERE manager_id = $1 AND is_active = true
                     UNION
                     SELECT $1 as id`,
                    [recipientId]
                );
                users = teamMembers.rows.map((r) => r.id);
            }
            break;

        case 'DEPARTMENT':
            if (recipientId) {
                const deptUsers = await client.query(
                    'SELECT id FROM efiling_users WHERE department_id = $1 AND is_active = true',
                    [recipientId]
                );
                users = deptUsers.rows.map((r) => r.id);
            }
            break;

        case 'EVERYONE': {
            const allUsers = await client.query(
                'SELECT id FROM efiling_users WHERE is_active = true'
            );
            users = allUsers.rows.map((r) => r.id);
            break;
        }
    }

    return users;
}

// Replace ALL recipients of a daak with the given TO / CC lists.
// Must be called inside the caller's transaction. Returns the number of distinct users.
export async function replaceDaakRecipients(client, daakId, toRecipients, ccRecipients) {
    await client.query('DELETE FROM efiling_daak_recipients WHERE daak_id = $1', [daakId]);

    const tagged = [
        ...toRecipients.map((r) => ({ ...r, addressing: 'TO' })),
        ...ccRecipients.map((r) => ({ ...r, addressing: 'CC' })),
    ];

    const addressingByUser = new Map(); // userId -> 'TO' | 'CC'
    const insertsByUser = new Map();    // userId -> row to insert

    for (const recipient of tagged) {
        const userIds = await expandRecipients(client, recipient.type, recipient.id);
        for (const userId of userIds) {
            if (addressingByUser.get(userId) === 'TO') continue; // TO wins over CC
            addressingByUser.set(userId, recipient.addressing);
            insertsByUser.set(userId, {
                recipient_type: recipient.type,
                recipient_id: recipient.id || null,
                efiling_user_id: userId,
                addressing: recipient.addressing,
            });
        }
    }

    const inserts = Array.from(insertsByUser.values());

    if (inserts.length > 0) {
        const recipientParams = [];
        const placeholders = [];
        let paramIndex = 1;

        inserts.forEach((ins) => {
            placeholders.push(
                `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`
            );
            recipientParams.push(
                daakId,
                ins.recipient_type,
                ins.recipient_id,
                ins.efiling_user_id,
                'PENDING',
                ins.addressing
            );
            paramIndex += 6;
        });

        await client.query(
            `INSERT INTO efiling_daak_recipients
                (daak_id, recipient_type, recipient_id, efiling_user_id, status, addressing)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT (daak_id, efiling_user_id) DO UPDATE SET
                addressing = CASE
                    WHEN efiling_daak_recipients.addressing = 'TO' OR EXCLUDED.addressing = 'TO' THEN 'TO'
                    ELSE 'CC'
                END`,
            recipientParams
        );
    }

    await client.query(
        `UPDATE efiling_daak SET total_recipients = $1 WHERE id = $2`,
        [inserts.length, daakId]
    );

    return inserts.length;
}