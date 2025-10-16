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
    const chunkId = formData.get('chunkId'); // Unique identifier for this upload session
    const fileName = formData.get('fileName');
    const fileType = formData.get('fileType');
    const fileSize = parseInt(formData.get('fileSize') || '0');
    const chunk = formData.get('chunk');

    if (!chunkId || !fileName || !chunk) {
      return createErrorResponse('Missing required chunk data', 400);
    }

    // Validate file type
    if (!UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES.includes(fileType)) {
      return createErrorResponse(`File type ${fileType} is not allowed`, 400);
    }

    // Validate file size
    if (fileSize > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      return createErrorResponse(`File size exceeds limit of ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`, 400);
    }

    // Create temporary directory for chunks
    const tempDir = path.join(process.cwd(), 'temp', 'chunks', chunkId);
    await ensureUploadDir(tempDir);

    // Save chunk
    const chunkPath = path.join(tempDir, `chunk_${chunkIndex}`);
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(chunkPath, buffer);

    // If this is the last chunk, combine all chunks
    if (chunkIndex === totalChunks - 1) {
      try {
        // Read all chunks and combine them
        const chunks = [];
        for (let i = 0; i < totalChunks; i++) {
          const chunkFilePath = path.join(tempDir, `chunk_${i}`);
          const chunkData = await fs.readFile(chunkFilePath);
          chunks.push(chunkData);
        }

        // Combine chunks
        const combinedBuffer = Buffer.concat(chunks);
        
        // Generate final filename and save to uploads directory
        const finalFilename = generateUniqueFilename(fileName);
        const uploadsDir = path.join(process.cwd(), 'public', UPLOAD_CONFIG.UPLOAD_DIRS.finalVideos);
        await ensureUploadDir(uploadsDir);
        
        const finalPath = path.join(uploadsDir, finalFilename);
        await fs.writeFile(finalPath, combinedBuffer);

        // Clean up temporary chunks
        await fs.rm(tempDir, { recursive: true, force: true });

        return createSuccessResponse({
          success: true,
          fileName: finalFilename,
          filePath: `/uploads/final-videos/${finalFilename}`,
          fileSize: combinedBuffer.length,
          message: 'File uploaded successfully'
        });

      } catch (error) {
        // Clean up on error
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error('Error cleaning up chunks:', cleanupError);
        }
        
        console.error('Error combining chunks:', error);
        return createErrorResponse('Failed to combine file chunks', 500);
      }
    }

    // Return success for intermediate chunks
    return createSuccessResponse({
      success: true,
      chunkIndex,
      totalChunks,
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

    const { chunkId } = await req.json();
    
    if (!chunkId) {
      return createErrorResponse('Chunk ID is required', 400);
    }

    const tempDir = path.join(process.cwd(), 'temp', 'chunks', chunkId);
    
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
