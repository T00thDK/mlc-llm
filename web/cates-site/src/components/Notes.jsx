const NOTES = [
  {
    date: '2026 · 04',
    title: 'On the politeness of small interfaces',
    excerpt:
      'A meditation on tiny tools — why a single text field, well-considered, can feel kinder than an entire dashboard.',
    minutes: 6,
    tag: 'Essay',
  },
  {
    date: '2026 · 03',
    title: 'Editing as a kind of listening',
    excerpt:
      'Notes from a year of editing other people&apos;s websites: how patience, restraint, and good rules show up in the final mark.',
    minutes: 8,
    tag: 'Field note',
  },
  {
    date: '2026 · 02',
    title: 'A garden of links',
    excerpt:
      'How I keep a tended bibliography in plain text — and why it has slowly become the most useful thing on my computer.',
    minutes: 4,
    tag: 'Workflow',
  },
  {
    date: '2026 · 01',
    title: 'Slow software, again',
    excerpt:
      'Re-reading Brian Eno on generative systems while choosing not to ship a feature. A short defense of the unfinished.',
    minutes: 5,
    tag: 'Essay',
  },
]

export default function Notes() {
  return (
    <section id="notes" className="notes">
      <div className="shell">
        <header className="notes__head">
          <p className="eyebrow">§ 01 — Notes</p>
          <h2 className="notes__title">
            Recent writing, a little bit at a time.
          </h2>
          <p className="notes__sub">
            Mostly about craft, attention, and the strange middle ground between
            editorial and engineering.
          </p>
        </header>

        <ol className="notes__list">
          {NOTES.map((note, i) => (
            <li
              key={note.title}
              className="notes__item"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <a className="notes__link" href="#contact">
                <span className="notes__meta">
                  <span>{note.date}</span>
                  <span className="notes__tag">{note.tag}</span>
                  <span>{note.minutes} min</span>
                </span>
                <h3 className="notes__h">{note.title}</h3>
                <p className="notes__excerpt">{note.excerpt}</p>
                <span className="notes__more" aria-hidden>
                  Read →
                </span>
              </a>
            </li>
          ))}
        </ol>

        <a className="notes__archive" href="#contact">
          See the full archive
          <span aria-hidden>↗</span>
        </a>
      </div>

      <style>{`
        .notes {
          padding: 96px 0;
          border-top: 1px solid var(--rule);
        }

        .notes__head {
          max-width: 640px;
          margin-bottom: 56px;
        }

        .notes__title {
          margin-top: 14px;
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(30px, 4.4vw, 48px);
          line-height: 1.08;
          letter-spacing: -0.015em;
        }

        .notes__sub {
          margin-top: 14px;
          color: var(--ink-soft);
          max-width: 520px;
        }

        .notes__list {
          list-style: none;
          border-top: 1px solid var(--rule);
        }

        .notes__item {
          border-bottom: 1px solid var(--rule);
          opacity: 0;
          animation: rise .8s ease forwards;
        }

        .notes__link {
          position: relative;
          display: grid;
          grid-template-columns: 200px 1fr auto;
          align-items: baseline;
          gap: 32px;
          padding: 28px 8px;
          transition: padding .25s ease, background .25s ease;
        }

        .notes__link::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 6%, transparent), transparent);
          opacity: 0;
          transition: opacity .3s ease;
          pointer-events: none;
        }

        .notes__link:hover {
          padding-left: 20px;
        }

        .notes__link:hover::after {
          opacity: 1;
        }

        .notes__meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: var(--mono);
          font-size: 12px;
          color: var(--ink-mute);
          letter-spacing: 0.04em;
        }

        .notes__tag {
          width: fit-content;
          padding: 2px 8px;
          border: 1px solid var(--rule);
          border-radius: 999px;
          color: var(--ink-soft);
        }

        .notes__h {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(22px, 2.6vw, 28px);
          line-height: 1.2;
          letter-spacing: -0.01em;
          transition: color .2s ease;
        }

        .notes__link:hover .notes__h {
          color: var(--accent);
        }

        .notes__excerpt {
          grid-column: 2 / 3;
          margin-top: 8px;
          color: var(--ink-soft);
          max-width: 56ch;
        }

        .notes__more {
          align-self: center;
          font-family: var(--mono);
          font-size: 13px;
          color: var(--ink-mute);
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity .25s ease, transform .25s ease, color .2s ease;
        }

        .notes__link:hover .notes__more {
          opacity: 1;
          transform: translateX(0);
          color: var(--accent);
        }

        .notes__archive {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 40px;
          font-family: var(--mono);
          font-size: 13px;
          letter-spacing: 0.04em;
          color: var(--ink);
          border-bottom: 1px solid var(--ink);
          padding-bottom: 2px;
        }

        @media (max-width: 720px) {
          .notes { padding: 64px 0; }
          .notes__link {
            grid-template-columns: 1fr;
            gap: 10px;
            padding: 22px 0;
          }
          .notes__excerpt { grid-column: 1; }
          .notes__more { display: none; }
        }
      `}</style>
    </section>
  )
}
