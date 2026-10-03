from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ticketmaster import find_artist_events, find_artist
from datetime import datetime, timezone
import time
from pydantic import BaseModel

# Allow React to access FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://concert-tracker-tau.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ArtistSearchRequest(BaseModel):
    artists: list[str]

class SearchRequest(BaseModel):
    artists: list[str]
    city: str | None = None
    radius: int | None = None
    start_date: str | None = None
    end_date: str | None = None

@app.get("/")
def root():
    return {"message": "Concert Tracker API is running"}

@app.post("/api/events/search")
def search_events(search: SearchRequest):
    all_events = {}

    for artist in search.artists:
        artist = artist.strip()
        events = find_artist_events(
            artist,
            city=search.city,
            radius=search.radius,
            start_date=search.start_date,
            end_date=search.end_date,
        )

        for event in events:
            all_events[event["event_id"]] = event

        time.sleep(1)

    return list(all_events.values())

@app.post("/api/artists/search")
def search_artists(search: ArtistSearchRequest):
    results = []

    for artist_name in search.artists:
        artist_name = artist_name.strip()

        if not artist_name:
            continue

        artist = find_artist(artist_name)

        if artist is None:
            continue

        results.append({
            "id": artist["id"],
            "name": artist["name"],
            "image": (
                artist["images"][0]["url"]
                if artist.get("images")
                else None
            ),
        })

        time.sleep(1)

    return results