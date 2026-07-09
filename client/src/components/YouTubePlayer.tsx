import React, { useEffect, useRef, useCallback } from "react";
import { VideoState } from "../types";

interface YouTubePlayerProps {
  videoState: VideoState;
  onPlay: (currentTime: number) => void;
  onPause: (currentTime: number) => void;
  onSeek: (currentTime: number) => void;
  onStateChange?: () => void;
}

let apiPromise: Promise<void> | null = null;

function loadAPI(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    window.onYouTubeIframeAPIReady = () => resolve();
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return apiPromise;
}

function valid(id: string) { return /^[a-zA-Z0-9_-]{11}$/.test(id); }

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoState, onPlay, onPause, onSeek, onStateChange,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const ignoreRef = useRef(false);
  const lastState = useRef(-1);
  const cbRef = useRef({ onPlay, onPause, onSeek, onStateChange });
  cbRef.current = { onPlay, onPause, onSeek, onStateChange };

  useEffect(() => {
    let dead = false;
    (async () => {
      await loadAPI();
      if (dead || !boxRef.current || playerRef.current) return;
      try {
        playerRef.current = new window.YT.Player(boxRef.current, {
          playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0 },
          events: {
            onStateChange: (e: any) => {
              const s = e.target.getPlayerState();
              const t = e.target.getCurrentTime();
              const cb = cbRef.current;
              if (ignoreRef.current) { ignoreRef.current = false; lastState.current = s; return; }
              if (s === 1 && lastState.current !== 1) cb.onPlay(t);
              else if (s === 2 && lastState.current === 1) cb.onPause(t);
              lastState.current = s;
              cb.onStateChange?.();
            },
          },
        });
      } catch {}
    })();
    return () => {
      dead = true;
      if (playerRef.current) { try { playerRef.current.destroy(); } catch {} playerRef.current = null; }
    };
  }, []);

  useEffect(() => {
    const p = playerRef.current;
    if (!p?.loadVideoById) return;
    if (valid(videoState.videoId)) {
      try {
        const cur = p.getVideoData?.()?.video_id || "";
        if (videoState.videoId !== cur) {
          ignoreRef.current = true;
          p.loadVideoById(videoState.videoId);
        }
      } catch {}
    }
  }, [videoState.videoId]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p?.getPlayerState) return;
    try {
      const s = p.getPlayerState();
      if (videoState.isPlaying && s !== 1) {
        ignoreRef.current = true;
        p.playVideo();
      } else if (!videoState.isPlaying && s === 1) {
        ignoreRef.current = true;
        p.pauseVideo();
      }
    } catch {}
  }, [videoState.isPlaying]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p?.getCurrentTime) return;
    try {
      const diff = Math.abs(p.getCurrentTime() - videoState.currentTime);
      if (diff > 2) {
        ignoreRef.current = true;
        p.seekTo(videoState.currentTime, true);
      }
    } catch {}
  }, [videoState.currentTime]);

  if (!valid(videoState.videoId)) {
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
      <div ref={boxRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
