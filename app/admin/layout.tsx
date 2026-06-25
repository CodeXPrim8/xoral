import { redirect } from 'next/navigation';
import { isAdminUser } from '@/lib/cms/server';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await isAdminUser();
  if (!isAdmin) {
    redirect('/login?next=/admin');
  }

  return <AdminShell>{children}</AdminShell>;
}
