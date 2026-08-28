'use client';

import { useState, useEffect } from 'react';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Fetches an authenticated PDF and displays it via a blob URL iframe.
 * Avoids X-Frame-Options blocking and does not require pdf.js worker.
 */
export default function SecurePdfFrame({ pdfUrl, title, className = 'w-full h-[85vh]' }) {
    const [blobUrl, setBlobUrl] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pdfUrl) {
            setError(true);
            setLoading(false);
            return;
        }

        let objectUrl;
        let cancelled = false;

        const loadPdf = async () => {
            try {
                const response = await fetch(pdfUrl, { credentials: 'include' });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const blob = await response.blob();
                if (cancelled) return;
                objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
                setError(false);
            } catch (err) {
                console.error('SecurePdfFrame failed:', err);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadPdf();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [pdfUrl]);

    if (!pdfUrl || error) {
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

    if (loading || !blobUrl) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 min-h-[200px] flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2 animate-pulse" />
                <p>Loading PDF preview...</p>
            </div>
        );
    }

    return (
        <iframe
            src={blobUrl}
            className={`${className} border-0`}
            title={title || 'PDF preview'}
        />
    );
}
