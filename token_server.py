from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from livekit.api import AccessToken, VideoGrants

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/token")
async def get_token():
    token = AccessToken(
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET")
    )
    token.with_grants(VideoGrants(room_join=True, room="voice-room"))
    token.with_identity("user")
    jwt = token.to_jwt()
    return {"token": jwt}