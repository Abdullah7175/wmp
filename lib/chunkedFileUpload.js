import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export class ChunkedFileUpload {
    constructor(options = {}) {
        this.chunkSize = options.chunkSize || 1024 * 1024; // 1MB chunks
        this.maxFileSize = options.maxFileSize || 500 * 1024 * 1024; // 500MB max
        this.uploadDir = options.uploadDir || path.join(process.cwd(), 'public', 'uploads');
        this.tempDir = path.join(this.uploadDir, 'temp');
    }

    async initializeUpload(fileName, fileSize, fileType) {
        // Validate file size
        if (fileSize > this.maxFileSize) {
            throw new Error(`File size ${fileSize} exceeds maximum allowed size of ${this.maxFileSize}`);
        }

        // Create temp directory if it doesn't exist
        await fs.mkdir(this.tempDir, { recursive: true });

        // Generate unique upload ID
        const uploadId = crypto.randomUUID();
        const tempFilePath = path.join(this.tempDir, `${uploadId}_${fileName}`);

        return {
            uploadId,
            tempFilePath,
            totalChunks: Math.ceil(fileSize / this.chunkSize),
            chunkSize: this.chunkSize
        };
    }

    async uploadChunk(uploadId, chunkIndex, chunkData, fileName) {
        const tempFilePath = path.join(this.tempDir, `${uploadId}_${fileName}`);
        
        try {
            // Append chunk to temp file
            await fs.appendFile(tempFilePath, chunkData);
            
            return {
                success: true,
                chunkIndex,
                uploadedBytes: chunkData.length
            };
        } catch (error) {
            console.error('Chunk upload error:', error);
            throw new Error(`Failed to upload chunk ${chunkIndex}: ${error.message}`);
        }
    }

    async finalizeUpload(uploadId, fileName, finalPath) {
        const tempFilePath = path.join(this.tempDir, `${uploadId}_${fileName}`);
        
        try {
            // Ensure final directory exists
            const finalDir = path.dirname(finalPath);
            await fs.mkdir(finalDir, { recursive: true });

            // Move temp file to final location
            await fs.rename(tempFilePath, finalPath);

            // Clean up temp file
            try {
                await fs.unlink(tempFilePath);
            } catch (cleanupError) {
                console.warn('Failed to cleanup temp file:', cleanupError);
            }

            return {
                success: true,
                finalPath,
                fileSize: (await fs.stat(finalPath)).size
            };
        } catch (error) {
            console.error('Finalize upload error:', error);
            throw new Error(`Failed to finalize upload: ${error.message}`);
        }
    }

    async cleanupFailedUpload(uploadId, fileName) {
        const tempFilePath = path.join(this.tempDir, `${uploadId}_${fileName}`);
        
        try {
            await fs.unlink(tempFilePath);
        } catch (error) {
            console.warn('Failed to cleanup failed upload:', error);
        }
    }

    // Helper method to convert file to chunks
    static async fileToChunks(file, chunkSize = 1024 * 1024) {
        const chunks = [];
        const buffer = await file.arrayBuffer();
        const totalChunks = Math.ceil(buffer.byteLength / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, buffer.byteLength);
            const chunk = buffer.slice(start, end);
            chunks.push({
                index: i,
                data: chunk,
                size: chunk.byteLength
            });
        }

        return chunks;
    }
}

export default ChunkedFileUpload;
