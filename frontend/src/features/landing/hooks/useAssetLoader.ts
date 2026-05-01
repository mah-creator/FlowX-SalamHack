import { useEffect, useState } from "react";

const VIDEO_PATTERN = /\.(mp4|webm|ogg)$/i;

export function useAssetLoader(assets: string[], timeoutMs = 5000) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const uniqueAssets = Array.from(new Set(assets.filter(Boolean)));
    const total = uniqueAssets.length + 1;
    let loaded = 0;

    const markLoaded = () => {
      if (cancelled) return;
      loaded += 1;
      const nextProgress = Math.min(100, Math.round((loaded / total) * 100));
      setProgress(nextProgress);

      if (loaded >= total) {
        setIsComplete(true);
      }
    };

    uniqueAssets.forEach((src) => {
      if (VIDEO_PATTERN.test(src)) {
        const video = document.createElement("video");
        video.preload = "auto";
        video.onloadeddata = markLoaded;
        video.onerror = markLoaded;
        video.src = src;
        return;
      }

      const img = new Image();
      img.onload = markLoaded;
      img.onerror = markLoaded;
      img.src = src;
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(markLoaded).catch(markLoaded);
    } else {
      markLoaded();
    }

    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setProgress(100);
        setIsComplete(true);
      }
    }, timeoutMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [assets, timeoutMs]);

  return { progress, isComplete };
}
