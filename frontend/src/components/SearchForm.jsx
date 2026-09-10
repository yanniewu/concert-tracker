function SearchForm({
  search,
  onChange,
  onSearch,
  onRemove,
  onToggle,
}) {
  return (
    <div className="search-section">

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


          <form onSubmit={(event) => onSearch(event, search.id)}>

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


            <div>
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
                placeholder="Leave blank to search only within the selected city."
                min="1"
              />
            </div>


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


            <div>
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

              <small>
                If blank, defaults to 6 months after the start date.
              </small>
            </div>


            <button type="submit">
              Search
            </button>

          </form>

        </>
      )}

    </div>
  );
}

export default SearchForm;