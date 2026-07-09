import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useVoiceChat } from "../hooks/useVoiceChat";
import { YouTubePlayer } from "../components/YouTubePlayer";
import { ResizablePlayer } from "../components/ResizablePlayer";
import { VideoInput } from "../components/VideoInput";
import { Chat } from "../components/Chat";
import { Participants } from "../components/Participants";
import { VoiceChat } from "../components/VoiceChat";
import { Header } from "../components/Header";
import { Notifications } from "../components/Notifications";
import { NicknameModal } from "../components/NicknameModal";

export const Watch: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<string | null>(() => {
    return localStorage.getItem("wesync-nickname");
  });
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = useState(35);
  const chatDragRef = useRef<{ startY: number; startH: number } | null>(null);

  const {
    socket,
    connected,
    participants,
    chat,
    videoState,
    leaderId,
    myParticipantId,
    notifications,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendImage,
    sendPlay,
    sendPause,
    sendSeek,
    sendLoadVideo,
    removeNotification,
    setVideoState,
  } = useSocket();

  const { isMuted, toggleMute, speakingMap } = useVoiceChat({
    socket,
    participants,
    myParticipantId,
  });

  const isLeader = myParticipantId === leaderId;

  useEffect(() => {
    if (nickname && roomId && connected) {
      joinRoom(roomId, nickname);
    }
  }, [nickname, roomId, connected, joinRoom]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/watch/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [roomId]);

  const handleLeave = useCallback(() => {
    leaveRoom();
  }, [leaveRoom]);

  const handleLoadVideo = useCallback(
    (videoId: string) => {
      sendLoadVideo(videoId);
      setVideoState((prev) => ({
        ...prev,
        videoId,
        currentTime: 0,
        isPlaying: true,
      }));
    },
    [sendLoadVideo, setVideoState]
  );

  const handlePlay = useCallback(
    (currentTime: number) => {
      sendPlay(currentTime);
      setVideoState((prev) => ({ ...prev, isPlaying: true, currentTime }));
    },
    [sendPlay, setVideoState]
  );

  const handlePause = useCallback(
    (currentTime: number) => {
      sendPause(currentTime);
      setVideoState((prev) => ({ ...prev, isPlaying: false, currentTime }));
    },
    [sendPause, setVideoState]
  );

  const handleSeek = useCallback(
    (currentTime: number) => {
      sendSeek(currentTime);
      setVideoState((prev) => ({ ...prev, currentTime }));
    },
    [sendSeek, setVideoState]
  );

  const toggleFullscreen = useCallback(async () => {
    if (!isFullscreen) {
      try {
        const el = fullscreenContainerRef.current;
        if (el?.requestFullscreen) {
          await el.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch {}
    } else {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      } catch {}
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleChatDragStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    chatDragRef.current = { startY: e.touches[0].clientY, startH: chatHeight };
  }, [chatHeight]);

  const handleChatDragMove = useCallback((e: React.TouchEvent) => {
    if (!chatDragRef.current) return;
    const dy = chatDragRef.current.startY - e.touches[0].clientY;
    const vh = window.innerHeight;
    const newH = Math.max(15, Math.min(70, chatDragRef.current.startH + (dy / vh) * 100));
    setChatHeight(newH);
  }, []);

  const handleChatDragEnd = useCallback(() => {
    chatDragRef.current = null;
  }, []);

  if (!nickname) {
    return (
      <NicknameModal
        onSubmit={(nick) => {
          localStorage.setItem("wesync-nickname", nick);
          setNickname(nick);
        }}
      />
    );
  }

  const playerContent = (
    <>
      {isLeader && (
        <div className="mb-3 md:mb-4 relative">
          <VideoInput onLoadVideo={handleLoadVideo} />
          {copied && (
            <div className="absolute -top-8 right-0 px-3 py-1 bg-green-600 text-white text-xs rounded-lg">
              Ссылка скопирована!
            </div>
          )}
        </div>
      )}
      <ResizablePlayer onFullscreen={toggleFullscreen}>
        <YouTubePlayer
          videoState={videoState}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
        />
      </ResizablePlayer>
      <div className="mt-3 md:mt-4 flex items-center justify-between">
        <VoiceChat isMuted={isMuted} onToggleMute={toggleMute} />
        <div className="text-gray-500 text-sm">
          {videoState.isPlaying ? "▶ Воспроизведение" : "⏸ Пауза"}
        </div>
      </div>
    </>
  );

  if (isFullscreen) {
    return (
      <div ref={fullscreenContainerRef} className="h-screen w-screen bg-dark-900 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-7xl">{playerContent}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-900 flex flex-col">
      <Header
        roomId={roomId || ""}
        participantCount={participants.length}
        onCopyLink={handleCopyLink}
        onLeave={handleLeave}
      />

      {/* Mobile: resizable chat on top, video below */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        <div
          className="border-b border-dark-600 flex flex-col bg-dark-800 overflow-hidden"
          style={{ height: `${chatHeight}%` }}
        >
          <div
            onTouchStart={handleChatDragStart}
            onTouchMove={handleChatDragMove}
            onTouchEnd={handleChatDragEnd}
            className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="w-8 h-1 bg-dark-500 rounded-full" />
          </div>
          <div className="flex-1 overflow-hidden">
            <Chat messages={chat} onSend={sendMessage} onSendImage={sendImage} myNickname={nickname} />
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-2 overflow-auto" ref={fullscreenContainerRef}>
            <div className="w-full">{playerContent}</div>
          </div>
        </div>
      </div>

      {/* Desktop: sidebar chat, main video */}
      <div className="hidden md:flex flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-dark-600 flex flex-col bg-dark-800">
          <Participants
            participants={participants}
            leaderId={leaderId}
            myParticipantId={myParticipantId}
            speakingMap={speakingMap}
          />
          <div className="flex-1 overflow-hidden">
            <Chat messages={chat} onSend={sendMessage} onSendImage={sendImage} myNickname={nickname} />
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto" ref={fullscreenContainerRef}>
            <div className="w-full max-w-5xl">{playerContent}</div>
          </div>
        </div>
      </div>

      <Notifications notifications={notifications} onRemove={removeNotification} />
    </div>
  );
};
