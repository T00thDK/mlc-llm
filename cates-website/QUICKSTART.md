# QUICKSTART — view the Cates demo

The demo is a static site (HTML + CSS + vanilla JS, zero build step). It will **not** work if you double-click `index.html` — browsers block the Google Fonts and image CDNs under the `file://` protocol. You need any web server. Pick one:

---

## Option 1 — Local (fastest, ~30 seconds)

From inside `cates-website/`:

```bash
./serve.sh
```

Then open **http://localhost:8000**.

The script auto-detects python3 / python / node / ruby / php — whichever you have.

---

## Option 2 — Netlify drop (shareable URL, ~2 minutes, free)

1. In a Finder/Explorer window, zip the entire `cates-website/` folder.
2. Open **https://app.netlify.com/drop** in your browser.
3. Drag the zip onto the page.
4. Netlify gives you a URL like `https://cates-demo-a8c2.netlify.app` — share that with Bobby, Jordan, family.

`netlify.toml` is already configured for caching, security headers, and pretty URLs (`/auctions/lot-1041` works).

---

## Option 3 — Vercel CLI (per-branch preview URLs, ~3 minutes, free)

From inside `cates-website/`:

```bash
npx vercel
```

Follow the prompts (link to your Vercel account, accept the defaults). Get a URL like `https://cates-demo-abc123.vercel.app`.

`vercel.json` is already configured.

For automatic preview URLs on every push, instead run:

```bash
npx vercel link
git push  # triggers a preview deploy
```

---

## Option 4 — GitHub Pages (long-term staging)

Requires a one-time GitHub Actions workflow. If you want this path, just tell me and I'll add `.github/workflows/cates-pages.yml` — it'll publish `cates-website/` to a `gh-pages-cates` branch on every push, served at `https://t00thdk.github.io/mlc-llm/cates/`.

---

## What to try once it's loaded

The site is a working MVP, not a mockup:

1. **Browse** — heart a card on the homepage. The badge in the header increments.
2. **Sign in** — click "My Account" → on the dashboard, click "Sign in as demo bidder" (loads Eleanor Whitford, paddle #427).
3. **Bid** — open any "Live Auction" card → place a bid. Watch the current bid update everywhere.
4. **Watch the simulator** — leave the page open for ~30 seconds. Competing bidders place bids automatically on live lots.
5. **Auctioneer view** — open `warroom.html` → type a broadcast → click Send → check the dashboard's Notifications panel.
6. **Cross-tab** — open `listing.html?lot=lot-1041` in two tabs, bid in one, watch the other update.
7. **Accessibility** — click the round FAB in the lower-left to switch theme, font size, motion.

---

## Architecture & charter

- `README.md` — design system + architecture overview
- `PROJECT-CHARTER.md` — full project charter & SOW (added separately if you want it in-repo)
- `js/cates-engine.js` — client-side MVP backend (catalog, user, auctions, pub/sub)
- `js/cates-render.js` — DOM render helpers
- `js/main.js` — page wiring
- `js/partials.js` — shared chrome injector
- `css/styles.css` — design tokens + components
