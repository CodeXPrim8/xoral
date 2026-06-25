import { CharacterForm } from '@/components/admin/CharacterForm';

export default async function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Edit AI Star</h1>
      <CharacterForm characterId={id} />
    </div>
  );
}
