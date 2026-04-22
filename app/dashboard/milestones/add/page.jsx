import { ListPlus } from 'lucide-react';
import AddMilestoneForm from './addMilestoneForm';
// Note: If you created a MilestoneProvider/Context, wrap it here. 
// Otherwise, we can use standard form handling.

const Page = () => {
  return (
      <div className='bg-slate-50 p-3 h-full'>
        <div className="flex items-center justify-between bg-white mx-auto mt-10 mb-5 shadow-sm border sm:rounded-lg p-6 max-w-7xl ">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Add Milestone Definition</h1>
            <p className="mt-2 text-gray-600">Define a new step for specific work categories.</p>
          </div>
          <ListPlus className="w-8 h-8 text-blue-950" />
        </div>
        <div className='flex flex-col items-center justify-center w-full'>
          <AddMilestoneForm />
        </div>
      </div>
  );
};

export default Page;