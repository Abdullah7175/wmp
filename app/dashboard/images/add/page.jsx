import { Image as ImageIcon, ArrowLeft } from 'lucide-react';
import ImageForm from './addImageForm';
import { ImageProvider } from '../ImageContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Page = () => {
  return (
    <ImageProvider>
      <div className='bg-slate-50 p-3 h-full'>
        <div className="flex items-center justify-between bg-white mx-auto mt-10 mb-5 shadow-sm border sm:rounded-lg p-6 max-w-7xl ">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/images">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Images
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Add a New Image</h1>
              <p className="mt-2 text-gray-600">Upload an image with relevant details.</p>
            </div>
          </div>
          <ImageIcon className="w-8 h-8 text-blue-950" />
        </div>
      <div className='flex flex-col items-center justify-center w-full'>
        <ImageForm />
      </div>
      </div>
    </ImageProvider>
  );
};

export default Page;