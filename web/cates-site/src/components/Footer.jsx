export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <div className="footer__col">
          <span className="eyebrow">Colophon</span>
          <p>
            Set in <em>Fraunces</em> &amp; <em>Inter</em>. Built quietly with
            React and a lot of tea. No tracking, no analytics, no popups.
          </p>
        </div>

        <div className="footer__col footer__col--meta">
          <span className="eyebrow">Meta</span>
          <p>© {year} Cate. Last revised in early spring.</p>
          <p className="footer__credit">
            <a href="#top">↑ Back to the top</a>
          </p>
        </div>
      </div>

      <div className="footer__mark" aria-hidden>
        cate
      </div>

      <style>{`
        .footer {
          position: relative;
          padding: 64px 0 0;
          background: var(--paper-deep);
          border-top: 1px solid var(--rule);
          overflow: hidden;
        }

        .footer__inner {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 48px;
          padding-bottom: 56px;
        }

        .footer__col p {
          margin-top: 12px;
          color: var(--ink-soft);
          max-width: 48ch;
        }

        .footer__col em {
          font-family: var(--serif);
          font-style: italic;
          color: var(--ink);
        }

        .footer__col--meta { text-align: right; }
        .footer__col--meta p { margin-left: auto; }

        .footer__credit a {
          font-family: var(--mono);
          font-size: 13px;
          color: var(--ink);
          border-bottom: 1px solid var(--ink);
          padding-bottom: 2px;
        }

        .footer__mark {
          font-family: var(--serif);
          font-style: italic;
          font-weight: 300;
          font-size: clamp(120px, 28vw, 320px);
          line-height: 0.85;
          color: color-mix(in srgb, var(--ink) 8%, transparent);
          text-align: center;
          letter-spacing: -0.04em;
          padding: 0 24px 32px;
          user-select: none;
        }

        @media (max-width: 720px) {
          .footer__inner {
            grid-template-columns: 1fr;
            gap: 32px;
            padding-bottom: 32px;
          }
          .footer__col--meta { text-align: left; }
          .footer__col--meta p { margin-left: 0; }
        }
      `}</style>
    </footer>
  )
}
