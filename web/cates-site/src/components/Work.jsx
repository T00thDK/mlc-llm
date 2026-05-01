const PROJECTS = [
  {
    year: '2025',
    client: 'Alder & Vine',
    title: 'A printed-matter shop, brought online without losing the page',
    role: 'Identity, editorial system, build',
    palette: ['#2c3a2a', '#cdb792', '#e8e2d3'],
  },
  {
    year: '2025',
    client: 'Field Notes Lab',
    title: 'A research collective’s living archive of small experiments',
    role: 'Information design, custom CMS, site',
    palette: ['#1c1b18', '#b25b2b', '#f3ead3'],
  },
  {
    year: '2024',
    client: 'Halve House Press',
    title: 'A bilingual literary journal, layered like a quiet conversation',
    role: 'Editorial design, site, typography',
    palette: ['#3a3833', '#b9a07a', '#e6dcc4'],
  },
  {
    year: '2024',
    client: 'Solenne Studio',
    title: 'A perfumer’s portfolio that smells, somehow, like the work',
    role: 'Concept, art direction, copy',
    palette: ['#4a2c1f', '#d8895a', '#efe5d2'],
  },
]

export default function Work() {
  return (
    <section id="work" className="work">
      <div className="shell">
        <header className="work__head">
          <p className="eyebrow">§ 02 — Selected work</p>
          <h2 className="work__title">
            A handful of projects I&apos;m still proud of.
          </h2>
          <p className="work__sub">
            I work with small studios, independent presses, and one or two
            kindly engineers. Mostly long, careful collaborations.
          </p>
        </header>

        <div className="work__grid">
          {PROJECTS.map((p, i) => (
            <article
              className="card"
              key={p.client}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="card__top">
                <div className="card__swatch" aria-hidden>
                  {p.palette.map((c) => (
                    <span key={c} style={{ background: c }} />
                  ))}
                </div>
                <span className="card__year">{p.year}</span>
              </div>

              <h3 className="card__client">{p.client}</h3>
              <p className="card__title">{p.title}</p>

              <footer className="card__footer">
                <span className="card__role">{p.role}</span>
                <span className="card__arrow" aria-hidden>→</span>
              </footer>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .work {
          padding: 96px 0;
          background: var(--paper-soft);
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }

        .work__head {
          max-width: 640px;
          margin-bottom: 56px;
        }

        .work__title {
          margin-top: 14px;
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(30px, 4.4vw, 48px);
          line-height: 1.08;
          letter-spacing: -0.015em;
        }

        .work__sub {
          margin-top: 14px;
          color: var(--ink-soft);
          max-width: 520px;
        }

        .work__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .card {
          position: relative;
          padding: 28px;
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: 16px;
          opacity: 0;
          animation: rise .8s ease forwards;
          transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease;
          cursor: pointer;
        }

        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: linear-gradient(180deg, transparent 60%, color-mix(in srgb, var(--accent) 6%, transparent));
          opacity: 0;
          transition: opacity .3s ease;
          pointer-events: none;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow);
          border-color: color-mix(in srgb, var(--ink) 14%, var(--rule));
        }

        .card:hover::before { opacity: 1; }

        .card__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .card__swatch {
          display: inline-flex;
          gap: 4px;
        }

        .card__swatch span {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
        }

        .card__year {
          font-family: var(--mono);
          font-size: 12px;
          letter-spacing: 0.06em;
          color: var(--ink-mute);
        }

        .card__client {
          margin-top: 24px;
          font-family: var(--mono);
          font-weight: 500;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink);
        }

        .card__title {
          margin-top: 12px;
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(20px, 2.2vw, 26px);
          line-height: 1.22;
          letter-spacing: -0.01em;
          color: var(--ink);
        }

        .card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 28px;
          padding-top: 18px;
          border-top: 1px solid var(--rule);
        }

        .card__role {
          font-size: 13px;
          color: var(--ink-soft);
        }

        .card__arrow {
          font-family: var(--serif);
          font-size: 20px;
          color: var(--ink-mute);
          transition: transform .3s ease, color .3s ease;
        }

        .card:hover .card__arrow {
          color: var(--accent);
          transform: translate(4px, -4px) rotate(-12deg);
        }

        @media (max-width: 720px) {
          .work { padding: 64px 0; }
          .work__grid { grid-template-columns: 1fr; }
          .card { padding: 22px; }
        }
      `}</style>
    </section>
  )
}
