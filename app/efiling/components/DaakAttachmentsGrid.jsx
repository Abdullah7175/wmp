"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";

function isImageAttachment(attachment) {
    const type = (attachment.file_type || "").toLowerCase();
    const name = (attachment.file_name || "").toLowerCase();
    if (type.startsWith("image/")) return true;
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name);
}

function isPdfAttachment(attachment) {
    const type = (attachment.file_type || "").toLowerCase();
    const name = (attachment.file_name || "").toLowerCase();
    return type === "application/pdf" || name.endsWith(".pdf");
}

function isWordAttachment(attachment) {
    const type = (attachment.file_type || "").toLowerCase();
    const name = (attachment.file_name || "").toLowerCase();
    return (
        type.includes("word") ||
        type.includes("officedocument.wordprocessingml") ||
        /\.(doc|docx)$/i.test(name)
    );
}

function displayName(attachment) {
    return attachment.attachment_name || attachment.file_name || "Attachment";
}

function openAttachment(attachment) {
    if (attachment?.file_path) {
        window.open(attachment.file_path, "_blank", "noopener,noreferrer");
    }
}

/**
 * Daak attachments: images as thumbnails; PDF/Word/other as file cards.
 * Both open in a new window on click.
 */
export default function DaakAttachmentsGrid({ attachments = [] }) {
    if (!attachments.length) {
        return <p className="text-sm text-gray-500">No attachments</p>;
    }

    const images = attachments.filter(isImageAttachment);
    const files = attachments.filter((a) => !isImageAttachment(a));

    return (
        <div className="space-y-5">
            {images.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Images</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.map((attachment) => (
                            <button
                                key={attachment.id}
                                type="button"
                                onClick={() => openAttachment(attachment)}
                                className="group border rounded-lg overflow-hidden bg-gray-50 hover:ring-2 hover:ring-blue-400 transition text-left"
                                title={`Open ${displayName(attachment)}`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={attachment.file_path}
                                    alt={displayName(attachment)}
                                    className="w-full h-28 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                                <div className="px-2 py-1.5 flex items-center justify-between gap-1">
                                    <span className="text-xs truncate flex-1">
                                        {displayName(attachment)}
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-100" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Files</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {files.map((attachment) => {
                            const pdf = isPdfAttachment(attachment);
                            const word = isWordAttachment(attachment);
                            return (
                                <div
                                    key={attachment.id}
                                    className="flex items-center gap-3 border rounded-lg p-3 bg-white hover:bg-gray-50"
                                >
                                    <div
                                        className={`w-12 h-14 rounded flex items-center justify-center shrink-0 ${
                                            pdf
                                                ? "bg-red-50 text-red-600"
                                                : word
                                                  ? "bg-blue-50 text-blue-700"
                                                  : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        <FileText className="w-6 h-6" />
                                        <span className="sr-only">
                                            {pdf ? "PDF" : word ? "Word" : "File"}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate" title={displayName(attachment)}>
                                            {displayName(attachment)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {pdf ? "PDF" : word ? "Word document" : "File"}
                                            {attachment.file_size
                                                ? ` · ${Math.round(attachment.file_size / 1024)} KB`
                                                : ""}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 h-7 text-xs"
                                            onClick={() => openAttachment(attachment)}
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            Open in new window
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
