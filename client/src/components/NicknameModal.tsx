import React, { useState } from "react";

interface NicknameModalProps {
  onSubmit: (nickname: string) => void;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({ onSubmit }) => {
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem("wesync-nickname") || "";
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length < 1 || trimmed.length > 20) return;
    localStorage.setItem("wesync-nickname", trimmed);
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Как вас зовут?</h2>
          <p className="text-gray-400 text-sm mt-1">Введите никнейм для чата</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ваш никнейм"
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors text-center text-lg"
          />
          <button
            type="submit"
            disabled={nickname.trim().length < 1}
            className="w-full mt-4 px-4 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
          >
            Продолжить
          </button>
        </form>
      </div>
    </div>
  );
};
