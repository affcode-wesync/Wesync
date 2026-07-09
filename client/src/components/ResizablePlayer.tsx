import React, { useState, useRef, useCallback, useEffect } from "react";

interface ResizablePlayerProps {
  children: React.ReactNode;
  onFullscreen?: () => void;
}

export const ResizablePlayer: React.FC<ResizablePlayerProps> = ({
  children,
  onFullscreen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: "100%", height: "100%" });
  const [isResizing, setIsResizing] = useState(false);
  const startRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    startRef.current = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height };
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      const newW = Math.max(400, Math.min(window.innerWidth - 100, startRef.current.w + dx));
      const aspectRatio = 16 / 9;
      const newH = newW / aspectRatio;

      setSize({ width: `${newW}px`, height: `${newH}px` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const handleResetSize = useCallback(() => {
    setSize({ width: "100%", height: "100%" });
  }, []);

  return (
    <div className="relative group" style={{ width: size.width, height: size.height }}>
      {children}

      {/* Fullscreen button */}
      <button
        onClick={onFullscreen}
        className="absolute top-3 right-12 z-10 p-1.5 bg-black/60 hover:bg-black/80 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
        title="Фуллскрин"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      {/* Reset size button */}
      {size.width !== "100%" && (
        <button
          onClick={handleResetSize}
          className="absolute top-3 right-24 z-10 p-1.5 bg-black/60 hover:bg-black/80 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Сбросить размер"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute bottom-0 right-0 z-10 w-5 h-5 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
        title="Изменить размер"
      >
        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <svg className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 text-white/80" viewBox="0 0 12 12" fill="currentColor">
          <path d="M11 0L11 11L0 11L0 9L9 9L9 0Z" />
        </svg>
      </div>
    </div>
  );
};
