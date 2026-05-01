import { useEffect, useState } from 'react'

const links = [
  { href: '#notes', label: 'Notes' },
  { href: '#work', label: 'Work' },
  { href: '#reading', label: 'Reading' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="shell nav__inner">
        <a href="#top" className="nav__brand" aria-label="Cate, home">
          <span className="nav__mark">c</span>
          <span className="nav__name">Cate</span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="nav__cta" href="#contact">
          Say hello
          <span aria-hidden>→</span>
        </a>
      </div>

      <style>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 18px 0;
          background: color-mix(in srgb, var(--paper) 88%, transparent);
          backdrop-filter: saturate(140%) blur(14px);
          -webkit-backdrop-filter: saturate(140%) blur(14px);
          border-bottom: 1px solid transparent;
          transition: border-color .25s ease, padding .25s ease, background .25s ease;
        }

        .nav--scrolled {
          padding: 12px 0;
          border-bottom-color: var(--rule);
        }

        .nav__inner {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 32px;
        }

        .nav__brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: var(--serif);
          font-weight: 500;
          font-size: 20px;
          letter-spacing: -0.01em;
        }

        .nav__mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--ink);
          color: var(--paper);
          font-style: italic;
          font-family: var(--serif);
          font-size: 18px;
          line-height: 1;
          transform: translateY(-1px);
        }

        .nav__name {
          color: var(--ink);
        }

        .nav__links {
          justify-self: center;
          display: flex;
          gap: 28px;
          font-size: 14px;
          color: var(--ink-soft);
        }

        .nav__links a {
          position: relative;
          padding: 6px 0;
          transition: color .2s ease;
        }

        .nav__links a::after {
          content: '';
          position: absolute;
          left: 50%;
          right: 50%;
          bottom: 0;
          height: 1px;
          background: var(--ink);
          transition: left .25s ease, right .25s ease;
        }

        .nav__links a:hover { color: var(--ink); }
        .nav__links a:hover::after { left: 0; right: 0; }

        .nav__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          padding: 9px 16px;
          border-radius: 999px;
          background: var(--ink);
          color: var(--paper);
          transition: transform .2s ease, background .2s ease;
        }

        .nav__cta span {
          transition: transform .25s ease;
        }

        .nav__cta:hover {
          background: var(--accent);
        }

        .nav__cta:hover span {
          transform: translateX(3px);
        }

        @media (max-width: 720px) {
          .nav__inner { grid-template-columns: auto 1fr; gap: 12px; }
          .nav__links { display: none; }
        }
      `}</style>
    </header>
  )
}
