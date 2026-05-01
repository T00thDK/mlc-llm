const SHELF = [
  { author: 'Ursula K. Le Guin', title: 'The Carrier Bag Theory of Fiction', kind: 'essay' },
  { author: 'Italo Calvino', title: 'Six Memos for the Next Millennium', kind: 'lectures' },
  { author: 'John Berger', title: 'And Our Faces, My Heart, Brief as Photos', kind: 'poetry / prose' },
  { author: 'Anne Carson', title: 'Plainwater', kind: 'essay / poetry' },
  { author: 'Lewis Hyde', title: 'The Gift', kind: 'essay' },
  { author: 'Maggie Nelson', title: 'Bluets', kind: 'essay' },
]

export default function Reading() {
  return (
    <section id="reading" className="reading">
      <div className="shell reading__inner">
        <header className="reading__head">
          <p className="eyebrow">§ 03 — Currently on the shelf</p>
          <h2 className="reading__title">
            A short, opinionated reading list,&nbsp;
            <em>updated when it&apos;s honest</em>.
          </h2>
        </header>

        <ul className="reading__list">
          {SHELF.map((b, i) => (
            <li
              key={b.title}
              className="reading__row"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="reading__num">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="reading__body">
                <span className="reading__author">{b.author}</span>
                <span className="reading__sep" aria-hidden>·</span>
                <span className="reading__name">{b.title}</span>
              </div>
              <span className="reading__kind">{b.kind}</span>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .reading {
          padding: 96px 0;
          border-top: 1px solid var(--rule);
        }

        .reading__inner { max-width: 880px; }

        .reading__title {
          margin-top: 14px;
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.1;
          letter-spacing: -0.015em;
        }

        .reading__title em {
          font-style: italic;
          color: var(--accent);
        }

        .reading__list {
          list-style: none;
          margin-top: 48px;
          border-top: 1px solid var(--rule);
        }

        .reading__row {
          display: grid;
          grid-template-columns: 36px 1fr auto;
          align-items: baseline;
          gap: 16px;
          padding: 18px 4px;
          border-bottom: 1px solid var(--rule);
          opacity: 0;
          animation: rise .7s ease forwards;
          transition: padding .25s ease, color .25s ease;
        }

        .reading__row:hover {
          padding-left: 14px;
        }

        .reading__num {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--ink-mute);
          letter-spacing: 0.04em;
        }

        .reading__body {
          font-family: var(--serif);
          font-size: clamp(18px, 1.8vw, 22px);
          line-height: 1.3;
          color: var(--ink);
        }

        .reading__author {
          font-style: italic;
          color: var(--ink-soft);
        }

        .reading__sep {
          margin: 0 8px;
          color: var(--ink-mute);
        }

        .reading__name {
          font-weight: 500;
        }

        .reading__kind {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-mute);
        }

        @media (max-width: 720px) {
          .reading { padding: 64px 0; }
          .reading__row {
            grid-template-columns: 28px 1fr;
            row-gap: 4px;
          }
          .reading__kind {
            grid-column: 2;
            justify-self: start;
          }
        }
      `}</style>
    </section>
  )
}
