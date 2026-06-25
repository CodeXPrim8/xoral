import { createClientIfConfigured } from '@/lib/supabase/client';

const BUCKET = 'cms-media';

export async function uploadCommunityMedia(file: File, kind: 'image' | 'video') {
  const supabase = createClientIfConfigured();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  if (kind === 'image') {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (file.type && !allowed.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|gif)$/i)) {
      throw new Error('Upload a JPG, PNG, WebP, or GIF image.');
    }
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('Images must be under 15MB.');
    }
  } else {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (file.type && !allowed.includes(file.type) && !file.name.match(/\.(mp4|webm|mov)$/i)) {
      throw new Error('Upload an MP4, WebM, or MOV video.');
    }
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('Videos must be under 100MB.');
    }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `community/${kind}s/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    if (error.message?.toLowerCase().includes('row-level security')) {
      throw new Error(
        'Upload blocked. Sign in and run supabase/RUN-IN-SUPABASE-community.sql in Supabase SQL Editor.'
      );
    }
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCommunityMusic(file: File) {
  const supabase = createClientIfConfigured();
  if (!supabase) throw new Error('Supabase is not configured');

  const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  if (file.type && !allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
    throw new Error('Upload an MP3, WAV, or OGG audio file.');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('Audio must be under 20MB.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `community/music/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
