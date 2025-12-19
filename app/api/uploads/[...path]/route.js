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
    if (baseDir.includes('.next/standalone') || baseDir.includes('.next\\standalone')) {
      // In standalone mode, go up two levels to get to project root
      baseDir = join(baseDir, '..', '..');
    }

    // Construct the full file path
    const uploadsDir = resolve(join(baseDir, 'public', 'uploads'));
    const fullPath = resolve(join(uploadsDir, ...normalizedPath));

    // SECURITY: Ensure resolved path stays within uploads directory
    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      console.error(`Requested path: ${filePath.join('/')}`);
      
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
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}