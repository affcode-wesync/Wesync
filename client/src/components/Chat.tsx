import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onSendImage: (image: string) => void;
  myNickname: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const Chat: React.FC<ChatProps> = ({ messages, onSend, onSendImage, myNickname }) => {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) {
      onSendImage(preview);
      setPreview(null);
      return;
    }
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_IMAGE_SIZE) {
      alert("Максимальный размер файла — 5 МБ");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-dark-600">
        <h3 className="text-white font-semibold text-sm">Чат</h3>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-8">
            Нет сообщений
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="group">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-sm font-semibold ${
                  msg.nickname === myNickname ? "text-accent-light" : "text-gray-300"
                }`}
              >
                {msg.nickname}
              </span>
              <span className="text-gray-600 text-xs">{formatTime(msg.timestamp)}</span>
            </div>
            {msg.text && (
              <p className="text-gray-200 text-sm mt-0.5 break-words">{msg.text}</p>
            )}
            {msg.image && (
              <img
                src={msg.image}
                alt="Фото"
                className="mt-1 max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(msg.image, "_blank")}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {preview && (
        <div className="px-4 py-2 border-t border-dark-600">
          <div className="relative inline-block">
            <img src={preview} alt="Превью" className="max-h-24 rounded-lg" />
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
            >
              x
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-dark-600">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-dark-600 hover:bg-dark-500 text-gray-400 rounded-lg transition-colors"
            title="Прикрепить фото"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={preview ? "Нажмите отправить..." : "Сообщение..."}
            className="flex-1 px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
