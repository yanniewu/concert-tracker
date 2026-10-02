import pprint
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
from dateutil.rrule import rrule, MONTHLY



load_dotenv()

CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")
REDIRECT_URI=os.getenv("SPOTIPY_REDIRECT_URI")

scope = "user-follow-read"
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope=scope))

def get_all_followed_artists():
    all_followed = []

    results = sp.current_user_followed_artists(limit=50)

    while results:
        for artist in results["artists"]["items"]:
            all_followed.append(artist["name"])

        if results["artists"]["next"]:
            results = sp.next(results["artists"])
        else:
            break

    return all_followed

print(get_all_followed_artists())

