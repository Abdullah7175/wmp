'use client';

import { useState, useEffect } from 'react';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadPdfJs, fetchPdfArrayBuffer } from '@/lib/setupPdfJs';

/**
 * Renders every page of a PDF as an image (no iframe, CSP-safe).
 */
export default function PdfPagePreview({ pdfUrl, title }) {
    const [pages, setPages] = useState([]);
    const [status, setStatus] = useState('loading');
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (!pdfUrl) {
            setStatus('error');
            return;
        }

        let cancelled = false;

        const render = async () => {
            try {
                const pdfjsLib = await loadPdfJs();
                const data = await fetchPdfArrayBuffer(pdfUrl);
                const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
                if (cancelled) return;

                setTotalPages(pdfDoc.numPages);
                const images = [];

                for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
                    if (cancelled) return;

                    const page = await pdfDoc.getPage(pageNumber);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({
                        canvasContext: canvas.getContext('2d'),
                        viewport,
                    }).promise;
                    images.push(canvas.toDataURL('image/jpeg', 0.9));
                    setPages([...images]);
                }

                if (!cancelled) setStatus('ready');
            } catch (error) {
                console.error(`PdfPagePreview failed for "${title || pdfUrl}":`, error);
                if (!cancelled) setStatus('error');
            }
        };

        setStatus('loading');
        setPages([]);
        setTotalPages(0);
        render();

        return () => {
            cancelled = true;
        };
    }, [pdfUrl, title]);

    if (!pdfUrl || status === 'error') {
        return (
            <div className="p-8 text-center text-red-600 bg-gray-50">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="mb-3">Unable to preview this PDF in the browser.</p>
                {pdfUrl ? (
                    <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Open in New Tab
                    </Button>
                ) : null}
            </div>
        );
    }

    if (pages.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 min-h-[200px] flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2 animate-pulse" />
                <p>Loading PDF preview...</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 p-2 space-y-4">
            {pages.map((pageImage, pageIdx) => (
                <div key={pageIdx} className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={pageImage}
                        alt={`${title || 'PDF'} - page ${pageIdx + 1}`}
                        className="max-w-full h-auto object-contain shadow-sm border bg-white"
                    />
                    {totalPages > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                            Page {pageIdx + 1} of {totalPages}
                        </p>
                    )}
                </div>
            ))}
            {status === 'loading' && totalPages > pages.length && (
                <p className="text-xs text-center text-gray-500 py-2">Loading more pages...</p>
            )}
        </div>
    );
}
