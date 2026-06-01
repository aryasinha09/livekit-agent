import asyncio
import os
import httpx
from dotenv import load_dotenv
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import openai, silero, deepgram

load_dotenv()

async def send_to_webhook(name: str, requirement: str):
    payload = {"name": name, "requirement": requirement}
    async with httpx.AsyncClient() as client:
        await client.post(os.getenv("WEBHOOK_URL"), json=payload)

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=openai.STT(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY"),
            model="whisper-large-v3"
        ),
        llm=openai.LLM(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY"),
            model="llama-3.3-70b-versatile"
        ),
        tts=deepgram.TTS(
            api_key=os.getenv("DEEPGRAM_API_KEY")
        ),
    )

    await session.start(
        room=ctx.room,
        agent=Agent(instructions=(
            "You are a friendly voice assistant. "
            "First greet the user warmly. "
            "Then ask for their name. "
            "Then ask what they need help with. "
            "Once you have both, confirm and say goodbye."
        ))
    )

    await asyncio.sleep(300)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))