import React from "react";

interface VoiceChatProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ isMuted, onToggleMute }) => {
  return (
    <button
      onClick={onToggleMute}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isMuted
          ? "bg-dark-600 text-gray-400 hover:bg-dark-500"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
      title={isMuted ? "Включить микрофон" : "Выключить микрофон"}
    >
      {isMuted ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      )}
      <span>{isMuted ? "Микрофон" : "Говоришь"}</span>
    </button>
  );
};
