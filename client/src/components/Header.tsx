import React from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  roomId: string;
  participantCount: number;
  onCopyLink: () => void;
  onLeave: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  participantCount,
  onCopyLink,
  onLeave,
}) => {
  const navigate = useNavigate();

  const handleLeave = () => {
    onLeave();
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-dark-800 border-b border-dark-600">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-bold text-white hover:text-accent transition-colors"
        >
          WeSync
        </button>
        <div className="h-6 w-px bg-dark-500" />
        <span className="text-gray-400 text-sm">Комната</span>
        <code className="text-gray-300 text-xs bg-dark-700 px-2 py-1 rounded font-mono">
          {roomId.slice(0, 8)}...
        </code>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{participantCount}</span>
        </div>

        <button
          onClick={onCopyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-600 hover:bg-dark-500 text-gray-300 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Пригласить
        </button>

        <button
          onClick={handleLeave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Выйти
        </button>
      </div>
    </div>
  );
};
