import { NextResponse } from 'next/server';
import { join, resolve, relative } from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { checkFileAccess } from '@/lib/authMiddleware';
import { getMobileUserToken } from '@/lib/mobileAuthHelper';

/** Shallow recursive lookup by exact filename (legacy misplaced before-content files). */
function findFileByName(rootDir, fileName, depth = 0, maxDepth = 3) {
  if (depth > maxDepth || !existsSync(rootDir)) return null;
  let entries;
  try {
    entries = readdirSync(rootDir);
  } catch {
    return null;
  }
  for (const entry of entries) {
    const full = join(rootDir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isFile() && entry === fileName) return full;
    if (st.isDirectory()) {
      const found = findFileByName(full, fileName, depth + 1, maxDepth);
      if (found) return found;
    }
  }
  return null;
}

/**
 * SECURE FILE DOWNLOAD USING X-ACCEL-REDIRECT
 * 
 * This route uses Nginx's X-Accel-Redirect feature to serve files securely:
 * 1. Node.js authenticates and checks permissions
 * 2. Nginx serves the file directly (fast, efficient)
 * 3. Files under /protected/uploads/ are NOT accessible directly (internal only)
 * 
 * Benefits:
 * - Fast file serving (no Node.js streaming overhead)
 * - Secure (files not publicly accessible)
 * - Works even if Node.js restarts during download
 */
