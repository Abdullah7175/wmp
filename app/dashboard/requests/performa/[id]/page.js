"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import QRCode from 'react-qr-code';
import { useSession } from 'next-auth/react';

const Page = () => {
    const [data, setData] = useState(null);
    const [performaDate, setPerformaDate] = useState('');
    const [showDateModal, setShowDateModal] = useState(true);
    const [shootDate, setShootDate] = useState('');
    const [editShootDate, setEditShootDate] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const requestId = params.id;
    const { data: session } = useSession();
    const currentUserName = session?.user?.name || 'N/A';

    useEffect(() => {
        const Getdata = async () => {
            if (requestId) {
                try {
                    const response = await fetch(`/api/requests?id=${requestId}`);
                    const data = await response.json();
                    setData(data);
                    setShootDate(data.shoot_date || '');
                } catch (error) {
                    console.error('Error fetching performa data:', error);
                    toast({
                        title: "Error fetching performa data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };
        Getdata();
    }, [requestId, toast]);

    useEffect(() => {
        if (data && !performaDate) {
            setPerformaDate(new Date().toISOString().slice(0, 10));
        }
    }, [data, performaDate]);

    const handleDateSelect = (e) => {
        setPerformaDate(e.target.value);
    };

    const handleShootDateChange = (e) => {
        setShootDate(e.target.value);
    };
    const handleShootDateSelect = () => {
        setEditShootDate(true);
    };
    const handleShootDateSave = () => {
        setEditShootDate(false);
    };

    if (!data) return <div>Loading...</div>;

    // Helper functions to get videographer, assistant, etc. (mocked for now)
    const videographer = data.videographer_name || 'N/A'; // You may need to fetch this from related tables
    const assistant = data.assistant_name || 'N/A'; // You may need to fetch this from related tables
    let videoLink = data.final_video_link || 'N/A'; // You may need to fetch this from final_videos
    // Make videoLink absolute if it starts with '/'
    if (videoLink && typeof window !== 'undefined' && videoLink.startsWith('/')) {
        videoLink = window.location.origin + videoLink;
    }

    // Modal for selecting performa date
    if (showDateModal) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-lg font-bold mb-4">Select Performa Date</h2>
                    <input
                        type="date"
                        value={performaDate}
                        onChange={handleDateSelect}
                        className="border px-3 py-2 rounded-md mb-4"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                            onClick={() => setShowDateModal(false)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
        {/* Print Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => window.print()}
            className="no-print px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            Print Performa
          </button>
        </div>
        <div className="performa-content">
        <div className='w-full max-w-4xl m-auto my-10 border rounded-2xl bg-gray-50 py-5 print:w-[210mm] print:min-h-[297mm] print:m-0 print:rounded-none print:border-0'>
            {/* Performa Header */}
            <div className="performa-header flex flex-row justify-between items-start px-8 mt-2 mb-6 gap-8 print:gap-0">
                <div className='flex-1'>
                    <h1 className='font-bold text-lg mb-2'>KW&SC Works Video Record Performance (Form-B)</h1>
                    <div className='font-bold'>For The <span className='font-bold'>{data.nature_of_work}</span></div>
                    <div className='font-bold'>Assign to: <span className='font-light'>Media Cell</span></div>
                    <div className='font-bold'>Date: <span className='font-light'>{performaDate}</span></div>
                    <div className='font-bold'>Case No: SMW-{requestId}</div>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[140px]">
                    <Image src="/logo.png" className="py-2 px-1" width="90" height="90" alt="logo" />
                    <div className='flex items-center w-full mt-2'>
                        <span className='font-medium mr-2'>Ref:</span>
                        <div className="border-t-2 border-black flex-1 h-0 mt-2"></div>
                    </div>
                </div>
            </div>

            <h1 className='flex items-center justify-center font-bold text-2xl my-8 print:my-16'>Work Particulars</h1>

            {/* Performa Tables */}
            <div className='performa-tables flex flex-row gap-4 justify-center items-start px-8 mb-12 print:gap-4 print:mb-20 print:flex-row print:justify-center print:items-start' style={{ pageBreakInside: 'avoid' }}>
                <table className='table-auto border border-gray-300 rounded-lg shadow-md min-w-[320px] max-w-[360px] w-[340px] print:w-[340px] print:min-w-[320px] print:max-w-[360px]'>
                    <tbody>
                        {[
                            ["Town", data.town_name || 'N/A'],
                            ["ExEn", data.executive_engineer_name || 'N/A'],
                            ["Nature of Work", data.nature_of_work || 'N/A'],
                            ["District", data.district_name || 'N/A'],
                            ["Videographer", videographer],
                            ["Shoot Date",
                                [
                                <div key="shoot-date-input" className="flex items-center gap-2 print:hidden">
                                    {(!shootDate || editShootDate) ? (
                                        <>
                                            <input
                                                type="date"
                                                value={shootDate}
                                                onChange={handleShootDateChange}
                                                className="border px-2 py-1 rounded-md"
                                            />
                                            <button
                                                className="px-2 py-1 bg-indigo-600 text-white rounded-md text-xs"
                                                onClick={handleShootDateSave}
                                            >
                                                Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span>{shootDate}</span>
                                            <button
                                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded-md text-xs"
                                                onClick={handleShootDateSelect}
                                            >
                                                Change
                                            </button>
                                        </>
                                    )}
                                </div>,
                                // For print: always show as plain text
                                <span key="shoot-date-print" className="hidden print:inline">{shootDate || '_________'}</span>
                            ]
                            ],
                            ["Status", data.status_name || 'N/A'],
                            ["Video Link", videoLink],
                            ["B.G #", data.budget_code || 'N/A'],
                        ].map(([label, value], index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                                <td className='px-4 py-2 font-medium border border-gray-300'>{label}:</td>
                                <td className="px-4 py-2 border border-gray-300">{Array.isArray(value) ? value.map((v, i) => <React.Fragment key={i}>{v}</React.Fragment>) : value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <table className='table-auto border border-gray-300 rounded-lg shadow-md min-w-[320px] max-w-[360px] w-[340px] print:w-[340px] print:min-w-[320px] print:max-w-[360px]'>
                    <tbody>
                        {[
                            ["Work Location", data.address || 'N/A'],
                            ["Contact", data.contact_number || 'N/A'],
                            ["Department", data.complaint_type || 'N/A'],
                            ["Completion Date", performaDate],
                            // ["Completion Date", data.completion_date ? new Date(data.completion_date).toLocaleDateString() : 'N/A'],
                            ["Assistant", currentUserName],
                            ["Geo Tag", data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : 'N/A'],
                            ["Contractor", data.contractor_name || 'N/A'],
                            ["QR Code",
                                [<QRCode
                                    key="qr-code"
                                    style={{ height: "auto", maxWidth: "50%", width: 130, minWidth: 110, maxWidth: 170 }}
                                    viewBox={`0 0 150 150`}
                                    value={window.location.href}></QRCode> || 'N/A']
                            ],
                        ].map(([label, value], index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                                <td className='px-4 py-2 font-medium border border-gray-300'>{label}:</td>
                                <td className="px-4 py-2 border border-gray-300">{Array.isArray(value) ? value.map((v, i) => <React.Fragment key={i}>{v}</React.Fragment>) : value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Signature Section */}
            <div className='performa-signatures flex flex-row justify-between items-end gap-8 mt-16 px-8 print:gap-8 print:mt-32' style={{ pageBreakInside: 'avoid' }}>
                <div className="text-center flex-1">
                    <div className="border-t-2 border-black w-full mx-auto mb-2"></div>
                    <p className="text-sm mt-2 font-bold">Issued By</p>
                </div>
                <div className="text-center flex-1">
                    <div className="border-t-2 border-black w-full mx-auto mb-2"></div>
                    <p className="text-sm mt-2 font-bold">Incharge(SWMC)</p>
                </div>
                <div className="text-center flex-1">
                    <div className="border-t-2 border-black w-full mx-auto mb-2"></div>
                    <p className="text-sm mt-2 font-bold">ExEn (Name & Sign)</p>
                </div>
            </div>
        </div>
        </div>
        </>
        
    );
};

export default Page; 