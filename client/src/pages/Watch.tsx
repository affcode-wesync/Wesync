import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useVoiceChat } from "../hooks/useVoiceChat";
import { YouTubePlayer } from "../components/YouTubePlayer";
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

  return (
    <div className="h-screen bg-dark-900 flex flex-col">
      <Header
        roomId={roomId || ""}
        participantCount={participants.length}
        onCopyLink={handleCopyLink}
        onLeave={handleLeave}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
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

        {/* Right: Video + Controls */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
              <div className="mb-4 relative">
                <VideoInput onLoadVideo={handleLoadVideo} />
                {copied && (
                  <div className="absolute -top-8 right-0 px-3 py-1 bg-green-600 text-white text-xs rounded-lg">
                    Ссылка скопирована!
                  </div>
                )}
              </div>
              <YouTubePlayer
                videoState={videoState}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
              />
              <div className="mt-4 flex items-center justify-between">
                <VoiceChat isMuted={isMuted} onToggleMute={toggleMute} />
                <div className="text-gray-500 text-sm">
                  {videoState.isPlaying ? "▶ Воспроизведение" : "⏸ Пауза"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Notifications notifications={notifications} onRemove={removeNotification} />
    </div>
  );
};
