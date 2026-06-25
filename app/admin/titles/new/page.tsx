import { TitleForm } from '@/components/admin/TitleForm';

export default function NewTitlePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Add title</h1>
      <TitleForm />
    </div>
  );
}
