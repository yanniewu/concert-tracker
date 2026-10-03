import { useState } from "react";
import ConcertCard from "./components/ConcertCard";
import SearchForm from "./components/SearchForm";
import "./App.css";
import MyArtists from "./components/MyArtists";

// Sort events chronologically
function sortEvents(events) {
  return [...events].sort((a, b) => {
    const dateA = `${a.date}T${a.time || "00:00:00"}`;
    const dateB = `${b.date}T${b.time || "00:00:00"}`;

    return dateA.localeCompare(dateB);
  });
}

// Groups events by month
function groupEventsByMonth(events) {
  return events.reduce((groups, event) => {
    const month = event.date.slice(0, 7);

    if (!groups[month]) {
      groups[month] = [];
    }

    groups[month].push(event);

    return groups;
  }, {});
}

// Convert month value into readable text
function formatMonth(month) {
  const date = new Date(`${month}-01T00:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Get today's date
function getToday() {
  const today = new Date();

  return today.toISOString().split("T")[0];
}

// Get months in specified date range
function getMonthsInRange(startDate, endDate) {
  const months = [];

  const current = new Date(`${startDate}T00:00:00`);

  let end;

  if (endDate) {
    end = new Date(`${endDate}T00:00:00`);
  } else {
    end = new Date(current);
    end.setMonth(end.getMonth() + 6);
  }

  current.setDate(1);
  end.setDate(1);

  while (current <= end) {
    const month = current.toISOString().slice(0, 7);

    months.push(month);

    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

// Create a new search
function createSearch() {
  return {
    id: Date.now() + Math.random(),
    artists: "",
    city: "",
    radius: "",
    startDate: getToday(),
    endDate: "",
    events: [],
    loading: false,
    error: null,
  };
}


function App() {
  const [searches, setSearches] = useState([
    createSearch(),
  ]);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedSearches, setSubmittedSearches] = useState([]);
  const [page, setPage] = useState(window.location.pathname === "/my-artists" ? "my-artists" : "home");

  // Update one field in one search
  function updateSearch(searchId, field, value) {
    setSearches((currentSearches) =>
      currentSearches.map((search) =>
        search.id === searchId
          ? {
            ...search,
            [field]: value,
          }
          : search
      )
    );
  }

  // Add another search
  function addSearch() {
    setSearches((currentSearches) => [
      ...currentSearches,
      createSearch(),
    ]);
  }

  // Remove a search
  function removeSearch(searchId) {
    setSearches((currentSearches) =>
      currentSearches.filter(
        (search) => search.id !== searchId
      )
    );
  }

  // Navigation for home and artists page
function navigateTo(newPage) {
  const path =
    newPage === "my-artists"
      ? "/my-artists"
      : "/";

  window.history.pushState({}, "", path);

  setPage(newPage);
};

  // Ticket icon
  function TicketIcon() {
    return (
      <svg
        viewBox="0 0 32 20"
        aria-hidden="true"
        className="ticket-icon"
      >
        {/* Pixel/blocky ticket */}
        <path
          d="
          M2 2
          H30
          V6
          H28
          V8
          H30
          V18
          H2
          V14
          H4
          V12
          H2
          Z
        "
          fill="currentColor"
        />

        {/* Perforation line */}
        <path
          d="M22 3 V5 M22 7 V9 M22 11 V13 M22 15 V17"
          stroke="var(--bg)"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  // Search Ticketmaster for one search
  async function searchConcerts(search) {
    const artistList = search.artists
      .split(",")
      .map((artist) => artist.trim())
      .filter((artist) => artist !== "");

    // Build the request
    const searchRequest = {
      artists: artistList,

      city: search.city || null,

      radius: search.city && search.radius
        ? Number(search.radius)
        : null,

      start_date: search.startDate
        ? `${search.startDate}T00:00:00Z`
        : null,

      end_date: search.endDate
        ? `${search.endDate}T23:59:59Z`
        : null,
    };

    const API_URL = import.meta.env.VITE_API_URL;

    const response = await fetch(
      `${API_URL}/api/events/search`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(searchRequest),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to search for concerts"
      );
    }

    const data = await response.json();

    return sortEvents(data);
  }

  // Search all search bars
  async function handleSearchAll() {
    setSearchError(null);

    // Only search rows that have an artist
    const activeSearches = searches.filter(
      (search) => search.artists.trim() !== ""
    );

    if (activeSearches.length === 0) {
      setSearchError(
        "Please enter at least one artist."
      );

      return;
    }

    setSubmittedSearches(activeSearches);
    setHasSearched(true);

    // Validate every search before making requests
    for (const search of activeSearches) {
      if (
        search.endDate &&
        search.endDate <= search.startDate
      ) {
        updateSearch(
          search.id,
          "error",
          "End date must be after start date."
        );

        return;
      }

      if (search.radius && !search.city) {
        updateSearch(
          search.id,
          "error",
          "A city must be provided when using radius."
        );

        return;
      }
    }

    // Clear previous errors
    setSearches((currentSearches) =>
      currentSearches.map((search) => ({
        ...search,
        error: null,
        events: [],
        loading: activeSearches.some(
          (activeSearch) =>
            activeSearch.id === search.id
        ),
      }))
    );

    setSearching(true);

    try {
      // Run all searches at the same time
      const results = await Promise.all(
        activeSearches.map(async (search) => {
          try {
            const events = await searchConcerts(search);

            return {
              searchId: search.id,
              events,
              error: null,
            };
          } catch (error) {
            return {
              searchId: search.id,
              events: [],
              error: error.message,
            };
          }
        })
      );

      // Save each search's results
      setSearches((currentSearches) =>
        currentSearches.map((search) => {
          const result = results.find(
            (item) => item.searchId === search.id
          );

          if (!result) {
            return {
              ...search,
              loading: false,
            };
          }

          return {
            ...search,
            events: result.events,
            loading: false,
            error: result.error,
          };
        })
      );

      // Get every event from every search
      const allEvents = results.flatMap(
        (result) => result.events
      );

      // Sort everything together
      const sortedEvents = sortEvents(allEvents);

      // Determine available months
      if (activeSearches.length > 0) {
        const months = [
          ...new Set(
            activeSearches.flatMap((search) =>
              getMonthsInRange(
                search.startDate,
                search.endDate
              )
            )
          ),
        ].sort();

        setSelectedMonth(months[0] || null);
      } else {
        setSelectedMonth(null);
      }
    } finally {
      setSearching(false);
    }
  }

  // Combine every search's events
  const allEvents = sortEvents(
    searches.flatMap((search) => search.events)
  );

  // Group combined events by month
  const groupedEvents =
    groupEventsByMonth(allEvents);

  // Get months that actually contain results
  const resultMonths = [
    ...new Set(
      submittedSearches
        .filter(
          (search) =>
            search.artists.trim() !== "" &&
            search.startDate
        )
        .flatMap((search) =>
          getMonthsInRange(
            search.startDate,
            search.endDate
          )
        )
    ),
  ].sort();

  const displayedEvents =
    selectedMonth && groupedEvents[selectedMonth]
      ? groupedEvents[selectedMonth]
      : [];

  return (
    <div className={`app ${page === "my-artists" ? "artists-page" : ""}`}>

      {/* Navigation */}
      <header className="top-nav">
        <div className="logo">
          ♪ CONCERT TRACKER
        </div>

        <nav>
  <button
    type="button"
    onClick={() => navigateTo("home")}
  >
    HOME
  </button>

  <button
    type="button"
    onClick={() => navigateTo("my-artists")}
  >
    MY ARTISTS
  </button>
</nav>
      </header>


    {page === "my-artists" ? (
      <MyArtists />
    ) : (
   


      <main>

        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <h1>
              NEVER MISS
              <br />
              A SHOW.
            </h1>

            <p>
              Find live concerts from your favorite artists,
              <br />
              near you and beyond.
            </p>
          </div>
        </section>

        {/* Search bars */}
        <section className="searches">

          {searches.map((search) => (
            <div
              key={search.id}
              className="search-container"
            >
              <SearchForm
                search={search}
                onChange={updateSearch}
                onRemove={
                  searches.length > 1
                    ? removeSearch
                    : null
                }
              />

              {/* Individual search error */}
              {search.error && (
                <div className="search-error">
                  {search.error}
                </div>
              )}
            </div>
          ))}

        </section>

        {/* Add another search */}
        <button
          type="button"
          className="add-search-button"
          onClick={addSearch}
        >
          + ADD SEARCH
        </button>

        {/* Search all */}
        <button
          type="button"
          className="search-all-button"
          onClick={handleSearchAll}
          disabled={searching}
        >
          {searching
            ? "SEARCHING..."
            : "SEARCH ALL"}

          {!searching && (
            <span className="search-all-button-arrow">
              →
            </span>
          )}
        </button>

        <div className="results-header">
          <span className="results-header-title"><TicketIcon />
            Upcoming Concerts</span>

          <span className="results-count">
            {allEvents.length}{" "}
            {allEvents.length == 1 ? "result" : "results"}
          </span>
        </div>

        <div className="search-results-divider" />

        {/* Start screen when there is no search */}
        {!hasSearched && !searching && (
          <div className="initial-message">
            Find your next concert!
          </div>
        )}
        {/* General search error */}
        {searchError && (
          <div className="search-error">
            {searchError}
          </div>
        )}

        {/* Loading */}
        {searching && (
          <div className="searching-message">
            Searching
          </div>
        )}

        {/* Combined results */}
        {!searching && allEvents.length > 0 && (
          <section className="combined-results">

            <h2>ALL CONCERTS</h2>

            {/* Month tabs */}
            <div className="month-tabs">
              {resultMonths.map((month) => (
                <button
                  key={month}
                  type="button"
                  className={
                    selectedMonth === month
                      ? "month-tab active"
                      : "month-tab"
                  }
                  onClick={() =>
                    setSelectedMonth(month)
                  }
                >
                  {formatMonth(month)}
                </button>
              ))}
            </div>

            {/* Selected month */}
            {selectedMonth && (
              <section>
                <h2>
                  {formatMonth(selectedMonth)}
                </h2>

                {displayedEvents.length > 0 ? (
                  displayedEvents.map(
                    (event, index) => (
                      <ConcertCard
                        key={`${event.event_id}-${index}`}
                        event={event}
                      />
                    )
                  )
                ) : (
                  <div className="no-results">
                    <p>
                      No results for this month.
                    </p>
                  </div>
                )}
              </section>
            )}

          </section>
        )}

        {/* No results */}
        {hasSearched &&
          !searching &&
          !searchError &&
          allEvents.length === 0 &&
          searches.some(
            (search) =>
              search.artists.trim() !== ""
          ) && (
            <div className="no-results">
              <p>
                We couldn't find any concerts
                matching your searches.
                <br />
                Try changing the artist, city,
                radius, or date range.
              </p>
            </div>
          )}

      </main>
        )}
    </div>
  );
}

export default App;