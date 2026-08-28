/**
 * Configure pdf.js to use a worker served from /public as .js
 * so nginx does not block it with application/octet-stream on .mjs bundles.
 */
export async function loadPdfJs() {
    const pdfjsLib = await import('pdfjs-dist/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    return pdfjsLib;
}

export async function fetchPdfArrayBuffer(fileUrl) {
    const response = await fetch(fileUrl, { credentials: 'include' });
    if (!response.ok) {
        throw new Error(`Failed to fetch PDF (${response.status})`);
    }
    return response.arrayBuffer();
}
