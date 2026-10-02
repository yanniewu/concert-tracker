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
  onRemove,
}) {
  return (
    <div className="search-row">

      <div className="search-bar">

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
    onChange={(event) => {
  const city = event.target.value;

  onChange(search.id, "city", city);

  if (city.trim() === "") {
    onChange(search.id, "radius", "");
  }
}}
    placeholder="Any city"
  />

  {search.city.trim() !== "" && (
    <select
      className="radius-select"
      value={search.radius}
      onChange={(event) =>
        onChange(
          search.id,
          "radius",
          event.target.value
        )
      }
    >
      <option value="">Radius</option>
      <option value="5">5 mi</option>
      <option value="10">10 mi</option>
      <option value="25">25 mi</option>
      <option value="50">50 mi</option>
      <option value="100">100 mi</option>
    </select>
  )}
</div>

        <div className="search-divider" />

        {/* Start Date */}
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

<div className="search-divider" />

{/* End Date */}
<div className="search-field search-date">
  <CalendarIcon />

  <input
    type="date"
    value={search.endDate}
    onChange={(event) =>
      onChange(
        search.id,
        "endDate",
        event.target.value
      )
    }
  />
</div>

      </div>

      {/* Remove search */}
      {onRemove && (
        <button
  type="button"
  className="remove-search"
  onClick={() => onRemove(search.id)}
  aria-label="Remove search"
>
  ×
</button>
      )}

    </div>
  );
}

export default SearchForm;