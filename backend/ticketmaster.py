import requests
from datetime import datetime, timezone
import time
import os
from dotenv import load_dotenv
from collections import defaultdict
from functools import lru_cache
from geopy.geocoders import Nominatim
from dateutil.relativedelta import relativedelta


load_dotenv()

API_KEY = os.getenv("TICKETMASTER_API_KEY")
BASE_URL = "https://app.ticketmaster.com/discovery/v2"

# Geocoder
geolocator = Nominatim(user_agent="my_concert_search_app")
@lru_cache(maxsize=100)
def get_coordinates(city, country_code=None):
    """
    Convert a city name into latitude and longitude.

    The result is cached so the same city isn't
    geocoded repeatedly.
    """

    if country_code:
        location = geolocator.geocode(city, country_codes=country_code.lower())
    else:
        location = geolocator.geocode(city)

    if location is None:
        raise ValueError(f"Could not find coordinates for: {city}")

    return location.latitude, location.longitude


# Ticketmaster request with exponential backoff
def ticketmaster_get(url, params, max_retries=5):

    for attempt in range(max_retries):
        response = requests.get(url,params=params)

        # Success
        if response.status_code == 200:
            return response

        # Rate limited
        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After")

            if retry_after:
                wait_time = int(retry_after)
            else:
                # 2, 4, 8, 16, 32 seconds
                wait_time = 2 ** attempt

            print(
                f"Rate limited (429). "
                f"Retrying in {wait_time} seconds..."
            )

            time.sleep(wait_time)
            continue

        # Other HTTP error
        # print("Ticketmaster error:")
        # print(response.text)
        # response.raise_for_status()
        response.raise_for_status()

    raise Exception(f"Ticketmaster API failed after {max_retries} retries.")


# Find Ticketmaster artist
def find_artist(artist_name):

    attraction_params = {
        "apikey": API_KEY,
        "keyword": artist_name,
        "size": 10
    }

    response = ticketmaster_get(f"{BASE_URL}/attractions.json", attraction_params)
    attraction_data = response.json()

    attractions = attraction_data.get("_embedded", {}).get("attractions", [])

    if not attractions:
        print(f"No artists found for '{artist_name}'")
        return None

    # Default to first result
    artist = attractions[0]

    # Prefer exact name match
    for attraction in attractions:
        if attraction["name"].lower() == artist_name.lower():
            artist = attraction
            break

    print(f"\nSearching events for: {artist['name']}")
    print(f"Attraction ID: {artist['id']}")

    return artist


# Find artist events
def find_artist_events(
    artist_name,
    city=None,
    start_date=None,
    end_date=None,
    country_code=None,
    radius=None
):

    # 1. Find the artist
    artist = find_artist(artist_name)
    if artist is None:
        return []

    # 2. Build event search parameters
    event_params = {
        "apikey": API_KEY,
        "attractionId": artist["id"],
        "size": 100
    }

    # Location search
    if radius is not None:
        if city is None:
            raise ValueError("A city must be provided when using radius.")
        if radius <= 0:
            raise ValueError("Radius must be greater than 0.")
    
        latitude, longitude = get_coordinates(city, country_code)
        event_params["latlong"] = (f"{latitude},{longitude}")
        event_params["radius"] = radius
        event_params["unit"] = "miles"

        print(
            f"Searching within {radius} miles of {city}")

    elif city:
        event_params["city"] = city

    if country_code:
            event_params["countryCode"] = country_code

    # Other filters
    if start_date is None:
        start_dt = datetime.now(timezone.utc).replace(microsecond=0)
        event_params["startDateTime"] = start_dt.isoformat().replace("+00:00", "Z")
    else:
        # Convert the provided ISO string into a datetime
        start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        event_params["startDateTime"] = start_date

    # Default end_date to 6 months after start_date
    if end_date is None:
        end_dt = start_dt + relativedelta(months=6)
        event_params["endDateTime"] = end_dt.isoformat().replace("+00:00", "Z")
    else:
        event_params["endDateTime"] = end_date

    if event_params["startDateTime"] >= event_params["endDateTime"]:
        raise ValueError("start_date must be before end_date")


    # Search Ticketmaster
    response = ticketmaster_get(f"{BASE_URL}/events.json", event_params)
    event_data = response.json()
    events = event_data.get("_embedded", {}).get("events", [])


    # 3. Extract useful information
    results = []
    for event in events:
        # Date/time
        start = event.get("dates", {}).get("start", {})
        event_date = start.get("localDate")
        event_time = start.get("localTime")

        # Venue/location
        venues = event.get("_embedded", {}).get("venues", [])

        if venues:
            venue_data = venues[0]

            venue = venue_data.get("name")
            event_city = venue_data.get("city", {}).get("name")
            state = venue_data.get( "state", {}).get("stateCode")
            country = venue_data.get("country", {}).get("name")

            if event_city and state:
                location = (f"{event_city}, {state}")
            elif event_city and country:
                location = (f"{event_city}, {country}")
            elif event_city:
                location = event_city
            else:
                location = None

        else:
            venue = None
            location = None

        # Ticket URL
        ticket_url = event.get("url")

        # Store event
        result = {
            "artist": artist["name"],
            "artist_id": artist["id"],
            "artist_image": artist["images"][0]["url"] if artist.get("images") else None,
            "event_name": event.get("name"),
            "event_id": event.get("id"),
            "date": event_date,
            "time": event_time,
            "venue": venue,
            "location": location,
            "ticket_url": ticket_url
        }

        results.append(result)

    return results


# Print events by month
# def print_events_by_month(events):

#     events_by_month = defaultdict(list)

#     for event in events.values():
#         if event["date"]:
#             month = event["date"][:7]
#             events_by_month[month].append(event)

#     for month in sorted(events_by_month):
#         print()
#         print("=" * 60)
#         print(month)
#         print("=" * 60)

#         month_events = sorted(events_by_month[month], key=lambda x: (x["date"], x["time"] or ""))

#         for event in month_events:
#             print(f"Artist:     {event['artist']}")
#             print(f"Event:      {event['event_name']}")
#             print(f"Date:       {event['date']}")
#             print(f"Time:       {event['time']}")
#             print(f"Venue:      {event['venue']}")
#             print(f"Location:   {event['location']}")
#             print(f"Tickets:    {event['ticket_url']}")
#             print("-" * 60)

# my_artists = ['Olivia Rodrigo', 'I Hate Models']
# all_events = {}

# for artist in my_artists:
#     events = find_artist_events(
#         artist,
#         city="Washington, DC",
#         #radius=100,
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