export async function GET(request, { params }) {
  let client;
  try {
    // SECURITY: Require authentication (support both NextAuth session and Mobile JWT token)
    let userId;
    let isAdmin;
    let userRole;
    
    // Check if this is a mobile app request (JWT token in X-User-Token header OR ?token= query param)
    // Note: React Native Image/Video components don't support headers, so we also accept token as query param
    let mobileToken = getMobileUserToken(request);
    
    // Fallback: Check query parameter for mobile token (React Native Image/Video can't send headers)
    if (!mobileToken) {
      const { searchParams } = new URL(request.url);
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        try {
          const { verify } = await import('jsonwebtoken');
          const decoded = verify(tokenParam, process.env.JWT_SECRET);
          if (decoded.source === 'mobile_app' && decoded.userId) {
            mobileToken = decoded;
            console.log('[Uploads API] Authenticated via query parameter token');
          }
        } catch (tokenError) {
          console.error('[Uploads API] Invalid token in query parameter:', tokenError.message);
        }
      }
    }
    
    if (mobileToken) {
      // Mobile app authentication via JWT token (header or query param)
      userId = parseInt(mobileToken.userId);
      // For mobile users, check their role from the token or database
      // Mobile tokens typically don't include role, so we'll fetch it if needed for permission checks
      userRole = mobileToken.role || null;
      // For mobile, we'll be more permissive - allow access to own files
      // Permission checks will happen in the file access validation below
      isAdmin = false; // Mobile users are typically not admins, adjust if needed
      console.log(`[Uploads API] Authenticated mobile user: ${userId}`);
    } else {
      // Web app authentication via NextAuth session
      let session;
      try {
        session = await auth();
      } catch (authError) {
        console.error('[Uploads API] Auth error:', authError);
        return NextResponse.json({ error: 'Unauthorized - Auth failed' }, { status: 401 });
      }
      
      if (!session?.user) {
        console.error('[Uploads API] No session or user (web) and no mobile token');
        return NextResponse.json({ error: 'Unauthorized - No session or token' }, { status: 401 });
      }
      
      userId = parseInt(session.user.id);
      userRole = session.user.role;
      isAdmin = [1, 2].includes(parseInt(session.user.role));
      console.log(`[Uploads API] Authenticated web user: ${userId} (admin: ${isAdmin})`);
    }

    const { path: filePath } = await params;
    
    if (!filePath || filePath.length === 0) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // SECURITY: Validate and sanitize path segments to prevent path traversal
    const normalizedPath = filePath.map(segment => {
      // Remove any path traversal sequences
      if (segment.includes('..') || segment.includes('/') || segment.includes('\\')) {
        throw new Error('Invalid path segment');
      }
      return segment;
    });

    // Check if this is an efiling attachment and verify permissions
    const filePathStr = normalizedPath.join('/');
    const isEFilingAttachment = filePathStr.startsWith('efiling/attachments/');
    
    if (isEFilingAttachment && !isAdmin) {
      // Extract attachment ID from filename (format: {attachmentId}.{ext})
      const fileName = normalizedPath[normalizedPath.length - 1];
      const attachmentId = fileName.split('.')[0]; // Get ID part before extension
      
      // Connect to database to check permissions
      client = await connectToDatabase();
      
      // Get attachment record to find associated file_id
      const attachmentResult = await client.query(
        `SELECT file_id, uploaded_by, is_active 
         FROM efiling_file_attachments 
         WHERE id = $1 AND is_active = true`,
        [attachmentId]
      );
      
      if (attachmentResult.rows.length === 0) {
        console.error(`[Uploads API] Attachment not found: ${attachmentId}`);
        await client.release();
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      
      const attachment = attachmentResult.rows[0];
      const fileId = attachment.file_id;
      
      // Check if user has access to the parent file
      const hasAccess = await checkFileAccess(client, fileId, userId, isAdmin);
      
      if (!hasAccess) {
        console.error(`[Uploads API] User ${userId} denied access to attachment ${attachmentId} (file_id: ${fileId})`);
        await client.release();
        return NextResponse.json({ error: 'Forbidden - You do not have access to this file' }, { status: 403 });
      }
      
      console.log(`[Uploads API] User ${userId} granted access to attachment ${attachmentId} (file_id: ${fileId})`);
      await client.release();
      client = null;
    }

    // Try multiple base directories (APP_BASE_DIR, cwd, standalone public, production paths)
    const cwd = process.cwd();
    const candidateBaseDirs = [
      process.env.APP_BASE_DIR,
      cwd,
      resolve(join(cwd, '.next', 'standalone')),
      '/opt/wmp16',
      '/opt/wmp',
      resolve(join(cwd, '..', '..')),
    ].filter(Boolean);

    let fullPath = null;
    let uploadsDir = null;
    let baseDirUsed = null;
    let servedRelativePath = normalizedPath;

    // Primary path + legacy fallbacks (before-content used flat / before-images folders historically)
    const fileName = normalizedPath[normalizedPath.length - 1];
    const pathVariants = [normalizedPath];
    if (normalizedPath[0] === 'before-content' && normalizedPath.length >= 2) {
      pathVariants.push(['before-content', fileName]);
      pathVariants.push(['before-content', 'image', fileName]);
      pathVariants.push(['before-content', 'video', fileName]);
      pathVariants.push(['before-images', fileName]);
      pathVariants.push(['before-images', 'image', fileName]);
      pathVariants.push(['images', fileName]);
    }

    // Prefer public/uploads (efiling/nginx), then nested public/public/uploads (legacy AWS-synced tree)
    const uploadRootSuffixes = [
      ['public', 'uploads'],
      ['public', 'public', 'uploads'],
    ];

    for (const baseDir of candidateBaseDirs) {
      for (const suffix of uploadRootSuffixes) {
        const dir = resolve(join(baseDir, ...suffix));
        for (const variant of pathVariants) {
          const candidatePath = resolve(join(dir, ...variant));
          if (!candidatePath.startsWith(dir)) continue;
          if (existsSync(candidatePath)) {
            fullPath = candidatePath;
            uploadsDir = dir;
            baseDirUsed = baseDir;
            servedRelativePath = variant;
            console.log(`[Uploads API] Found file at: ${fullPath} (baseDir: ${baseDir}, root: ${suffix.join('/')})`);
            break;
          }
        }
        if (fullPath) break;

        // Last resort for before-content: locate by filename under uploads/before-content
        if (!fullPath && normalizedPath[0] === 'before-content') {
          const searchRoot = join(dir, 'before-content');
          const found = findFileByName(searchRoot, fileName);
          if (found && found.startsWith(dir)) {
            fullPath = found;
            uploadsDir = dir;
            baseDirUsed = baseDir;
            servedRelativePath = relative(dir, found).split(/[/\\]/).filter(Boolean);
            console.log(`[Uploads API] Found file by name at: ${fullPath} (baseDir: ${baseDir})`);
          }
        }
        if (fullPath) break;
      }
      if (fullPath) break;
    }

    if (!fullPath || !existsSync(fullPath)) {
      const tried = candidateBaseDirs.flatMap((b) =>
        uploadRootSuffixes.flatMap((suffix) =>
          pathVariants.map((v) => join(b, ...suffix, ...v))
        )
      ).join(', ');
      console.error(`[Uploads API] File not found. Tried: ${tried}`);
      return new NextResponse('File not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const baseDir = baseDirUsed;
    
    // Determine content type based on file extension
    const extension = filePath[filePath.length - 1].split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'doc':
        contentType = 'application/msword';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'ppt':
        contentType = 'application/vnd.ms-powerpoint';
        break;
      case 'pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case 'mp4':
        contentType = 'video/mp4';
        break;
      case 'webm':
        contentType = 'video/webm';
        break;
      case 'mov':
        contentType = 'video/quicktime';
        break;
      case 'avi':
        contentType = 'video/x-msvideo';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    const filename = filePath[filePath.length - 1];
    const contentDisposition =
      extension === 'pdf' ||
      ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'mov'].includes(extension)
        ? `inline; filename="${filename}"`
        : `attachment; filename="${filename}"`;

    // X-Accel only for primary public/uploads (nginx alias). Nested public/public/uploads is streamed by Node.
    const nginxServedRoot = process.env.APP_BASE_DIR || '/opt/wmp16';
    const nginxUploadsDir = resolve(join(nginxServedRoot, 'public', 'uploads'));
    const canNginxServe =
      fullPath === nginxUploadsDir ||
      fullPath.startsWith(nginxUploadsDir + '/') ||
      fullPath.startsWith(nginxUploadsDir + '\\');

    if (canNginxServe) {
      const internalPath = `/protected/uploads/${servedRelativePath.join('/')}`;
      console.log(`[Uploads API] Serving via X-Accel-Redirect: ${internalPath}`);
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'X-Accel-Redirect': internalPath,
          'Content-Disposition': contentDisposition,
        },
      });
    }

    // File is under a path Nginx doesn't serve (e.g. .next/standalone/public) — stream from Node
    console.log(`[Uploads API] Serving by streaming from Node: ${fullPath}`);
    const body = readFileSync(fullPath);
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Cache-Control': 'public, max-age=2592000',
      },
    });

  } catch (error) {
    console.error('[Uploads API] Error serving file:', error);
    console.error('[Uploads API] Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to serve file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    if (client && typeof client.release === 'function') {
      try {
        await client.release();
      } catch (releaseError) {
        console.error('[Uploads API] Error releasing database client:', releaseError);
      }
    }
  }
}