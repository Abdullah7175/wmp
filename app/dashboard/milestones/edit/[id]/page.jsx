// app/dashboard/milestones/edit/[id]/page.jsx
import { Edit3 } from 'lucide-react';
import UpdateMilestoneForm from './updateMilestoneForm';

// Use async if you are on a newer Next.js version where params is a promise
const Page = async ({ params }) => {
  const { id } = await params; // Await params to ensure ID is available

  return (
    <div className='bg-slate-50 p-3 h-full'>
      <div className="flex items-center justify-between bg-white mx-auto mt-10 mb-5 shadow-sm border sm:rounded-lg p-6 max-w-7xl ">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Edit Milestone</h1>
          <p className="mt-2 text-gray-600">Modify the properties of this milestone definition.</p>
        </div>
        <Edit3 className="w-8 h-8 text-blue-900" />
      </div>
      <div className='flex flex-col items-center justify-center w-full'>
        {/* Pass the id here */}
        <UpdateMilestoneForm id={id} />
      </div>
    </div>
  );
};

export default Page;