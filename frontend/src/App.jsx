import { useState } from "react";
import ConcertCard from "./components/ConcertCard";
import SearchForm from "./components/SearchForm";
import "./App.css";

// Sorts events chronologically
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

// Get today's date in proper format
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


function App() {
  // Search form state
  const [searches, setSearches] = useState([
    {
      id: 1,
      artists: "",
      city: "",
      //countryCode: "",
      radius: "",
      startDate: getToday(),
      endDate: "",
      events: [],
      loading: false,
      error: null,
      selectedMonth: null,
      expanded: true,
    },
  ]);


  // Update one field in one search
  function updateSearch(searchId, field, value) {
    setSearches((currentSearches) =>
      currentSearches.map((search) =>
        search.id === searchId
          ? { ...search, [field]: value }
          : search
      )
    );
  }


  // Expand or collapse one search
  function toggleSearch(searchId) {
    setSearches((currentSearches) =>
      currentSearches.map((search) =>
        search.id === searchId
          ? {
              ...search,
              expanded: !search.expanded,
            }
          : search
      )
    );
  }


  // Add a new search
  function addSearch() {
    setSearches((currentSearches) => [
      ...currentSearches,
      {
        id: Date.now(),
        artists: "",
        city: "",
        //countryCode: "",
        radius: "",
        startDate: getToday(),
        endDate: "",
        events: [],
        loading: false,
        error: null,
        selectedMonth: null,
        expanded: true,
      },
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


  // Search Ticketmaster
  async function handleSearch(event, searchId) {
    event.preventDefault();

    const search = searches.find(
      (search) => search.id === searchId
    );

    if (!search) {
      return;
    }


    // Turn the artist input into a list of artist names
    const artistList = search.artists
      .split(",")
      .map((artist) => artist.trim())
      .filter((artist) => artist !== "");


    // Artist is required
    if (artistList.length === 0) {
      updateSearch(
        searchId,
        "error",
        "Please enter at least one artist."
      );

      return;
    }


    // End date must be after start date
    if (
      search.endDate &&
      search.endDate <= search.startDate
    ) {
      updateSearch(
        searchId,
        "error",
        "End date must be after start date."
      );

      return;
    }


    // Radius requires a city
    if (search.radius && !search.city) {
      updateSearch(
        searchId,
        "error",
        "A city must be provided when using radius."
      );

      return;
    }


    // Clear previous results and errors for this search
    setSearches((currentSearches) =>
      currentSearches.map((currentSearch) =>
        currentSearch.id === searchId
          ? {
              ...currentSearch,
              loading: true,
              error: null,
              events: [],
            }
          : currentSearch
      )
    );


    // Build the request that FastAPI expects
    const searchRequest = {
      artists: artistList,

      city: search.city || null,

      //country_code: search.countryCode || null,

      radius: search.radius
        ? Number(search.radius)
        : null,

      start_date: search.startDate
        ? `${search.startDate}T00:00:00Z`
        : null,

      end_date: search.endDate
        ? `${search.endDate}T23:59:59Z`
        : null,
    };


    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/events/search",
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


      // Sort events chronologically
      const sortedEvents = sortEvents(data);


      // Determine which months should appear as tabs
      const months = getMonthsInRange(
        search.startDate,
        search.endDate
      );


      // Save results only to this search
      setSearches((currentSearches) =>
        currentSearches.map((currentSearch) =>
          currentSearch.id === searchId
            ? {
                ...currentSearch,
                events: sortedEvents,
                loading: false,
                error: null,
                selectedMonth: months[0] || null,
              }
            : currentSearch
        )
      );
    } catch (error) {
      setSearches((currentSearches) =>
        currentSearches.map((currentSearch) =>
          currentSearch.id === searchId
            ? {
                ...currentSearch,
                loading: false,
                error: error.message,
              }
            : currentSearch
        )
      );
    }
  }


  return (
    <div>
      <h1>Concert Tracker</h1>


      {searches.map((search) => {
        // Group this search's events by month
        const groupedEvents = groupEventsByMonth(
          search.events
        );


        // Get the months for this search
        const months = getMonthsInRange(
          search.startDate,
          search.endDate
        );


        return (
          <div
            key={search.id}
            className="search-section"
          >

            {/* Search form and collapsed summary */}
            <SearchForm
              search={search}
              onChange={updateSearch}
              onSearch={handleSearch}
              onRemove={removeSearch}
              onToggle={toggleSearch}
            />


            {/* Everything below the form collapses with it */}
            {search.expanded && (
              <>

                {/* Loading state */}
                {search.loading && (
                  <h2>Searching...</h2>
                )}


                {/* Error state */}
                {search.error && (
                  <h2>
                    Error: {search.error}
                  </h2>
                )}


                {/* No results */}
                {!search.loading &&
                  !search.error &&
                  search.events.length === 0 && (
                    <div className="no-results">
                      <p>
                        We couldn't find any concerts
                        matching this search.
                      </p>

                      <p>
                        Try changing the artist, city,
                        radius, or date range.
                      </p>
                    </div>
                  )}


                {/* Search results */}
                {!search.loading &&
                  !search.error &&
                  search.events.length > 0 && (
                    <>

                      {/* Month tabs */}
                      <div className="month-tabs">
                        {months.map((month) => (
                          <button
                            key={month}
                            type="button"
                            className={
                              search.selectedMonth === month
                                ? "month-tab active"
                                : "month-tab"
                            }
                            onClick={() =>
                              updateSearch(
                                search.id,
                                "selectedMonth",
                                month
                              )
                            }
                          >
                            {formatMonth(month)}
                          </button>
                        ))}
                      </div>


                      {/* Selected month's concerts */}
                      <section>
                        <h2>
                          {formatMonth(
                            search.selectedMonth
                          )}
                        </h2>


                        {groupedEvents[
                          search.selectedMonth
                        ] ? (
                          groupedEvents[
                            search.selectedMonth
                          ].map((event) => (
                            <ConcertCard
                              key={event.event_id}
                              event={event}
                            />
                          ))
                        ) : (
                          <div className="no-results">
                            <p>
                              No results for this month.
                            </p>
                          </div>
                        )}

                      </section>

                    </>
                  )}

              </>
            )}

          </div>
        );
      })}


      {/* Add another search */}
      <button
        type="button"
        className="add-search-button"
        onClick={addSearch}
      >
        + Add Search
      </button>

    </div>
  );
}

export default App;