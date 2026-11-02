/** Consistent title area; optional actions are supplied by each page. */
export default function PageHeading({ title, description, children }) {
  return (
    <section className="page-heading">
      <div>
        <div className="eyebrow">LESS NOISE. MORE CONTROL.</div>
        <h1>
          {title}
          <span>.</span>
        </h1>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}
