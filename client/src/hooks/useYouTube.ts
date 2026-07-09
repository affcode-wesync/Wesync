import { useEffect, useRef, useCallback, useState } from "react";
import { VideoState } from "../types";

interface UseYouTubeProps {
  videoState: VideoState;
  onPlay: (currentTime: number) => void;
  onPause: (currentTime: number) => void;
  onSeek: (currentTime: number) => void;
  onStateChange?: () => void;
}

export function useYouTube({
  videoState,
  onPlay,
  onPause,
  onSeek,
  onStateChange,
}: UseYouTubeProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRemoteUpdate = useRef(false);
  const lastState = useRef<number>(-1);
  const [playerReady, setPlayerReady] = useState(false);
  const callbacksRef = useRef({ onPlay, onPause, onSeek, onStateChange });
  callbacksRef.current = { onPlay, onPause, onSeek, onStateChange };

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    document.head.appendChild(tag);

    return () => {
      window.onYouTubeIframeAPIReady = () => {};
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  function initPlayer() {
    if (!containerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: undefined,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: () => {
          setPlayerReady(true);
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

          if (state === window.YT.PlayerState.PLAYING && lastState.current !== window.YT.PlayerState.PLAYING) {
            cb.onPlay(currentTime);
          } else if (state === window.YT.PlayerState.PAUSED && lastState.current === window.YT.PlayerState.PLAYING) {
            cb.onPause(currentTime);
          }

          lastState.current = state;
          cb.onStateChange?.();
        },
      },
    });
  }

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !playerReady) return;

    if (videoState.videoId && videoState.videoId !== player.getVideoData()?.video_id) {
      isRemoteUpdate.current = true;
      player.loadVideoById(videoState.videoId);
    }
  }, [videoState.videoId, playerReady]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !playerReady) return;

    const currentTime = player.getCurrentTime();
    const timeDiff = Math.abs(currentTime - videoState.currentTime);

    if (timeDiff > 1.5) {
      isRemoteUpdate.current = true;
      player.seekTo(videoState.currentTime, true);
    }
  }, [videoState.currentTime, playerReady]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !playerReady) return;

    const state = player.getPlayerState();
    if (videoState.isPlaying && state !== window.YT.PlayerState.PLAYING) {
      isRemoteUpdate.current = true;
      player.playVideo();
    } else if (!videoState.isPlaying && state === window.YT.PlayerState.PLAYING) {
      isRemoteUpdate.current = true;
      player.pauseVideo();
    }
  }, [videoState.isPlaying, playerReady]);

  const loadVideo = useCallback(
    (videoId: string) => {
      const player = playerRef.current;
      if (!player || !playerReady) return;
      isRemoteUpdate.current = true;
      player.loadVideoById(videoId);
    },
    [playerReady]
  );

  const seekTo = useCallback(
    (time: number) => {
      const player = playerRef.current;
      if (!player || !playerReady) return;
      isRemoteUpdate.current = true;
      player.seekTo(time, true);
      onSeek(time);
    },
    [playerReady, onSeek]
  );

  return { containerRef, playerRef, playerReady, loadVideo, seekTo };
}
