import { createClientIfConfigured } from '@/lib/supabase/client';

const VIDEO_BUCKET = 'cms-media';

export async function uploadCmsFile(file: File, folder: string) {
  const supabase = createClientIfConfigured();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    if (error.message?.toLowerCase().includes('row-level security')) {
      throw new Error(
        'Upload blocked by permissions. Sign in as admin, run supabase/RUN-IN-SUPABASE-fix-upload-rls.sql in Supabase SQL Editor, then try again.'
      );
    }
    throw error;
  }

  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCmsVideo(file: File, subfolder: 'movies' | 'trailers' | 'episodes') {
  const maxMb = 500;
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`Video must be under ${maxMb}MB. Use a CDN URL for larger files.`);
  }

  const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'application/x-mpegURL', 'video/mpeg'];
  if (file.type && !allowed.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|m3u8)$/i)) {
    throw new Error('Upload an MP4, WebM, MOV, or HLS (.m3u8) file.');
  }

  return uploadCmsFile(file, `videos/${subfolder}`);
}
