import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const NO_STORE_HEADERS = {
    'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
};

function json(data, status = 200) {
    return NextResponse.json(data, { status, headers: NO_STORE_HEADERS });
}

const TIMEZONE = 'Asia/Karachi';
const TZ_OFFSET = '+05:00';

const NOISY_ACTION_TYPES = new Set([
    'file_viewed',
    'FILE_VIEWED',
    'WORKFLOW_VIEWED',
    'DOCUMENT_VIEWED',
    'NOTIFICATION_READ',
    'notification_read',
    'NOTIFICATION_DISMISSED',
    'notification_dismissed',
    'REPORT_GENERATED',
    'report_generated',
    'REPORT_EXPORTED',
    'report_exported',
    'FILE_TYPES_LISTED',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED',
    'CREATE',
    'PROFILE_UPDATED',
    'profile_updated',
    'login',
    'LOGIN',
    'USER_LOGIN',
    'logout',
    'LOGOUT',
    'USER_LOGOUT',
]);

const COVERED_ACTION_TYPES = new Set([
    'FILE_ASSIGNED',
    'file_assigned',
    'FILE_FORWARDED',
    'file_forwarded',
    'MARK_TO',
    'ASSIGNED',
    'SIGNATURE_ADDED',
    'ADD_SIGNATURE',
    'file_signed',
    'FILE_SIGNED',
    'FILE_CREATED',
    'file_created',
    'COMMENT_ADDED',
    'comment_added',
    'DOCUMENT_UPLOADED',
    'document_uploaded',
]);

function ymdInKarachi(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

function startOfDayKarachi(ymd) {
    return new Date(`${ymd}T00:00:00${TZ_OFFSET}`);
}

function addDaysYmd(ymd, days) {
    const [year, month, day] = ymd.split('-').map(Number);
    const dt = new Date(Date.UTC(year, month - 1, day + days));
    return dt.toISOString().slice(0, 10);
}

function weekdayInKarachi(date = new Date()) {
    const label = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'short' }).format(date);
    return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[label] ?? 1;
}

function getPeriodBounds(period, fromParam, toParam) {
    const todayYmd = ymdInKarachi();

    if (period === 'custom' && fromParam) {
        const fromYmd = fromParam;
        const toYmd = toParam || fromParam;
        const from = startOfDayKarachi(fromYmd);
        const to = startOfDayKarachi(addDaysYmd(toYmd, 1));
        return { from, to, fromYmd, toYmd, label: `${fromYmd} – ${toYmd}` };
    }

    if (period === 'week') {
        const weekday = weekdayInKarachi();
        const mondayOffset = weekday === 0 ? 6 : weekday - 1;
        const fromYmd = addDaysYmd(todayYmd, -mondayOffset);
        const from = startOfDayKarachi(fromYmd);
        const to = startOfDayKarachi(addDaysYmd(todayYmd, 1));
        return { from, to, fromYmd, toYmd: todayYmd, label: 'This week' };
    }

    if (period === 'month') {
        const fromYmd = `${todayYmd.slice(0, 7)}-01`;
        const from = startOfDayKarachi(fromYmd);
        const to = startOfDayKarachi(addDaysYmd(todayYmd, 1));
        return { from, to, fromYmd, toYmd: todayYmd, label: 'This month' };
    }

    if (period === 'all') {
        return {
            from: new Date('2000-01-01T00:00:00+05:00'),
            to: startOfDayKarachi(addDaysYmd(todayYmd, 1)),
            fromYmd: null,
            toYmd: todayYmd,
            label: 'All time',
        };
    }

    const from = startOfDayKarachi(todayYmd);
    const to = startOfDayKarachi(addDaysYmd(todayYmd, 1));
    return { from, to, fromYmd: todayYmd, toYmd: todayYmd, label: 'Today' };
}

async function safeQuery(client, sql, params) {
    try {
        const result = await client.query(sql, params);
        return result.rows || [];
    } catch (error) {
        console.warn('[my-actions] query skipped:', error.message);
        return [];
    }
}

function uniqueByFile(rows) {
    const seen = new Set();
    const unique = [];
    for (const row of rows) {
        const key = String(row.file_id ?? row.id);
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(row);
    }
    return unique;
}

