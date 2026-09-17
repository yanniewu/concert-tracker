function SearchForm({
  search,
  onChange,
  onSearch,
  onRemove,
  onToggle,
}) {
  return (
    <div>
      {/* Collapsed search summary */}
      {!search.expanded && (
        <div className="search-summary-header">
          <button
            type="button"
            className="search-header-main"
            onClick={() => onToggle(search.id)}
          >
            <span className="search-arrow">▶</span>

            <span className="search-summary">
              <strong>
                {search.artists.trim() || "No artists"}
              </strong>

              <span>
                {search.city || "All locations"}

                {search.radius &&
                  ` · Within ${search.radius} miles`}

                {search.startDate &&
                  ` · ${search.startDate}`}

                {search.endDate
                  ? ` – ${search.endDate}`
                  : " – 6 months"}
              </span>
            </span>
          </button>

          <button
            type="button"
            className="remove-search-button"
            onClick={() => onRemove(search.id)}
            aria-label="Remove search"
          >
            ×
          </button>
        </div>
      )}

      {/* Expanded search form */}
      {search.expanded && (
        <>
          {/* Search summary */}
          <div className="search-summary-header">
            <button
              type="button"
              className="search-header-main"
              onClick={() => onToggle(search.id)}
            >
              <span className="search-arrow">▼</span>

              <span className="search-summary">
                <strong>
                  {search.artists.trim() || "New Search"}
                </strong>

                <span>
                  {search.city || "All locations"}

                  {search.radius &&
                    ` · Within ${search.radius} miles`}

                  {search.startDate &&
                    ` · ${search.startDate}`}

                  {search.endDate
                    ? ` – ${search.endDate}`
                    : " – 6 months"}
                </span>
              </span>
            </button>

            <button
              type="button"
              className="remove-search-button"
              onClick={() => onRemove(search.id)}
              aria-label="Remove search"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <div className="search-form-content">
            <form
              onSubmit={(event) =>
                onSearch(event, search.id)
              }
            >
              <p className="required-note">
                <strong>Required fields:</strong> Artist and Start Date.
                All other fields are optional.
              </p>

              <div>
                <label>Artists *</label>

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
                  placeholder="Lorde, Ariana Grande"
                />
              </div>

              <div className="search-row">
                <div>
                  <label>City</label>

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
                    placeholder="Washington, DC"
                  />
                </div>

                <div className="radius-field">
                  <label>Radius (miles)</label>

                  <input
                    type="number"
                    value={search.radius}
                    onChange={(event) =>
                      onChange(
                        search.id,
                        "radius",
                        event.target.value
                      )
                    }
                    placeholder="Leave blank for city only"
                    min="1"
                  />
                </div>
              </div>

              <div className="search-row">
                <div>
                  <label>Start Date *</label>

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

                <div className="end-date-field">
                  <div className="end-date-input-row">
                    <label>End Date</label>

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

                  <small>
                    If blank, defaults to 6 months after the start date.
                  </small>
                </div>
              </div>

              <button type="submit">
                Search
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default SearchForm;