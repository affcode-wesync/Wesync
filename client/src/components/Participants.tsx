import React from "react";
import { Participant } from "../types";

interface ParticipantsProps {
  participants: Participant[];
  leaderId: string | null;
  myParticipantId: string | null;
  speakingMap: Map<string, boolean>;
}

export const Participants: React.FC<ParticipantsProps> = ({
  participants,
  leaderId,
  myParticipantId,
  speakingMap,
}) => {
  return (
    <div className="px-4 py-3 border-b border-dark-600">
      <h3 className="text-white font-semibold text-sm mb-3">
        Участники ({participants.length})
      </h3>
      <div className="space-y-2">
        {participants.map((p) => {
          const isLeader = p.id === leaderId;
          const isMe = p.id === myParticipantId;
          const isSpeaking = speakingMap.get(p.id) || p.isSpeaking;

          return (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isSpeaking
                    ? "bg-green-600 ring-2 ring-green-400"
                    : "bg-dark-500"
                }`}
              >
                {p.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-medium truncate">
                    {p.nickname}
                  </span>
                  {isMe && (
                    <span className="text-gray-500 text-xs">(ты)</span>
                  )}
                  {isLeader && (
                    <span className="text-yellow-500 text-xs font-semibold">
                      ★ лидер
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {p.isMuted && (
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                )}
                {!p.isMuted && isSpeaking && (
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