function applyFileMeta(item, meta) {
    if (!meta) return item;
    if (!item.file_number) item.file_number = meta.file_number;
    if (!item.file_subject && !item.subject) item.file_subject = meta.subject;
    if (!item.search_file_number) item.search_file_number = meta.file_number;
    if (!item.search_file_subject) item.search_file_subject = meta.subject;
    item.file_type_name = meta.file_type_name || item.file_type_name || null;
    item.file_type_code = meta.file_type_code || item.file_type_code || null;
    item.created_by_name = meta.created_by_name || item.created_by_name || null;
    return item;
}

function parseDetails(details) {
    if (!details) return {};
    if (typeof details === 'object') return details;
    try {
        return JSON.parse(details);
    } catch {
        return {};
    }
}

function actionText(row) {
    const details = parseDetails(row.details);
    const raw = row.description && !String(row.description).startsWith('{')
        ? String(row.description)
        : String(details.description || '');
    return raw.trim();
}

function isNoisyDiaryEntry(row) {
    const type = row.action_type || '';
    if (NOISY_ACTION_TYPES.has(type) || NOISY_ACTION_TYPES.has(type.toUpperCase())) return true;
    const text = actionText(row).toLowerCase();
    if (!text) return false;
    if (text.startsWith('accessed ')) return true;
    if (text.includes('file types list viewed')) return true;
    if (/e-filing (user|consultant) .+ created/.test(text)) return true;
    return false;
}

function isImageAttachment(fileType, fileName) {
    const type = String(fileType || '').toLowerCase();
    if (type.startsWith('image/')) return true;
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(fileName || ''));
}

function normalizeUploadUrl(url, fileName) {
    if (url) {
        if (url.startsWith('/uploads/')) return `/api${url}`;
        return url;
    }
    if (fileName && /^\d+\.[a-z0-9]+$/i.test(fileName)) {
        return `/api/uploads/efiling/attachments/${fileName}`;
    }
    return null;
}

