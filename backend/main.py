from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ticketmaster import find_artist_events
from datetime import datetime, timezone
import time
from pydantic import BaseModel

# python -m uvicorn main:app --reload
# Allow React to access FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    artists: list[str]
    city: str | None = None
    country_code: str | None = None
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
            country_code=search.country_code,
            start_date=search.start_date,
            end_date=search.end_date,
        )

        for event in events:
            all_events[event["event_id"]] = event

        time.sleep(2)

    return list(all_events.values())