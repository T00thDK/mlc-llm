export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__bg" aria-hidden>
        <div className="hero__blob hero__blob--a" />
        <div className="hero__blob hero__blob--b" />
        <div className="hero__grain" />
      </div>

      <div className="shell hero__inner">
        <p className="eyebrow hero__eyebrow">
          <span className="hero__dot" />
          Studio notes · vol. {new Date().getFullYear()}
        </p>

        <h1 className="hero__title">
          I make small,&nbsp;
          <em>careful</em>
          &nbsp;things on the&nbsp;
          <span className="hero__shimmer">internet</span>.
        </h1>

        <p className="hero__lede">
          I&apos;m Cate — a writer and designer working between research, words,
          and the quiet edges of software. This is a slow site for slow ideas:
          field notes, reading lists, and selected client work.
        </p>

        <div className="hero__meta">
          <div className="hero__meta-item">
            <span className="eyebrow">Currently</span>
            <span>Brooklyn, NY · accepting projects from June</span>
          </div>
          <div className="hero__meta-item">
            <span className="eyebrow">Lately</span>
            <span>Editorial systems, small tools, gardens of links</span>
          </div>
        </div>

        <div className="hero__cta">
          <a className="hero__btn" href="#work">
            See selected work
            <span aria-hidden>→</span>
          </a>
          <a className="hero__btn hero__btn--ghost" href="#notes">
            Read recent notes
          </a>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          padding: 120px 0 96px;
          overflow: hidden;
        }

        .hero__bg {
          position: absolute;
          inset: -10% -5% 0 -5%;
          z-index: 0;
          pointer-events: none;
        }

        .hero__blob {
          position: absolute;
          filter: blur(70px);
          opacity: 0.55;
          border-radius: 50%;
          animation: drift 18s ease-in-out infinite;
        }

        .hero__blob--a {
          top: 8%;
          left: 4%;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle at 30% 30%, #e7c79a, transparent 70%);
        }

        .hero__blob--b {
          top: 14%;
          right: -4%;
          width: 460px;
          height: 460px;
          background: radial-gradient(circle at 60% 40%, #d8895a, transparent 70%);
          animation-delay: -8s;
          opacity: 0.35;
        }

        .hero__grain {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(28, 27, 24, 0.08) 1px, transparent 1px);
          background-size: 3px 3px;
          mix-blend-mode: multiply;
          opacity: 0.35;
        }

        .hero__inner {
          position: relative;
          z-index: 1;
          max-width: 880px;
          animation: rise 0.9s ease both;
        }

        .hero__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .hero__dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 25%, transparent);
        }

        .hero__title {
          margin-top: 28px;
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(40px, 7vw, 84px);
          line-height: 1.02;
          letter-spacing: -0.02em;
          color: var(--ink);
        }

        .hero__title em {
          font-style: italic;
          color: var(--accent);
        }

        .hero__shimmer {
          background: linear-gradient(120deg, var(--ink) 30%, var(--accent) 50%, var(--ink) 70%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 7s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero__lede {
          margin-top: 28px;
          max-width: 620px;
          font-size: clamp(17px, 1.4vw, 19px);
          line-height: 1.6;
          color: var(--ink-soft);
        }

        .hero__meta {
          margin-top: 48px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--rule);
          max-width: 620px;
        }

        .hero__meta-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          color: var(--ink-soft);
        }

        .hero__cta {
          margin-top: 40px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .hero__btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 22px;
          border-radius: 999px;
          background: var(--ink);
          color: var(--paper);
          font-size: 15px;
          transition: transform .2s ease, background .2s ease;
        }

        .hero__btn span {
          transition: transform .25s ease;
        }

        .hero__btn:hover {
          background: var(--accent);
        }

        .hero__btn:hover span {
          transform: translateX(4px);
        }

        .hero__btn--ghost {
          background: transparent;
          color: var(--ink);
          border: 1px solid var(--ink);
        }

        .hero__btn--ghost:hover {
          background: var(--ink);
          color: var(--paper);
        }

        @media (max-width: 720px) {
          .hero { padding: 80px 0 64px; }
          .hero__meta { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>
    </section>
  )
}
