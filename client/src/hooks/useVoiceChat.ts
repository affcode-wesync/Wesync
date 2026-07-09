import { useEffect, useRef, useCallback, useState } from "react";
import { TypedSocket } from "../services/socket";

interface UseVoiceChatProps {
  socket: TypedSocket | null;
  participants: { id: string; nickname: string }[];
  myParticipantId: string | null;
}

interface PeerConnection {
  peer: RTCPeerConnection;
  stream?: MediaStream;
}

export function useVoiceChat({
  socket,
  participants,
  myParticipantId,
}: UseVoiceChatProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [speakingMap, setSpeakingMap] = useState<Map<string, boolean>>(new Map());
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<Map<string, AnalyserNode>>(new Map());
  const speakingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const createPeer = useCallback(
    (remoteId: string, initiator: boolean) => {
      if (!socket || !localStream) return;
      if (peersRef.current.has(remoteId)) return;

      const peer = new (window as unknown as { RTCPeerConnection: typeof RTCPeerConnection }).RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });

      const pc: PeerConnection = { peer };
      peersRef.current.set(remoteId, pc);

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("voice-signal", {
            to: remoteId,
            signal: { type: "candidate", candidate: event.candidate },
          });
        }
      };

      peer.ontrack = (event) => {
        pc.stream = event.streams[0];
        const audio = document.createElement("audio");
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audio.id = `voice-${remoteId}`;
        document.body.appendChild(audio);

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const source = audioContextRef.current.createMediaStreamSource(event.streams[0]);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current.set(remoteId, analyser);

        const checkSpeaking = () => {
          if (!analyserRef.current.has(remoteId)) return;
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          const isSpeaking = avg > 30;

          setSpeakingMap((prev) => {
            const next = new Map(prev);
            next.set(remoteId, isSpeaking);
            return next;
          });

          if (isSpeaking) {
            socket.emit("speaking-changed", { isSpeaking: true });
          } else {
            if (speakingTimersRef.current.has(remoteId)) {
              clearTimeout(speakingTimersRef.current.get(remoteId)!);
            }
            speakingTimersRef.current.set(
              remoteId,
              setTimeout(() => {
                socket.emit("speaking-changed", { isSpeaking: false });
              }, 500)
            );
          }

          requestAnimationFrame(checkSpeaking);
        };
        requestAnimationFrame(checkSpeaking);
      };

      if (initiator) {
        peer.createOffer().then((offer) => {
          peer.setLocalDescription(offer);
          socket.emit("voice-signal", {
            to: remoteId,
            signal: { type: "offer", sdp: offer },
          });
        });
      }
    },
    [socket, localStream]
  );

  useEffect(() => {
    if (!socket || !myParticipantId) return;

    socket.on("voice-signal", async ({ from, signal }) => {
      const sdp = signal as { type: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };

      if (sdp.type === "offer") {
        createPeer(from, false);
        const pc = peersRef.current.get(from);
        if (pc) {
          await pc.peer.setRemoteDescription(new RTCSessionDescription(sdp.sdp!));
          const answer = await pc.peer.createAnswer();
          await pc.peer.setLocalDescription(answer);
          socket.emit("voice-signal", {
            to: from,
            signal: { type: "answer", sdp: answer },
          });
        }
      } else if (sdp.type === "answer") {
        const pc = peersRef.current.get(from);
        if (pc) {
          await pc.peer.setRemoteDescription(new RTCSessionDescription(sdp.sdp!));
        }
      } else if (sdp.type === "candidate" && sdp.candidate) {
        const pc = peersRef.current.get(from);
        if (pc) {
          await pc.peer.addIceCandidate(new RTCIceCandidate(sdp.candidate));
        }
      }
    });

    return () => {
      socket.off("voice-signal");
    };
  }, [socket, myParticipantId, createPeer]);

  useEffect(() => {
    if (!socket || !myParticipantId || isMuted) return;

    const remoteIds = participants
      .filter((p) => p.id !== myParticipantId)
      .map((p) => p.id);

    remoteIds.forEach((id) => {
      if (!peersRef.current.has(id)) {
        createPeer(id, true);
      }
    });

    const currentIds = new Set(remoteIds);
    peersRef.current.forEach((pc, id) => {
      if (!currentIds.has(id)) {
        pc.peer.close();
        const audio = document.getElementById(`voice-${id}`);
        if (audio) audio.remove();
        peersRef.current.delete(id);
        analyserRef.current.delete(id);
      }
    });
  }, [participants, myParticipantId, isMuted, socket, createPeer]);

  const toggleMute = useCallback(async () => {
    if (isMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
        setIsMuted(false);
      } catch (err) {
        console.error("Failed to get microphone:", err);
      }
    } else {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      peersRef.current.forEach((pc) => {
        pc.peer.close();
      });
      peersRef.current.clear();
      analyserRef.current.clear();
      document.querySelectorAll('audio[id^="voice-"]').forEach((el) => el.remove());
      setIsMuted(true);
      setSpeakingMap(new Map());
    }
  }, [isMuted, localStream]);

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      peersRef.current.forEach((pc) => pc.peer.close());
      peersRef.current.clear();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [localStream]);

  return {
    isMuted,
    toggleMute,
    speakingMap,
  };
}