export async function GET(request) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return json({ error: 'Unauthorized' }, 401);
        }

        const { searchParams } = new URL(request.url);
        const period = (searchParams.get('period') || 'month').toLowerCase();
        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');
        const { from, to, fromYmd, toYmd, label } = getPeriodBounds(period, fromParam, toParam);

        client = await connectToDatabase();
        if (!client) {
            return json({ error: 'Database unavailable' }, 503);
        }

        const userRes = await client.query(
            `
            SELECT eu.id
            FROM efiling_users eu
            WHERE eu.user_id = $1 AND eu.is_active = true
            LIMIT 1
            `,
            [session.user.id]
        );

        const efilingUserId = userRes.rows[0]?.id || null;
        const sessionUserId = session.user.id;

        if (!efilingUserId) {
            return json({
                success: true,
                period: { key: period, from: from.toISOString(), to: to.toISOString(), fromYmd, toYmd, label },
                summary: {
                    marked: { events: 0, files: 0 },
                    signed: { events: 0, files: 0 },
                    created: { events: 0, files: 0 },
                    comments: { events: 0, files: 0 },
                    completed: { events: 0, files: 0 },
                    other: { events: 0, files: 0 },
                    totalEvents: 0,
                    totalFiles: 0,
                },
                filesByCategory: { marked: [], signed: [], created: [], comments: [], completed: [], other: [] },
                timeline: [],
                dailyBreakdown: [],
            });
        }

        const dateParams = [from, to];

        const markedRows = await safeQuery(
            client,
            `
            SELECT
                m.id,
                m.file_id,
                m.action_type,
                m.remarks,
                m.created_at,
                m.to_user_id,
                COALESCE(m.to_user_name, u.name) AS to_user_name,
                COALESCE(m.to_user_designation, eu.designation) AS to_user_designation,
                r.name AS to_role_name,
                r.code AS to_role_code,
                f.file_number,
                f.subject
            FROM efiling_file_movements m
            LEFT JOIN efiling_files f ON f.id = m.file_id
            LEFT JOIN efiling_users eu ON eu.id = m.to_user_id
            LEFT JOIN users u ON u.id = eu.user_id
            LEFT JOIN efiling_roles r ON r.id = eu.efiling_role_id
            WHERE m.from_user_id = $1
              AND COALESCE(m.action_type, '') NOT IN ('CC', 'COMPLETED')
              AND m.created_at >= $2
              AND m.created_at < $3
            ORDER BY m.created_at DESC
            `,
            [efilingUserId, ...dateParams]
        );

        const signedDocRows = await safeQuery(
            client,
            `
            SELECT
                s.id,
                s.file_id,
                s.type AS signature_type,
                s.timestamp AS created_at,
                s.user_name,
                f.file_number,
                f.subject
            FROM efiling_document_signatures s
            LEFT JOIN efiling_files f ON f.id = s.file_id
            WHERE s.user_id IN ($1, $2)
              AND COALESCE(s.is_active, true) = true
              AND s.timestamp >= $3
              AND s.timestamp < $4
            ORDER BY s.timestamp DESC
            `,
            [sessionUserId, efilingUserId, ...dateParams]
        );

        const signedLegacyRows = await safeQuery(
            client,
            `
            SELECT
                s.id,
                s.file_id,
                s.signature_method AS signature_type,
                s.signed_at AS created_at,
                f.file_number,
                f.subject
            FROM efiling_signatures s
            LEFT JOIN efiling_files f ON f.id = s.file_id
            WHERE s.user_id IN ($1, $2)
              AND s.signed_at >= $3
              AND s.signed_at < $4
            ORDER BY s.signed_at DESC
            `,
            [efilingUserId, sessionUserId, ...dateParams]
        );

        const signedCombined = [...signedDocRows, ...signedLegacyRows].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        const signedSeen = new Set();
        const signedRows = signedCombined.filter((row) => {
            const key = `${row.file_id}-${row.created_at ? new Date(row.created_at).toISOString().slice(0, 16) : row.id}`;
            if (signedSeen.has(key)) return false;
            signedSeen.add(key);
            return true;
        });

        const createdRows = await safeQuery(
            client,
            `
            SELECT
                f.id,
                f.id AS file_id,
                f.file_number,
                f.subject,
                f.created_at,
                s.name AS status_name,
                s.code AS status_code
            FROM efiling_files f
            LEFT JOIN efiling_file_status s ON s.id = f.status_id
            WHERE f.created_by = $1
              AND f.created_at >= $2
              AND f.created_at < $3
            ORDER BY f.created_at DESC
            `,
            [efilingUserId, ...dateParams]
        );

        const commentDocRows = await safeQuery(
            client,
            `
            SELECT
                c.id,
                c.file_id,
                c.text AS comment_text,
                c.timestamp AS created_at,
                f.file_number,
                f.subject
            FROM efiling_document_comments c
            LEFT JOIN efiling_files f ON f.id = c.file_id
            WHERE c.user_id IN ($1, $2)
              AND COALESCE(c.is_active, true) = true
              AND c.timestamp >= $3
              AND c.timestamp < $4
            ORDER BY c.timestamp DESC
            `,
            [sessionUserId, efilingUserId, ...dateParams]
        );

        const commentLegacyRows = await safeQuery(
            client,
            `
            SELECT
                c.id,
                c.file_id,
                c.comment AS comment_text,
                c.created_at,
                f.file_number,
                f.subject
            FROM efiling_comments c
            LEFT JOIN efiling_files f ON f.id = c.file_id
            WHERE c.user_id IN ($1, $2)
              AND c.created_at >= $3
              AND c.created_at < $4
            ORDER BY c.created_at DESC
            `,
            [efilingUserId, sessionUserId, ...dateParams]
        );

        const commentRows = [...commentDocRows, ...commentLegacyRows].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        const completedRows = await safeQuery(
            client,
            `
            SELECT
                m.id,
                m.file_id,
                m.remarks,
                m.created_at,
                f.file_number,
                f.subject
            FROM efiling_file_movements m
            LEFT JOIN efiling_files f ON f.id = m.file_id
            WHERE m.from_user_id = $1
              AND m.action_type = 'COMPLETED'
              AND m.created_at >= $2
              AND m.created_at < $3
            ORDER BY m.created_at DESC
            `,
            [efilingUserId, ...dateParams]
        );

        const actionRows = await safeQuery(
            client,
            `
            SELECT
                ua.id,
                ua.file_id,
                ua.action_type,
                ua.description,
                ua.timestamp AS created_at,
                ua.details,
                ua.entity_name,
                COALESCE(ef.file_number, NULL) AS file_number,
                COALESCE(ef.subject, NULL) AS subject
            FROM efiling_user_actions ua
            LEFT JOIN efiling_files ef ON (ua.file_id IS NOT NULL AND ua.file_id = ef.id::VARCHAR)
            WHERE ua.user_id IN ($1, $2)
              AND ua.timestamp >= $3
              AND ua.timestamp < $4
            ORDER BY ua.timestamp DESC
            LIMIT 500
            `,
            [String(efilingUserId), String(sessionUserId), ...dateParams]
        );

        const attachmentRowsRaw = await safeQuery(
            client,
            `
            SELECT
                a.id,
                a.file_id,
                a.file_name,
                a.file_type,
                a.file_url,
                a.uploaded_at AS created_at,
                f.file_number,
                f.subject,
                f.assigned_to
            FROM efiling_file_attachments a
            LEFT JOIN efiling_files f ON f.id::text = a.file_id::text
            WHERE a.uploaded_by IN ($1, $2)
              AND COALESCE(a.is_active, true) = true
              AND a.uploaded_at >= $3
              AND a.uploaded_at < $4
            ORDER BY a.uploaded_at DESC
            `,
            [String(efilingUserId), String(sessionUserId), ...dateParams]
        );

        const logAttachmentIds = actionRows
            .filter((row) => ['DOCUMENT_UPLOADED', 'document_uploaded'].includes(row.action_type))
            .map((row) => {
                const details = parseDetails(row.details);
                return details.attachmentId || details.attachment_id || null;
            })
            .filter(Boolean)
            .map(String);

        const extraAttachmentRows = logAttachmentIds.length
            ? await safeQuery(
                client,
                `
                SELECT
                    a.id,
                    a.file_id,
                    a.file_name,
                    a.file_type,
                    a.file_url,
                    a.uploaded_at AS created_at,
                    f.file_number,
                    f.subject,
                    f.assigned_to
                FROM efiling_file_attachments a
                LEFT JOIN efiling_files f ON f.id::text = a.file_id::text
                WHERE a.id = ANY($1::varchar[])
                  AND COALESCE(a.is_active, true) = true
                `,
                [logAttachmentIds]
            )
            : [];

        const attachmentById = new Map();
        for (const row of [...attachmentRowsRaw, ...extraAttachmentRows]) {
            attachmentById.set(String(row.id), row);
        }

        const attachmentRows = attachmentById.size > 0
            ? Array.from(attachmentById.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            : actionRows
                .filter((row) => ['DOCUMENT_UPLOADED', 'document_uploaded'].includes(row.action_type))
                .map((row) => {
                    const details = parseDetails(row.details);
                    return {
                        id: details.attachmentId || details.attachment_id || row.id,
                        file_id: row.file_id || details.fileId || details.file_id,
                        file_name: details.fileName || details.attachmentName || 'attachment',
                        file_type: details.fileType || '',
                        file_url: details.fileUrl || details.file_url || null,
                        created_at: row.created_at,
                        file_number: row.file_number,
                        subject: row.subject,
                        assigned_to: null,
                    };
                });

        const missingFileIds = [...new Set(
            attachmentRows.filter((row) => row.file_id && !row.subject).map((row) => String(row.file_id))
        )];
        if (missingFileIds.length > 0) {
            const extraFiles = await safeQuery(
                client,
                `SELECT id, file_number, subject, assigned_to FROM efiling_files WHERE id::text = ANY($1::text[])`,
                [missingFileIds]
            );
            const extraMap = new Map(extraFiles.map((file) => [String(file.id), file]));
            for (const row of attachmentRows) {
                const extra = extraMap.get(String(row.file_id));
                if (!extra) continue;
                row.file_number = row.file_number || extra.file_number;
                row.subject = row.subject || extra.subject;
                if (row.assigned_to == null) row.assigned_to = extra.assigned_to;
            }
        }

        const otherRows = actionRows.filter((row) => {
            const type = row.action_type || '';
            if (NOISY_ACTION_TYPES.has(type) || COVERED_ACTION_TYPES.has(type)) return false;
            return !isNoisyDiaryEntry(row);
        });

        const markedFiles = uniqueByFile(markedRows);
        const signedFiles = uniqueByFile(signedRows);
        const createdFiles = uniqueByFile(createdRows);
        const commentFiles = uniqueByFile(commentRows);
        const completedFiles = uniqueByFile(completedRows);
        const otherFiles = uniqueByFile(otherRows.filter((r) => r.file_id));

        const mapFile = (row, extra = {}) => ({
            file_id: row.file_id || row.id,
            file_number: row.file_number || 'N/A',
            subject: row.subject || '—',
            timestamp: row.created_at,
            ...extra,
        });

        const filesByCategory = {
            marked: markedFiles.map((row) =>
                mapFile(row, {
                    marked_to: row.to_user_name || null,
                    marked_to_role: row.to_role_name || row.to_role_code || null,
                    remarks: row.remarks || null,
                    action_type: row.action_type,
                })
            ),
            signed: signedFiles.map((row) =>
                mapFile(row, {
                    signature_type: row.signature_type || 'signature',
                })
            ),
            created: createdFiles.map((row) =>
                mapFile(row, {
                    status_name: row.status_name || row.status_code || null,
                })
            ),
            comments: commentFiles.map((row) =>
                mapFile(row, {
                    comment_text: row.comment_text || null,
                })
            ),
            completed: completedFiles.map((row) =>
                mapFile(row, {
                    remarks: row.remarks || null,
                })
            ),
            other: otherFiles.map((row) =>
                mapFile(row, {
                    action_type: row.action_type,
                    description: row.description,
                })
            ),
        };

        const timeline = [
            ...markedRows.map((row) => ({
                id: `marked-${row.id}`,
                type: 'marked',
                title: 'Marked a file',
                description: row.to_user_name
                    ? `Marked ${row.file_number || 'file'} to ${row.to_user_name}${row.to_role_name ? ` (${row.to_role_name})` : ''}`
                    : `Marked ${row.file_number || 'a file'}`,
                file_id: row.file_id,
                file_number: row.file_number,
                file_subject: row.subject,
                search_file_number: row.file_number,
                search_file_subject: row.subject,
                remarks: row.remarks,
                timestamp: row.created_at,
            })),
            ...signedRows.map((row) => ({
                id: `signed-${row.id}-${row.file_id}`,
                type: 'signed',
                title: 'Signed a file',
                description: `Signed ${row.file_number || 'a file'}${row.signature_type ? ` (${String(row.signature_type).replace(/_/g, ' ')})` : ''}`,
                file_id: row.file_id,
                file_number: row.file_number,
                file_subject: row.subject,
                search_file_number: row.file_number,
                search_file_subject: row.subject,
                timestamp: row.created_at,
            })),
            ...createdRows.map((row) => ({
                id: `created-${row.id}`,
                type: 'created',
                title: 'Created a file',
                description: `Created ${row.file_number || 'a file'}`,
                file_id: row.file_id,
                file_number: row.file_number,
                file_subject: row.subject,
                search_file_number: row.file_number,
                search_file_subject: row.subject,
                timestamp: row.created_at,
            })),
            ...commentRows.map((row) => ({
                id: `comment-${row.id}-${row.file_id}`,
                type: 'commented',
                title: 'Added a comment',
                description: row.comment_text
                    ? `Commented on ${row.file_number || 'a file'}: ${String(row.comment_text).slice(0, 120)}`
                    : `Commented on ${row.file_number || 'a file'}`,
                file_id: row.file_id,
                file_number: row.file_number,
                file_subject: row.subject,
                search_file_number: row.file_number,
                search_file_subject: row.subject,
                timestamp: row.created_at,
            })),
            ...completedRows.map((row) => ({
                id: `completed-${row.id}`,
                type: 'completed',
                title: 'Completed a file',
                description: `Completed ${row.file_number || 'a file'}`,
                file_id: row.file_id,
                file_number: row.file_number,
                file_subject: row.subject,
                search_file_number: row.file_number,
                search_file_subject: row.subject,
                remarks: row.remarks,
                timestamp: row.created_at,
            })),
            ...attachmentRows.map((row) => {
                const displayName = row.file_name || 'attachment';
                const fileLabel = row.file_number && row.file_number !== 'N/A'
                    ? row.file_number
                    : (row.subject ? row.subject : (row.file_id ? `file ${row.file_id}` : 'a file'));
                const isImage = isImageAttachment(row.file_type, row.file_name);
                const previewUrl = row.id ? `/api/efiling/my-attachments/${row.id}` : normalizeUploadUrl(row.file_url);
                const canOpenFile = row.assigned_to != null && String(row.assigned_to) === String(efilingUserId);
                return {
                    id: `attachment-${row.id}`,
                    type: 'attachment',
                    title: 'Uploaded an attachment',
                    description: `Uploaded "${displayName}"`,
                    file_id: canOpenFile ? row.file_id : null,
                    source_file_id: row.file_id,
                    file_number: canOpenFile ? row.file_number : null,
                    file_subject: canOpenFile ? (row.subject || null) : null,
                    search_file_number: row.file_number,
                    search_file_subject: row.subject,
                    still_assigned: canOpenFile,
                    can_open_file: canOpenFile,
                    attachment_name: displayName,
                    is_image: isImage,
                    thumbnail_url: isImage ? previewUrl : null,
                    file_url: previewUrl,
                    timestamp: row.created_at,
                    uploaded_to_label: canOpenFile ? fileLabel : null,
                };
            }),
            ...otherRows.map((row) => {
                const details = parseDetails(row.details);
                const readableType = String(row.action_type || 'Action').replace(/_/g, ' ');
                return {
                    id: `other-${row.id}`,
                    type: 'other',
                    title: readableType,
                    description:
                        actionText(row) || `Performed ${readableType.toLowerCase()}`,
                    file_id: row.file_id || details.fileId || details.file_id || null,
                    file_number: row.file_number,
                    file_subject: row.subject,
                    search_file_number: row.file_number,
                    search_file_subject: row.subject,
                    timestamp: row.created_at,
                };
            }),
        ]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 400);

        const fileIdsForMeta = [...new Set([
            ...timeline.map((event) => event.source_file_id || event.file_id),
            ...Object.values(filesByCategory).flat().map((file) => file.file_id),
        ].filter(Boolean).map((id) => String(id)))];

        let fileMeta = new Map();
        if (fileIdsForMeta.length > 0) {
            let metaRows = await safeQuery(
                client,
                `
                SELECT
                    f.id::text AS id,
                    f.file_number,
                    f.subject,
                    ft.name AS file_type_name,
                    ft.code AS file_type_code,
                    u.name AS created_by_name
                FROM efiling_files f
                LEFT JOIN efiling_file_types ft ON f.file_type_id = ft.id
                LEFT JOIN efiling_users eu ON eu.id = f.created_by
                LEFT JOIN users u ON u.id = eu.user_id
                WHERE f.id::text = ANY($1::text[])
                `,
                [fileIdsForMeta]
            );
            if (metaRows.length === 0) {
                metaRows = await safeQuery(
                    client,
                    `
                    SELECT
                        f.id::text AS id,
                        f.file_number,
                        f.subject,
                        NULL AS file_type_name,
                        NULL AS file_type_code,
                        u.name AS created_by_name
                    FROM efiling_files f
                    LEFT JOIN efiling_users eu ON eu.id = f.created_by
                    LEFT JOIN users u ON u.id = eu.user_id
                    WHERE f.id::text = ANY($1::text[])
                    `,
                    [fileIdsForMeta]
                );
            }
            fileMeta = new Map(metaRows.map((row) => [String(row.id), row]));
        }

        for (const event of timeline) {
            applyFileMeta(event, fileMeta.get(String(event.source_file_id || event.file_id)));
        }
        for (const list of Object.values(filesByCategory)) {
            for (const file of list) {
                applyFileMeta(file, fileMeta.get(String(file.file_id)));
            }
        }

        const dailyMap = new Map();
        for (const event of timeline) {
            const day = ymdInKarachi(new Date(event.timestamp));
            if (!dailyMap.has(day)) {
                dailyMap.set(day, { date: day, marked: 0, signed: 0, created: 0, commented: 0, completed: 0, attachment: 0, other: 0, total: 0 });
            }
            const bucket = dailyMap.get(day);
            const key = event.type === 'commented' ? 'commented' : event.type;
            if (key in bucket) bucket[key] += 1;
            bucket.total += 1;
        }
        const dailyBreakdown = Array.from(dailyMap.values()).sort((a, b) => (a.date < b.date ? 1 : -1));

        const allFileIds = new Set(
            timeline.filter((e) => e.file_id).map((e) => String(e.file_id))
        );

        return json({
            success: true,
            period: {
                key: period,
                from: from.toISOString(),
                to: to.toISOString(),
                fromYmd,
                toYmd,
                label,
            },
            summary: {
                marked: { events: markedRows.length, files: markedFiles.length },
                signed: { events: signedRows.length, files: signedFiles.length },
                created: { events: createdRows.length, files: createdFiles.length },
                comments: { events: commentRows.length, files: commentFiles.length },
                completed: { events: completedRows.length, files: completedFiles.length },
                other: { events: otherRows.length, files: otherFiles.length },
                totalEvents: timeline.length,
                totalFiles: allFileIds.size,
            },
            filesByCategory,
            timeline,
            dailyBreakdown,
        });
    } catch (error) {
        console.error('Error fetching my actions:', error);
        return json({ error: 'Failed to load your actions' }, 500);
    } finally {
        if (client && typeof client.release === 'function') {
            try {
                client.release();
            } catch (releaseError) {
                console.error('Error releasing database client:', releaseError);
            }
        }
    }
}
