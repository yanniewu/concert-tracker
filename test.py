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
print(datetime(2026, 9, 1, 0, 0, 0,tzinfo=timezone.utc).isoformat().replace("+00:00", "Z"))
print(datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"))
print(datetime(2026, 10, 31, 23, 59, 59,tzinfo=timezone.utc).isoformat().replace("+00:00", "Z"))


# start_date = datetime(2026, 9, 26, 23, 59, 59,tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
# end_date = datetime(2026, 8, 30, 23, 59, 59,tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
# city = "Washington D.C."
# radius = 200  # Use None if you don't want a radius search

# all_events = {}

# for artist in my_artists:
#     events = find_artist_events(
#         artist,
#         city=city,
#         radius=radius,
#         #country_code=country_code,
#         #start_date=start_date,
#         #end_date=end_date,
#     )

#     # Store by Ticketmaster event ID
#     for event in events:
#         all_events[event["event_id"]] = event

#     time.sleep(2)


# print()
# print(f"Found {len(all_events)} events")
# print_events_by_month(all_events)
