import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, resolve, normalize } from 'path';
import { existsSync } from 'fs';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    // SECURITY: Require authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Handle standalone mode - get correct base directory
    let baseDir = process.cwd();
    
    // Check for environment variable first
    if (process.env.APP_BASE_DIR) {
      baseDir = process.env.APP_BASE_DIR;
    } else if (baseDir.includes('.next/standalone') || baseDir.includes('.next\\standalone')) {
      // In standalone mode, go up two levels to get to project root
      baseDir = join(baseDir, '..', '..');
    }
    
    // Also check for common production paths
    // If process.cwd() doesn't point to the right location, try /opt/wmp16
    const testUploadsPath = join(baseDir, 'public', 'uploads');
    if (!existsSync(testUploadsPath)) {
      // Try alternative production paths
      const productionPaths = ['/opt/wmp16', '/opt/wmp', process.cwd()];
      for (const prodPath of productionPaths) {
        const testPath = join(prodPath, 'public', 'uploads');
        if (existsSync(testPath)) {
          baseDir = prodPath;
          break;
        }
      }
    }

    // Construct the full file path
    const uploadsDir = resolve(join(baseDir, 'public', 'uploads'));
    const fullPath = resolve(join(uploadsDir, ...normalizedPath));

    // SECURITY: Ensure resolved path stays within uploads directory
    if (!fullPath.startsWith(uploadsDir)) {
      console.error(`Path traversal attempt detected. Resolved path: ${fullPath}, Uploads dir: ${uploadsDir}`);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      console.error(`Requested path segments: ${filePath.join('/')}`);
      console.error(`Base directory: ${baseDir}`);
      console.error(`Uploads directory: ${uploadsDir}`);
      console.error(`Normalized path segments: ${normalizedPath.join(', ')}`);
      
      // Return a proper 404 response without JSON for media files
      return new NextResponse('File not found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);
    
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

    // Return the file with appropriate headers
    const headers = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    };
    
    // SECURITY: Allow PDFs to be displayed in iframes (same-origin only)
    // This is safe because the file is served from the same origin and requires authentication
    if (extension === 'pdf') {
      headers['X-Frame-Options'] = 'SAMEORIGIN';
      // Also set Content-Disposition to inline for PDFs so they can be displayed
      headers['Content-Disposition'] = `inline; filename="${filePath[filePath.length - 1]}"`;
    } else {
      // For other file types, deny iframe embedding
      headers['X-Frame-Options'] = 'DENY';
    }
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}