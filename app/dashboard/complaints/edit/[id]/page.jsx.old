import { CopyPlus } from 'lucide-react';
import ComplaintForm from './updateComplaintForm';
import { ComplaintProvider } from './ComplaintContext';

const Page = () => {
  return (
    <ComplaintProvider>
      <div className='bg-slate-50 p-3 h-full'>
        <div className="flex items-center justify-between bg-white mx-auto mt-10 mb-5 shadow-sm border sm:rounded-lg p-6 max-w-7xl ">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Edit Complaint</h1>
            <p className="mt-2 text-gray-600">Change or update details below.</p>
          </div>
          <CopyPlus className="w-8 h-8 text-blue-950" />
        </div>
        <div className='flex flex-col items-center justify-center  w-full'>
          <ComplaintForm />
        </div>
      </div>
    </ComplaintProvider>
  );
};

export default Page;
