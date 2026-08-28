'use client';

/**
 * @deprecated Use pdf.js page-image preview via pdfPreviews in files/[id]/page.js.
 * Blob iframe previews are blocked by CSP (frame-src) on efiling pages.
 */
export { default } from './PdfPagePreview';
