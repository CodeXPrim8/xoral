import { PartySuperAdmin } from '@/components/admin/PartySuperAdmin';
import { getPartyAdminSnapshot } from '@/lib/party/admin-snapshot';

export const dynamic = 'force-dynamic';

export default async function AdminPartyPage() {
  const data = await getPartyAdminSnapshot();
  return <PartySuperAdmin data={data} />;
}
