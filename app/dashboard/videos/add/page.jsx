import { CopyPlus, ArrowLeft } from 'lucide-react';
import VideoForm from './addVideoForm';
import { VideoProvider } from '../VideoContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Page = () => {
  return (
    <VideoProvider>
      <div className='bg-slate-50 p-3 h-full'>
        <div className="flex items-center justify-between bg-white mx-auto mt-10 mb-5 shadow-sm border sm:rounded-lg p-6 max-w-7xl ">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/videos">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Videos
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Add a New Video</h1>
              <p className="mt-2 text-gray-600">Enter relevant details to create a new video.</p>
            </div>
          </div>
          <CopyPlus className="w-8 h-8 text-blue-950" />
        </div>
      <div className='flex flex-col items-center justify-center w-full'>
        <VideoForm />
      </div>
      </div>
    </VideoProvider>
  );
};

export default Page;
