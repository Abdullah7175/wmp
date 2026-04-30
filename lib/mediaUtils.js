// lib/mediaUtils.js
// Utility functions for handling media (images and videos) across the application

/**
 * Normalize a media link to ensure it returns a valid, accessible URL
 * Handles both old format (just filename) and new format (full API path)
 * 
 * @param {string} link - The media link from database (can be filename or full path)
 * @param {string} type - Media type: 'image', 'video', 'final-video', 'before-content', etc.
 * @returns {string} - Valid URL to access the media
 * 
 * Examples:
 * - "123.png" -> "/api/uploads/images/123.png"
 * - "video-456.mp4" -> "/api/uploads/videos/video-456.mp4"  
 * - "/api/uploads/images/123.png" -> "/api/uploads/images/123.png" (unchanged)
 */
export function getMediaUrl(link, type = 'image') {
    if (!link) {
        console.warn('Empty media link provided');
        return null;
    }

    // If link already starts with /api/uploads/ or http, it's already a valid URL
    if (link.startsWith('/api/uploads/') || link.startsWith('http')) {
        return link;
    }

    // Determine the upload directory based on type
    let uploadDir = 'images';
    if (type === 'video') {
        uploadDir = 'videos';
    } else if (type === 'final-video' || type === 'finalvideo') {
        uploadDir = 'final-videos';
    } else if (type === 'before-content' || type === 'beforecontent') {
        uploadDir = 'before-content';
    } else if (type === 'before-images' || type === 'beforeimages') {
        uploadDir = 'before-images';
    }

    // For old format (just filename), prepend the API path
    // Extract the actual filename in case there's a path included
    const filename = link.split('/').pop();

    return `/api/uploads/${uploadDir}/${filename}`;
}

/**
 * Get media URL with authentication token (for mobile apps)
 * Mobile apps may need to include JWT token for authenticated access
 * 
 * @param {string} link - The media link
 * @param {string} token - Optional JWT token for mobile authentication
 * @param {string} type - Media type
 * @returns {string} - URL with optional token parameter
 */
export function getMediaUrlWithToken(link, token, type = 'image') {
    const baseUrl = getMediaUrl(link, type);
    if (!baseUrl) return null;

    if (token) {
        // Add token as query parameter for React Native which doesn't support custom headers
        return `${baseUrl}?token=${token}`;
    }

    return baseUrl;
}

/**
 * Validate if a media URL is accessible (basic check)
 * 
 * @param {string} link - The media link
 * @returns {boolean} - True if link appears valid
 */
export function isValidMediaLink(link) {
    if (!link || typeof link !== 'string') return false;

    // Check if it's a valid path or URL
    return link.length > 0 && (link.startsWith('/') || link.startsWith('http'));
}

/**
 * Get file extension from media link
 * 
 * @param {string} link - The media link
 * @returns {string} - File extension (e.g., "png", "mp4", "jpg")
 */
export function getMediaExtension(link) {
    if (!link) return null;

    const filename = link.split('/').pop();
    const parts = filename.split('.');

    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
}

/**
 * Determine if media is an image based on extension
 * 
 * @param {string} link - The media link
 * @returns {boolean} - True if media is an image
 */
export function isImageMedia(link) {
    const ext = getMediaExtension(link);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
}

/**
 * Determine if media is a video based on extension
 * 
 * @param {string} link - The media link
 * @returns {boolean} - True if media is a video
 */
export function isVideoMedia(link) {
    const ext = getMediaExtension(link);
    return ['mp4', 'webm', 'mov', 'avi', 'mkv', '3gp'].includes(ext);
}

/**
 * Build image tag attributes safely
 * Useful for logging and debugging
 * 
 * @param {string} link - The media link
 * @param {object} options - Additional options (alt, className, etc.)
 * @returns {object} - Sanitized attributes for img tag
 */
export function getImageAttributes(link, options = {}) {
    const url = getMediaUrl(link, 'image');

    return {
        src: url || '',
        alt: options.alt || 'Media content',
        className: options.className || '',
        loading: 'lazy', // Lazy load images for better performance
        onError: options.onError,
    };
}

/**
 * Build video tag attributes safely
 * 
 * @param {string} link - The media link
 * @param {object} options - Additional options (controls, autoplay, etc.)
 * @returns {object} - Sanitized attributes for video tag
 */
export function getVideoAttributes(link, options = {}) {
    const url = getMediaUrl(link, 'video');

    return {
        src: url || '',
        controls: options.controls !== false, // Default to true
        autoPlay: options.autoPlay || false,
        className: options.className || '',
        onError: options.onError,
    };
}
