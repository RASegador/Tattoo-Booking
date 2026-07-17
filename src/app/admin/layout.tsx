'use client';

import { usePathname } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';

const BARE_ROUTES = ['/admin/login', '/admin/setup'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = BARE_ROUTES.includes(pathname);

  if (isBare) {
    return <div className="relative min-h-screen">{children}</div>;
  }

  return (
    <div className="relative min-h-screen">
      <AdminNav />
      <main className="md:pl-64 pt-32 md:pt-28 pb-16 px-4 md:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
