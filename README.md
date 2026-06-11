# 🎙️ AI Voice Assistant

A real-time AI voice assistant built with LiveKit, Groq, and Deepgram.

<img width="1920" height="1080" alt="Screenshot 2026-06-11 083926" src="https://github.com/user-attachments/assets/d263bd24-3119-4f9f-8002-d4b6435e4ed9" />



## 🌐 Live Demo
[https://livekit-agent-one.vercel.app/](https://livekit-agent-one.vercel.app/)

## ✨ Features
- 🎙️ Real-time voice conversation with AI
- 📝 Live transcript display

- ⏱️ Conversation timer
- 📥 Download conversation as HTML
- 🌊 Animated voice visualizer

## 🛠️ Tech Stack
| Component | Technology |
|-----------|-----------|
| Frontend | React + Vite |
| Voice Infrastructure | LiveKit |
| Speech to Text | Groq Whisper |
| AI Brain | Groq LLaMA 3.3 |
| Text to Speech | Deepgram |
| Deployment | Vercel + Render + Railway |

## 🚀 How to Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/aryasinha09/livekit-agent.git
cd livekit-agent
```

### 2. Install dependencies
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Setup environment variables
Create a `.env` file:
```env
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_key
DEEPGRAM_API_KEY=your_deepgram_key
WEBHOOK_URL=your_webhook_url
```

### 4. Run the agent
```bash
python agent.py dev
```

### 5. Run the frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure
- agent.py — AI voice agent
- token_server.py — FastAPI token server
- requirements.txt — Python dependencies
- frontend/ — React frontend

## 🔑 Get API Keys
- [LiveKit](https://cloud.livekit.io) — Free
- [Groq](https://console.groq.com) — Free
- [Deepgram](https://deepgram.com) — Free $200 credit

