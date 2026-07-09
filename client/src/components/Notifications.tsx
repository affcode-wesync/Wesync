import React from "react";
import { Notification } from "../types";

interface NotificationsProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onRemove,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-lg shadow-lg text-sm text-gray-200 animate-in slide-in-from-right"
          onClick={() => onRemove(n.id)}
        >
          <svg
            className="w-4 h-4 text-accent-light shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{n.text}</span>
        </div>
      ))}
    </div>
  );
};
