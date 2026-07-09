import React, { useState, useCallback } from "react";

interface ResizablePlayerProps {
  children: React.ReactNode;
  onFullscreen?: () => void;
}

export const ResizablePlayer: React.FC<ResizablePlayerProps> = ({
  children,
  onFullscreen,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className={`relative group transition-all duration-300 ${isExpanded ? "w-full max-w-none" : "w-full"}`}>
      <div style={{ aspectRatio: "16/9" }} className="w-full">
        {children}
      </div>

      {/* Controls overlay */}
      <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Expand 2x */}
        <button
          onClick={toggleExpand}
          className="p-1.5 bg-black/60 hover:bg-black/80 rounded-md text-white transition-colors"
          title={isExpanded ? "Обычный размер" : "Увеличить"}
        >
          {isExpanded ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>

        {/* Fullscreen */}
        <button
          onClick={onFullscreen}
          className="p-1.5 bg-black/60 hover:bg-black/80 rounded-md text-white transition-colors"
          title="Фуллскрин"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
