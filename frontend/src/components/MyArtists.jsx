import { useEffect, useState } from "react";

const STORAGE_KEY = "concert-tracker-my-artists";

function MyArtists() {
  const [artistInput, setArtistInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [artists, setArtists] = useState(() => {
  const savedArtists = localStorage.getItem(STORAGE_KEY);

  if (!savedArtists) {
    return [];
  }

  try {
    return JSON.parse(savedArtists);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
});

  // Save artists whenever the list changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(artists)
    );
  }, [artists]);

  async function addArtists() {
    const names = artistInput
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");

    if (names.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${API_URL}/api/artists/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            artists: names,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to find artists.");
      }

      const foundArtists = await response.json();

      if (foundArtists.length === 0) {
        setError("No artists were found.");
        return;
      }

      setArtists((currentArtists) => {
        const existingIds = new Set(
          currentArtists.map((artist) => artist.id)
        );

        const newArtists = foundArtists.filter(
          (artist) => !existingIds.has(artist.id)
        );

        return [...currentArtists, ...newArtists].sort(
          (a, b) =>
            a.name.localeCompare(b.name)
        );
      });

      setArtistInput("");
    } catch (error) {
      console.error(error);
      setError("Could not find the artists.");
    } finally {
      setLoading(false);
    }
  }

  function removeArtist(artistId) {
    setArtists((currentArtists) =>
      currentArtists.filter(
        (artist) => artist.id !== artistId
      )
    );
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addArtists();
    }
  }


  return (
    <main className="my-artists-page">

      <section className="my-artists-header">
          Save your favorite artists to quickly search for their concerts.
      </section>

      {/* Add artists */}
      <section className="artist-input-section">

        <div className="artist-input-bar">

          <input
            type="text"
            value={artistInput}
            onChange={(event) =>
              setArtistInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Enter artists separated by commas..."
          />

          <button
            type="button"
            onClick={addArtists}
            disabled={loading || !artistInput.trim()}
          >
            {loading ? "ADDING..." : "ADD ARTISTS"}
          </button>

        </div>

        <p className="artist-input-help">
          Example: Lorde, Ariana Grande, Charli XCX
        </p>

        {error && (
          <div className="artist-error">
            {error}
          </div>
        )}

      </section>

      {/* Artist list */}
      <section className="saved-artists-section">

        <div className="saved-artists-header">
          <h2>YOUR ARTISTS</h2>

          <span>
            {artists.length}{" "}
            {artists.length === 1
              ? "artist"
              : "artists"}
          </span>
        </div>

        <div className="saved-artists-divider" />

        {artists.length === 0 ? (
          <div className="no-artists">
            <p>
              You haven't added any artists yet.
            </p>
          </div>
        ) : (
          <div className="artist-grid">

            {artists.map((artist) => (
              <div
                className="artist-card"
                key={artist.id}
              >

                <div className="artist-image-container">

                  {artist.image ? (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="artist-image"
                    />
                  ) : (
                    <div className="artist-image-placeholder">
                      ♪
                    </div>
                  )}

                  <button
                    type="button"
                    className="remove-artist-button"
                    onClick={() =>
                      removeArtist(artist.id)
                    }
                    aria-label={`Remove ${artist.name}`}
                  >
                    ×
                  </button>

                </div>

                <div className="artist-name">
                  {artist.name}
                </div>

              </div>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}

export default MyArtists;