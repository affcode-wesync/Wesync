import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem("wesync-nickname") || "";
  });
  const [showNicknameInput, setShowNicknameInput] = useState(!nickname);
  const [tempNickname, setTempNickname] = useState(nickname);

  const createRoom = () => {
    if (!nickname) {
      setShowNicknameInput(true);
      return;
    }
    const roomId = uuidv4();
    navigate(`/watch/${roomId}`);
  };

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempNickname.trim();
    if (trimmed.length < 1 || trimmed.length > 20) return;
    localStorage.setItem("wesync-nickname", trimmed);
    setNickname(trimmed);
    setShowNicknameInput(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">WeSync</h1>
          <p className="text-gray-400 text-lg">
            Смотрите YouTube вместе в реальном времени
          </p>
        </div>

        {showNicknameInput ? (
          <form onSubmit={handleNicknameSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Как вас зовут?
              </label>
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder="Ваш никнейм"
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors text-center text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={tempNickname.trim().length < 1}
              className="w-full px-6 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors text-lg"
            >
              Продолжить
            </button>
          </form>
        ) : (
          <button
            onClick={createRoom}
            className="w-full px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors text-lg shadow-lg shadow-accent/25"
          >
            Создать комнату
          </button>
        )}

        <p className="text-gray-600 text-sm mt-8">
          Никакой регистрации. Просто создайте комнату и поделитесь ссылкой.
        </p>
      </div>
    </div>
  );
};
