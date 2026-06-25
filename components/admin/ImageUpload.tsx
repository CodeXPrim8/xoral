'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadCmsFile } from '@/lib/cms/upload';
import { toast } from 'sonner';

type ImageUploadProps = {
  label: string;
  value: string;
  folder: string;
  onChange: (url: string) => void;
};

export function ImageUpload({ label, value, folder, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadCmsFile(file, folder);
      onChange(url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
      <div className="flex items-center gap-3">
        <Input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-16 w-16 rounded object-cover border border-border" />
        )}
      </div>
      {uploading && <p className="text-xs text-foreground/60">Uploading...</p>}
    </div>
  );
}
