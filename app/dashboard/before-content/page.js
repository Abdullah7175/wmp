import { redirect } from 'next/navigation';

/** Legacy URL — list lives at /dashboard/before-images */
export default function BeforeContentIndexPage() {
  redirect('/dashboard/before-images');
}
