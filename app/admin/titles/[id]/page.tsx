import { TitleForm } from '@/components/admin/TitleForm';

export default async function EditTitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Edit title</h1>
      <TitleForm titleId={id} />
    </div>
  );
}
