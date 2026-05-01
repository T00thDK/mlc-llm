import { useState } from 'react'

const EMAIL = 'cate@cates.studio'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="contact" className="contact">
      <div className="shell contact__inner">
        <p className="eyebrow">§ 04 — Get in touch</p>

        <h2 className="contact__title">
          If something here resonates,&nbsp;
          <em>write to me</em>.
        </h2>

        <p className="contact__lede">
          The best projects begin as a long, slightly rambling email. Tell me
          what you&apos;re building, what feels stuck, what you&apos;d like the
          finished thing to feel like. I usually answer within a few days.
        </p>

        <div className="contact__row">
          <a className="contact__email" href={`mailto:${EMAIL}`}>
            {EMAIL}
            <span aria-hidden>↗</span>
          </a>
          <button
            className="contact__copy"
            onClick={onCopy}
            aria-live="polite"
          >
            {copied ? 'Copied to clipboard' : 'Copy address'}
          </button>
        </div>

        <ul className="contact__elsewhere">
          <li>
            <span className="eyebrow">Elsewhere</span>
          </li>
          <li><a href="#contact">Are.na</a></li>
          <li><a href="#contact">Working notes</a></li>
          <li><a href="#contact">Mailing list</a></li>
          <li><a href="#contact">Bookshop</a></li>
        </ul>
      </div>

      <style>{`
        .contact {
          padding: 120px 0;
          border-top: 1px solid var(--rule);
          background:
            radial-gradient(1200px 400px at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%),
            var(--paper);
        }

        .contact__inner { max-width: 820px; }

        .contact__title {
          margin-top: 18px;
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(36px, 6vw, 68px);
          line-height: 1.04;
          letter-spacing: -0.02em;
        }

        .contact__title em {
          font-style: italic;
          color: var(--accent);
        }

        .contact__lede {
          margin-top: 24px;
          color: var(--ink-soft);
          max-width: 580px;
          font-size: clamp(16px, 1.3vw, 18px);
        }

        .contact__row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
          margin-top: 40px;
        }

        .contact__email {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-radius: 999px;
          background: var(--ink);
          color: var(--paper);
          font-family: var(--mono);
          font-size: 15px;
          letter-spacing: 0.02em;
          transition: background .2s ease, transform .2s ease;
        }

        .contact__email:hover {
          background: var(--accent);
        }

        .contact__email span {
          transition: transform .25s ease;
        }

        .contact__email:hover span {
          transform: translate(3px, -3px);
        }

        .contact__copy {
          padding: 16px 22px;
          border-radius: 999px;
          border: 1px solid var(--ink);
          font-size: 14px;
          color: var(--ink);
          transition: background .2s ease, color .2s ease;
        }

        .contact__copy:hover {
          background: var(--ink);
          color: var(--paper);
        }

        .contact__elsewhere {
          list-style: none;
          margin-top: 56px;
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--rule);
          font-size: 14px;
          color: var(--ink-soft);
        }

        .contact__elsewhere a {
          position: relative;
          padding-bottom: 2px;
          border-bottom: 1px solid transparent;
          transition: color .2s ease, border-color .2s ease;
        }

        .contact__elsewhere a:hover {
          color: var(--ink);
          border-bottom-color: var(--ink);
        }

        @media (max-width: 720px) {
          .contact { padding: 80px 0; }
          .contact__email,
          .contact__copy {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>
    </section>
  )
}
