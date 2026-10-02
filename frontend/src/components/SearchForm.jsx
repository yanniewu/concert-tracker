function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="search-icon"
    >
      <circle
        cx="11"
        cy="11"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <line
        x1="16"
        y1="16"
        x2="21"
        y2="21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="search-icon"
    >
      <path
        d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <circle
        cx="12"
        cy="10"
        r="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="search-icon"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
        stroke="currentColor"
        strokeWidth="2"
      />

      <line
        x1="8"
        y1="3"
        x2="8"
        y2="7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <line
        x1="16"
        y1="3"
        x2="16"
        y2="7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchForm({
  search,
  onChange,
  onSearch,
}) {
  return (
    <form
      className="search-bar"
      onSubmit={(event) =>
        onSearch(event, search.id)
      }
    >
      {/* Artists */}
      <div className="search-field search-artists">
        <SearchIcon />

        <input
          type="text"
          value={search.artists}
          onChange={(event) =>
            onChange(
              search.id,
              "artists",
              event.target.value
            )
          }
          placeholder="Search artists..."
        />
      </div>

      <div className="search-divider" />

      {/* Location */}
      <div className="search-field search-location">
        <LocationIcon />

        <input
          type="text"
          value={search.city}
          onChange={(event) =>
            onChange(
              search.id,
              "city",
              event.target.value
            )
          }
          placeholder="Any location"
        />
      </div>

      <div className="search-divider" />

      {/* Date */}
      <div className="search-field search-date">
        <CalendarIcon />

        <input
          type="date"
          value={search.startDate}
          onChange={(event) =>
            onChange(
              search.id,
              "startDate",
              event.target.value
            )
          }
        />
      </div>

      {/* Search button */}
      <button
        type="submit"
        className="search-button"
      >
          <span>Search</span>
          <span className="search-button-arrow">→</span>
      </button>
    </form>
  );
}

export default SearchForm;