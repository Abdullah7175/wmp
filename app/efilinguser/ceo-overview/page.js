'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CEOOverview() {
    const router = useRouter();

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-800">E-Filing CEO Dashboard</h1>
            </div>

            {/* Here you will add your Organization-wide Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Example: Total Files across ALL departments */}
            </div>
            
            {/* Here you can show a Chart of department performance */}
        </div>
    );
}