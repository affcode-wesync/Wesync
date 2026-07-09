import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { VideoState } from "../types";

interface YouTubePlayerProps {
  videoState: VideoState;
  onPlay: (currentTime: number) => void;
  onPause: (currentTime: number) => void;
  onSeek: (currentTime: number) => void;
  onStateChange?: () => void;
}

export interface YouTubePlayerHandle {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
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

function sendCommand(iframe: HTMLIFrameElement, func: string, args: any[] = []) {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "*"
  );
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ videoState, onPlay, onPause, onSeek, onStateChange }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const lastState = useRef<string>("");
    const isRemoteCommand = useRef(false);

    useImperativeHandle(ref, () => ({
      play: () => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        isRemoteCommand.current = true;
        sendCommand(iframe, "playVideo");
      },
      pause: () => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        isRemoteCommand.current = true;
        sendCommand(iframe, "pauseVideo");
      },
      seekTo: (seconds: number) => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        isRemoteCommand.current = true;
        sendCommand(iframe, "seekTo", [seconds, true]);
      },
    }));

    useEffect(() => {
      const handler = (e: MessageEvent) => {
        if (typeof e.data !== "string") return;
        try {
          const data = JSON.parse(e.data);
          if (data.event === "infoDelivery" && data.info?.playerState !== undefined) {
            const state = data.info.playerState;
            const currentTime = data.info.currentTime || 0;

            if (isRemoteCommand.current) {
              isRemoteCommand.current = false;
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

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      isRemoteCommand.current = true;
      if (videoState.isPlaying) {
        sendCommand(iframe, "playVideo");
      } else {
        sendCommand(iframe, "pauseVideo");
      }
    }, [videoState.isPlaying]);

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe || videoState.currentTime <= 0) return;

      isRemoteCommand.current = true;
      sendCommand(iframe, "seekTo", [videoState.currentTime, true]);
    }, [videoState.currentTime]);

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
        />
      </div>
    );
  }
);

YouTubePlayer.displayName = "YouTubePlayer";
