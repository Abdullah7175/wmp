import { Suspense } from 'react';
import AddBeforeContentPageClient from './AddBeforeImagesPageClient';

export default function AddBeforeContentPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6"><div>Loading...</div></div>}>
      <AddBeforeContentPageClient />
    </Suspense>
  );
}
