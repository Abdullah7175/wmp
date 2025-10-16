import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  UPLOAD_CONFIG, 
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

    const { uploadId, fileName, fileSize, totalChunks } = await req.json();
    
    if (!uploadId || !fileName || !totalChunks) {
      return createErrorResponse('Missing required finalize data', 400);
    }

    const tempDir = path.join(process.cwd(), 'temp', 'chunks', uploadId);
    
    // Check if temp directory exists
    try {
      await fs.access(tempDir);
    } catch (error) {
      return createErrorResponse('Upload session not found or expired', 404);
    }

    try {
      // Read all chunks and combine them
      const chunks = [];
      for (let i = 0; i < totalChunks; i++) {
        const chunkFilePath = path.join(tempDir, `chunk_${i}`);
        try {
          const chunkData = await fs.readFile(chunkFilePath);
          chunks.push(chunkData);
        } catch (error) {
          console.error(`Error reading chunk ${i}:`, error);
          throw new Error(`Missing chunk ${i}. Upload may be incomplete.`);
        }
      }

      // Combine chunks
      const combinedBuffer = Buffer.concat(chunks);
      
      // Verify combined file size matches expected size
      if (fileSize && Math.abs(combinedBuffer.length - fileSize) > 1024) { // Allow 1KB variance
        throw new Error(`File size mismatch. Expected ${fileSize}, got ${combinedBuffer.length}`);
      }

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
        message: 'File uploaded and finalized successfully'
      });

    } catch (error) {
      // Clean up on error
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Error cleaning up chunks:', cleanupError);
      }
      
      console.error('Error finalizing upload:', error);
      return createErrorResponse(`Failed to finalize upload: ${error.message}`, 500);
    }

  } catch (error) {
    console.error('Finalize upload error:', error);
    return createErrorResponse('Failed to finalize upload', 500, error.message);
  }
}

