import React, { useEffect, useRef, useCallback } from "react";
import { VideoState } from "../types";

interface YouTubePlayerProps {
  videoState: VideoState;
  onPlay: (currentTime: number) => void;
  onPause: (currentTime: number) => void;
  onSeek: (currentTime: number) => void;
  onStateChange?: () => void;
}

function isValidVideoId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

function getEmbedUrl(videoId: string, startTime: number): string {
  const params = new URLSearchParams({
    autoplay: "0",
    controls: "1",
    modestbranding: "1",
    rel: "0",
    enablejsapi: "1",
  });
  if (startTime > 0) {
    params.set("start", Math.floor(startTime).toString());
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function sendPost(iframe: HTMLIFrameElement, func: string, args: any[] = []) {
  try {
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*"
    );
  } catch {}
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoState,
  onPlay,
  onPause,
  onSeek,
  onStateChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const ignoreNext = useRef(false);
  const lastState = useRef<string>("");
  const pendingRef = useRef<{ isPlaying: boolean } | null>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        if (data.event === "infoDelivery" && data.info?.playerState !== undefined) {
          const state = data.info.playerState;
          const currentTime = data.info.currentTime || 0;

          if (ignoreNext.current) {
            ignoreNext.current = false;
            lastState.current = String(state);
            return;
          }

          if (state === 1 && lastState.current !== "1") {
            onPlay(currentTime);
          } else if (state === 2 && lastState.current === "1") {
            onPause(currentTime);
          }

          lastState.current = String(state);
          onStateChange?.();
        }
      } catch {}
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onPlay, onPause, onSeek, onStateChange]);

  const applyPending = useCallback(() => {
    const iframe = iframeRef.current;
    const pending = pendingRef.current;
    if (!iframe || !pending) return;

    ignoreNext.current = true;
    if (pending.isPlaying) {
      sendPost(iframe, "playVideo");
    } else {
      sendPost(iframe, "pauseVideo");
    }
    pendingRef.current = null;
  }, []);

  useEffect(() => {
    if (readyRef.current) {
      const iframe = iframeRef.current;
      if (!iframe) return;

      ignoreNext.current = true;
      if (videoState.isPlaying) {
        sendPost(iframe, "playVideo");
      } else {
        sendPost(iframe, "pauseVideo");
      }
      pendingRef.current = null;
    } else {
      pendingRef.current = { isPlaying: videoState.isPlaying };
    }
  }, [videoState.isPlaying]);

  const handleLoad = useCallback(() => {
    readyRef.current = true;
    applyPending();
  }, [applyPending]);

  const embedUrl = isValidVideoId(videoState.videoId)
    ? getEmbedUrl(videoState.videoId, videoState.currentTime)
    : "";

  if (!isValidVideoId(videoState.videoId)) {
    return (
      <div className="relative w-full bg-black rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">Нет видео</p>
            <p className="text-sm mt-1">Вставьте ссылку на YouTube выше</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube Player"
        onLoad={handleLoad}
      />
    </div>
  );
};
