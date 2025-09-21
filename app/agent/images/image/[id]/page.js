'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

const Page = ({ params }) => {
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImageData = async () => {
            try {
                const response = await fetch(`/api/images?id=${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setImageData(data);
                }
            } catch (error) {
                console.error('Error fetching image data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchImageData();
    }, [params.id]);

    if (loading) return <div>Loading image data...</div>;
    if (!imageData) return <div>Image not found</div>;

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                    Work Request #{imageData.work_request_id} Image
                </h1>
                <p className="mt-2 text-gray-600">{imageData.description}</p>
                <p className="text-sm text-gray-500">
                    Uploaded on {new Date(imageData.created_at).toLocaleDateString()}
                </p>
            </div>

            {imageData.geo_tag && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Image Location
                    </h3>
                    <div className="mt-2 h-48 bg-gray-200 rounded-md flex items-center justify-center">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                const [lng, lat] = imageData.geo_tag.coordinates;
                                window.open(`https://www.google.com/maps?q=${lat},${lng}`);
                            }}
                        >
                            View on Map
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center mt-6">
                <div className="relative w-full max-w-4xl bg-black rounded-lg shadow-lg overflow-hidden">
                    <div className="aspect-video flex items-center justify-center">
                        <Image
                            src={imageData.link}
                            alt={imageData.description || 'Work request image'}
                            width={800}
                            height={600}
                            className="object-contain max-h-[70vh]"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;