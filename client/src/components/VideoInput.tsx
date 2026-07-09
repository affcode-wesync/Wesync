import React, { useState } from "react";
import { extractVideoId } from "../utils/youtube";

interface VideoInputProps {
  onLoadVideo: (videoId: string) => void;
}

export const VideoInput: React.FC<VideoInputProps> = ({ onLoadVideo }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(input);
    if (videoId) {
      onLoadVideo(videoId);
      setInput("");
      setError("");
    } else {
      setError("Неверная ссылка или ID видео");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError("");
        }}
        placeholder="Вставьте ссылку на YouTube или ID видео"
        className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors text-sm"
      />
      <button
        type="submit"
        className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
      >
        Загрузить
      </button>
      {error && (
        <p className="absolute mt-14 text-red-400 text-xs">{error}</p>
      )}
    </form>
  );
};
