function formatTime(time) {
  if (!time) {
    return "";
  }

  const date = new Date(`1970-01-01T${time}`);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ConcertCard({ event }) {
  const date = new Date(`${event.date}T00:00:00`);

  const month = date.toLocaleDateString("en-US", { month: "short", }).toUpperCase();

  const day = date.getDate().toString().padStart(2, "0");

  return (
    <article className="concert-card">

      <div className="concert-date">
        <div className="concert-month">
          {month}
        </div>

        <div className="concert-day">
          {day}
        </div>

        <div className="concert-year">
          {date.getFullYear()}
        </div>
      </div>

      {event.artist_image && (
        <img
          className="concert-artist-image"
          src={event.artist_image}
          alt={event.artist}
        />
      )}

      <div className="concert-details">
        <div className="concert-artist">
          {event.artist}
        </div>

        <div className="concert-event-name">
          {event.event_name}
        </div>

        <div className="concert-location">
          {event.venue}
          {event.location && ` · ${event.location}`}
        </div>

        {event.time && (
          <div className="concert-time">
            {formatTime(event.time)}
          </div>
        )}
      </div>

      <a
        className="concert-ticket"
        href={event.ticket_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span> Get Tickets</span>
        <span className="ticket-arrow">→</span>
      </a>
    </article>
  );
}

export default ConcertCard;