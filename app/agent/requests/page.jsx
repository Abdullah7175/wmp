"use client"
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DataTable } from './data-table';
import { columns, getAgentRequestColumns } from './columns';
import { useSession } from 'next-auth/react';
import ImageForm from '../images/add/addImageForm';
import VideoForm from '../videos/add/addVideoForm';
import AddBeforeContentForm from '../before-images/add/addBeforeImageForm';

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] relative flex flex-col">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <div className="overflow-y-auto p-6 flex-1 min-h-0">
        {children}
      </div>
    </div>
  </div>
);

const RequestsPage = () => {
    const { data: session } = useSession();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [showImageForm, setShowImageForm] = useState(false);
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [showBeforeContentForm, setShowBeforeContentForm] = useState(false);

    useEffect(() => {
        if (!session?.user?.id) return;
        const fetchRequests = async () => {
            try {
                const res = await fetch(`/api/requests?creator_id=${session.user.id}&creator_type=agent&limit=1000&include_approval_status=true`);
                if (!res.ok) {
                    throw new Error('Failed to fetch requests');
                }
                const data = await res.json();
                setRequests(data.data || []);
            } catch (error) {
                console.error('Error fetching requests:', error);
                setError(error.message);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [router, session?.user?.id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading requests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => router.push('/agent/requests')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const columns = getAgentRequestColumns({
        onAddImage: (id) => {
            setSelectedRequestId(id);
            setShowImageForm(true);
        },
        onAddVideo: (id) => {
            setSelectedRequestId(id);
            setShowVideoForm(true);
        },
        onAddBeforeContent: (id) => {
            setSelectedRequestId(id);
            setShowBeforeContentForm(true);
        },
    });

    const closeForms = () => {
        setShowImageForm(false);
        setShowVideoForm(false);
        setShowBeforeContentForm(false);
        setSelectedRequestId(null);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Work Requests</h1>
                <Button onClick={() => router.push('/agent/requests/new')}>
                    Create New Request
                </Button>
            </div>
            <div className="bg-white rounded-lg shadow">
                <DataTable 
                    columns={columns} 
                    data={requests} 
                    meta={{
                        onAddImage: (id) => {
                            setSelectedRequestId(id);
                            setShowImageForm(true);
                        },
                        onAddVideo: (id) => {
                            setSelectedRequestId(id);
                            setShowVideoForm(true);
                        },
                        onAddBeforeContent: (id) => {
                            setSelectedRequestId(id);
                            setShowBeforeContentForm(true);
                        },
                    }}
                />
            </div>
            {showImageForm && selectedRequestId && (
                <Modal onClose={closeForms}>
                  <ImageForm workRequestId={selectedRequestId} onClose={closeForms} />
                </Modal>
            )}
            {showVideoForm && selectedRequestId && (
                <Modal onClose={closeForms}>
                  <VideoForm workRequestId={selectedRequestId} onClose={closeForms} />
                </Modal>
            )}
            {showBeforeContentForm && selectedRequestId && (
                <Modal onClose={closeForms}>
                  <AddBeforeContentForm workRequestId={selectedRequestId} onClose={closeForms} />
                </Modal>
            )}
        </div>
    );
};

export default RequestsPage;