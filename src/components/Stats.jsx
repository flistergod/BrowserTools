/** Each card describes one count; feature pages calculate the values. */
export default function Stats({ cards }) {
  return (
    <section className="stats" aria-label="Library summary">
      {cards.map((card) => (
        <article className="stat" key={card.label}>
          <span className="stat-icon">{card.icon}</span>
          <div>
            <small>{card.label}</small>
            <strong>{card.value}</strong>
          </div>
          <em>{card.note}</em>
        </article>
      ))}
    </section>
  );
}
