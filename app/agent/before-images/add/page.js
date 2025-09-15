import { Suspense } from 'react';
import AddBeforeImagesPageClient from './AddBeforeImagesPageClient';

export default function AddBeforeImagesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6"><div>Loading...</div></div>}>
      <AddBeforeImagesPageClient />
    </Suspense>
  );
}
