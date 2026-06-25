'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { uploadCmsVideo } from '@/lib/cms/upload';
import { toast } from 'sonner';

type VideoUploadProps = {
  label: string;
  value: string;
  folder: 'movies' | 'trailers' | 'episodes';
  onChange: (url: string) => void;
  hint?: string;
};

export function VideoUpload({ label, value, folder, onChange, hint }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadCmsVideo(file, folder);
      onChange(url);
      toast.success('Video uploaded to XORAL');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-foreground/60">{hint}</p>}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... or upload below"
      />
      <Input
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.m3u8"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p className="text-xs text-foreground/60">Uploading video…</p>}
      {value && (
        <p className="text-xs text-foreground/50 truncate" title={value}>
          Linked: {value}
        </p>
      )}
    </div>
  );
}
