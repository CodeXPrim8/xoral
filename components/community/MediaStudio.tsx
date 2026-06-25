'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Music2, Scissors, Upload, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { COMMUNITY_MUSIC_TRACKS } from '@/lib/community/music';
import { uploadCommunityMedia, uploadCommunityMusic } from '@/lib/community/upload';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { addCommunityPost, requireAuthForAction } from '@/lib/user-data';
import type { CommunityPostKind } from '@/lib/types';

type MediaFile = {
  kind: 'image' | 'video';
  file: File;
  preview: string;
  duration?: number;
};

export function MediaStudio({
  postKind,
  onPublished,
  onCancel,
}: {
  postKind: CommunityPostKind;
  onPublished: () => void;
  onCancel?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(60);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicLabel, setMusicLabel] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const isShort = postKind === 'short';
  const maxShortDuration = 60;

  useEffect(() => {
    return () => {
      if (media?.preview.startsWith('blob:')) URL.revokeObjectURL(media.preview);
    };
  }, [media]);

  function clearMedia() {
    if (media?.preview.startsWith('blob:')) URL.revokeObjectURL(media.preview);
    setMedia(null);
    setTrimStart(0);
    setTrimEnd(maxShortDuration);
  }

  function handleVideoFile(file: File) {
    clearMedia();
    const preview = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = preview;
    video.onloadedmetadata = () => {
      const duration = video.duration || maxShortDuration;
      setMedia({ kind: 'video', file, preview, duration });
      setTrimEnd(Math.min(duration, isShort ? maxShortDuration : duration));
    };
  }

  function handleImageFile(file: File) {
    if (isShort) {
      toast.error('Shorts must be a video');
      return;
    }
    clearMedia();
    setMedia({ kind: 'image', file, preview: URL.createObjectURL(file) });
  }

  async function handlePublish() {
    if (!media && !caption.trim()) {
      toast.error('Add media or a caption');
      return;
    }
    if (isShort && (!media || media.kind !== 'video')) {
      toast.error('Upload a video for your Short');
      return;
    }

    if (isSupabaseConfigured()) {
      const allowed = await requireAuthForAction(
        isShort ? '/community/create/short' : '/community/create/post'
      );
      if (!allowed) {
        toast.info('Sign in to publish');
        return;
      }
    }

    setPublishing(true);
    try {
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;

      if (media?.file && isSupabaseConfigured()) {
        const url = await uploadCommunityMedia(media.file, media.kind);
        if (media.kind === 'image') imageUrl = url;
        else videoUrl = url;
      } else if (media?.preview.startsWith('blob:')) {
        if (media.kind === 'image') imageUrl = media.preview;
        else videoUrl = media.preview;
      }

      await addCommunityPost({
        content: caption.trim(),
        imageUrl,
        videoUrl,
        mediaType: videoUrl ? 'video' : imageUrl ? 'image' : 'text',
        postKind,
        musicUrl: musicUrl ?? undefined,
        videoTrimStart: media?.kind === 'video' ? trimStart : undefined,
        videoTrimEnd: media?.kind === 'video' ? trimEnd : undefined,
      });

      toast.success(isShort ? 'Short published!' : 'Post published!');
      onPublished();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not publish');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{isShort ? 'Create Short' : 'Create Post'}</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-foreground/60 hover:text-foreground">
            Cancel
          </button>
        )}
      </div>

      {!media ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {!isShort && (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="glass-card border rounded-xl p-8 text-center hover:bg-card/60 smooth-transition"
            >
              <ImagePlus className="w-10 h-10 mx-auto mb-3 text-primary" />
              <p className="font-semibold">Upload Photo</p>
              <p className="text-sm text-foreground/60 mt-1">JPG, PNG, WebP</p>
            </button>
          )}
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="glass-card border rounded-xl p-8 text-center hover:bg-card/60 smooth-transition"
          >
            <Video className="w-10 h-10 mx-auto mb-3 text-primary" />
            <p className="font-semibold">Upload Video</p>
            <p className="text-sm text-foreground/60 mt-1">
              {isShort ? 'Up to 60 seconds' : 'MP4, WebM, MOV'}
            </p>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[420px] mx-auto">
            {media.kind === 'video' ? (
              <video
                ref={videoRef}
                src={media.preview}
                controls
                playsInline
                className="w-full h-full object-contain"
                onLoadedMetadata={() => {
                  const v = videoRef.current;
                  if (v) v.currentTime = trimStart;
                }}
              />
            ) : (
              <img src={media.preview} alt="Preview" className="w-full h-full object-contain" />
            )}
            <button
              type="button"
              onClick={clearMedia}
              className="absolute top-2 right-2 p-2 rounded-full bg-background/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {media.kind === 'video' && media.duration && (
            <div className="glass-card border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Scissors className="w-4 h-4 text-primary" />
                Trim video
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-foreground/60">
                  Start (sec)
                  <input
                    type="number"
                    min={0}
                    max={trimEnd - 0.5}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => setTrimStart(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-border bg-input/30 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-foreground/60">
                  End (sec)
                  <input
                    type="number"
                    min={trimStart + 0.5}
                    max={isShort ? Math.min(media.duration, maxShortDuration) : media.duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-border bg-input/30 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <p className="text-xs text-foreground/50">
                Clip length: {(trimEnd - trimStart).toFixed(1)}s
                {isShort && trimEnd - trimStart > maxShortDuration && ' — Shorts max 60s'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="glass-card border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Music2 className="w-4 h-4 text-primary" />
          Add music
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMUNITY_MUSIC_TRACKS.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                setMusicUrl(track.url);
                setMusicLabel(`${track.title} · ${track.artist}`);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border smooth-transition ${
                musicUrl === track.url
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-card/60'
              }`}
            >
              {track.title}
            </button>
          ))}
          <button
            type="button"
            onClick={() => musicInputRef.current?.click()}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-border hover:bg-card/60 inline-flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            Your audio
          </button>
        </div>
        {musicLabel && (
          <p className="text-xs text-foreground/60 flex items-center gap-2">
            Selected: {musicLabel}
            <button type="button" onClick={() => { setMusicUrl(null); setMusicLabel(null); }} className="text-primary">
              Remove
            </button>
          </p>
        )}
      </div>

      <textarea
        placeholder={isShort ? 'Add a caption…' : 'What are you watching today?'}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={3}
        className="w-full bg-card/40 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
      />

      <button
        type="button"
        onClick={handlePublish}
        disabled={publishing}
        className="w-full glass-button py-3 rounded-lg font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {publishing && <Loader2 className="w-4 h-4 animate-spin" />}
        {isShort ? 'Publish Short' : 'Publish Post'}
      </button>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ''; }} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); e.target.value = ''; }} />
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const url = isSupabaseConfigured()
              ? await uploadCommunityMusic(file)
              : URL.createObjectURL(file);
            setMusicUrl(url);
            setMusicLabel(file.name);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Music upload failed');
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}
