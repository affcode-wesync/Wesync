/// <reference types="vite/client" />

interface Window {
  YT: {
    Player: new (
      elementId: string | HTMLElement,
      options: {
        videoId?: string;
        playerVars?: Record<string, unknown>;
        events?: Record<string, (event: { target: { getVideoData(): { video_id: string }; getCurrentTime(): number; getPlayerState(): number; getPlaybackRate(): number } }) => void>;
      }
    ) => {
      loadVideoById: (videoId: string) => void;
      playVideo: () => void;
      pauseVideo: () => void;
      seekTo: (seconds: number, allowSeekAhead: boolean) => void;
      getCurrentTime: () => number;
      getPlayerState: () => number;
      getPlaybackRate: () => number;
      setPlaybackRate: (rate: number) => void;
      destroy: () => void;
      getVideoData: () => { video_id: string };
    };
    PlayerState: {
      UNSTARTED: number;
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  };
  onYouTubeIframeAPIReady: () => void;
}
