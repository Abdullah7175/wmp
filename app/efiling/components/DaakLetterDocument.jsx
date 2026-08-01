"use client";

import "@/app/efiling/components/TipTapEditor.css";

const KWSC_ADDRESS =
    "Chairman Secretariat 1st Floor, Block-F, 9th Mile Karsaz, Shahrah-e-Faisal, Karachi";

function formatLetterDate(daak) {
    const raw = daak?.letter_date || daak?.sent_at || daak?.created_at;
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

/**
 * Official KW&SC letter layout for daak view.
 * Department line uses creator's department: "Office of {department}".
 */
export default function DaakLetterDocument({ daak }) {
    if (!daak) return null;

    const departmentName =
        daak.creator_department_name ||
        daak.department_name ||
        "";
    const officeLine = departmentName
        ? `Office of ${departmentName}`
        : "Office of —";

    const reference =
        daak.reference_number ||
        daak.daak_number ||
        "";
    const letterDate = formatLetterDate(daak);
    const toName = daak.to_header || "";

    return (
        <div className="bg-gray-100 p-3 md:p-6 rounded-lg border overflow-auto">
            <article
                className="bg-white mx-auto shadow-md border border-gray-300 w-full max-w-[210mm] text-black"
                style={{
                    minHeight: "297mm",
                    padding: "14mm 18mm 18mm",
                    fontFamily: "Times New Roman, Times, serif",
                }}
            >
                {/* Fixed letterhead */}
                <header className="flex items-start gap-3 md:gap-4 pb-2 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo.png"
                        alt="KW&SC"
                        className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] object-contain shrink-0"
                    />
                    <div className="flex-1 min-w-0 pt-1">
                        <h1 className="text-[15px] md:text-[18px] font-bold uppercase tracking-wide leading-tight">
                            Karachi Water &amp; Sewerage Corporation
                        </h1>
                        <p className="text-[13px] md:text-[15px] font-semibold mt-1 leading-snug">
                            {officeLine}
                        </p>
                        <p className="text-[11px] md:text-[12px] mt-1 leading-snug border-b border-black pb-0.5 inline-block max-w-full">
                            {KWSC_ADDRESS}
                        </p>
                    </div>
                </header>

                {/* Reference + Date (date on same row as To label area per letter style:
                    User asked: reference number, then To with date on right of same line as To) */}
                {reference && (
                    <p className="text-[13px] md:text-[14px] mb-3">
                        <span className="font-semibold">No. </span>
                        {reference}
                    </p>
                )}

                <div className="flex items-start justify-between gap-4 mb-1">
                    <p className="text-[14px] md:text-[15px] font-semibold">To,</p>
                    {letterDate && (
                        <p className="text-[13px] md:text-[14px] whitespace-nowrap">
                            <span className="font-semibold">Date: </span>
                            {letterDate}
                        </p>
                    )}
                </div>

                {toName ? (
                    <div className="pl-6 mb-4">
                        <p className="text-[14px] md:text-[15px] whitespace-pre-line">{toName}</p>
                        <p className="text-[14px] md:text-[15px]">
                            {daak.organization_name || "KW&SC"}
                        </p>
                    </div>
                ) : (
                    <div className="mb-4" />
                )}

                <p className="text-[14px] md:text-[15px] font-bold uppercase underline mb-3">
                    Subject: {daak.subject || "—"}
                </p>

                <div
                    className="daak-display-content text-[14px] md:text-[15px] leading-relaxed text-justify"
                    dangerouslySetInnerHTML={{ __html: daak.content || "" }}
                />
            </article>
        </div>
    );
}
