# Concert Tracker

A full-stack web application for searching and tracking upcoming concerts using the Ticketmaster Discovery API.

## Features

* 🎵 Search for concerts by one or more artists
* 📍 Filter by city
* 📏 Search within a radius of a city
* 📅 Select a start and end date
* 🔮 Automatically search 6 months ahead when no end date is provided
* 🗓️ View concerts grouped by month
* 🔎 Create multiple independent searches
* 📂 Collapse and expand searches
* 🎟️ Direct links to ticket pages

## Tech Stack

### Frontend

* React
* Vite
* CSS

### Backend

* Python
* FastAPI
* Ticketmaster Discovery API
* Geopy

### Deployment

* Frontend: Vercel
* Backend: Render

## How It Works

The React frontend sends search requests to the FastAPI backend.

The FastAPI backend:

1. Receives the search criteria.
2. Finds the requested artists using the Ticketmaster API.
3. Searches for their upcoming events.
4. Applies location and date filters.
5. Returns the concert data to the React frontend.

The frontend then sorts and displays the results by month.

## Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/yanniewu/concert-tracker.git
cd concert-tracker
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```text
TICKETMASTER_API_KEY=your_api_key_here
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

### 3. Set Up the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Create a `.env.local` file inside the `frontend` directory:

```text
VITE_API_URL=http://127.0.0.1:8000
```

Start the React development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## Environment Variables

### Backend

The backend requires a Ticketmaster API key:

```text
TICKETMASTER_API_KEY
```

### Frontend

The frontend uses the FastAPI backend URL:

```text
VITE_API_URL
```

For local development:

```text
VITE_API_URL=http://127.0.0.1:8000
```

For the deployed application, this points to the Render backend.


## Live Application

### Frontend

https://concert-tracker-tau.vercel.app

### Backend

https://concert-tracker-api.onrender.com


## Future Improvements

Potential future features include:

* 💾 Save searches between sessions
* 🎤  Saved artist list
* 👤 User accounts
* 🗄️ PostgreSQL database integration
* ❤️ Favorite artists and concerts
* 🔔 Notifications for new concerts
* 🎛️ Improved search and filtering
* 🖥️ Improved UI
