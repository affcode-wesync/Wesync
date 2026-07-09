import React from "react";
import { useYouTube } from "../hooks/useYouTube";
import { VideoState } from "../types";

interface YouTubePlayerProps {
  videoState: VideoState;
  onPlay: (currentTime: number) => void;
  onPause: (currentTime: number) => void;
  onSeek: (currentTime: number) => void;
  onStateChange?: () => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoState,
  onPlay,
  onPause,
  onSeek,
  onStateChange,
}) => {
  const { containerRef } = useYouTube({
    videoState,
    onPlay,
    onPause,
    onSeek,
    onStateChange,
  });

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {!videoState.videoId && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium">Нет видео</p>
            <p className="text-sm mt-1">Вставьте ссылку на YouTube выше</p>
          </div>
        </div>
      )}
    </div>
  );
};
