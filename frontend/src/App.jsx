import { useState, useEffect, useRef } from "react";
import {
  LiveKitRoom,
  VoiceAssistantControlBar,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { RoomEvent } from "livekit-client";

const serverUrl = "wss://my-voice-agnet-8s42tqg9.livekit.cloud";

async function getToken() {
  const response = await fetch("http://localhost:8000/token");
  const data = await response.json();
  return data.token;
}

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div style={{
      fontSize: "0.8rem",
      color: "#666",
      letterSpacing: "2px",
      fontFamily: "monospace",
    }}>
      ⏱️ {mins}:{secs}
    </div>
  );
}

function downloadPDF(messages) {
  const date = new Date().toLocaleString();
  
  let html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: #f9f9f9; }
        h1 { color: #7c3aed; }
        .meta { color: #888; font-size: 0.85rem; margin-bottom: 30px; }
        .msg { margin: 16px 0; display: flex; flex-direction: column; }
        .user { align-items: flex-end; }
        .assistant { align-items: flex-start; }
        .bubble { padding: 12px 18px; border-radius: 16px; max-width: 70%; font-size: 0.95rem; line-height: 1.6; }
        .user .bubble { background: #7c3aed22; border: 1px solid #7c3aed55; color: #5b21b6; }
        .assistant .bubble { background: #00f5a011; border: 1px solid #00f5a033; color: #065f46; }
        .label { font-size: 0.75rem; color: #999; margin-bottom: 4px; }
      </style>
    </head>
    <body>
      <h1>🎙️ Voice Assistant — Conversation</h1>
      <p class="meta">Downloaded on: ${date}</p>
  `;

  messages.forEach((m) => {
    const role = m.role === "user" ? "user" : "assistant";
    const label = m.role === "user" ? "You" : "🤖 Assistant";
    html += `
      <div class="msg ${role}">
        <span class="label">${label}</span>
        <div class="bubble">${m.text}</div>
      </div>
    `;
  });

  html += `</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "conversation.html";
  a.click();
  URL.revokeObjectURL(url);
}

function VoiceUI() {
  const { state, audioTrack } = useVoiceAssistant();
  const room = useRoomContext();
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const stateColors = {
    listening: "#00f5a0",
    speaking: "#7c3aed",
    thinking: "#f59e0b",
    connecting: "#6b7280",
  };

  const currentColor = stateColors[state] || stateColors.connecting;

  useEffect(() => {
    if (!room) return;

    const handleTranscription = (segments, participant) => {
      const isLocal = participant?.isLocal ?? false;
      segments.forEach((seg) => {
        if (seg.text.trim()) {
          setMessages((prev) => {
            const existing = prev.findIndex((m) => m.id === seg.id);
            if (existing !== -1) {
              const updated = [...prev];
              updated[existing] = {
                ...updated[existing],
                text: seg.text.trim(),
                final: seg.final,
              };
              return updated;
            }
            return [
              ...prev,
              {
                role: isLocal ? "user" : "assistant",
                text: seg.text.trim(),
                id: seg.id,
                final: seg.final,
              },
            ];
          });
        }
      });
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => room.off(RoomEvent.TranscriptionReceived, handleTranscription);
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      width: "100%",
      maxWidth: "650px",
    }}>
      {/* Timer */}
      <Timer />

      {/* Orb */}
      <div style={{ position: "relative", width: "180px", height: "180px" }}>
        <div style={{
          position: "absolute", inset: "-8px", borderRadius: "50%",
          border: `3px solid transparent`,
          borderTopColor: currentColor,
          borderRightColor: currentColor + "55",
          animation: "rotate 2s linear infinite",
          transition: "border-color 0.5s ease",
        }}/>
        <div style={{
          position: "absolute", inset: "-16px", borderRadius: "50%",
          border: `2px solid transparent`,
          borderBottomColor: currentColor + "88",
          borderLeftColor: currentColor + "33",
          animation: "rotate-reverse 3s linear infinite",
        }}/>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, ${currentColor}33, #0a0a0a)`,
          border: `2px solid ${currentColor}55`,
          boxShadow: `0 0 80px ${currentColor}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.5s ease",
        }}>
          <BarVisualizer
            state={state}
            trackRef={audioTrack}
            style={{ width: "90px", height: "45px" }}
            barCount={7}
          />
        </div>
      </div>

      {/* Status */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: "#ffffff0d", padding: "8px 20px",
        borderRadius: "50px", border: `1px solid ${currentColor}44`,
      }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: currentColor, boxShadow: `0 0 8px ${currentColor}`,
          animation: "pulse 1.5s infinite",
        }}/>
        <span style={{
          color: currentColor, fontSize: "0.85rem",
          letterSpacing: "3px", textTransform: "uppercase", fontWeight: "600",
        }}>
          {state === "listening" ? "Listening" :
           state === "speaking" ? "Speaking" :
           state === "thinking" ? "Thinking" : "Connecting"}
        </span>
      </div>

      {/* Chat Box */}
      <div style={{
        width: "100%", height: "200px", overflowY: "auto",
        background: "#ffffff06", border: "1px solid #ffffff10",
        borderRadius: "20px", padding: "16px",
        display: "flex", flexDirection: "column", gap: "12px",
      }}>
        {messages.length === 0 ? (
          <p style={{ color: "#444", fontSize: "0.85rem", textAlign: "center", marginTop: "70px" }}>
            Conversation will appear here...
          </p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "fadeIn 0.3s ease",
            }}>
              <span style={{
                fontSize: "0.7rem", color: "#555", marginBottom: "4px",
                paddingLeft: msg.role === "user" ? "0" : "8px",
                paddingRight: msg.role === "user" ? "8px" : "0",
              }}>
                {msg.role === "user" ? "You" : "🤖 Assistant"}
              </span>
              <div style={{
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #7c3aed44, #7c3aed22)"
                  : "linear-gradient(135deg, #00f5a022, #00f5a011)",
                border: `1px solid ${msg.role === "user" ? "#7c3aed66" : "#00f5a044"}`,
                borderRadius: msg.role === "user"
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                padding: "10px 16px",
                maxWidth: "75%", fontSize: "0.9rem",
                color: msg.role === "user" ? "#c4b5fd" : "#6ee7b7",
                lineHeight: 1.6,
                opacity: msg.final ? 1 : 0.6,
              }}>
                {msg.text}
                {!msg.final && <span style={{ opacity: 0.5, marginLeft: "4px" }}>...</span>}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Download Button */}
      {messages.length > 0 && (
        <button
          onClick={() => downloadPDF(messages)}
          style={{
            padding: "10px 24px",
            fontSize: "0.85rem",
            fontWeight: "600",
            background: "linear-gradient(135deg, #1a1a2e, #16213e)",
            color: "#a78bfa",
            border: "1px solid #7c3aed55",
            borderRadius: "50px",
            cursor: "pointer",
            letterSpacing: "1px",
          }}
        >
          📥 Download Conversation
        </button>
      )}

      <VoiceAssistantControlBar />

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    const t = await getToken();
    setToken(t);
    setConnecting(false);
  }

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#0a0a0a",
      backgroundImage: "radial-gradient(ellipse at top, #1a0533 0%, #0a0a0a 60%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "white", gap: "12px", overflow: "hidden",
    }}>
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "#ffffff0d", padding: "6px 16px",
          borderRadius: "50px", border: "1px solid #ffffff15",
          marginBottom: "16px", fontSize: "0.75rem", color: "#888",
          letterSpacing: "2px", textTransform: "uppercase",
        }}>
          ⚡ AI Powered
        </div>
        <h1 style={{
          fontSize: "3rem", fontWeight: "800",
          background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #7c3aed 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: "0 0 8px 0",
        }}>
          Voice Assistant
        </h1>
        <p style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "1px" }}>
          LiveKit · Groq · Deepgram
        </p>
      </div>

      {!token ? (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleConnect}
            disabled={connecting}
            style={{
              padding: "18px 48px", fontSize: "1rem", fontWeight: "600",
              background: connecting ? "#1a1a1a" : "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "white", border: "none", borderRadius: "50px",
              cursor: connecting ? "not-allowed" : "pointer",
              boxShadow: connecting ? "none" : "0 8px 32px #7c3aed55",
              transition: "all 0.3s ease",
            }}
          >
            {connecting ? "⏳ Connecting..." : "🎙️ Start Conversation"}
          </button>
          <p style={{ color: "#444", fontSize: "0.8rem", marginTop: "12px" }}>
            Allow microphone access when prompted
          </p>
        </div>
      ) : (
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          audio={true}
          video={false}
          style={{ width: "100%", maxWidth: "650px", padding: "0 20px" }}
        >
          <RoomAudioRenderer />
          <VoiceUI />
        </LiveKitRoom>
      )}
    </div>
  );
}