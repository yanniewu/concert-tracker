function ConcertCard({ event }) {
  const date = new Date(`${event.date}T00:00:00`);

  const month = date.toLocaleDateString("en-US", {
    month: "short",
  });

  const day = date.getDate().toString().padStart(2, "0");

  return (
    <div className="concert-card">
      {event.artist_image && (
        <img
          className="concert-artist-image"
          src={event.artist_image}
          alt={event.artist}
        />
      )}

      <div className="concert-date">
        <div className="concert-month">{month}</div>
        <div className="concert-day">{day}</div>
      </div>

      <div className="concert-details">
        <div className="concert-artist">{event.artist}</div>

        <div className="concert-location">
          {event.location} | {event.venue}
        </div>

        <div className="concert-time">{event.time}</div>

        <a
          className="concert-ticket"
          href={event.ticket_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tickets
        </a>
      </div>
    </div>
  );
}

export default ConcertCard;