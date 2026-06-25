type VideoWithWebkitFullscreen = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
  webkitExitFullscreen?: () => void;
};

export function isVideoFullscreen(video?: HTMLVideoElement | null): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  if (doc.fullscreenElement || doc.webkitFullscreenElement) {
    return true;
  }
  if (video) {
    return Boolean((video as VideoWithWebkitFullscreen).webkitDisplayingFullscreen);
  }
  return false;
}

/** Request native fullscreen for a video element (desktop + iOS Safari). */
export async function requestVideoFullscreen(video: HTMLVideoElement): Promise<void> {
  const v = video as VideoWithWebkitFullscreen;

  if (typeof v.webkitEnterFullscreen === 'function') {
    v.webkitEnterFullscreen();
    return;
  }

  if (video.requestFullscreen) {
    await video.requestFullscreen();
    return;
  }

  const container = video.parentElement;
  if (container?.requestFullscreen) {
    await container.requestFullscreen();
  }
}

export function exitVideoFullscreen(video?: HTMLVideoElement | null): void {
  const v = video as VideoWithWebkitFullscreen | undefined;
  if (v?.webkitDisplayingFullscreen && typeof v.webkitExitFullscreen === 'function') {
    v.webkitExitFullscreen();
    return;
  }

  const doc = document as Document & { webkitExitFullscreen?: () => void };
  if (document.fullscreenElement && document.exitFullscreen) {
    void document.exitFullscreen();
    return;
  }
  if (doc.webkitExitFullscreen) {
    doc.webkitExitFullscreen();
  }
}
