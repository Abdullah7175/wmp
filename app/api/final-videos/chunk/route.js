import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  UPLOAD_CONFIG, 
  validateFile, 
  generateUniqueFilename, 
  ensureUploadDir,
  createErrorResponse,
  createSuccessResponse 
} from '@/lib/fileUploadOptimized';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const formData = await req.formData();
    
    const chunkIndex = parseInt(formData.get('chunkIndex') || '0');
    const totalChunks = parseInt(formData.get('totalChunks') || '1');
    const uploadId = formData.get('uploadId'); // Frontend sends uploadId, not chunkId
    const fileName = formData.get('fileName');
    const fileSize = parseInt(formData.get('fileSize') || '0');
    const chunk = formData.get('chunk');

    if (!uploadId || !fileName || !chunk) {
      return createErrorResponse('Missing required chunk data', 400);
    }

    // Validate file size
    if (fileSize > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      return createErrorResponse(`File size exceeds limit of ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`, 400);
    }

    // Validate file extension (since frontend doesn't send fileType)
    const fileExt = fileName.toLowerCase().split('.').pop();
    const allowedExtensions = ['mp4', 'mkv', 'webm', 'avi', 'mov', 'm4v'];
    if (!allowedExtensions.includes(fileExt)) {
      return createErrorResponse(`File type .${fileExt} is not allowed`, 400);
    }

    // Create temporary directory for chunks
    const tempDir = path.join(process.cwd(), 'temp', 'chunks', uploadId);
    await ensureUploadDir(tempDir);

    // Save chunk
    const chunkPath = path.join(tempDir, `chunk_${chunkIndex}`);
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(chunkPath, buffer);

    // Always return success for chunks
    // The frontend will call a separate finalize endpoint to combine them
    return createSuccessResponse({
      success: true,
      chunkIndex,
      totalChunks,
      uploadId,
      message: `Chunk ${chunkIndex + 1} of ${totalChunks} uploaded successfully`
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return createErrorResponse('Failed to upload chunk', 500, error.message);
  }
}

// Cleanup endpoint for abandoned uploads
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { uploadId } = await req.json();
    
    if (!uploadId) {
      return createErrorResponse('Upload ID is required', 400);
    }

    const tempDir = path.join(process.cwd(), 'temp', 'chunks', uploadId);
    
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      return createSuccessResponse({ message: 'Chunks cleaned up successfully' });
    } catch (error) {
      console.error('Error cleaning up chunks:', error);
      return createErrorResponse('Failed to clean up chunks', 500);
    }

  } catch (error) {
    console.error('Chunk cleanup error:', error);
    return createErrorResponse('Failed to process cleanup request', 500);
  }
}
