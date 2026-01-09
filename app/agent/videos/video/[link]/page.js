'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Pause, Play, Repeat, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const Page = ({ params }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [isEnded, setIsEnded] = useState(false);
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                const response = await fetch(`/api/videos?link=${params.link}`);
                if (response.ok) {
                    const data = await response.json();
                    setVideoData(data);
                }
            } catch (error) {
                console.error('Error fetching video data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideoData();
    }, [params.link]);

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const handleProgressChange = (e) => {
        const newProgress = e.target.value;
        setProgress(newProgress);
        if (videoRef.current) {
            videoRef.current.currentTime = (videoRef.current.duration * newProgress) / 100;
        }
    };

    const updateProgress = () => {
        if (videoRef.current) {
            const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    const handleVideoEnd = () => {
        setIsEnded(true);
    };

    const handleReplay = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
            setIsEnded(false);
        }
    };

    if (loading) return <div>Loading video data...</div>;
    if (!videoData) return <div>Video not found</div>;

    return (
        // <>
        //     <div className="text-center">
        //         <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-4">
        //             Complaint Video Proof
        //         </h1>
        //         <p className="mt-2 text-gray-600">
        //             Enter relevant details to create a new video.
        //         </p>
        //     </div>

        //     <div className="flex flex-col items-center mt-6">
        //         {/* Video Player Container */}
        //         <div className="relative bg-black rounded-lg shadow-lg overflow-hidden lg:w-[850px] aspect-video">
        //             <video
        //                 ref={videoRef}
        //                 className="w-full h-full"
        //                 preload="metadata"
        //                 style={{ objectFit: 'contain' }}
        //                 onTimeUpdate={updateProgress}
        //                 onEnded={handleVideoEnd} // Trigger when video ends
        //             >
        //                 <source src="/uploads/vid.mp4" type="video/mp4" />
        //                 <track
        //                     src="/path/to/captions.vtt"
        //                     kind="subtitles"
        //                     srcLang="en"
        //                     label="English"
        //                 />
        //                 Your browser does not support the video tag.
        //             </video>
<div className="container mx-auto px-4 py-10">
            <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                    Work Request #{videoData.work_request_id} Video
                </h1>
                <p className="mt-2 text-gray-600">{videoData.description}</p>
                <p className="text-sm text-gray-500">
                    Uploaded on {new Date(videoData.created_at).toLocaleDateString()}
                </p>
            </div>
            {videoData.geo_tag && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Video Location
                </h3>
                <div className="mt-2 h-48 bg-gray-200 rounded-md flex items-center justify-center">
                {/* Here you would implement your map component */}
                <Button 
                    variant="outline" 
                    onClick={() => {
                    // Implement map opening functionality
                    const [lng, lat] = videoData.geo_tag.coordinates;
                    window.open(`https://www.google.com/maps?q=${lat},${lng}`);
                    }}
                >
                    View on Map
                </Button>
                </div>
            </div>
            )}

            <div className="flex flex-col items-center mt-6">
                <div className="relative bg-black rounded-lg shadow-lg overflow-hidden lg:w-[850px] aspect-video">
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        preload="metadata"
                        style={{ objectFit: 'contain' }}
                        onTimeUpdate={updateProgress}
                        onEnded={handleVideoEnd}
                    >
                        <source src={videoData.link?.startsWith('/uploads/') ? videoData.link.replace('/uploads/', '/api/uploads/') : videoData.link} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>





                    <div className="absolute inset-0 bottom-0 flex items-center justify-center">
                        {!isPlaying && !isEnded && (
                            <button
                                onClick={togglePlayPause}
                                className="p-4 text-white rounded-full shadow-lg focus:outline-none"
                            >
                                <Play />
                            </button>
                        )}
                        {/* Show replay icon if the video ends */}
                        {isEnded && (
                            <button
                                onClick={handleReplay}
                                className="p-4 bg-white text-gray-800 rounded-full shadow-lg focus:outline-none"
                            >
                                <Repeat />
                            </button>
                        )}
                        {/* Show pause button if the video is playing */}
                        {isPlaying && !isEnded && (
                            <button
                                onClick={togglePlayPause}
                                className="p-4 text-white rounded-full shadow-lg focus:outline-none"
                            >
                                <Pause />
                            </button>
                        )}
                    </div>

                    {/* Controls at the Bottom */}
                    <div className="absolute bottom-0 left-0 w-full p-4 flex items-center justify-between space-x-4">
                        {/* Seek Bar */}
                        <div className="flex gap-1 items-center w-full">
                            <button
                                onClick={togglePlayPause}
                                className="text-2xl focus:outline-none text-gray-300"
                            >
                                {isPlaying ? <Pause /> : <Play />}
                            </button>
                            <input
                                type="range"
                                className="flex-1 h-2 bg-gray-500 rounded-lg appearance-none"
                                min="0"
                                max="100"
                                step="0.1"
                                value={progress}
                                onChange={handleProgressChange}
                            />
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-300"><Volume2 /></span>
                            <input
                                type="range"
                                className="h-24 w-2 bg-gray-300 rounded-lg"
                                min="0"
                                max="1"
                                step="0.01" // Make volume change more dynamic
                                value={volume}
                                onChange={handleVolumeChange}
                            />
                            {/* Display Volume Percentage */}
                            <span className="text-gray-300">{Math.round(volume * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        {/* </> */}
        </div>
    );
};

export default Page;
