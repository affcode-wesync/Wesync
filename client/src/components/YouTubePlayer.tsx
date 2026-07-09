import React, { useEffect, useRef, useCallback } from "react";
import { VideoState } from "../types";

interface YouTubePlayerProps {
  videoState: VideoState;
  onPlay: (currentTime: number) => void;
  onPause: (currentTime: number) => void;
  onSeek: (currentTime: number) => void;
  onStateChange?: () => void;
}

let apiLoaded = false;
let apiLoading = false;
let apiReadyPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (apiLoaded) return Promise.resolve();
  if (apiReadyPromise) return apiReadyPromise;

  apiReadyPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      apiLoaded = true;
      resolve();
      return;
    }

    apiLoading = true;
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      resolve();
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onerror = () => {
      console.error("Failed to load YouTube IFrame API");
    };
    document.head.appendChild(tag);
  });

  return apiReadyPromise;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoState,
  onPlay,
  onPause,
  onSeek,
  onStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const isRemoteUpdate = useRef(false);
  const lastState = useRef<number>(-1);
  const callbacksRef = useRef({ onPlay, onPause, onSeek, onStateChange });
  callbacksRef.current = { onPlay, onPause, onSeek, onStateChange };

  const initPlayer = useCallback(async () => {
    if (!containerRef.current || playerRef.current) return;

    await loadYouTubeAPI();

    if (!window.YT || !window.YT.Player || !containerRef.current) return;

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoState.videoId || undefined,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            onStateChange?.();
          },
          onStateChange: (event: any) => {
            const player = event.target;
            const state = player.getPlayerState();
            const currentTime = player.getCurrentTime();
            const cb = callbacksRef.current;

            if (isRemoteUpdate.current) {
              isRemoteUpdate.current = false;
              lastState.current = state;
              return;
            }

            if (state === 1 && lastState.current !== 1) {
              cb.onPlay(currentTime);
            } else if (state === 2 && lastState.current === 1) {
              cb.onPause(currentTime);
            }

            lastState.current = state;
            cb.onStateChange?.();
          },
          onError: (event: any) => {
            console.error("YouTube player error:", event.data);
          },
        },
      });
    } catch (err) {
      console.error("Failed to create YouTube player:", err);
    }
  }, []);

  useEffect(() => {
    initPlayer();
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !player.getVideoData) return;

    try {
      if (videoState.videoId && videoState.videoId !== player.getVideoData()?.video_id) {
        isRemoteUpdate.current = true;
        player.loadVideoById(videoState.videoId);
      }
    } catch {}
  }, [videoState.videoId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !player.getCurrentTime) return;

    try {
      const currentTime = player.getCurrentTime();
      const timeDiff = Math.abs(currentTime - videoState.currentTime);
      if (timeDiff > 1.5) {
        isRemoteUpdate.current = true;
        player.seekTo(videoState.currentTime, true);
      }
    } catch {}
  }, [videoState.currentTime]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !player.getPlayerState) return;

    try {
      const state = player.getPlayerState();
      if (videoState.isPlaying && state !== 1) {
        isRemoteUpdate.current = true;
        player.playVideo();
      } else if (!videoState.isPlaying && state === 1) {
        isRemoteUpdate.current = true;
        player.pauseVideo();
      }
    } catch {}
  }, [videoState.isPlaying]);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <div ref={containerRef} id="ytplayer" className="absolute inset-0 w-full h-full" />
      {!videoState.videoId && (
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
      )}
    </div>
  );
};
