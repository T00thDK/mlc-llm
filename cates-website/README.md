# Cates Real Estate &amp; Auction Company — Website

A static, framework-free redesign of cates.com built to demonstrate the full UX surface
of a fourth-generation, data-first auction house.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage — hero video, featured auctions grid, services, heritage band, awards, reviews, freemium downloads |
| `auctions.html` | Full unified grid: online-only auctions and traditional listings, filterable / sortable / dual-view |
| `listing.html` | Property/asset detail — gallery, sticky bid box, countdown, specs, due-diligence, terms, bid history, FAQ, map |
| `dashboard.html` | Bidder dashboard — KPIs, active bids, watchlist, interests, invoices, payment methods, notifications, rewards |
| `warroom.html` | Auctioneer/operator console — live bid feed, paddle roster, broadcast, lot queue, audience analytics |
| `services.html` | Residential, Land &amp; Farms, Lakefront/Luxury, Commercial &amp; Hotels, Cates Estate Services, Cates Downsizing |
| `buyers.html` | Buyer journey, proxy bidding explainers, rewards tiers |
| `sellers.html` | Three sale paths (traditional / auction / private treaty), seller intake form, real-time valuation |
| `agents.html` | Team grid with filters; recruiting CTA |
| `gallery.html` | Photography &amp; video gallery, full awards roster |
| `blog.html` | Insights / blog index with featured article and category chips |
| `faq.html` | Topical FAQ with deep-link sidebar TOC |
| `learn.html` | Wiki — Auction 101, proxy, soft close, absolute vs reserve, buyer's premium, etc. |
| `signin.html` | 4-step registration: account → identity → proof of funds → consents |

## Architecture

- **Framework-free.** Vanilla HTML, CSS custom properties, plain ES module-free JS. Zero build step.
- **Design tokens** in `css/styles.css` (`:root`), with `[data-theme="dark"]` and `[data-theme="contrast"]`
  variants for accessibility. Font-scale and motion-reduction set via the floating
  accessibility FAB on every page.
- **Shared chrome** (utility bar, header, mobile drawer, footer, accessibility FAB) is injected
  by `js/partials.js`. The homepage inlines them for SEO; every other page uses placeholders.
- **Shared behaviors** in `js/main.js`:
  - persisted user prefs (theme / font-scale / motion)
  - mobile drawer + header dropdowns
  - countdown timers (`[data-end]` + `data-variant`)
  - watchlist (localStorage) with badge count in header
  - listing filter / search / view-toggle
  - tabs, bid form, simulated war-room bid feed
  - SVG sparklines (`<svg class="spark" data-values="…">`)
  - 4-step auth flow

## Brand language

- **Type:** Playfair Display (serif headings — heritage), Inter (UI), JetBrains Mono (data)
- **Palette:** Ink navy `#0c1320`, cream `#f4ede0`, brass/gold `#b6893a` accent, deep auction
  burgundy `#7a1f24` for live bid states, teal for traditional listings
- **Motifs:** thin gold rule lines, paddle pads, soft-close countdown clocks, tabular numbers,
  five-cell pressure strips

## Accessibility

- WCAG 2.2 AA target.
- User-toggleable: light / dark / high-contrast theme; standard / large / XL / XXL font scale;
  standard / reduced motion. All persist per device via `localStorage`.
- Semantic landmarks; ARIA on nav dropdowns, tabs, accordions, view-toggles.
- Keyboard-first focus styling.
- Soft-pulse animations respect `data-motion="reduced"`.

## Asset notes

Hero/listing imagery uses [picsum.photos](https://picsum.photos) deterministic seeds for the demo.
Hero video references a Google CDN sample MP4. In production, replace with brand-shot video and
imagery.
