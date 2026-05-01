/* ===================================================================
   Shared chrome injector — utility bar, header, drawer, footer, a11y
   Used by every page except index.html (which has them inlined for SEO)
   =================================================================== */

const CHROME_HEAD = `
<div class="utility-bar">
  <div class="container">
    <div class="left">
      <span class="pill"><span class="live-dot"></span> LIVE</span>
      <span class="activity-ticker" data-activity-bar></span>
    </div>
    <div class="right">
      <a href="tel:18005552837">1-800-555-CATES</a>
      <a href="warroom.html">War Room</a>
      <a href="learn.html">How auctions work</a>
      <a href="signin.html">Sign in</a>
    </div>
  </div>
</div>

<header class="site-header">
  <div class="container header-row">
    <a class="brand" href="index.html" aria-label="Cates home">
      <span class="mark">C</span>
      <span class="name">Cates<small>Real Estate &amp; Auction · Est. 1942</small></span>
    </a>
    <nav class="primary-nav" aria-label="Primary">
      <ul>
        <li class="has-dropdown" aria-expanded="false">
          <button class="nav-trigger" aria-haspopup="true">Auctions</button>
          <div class="dropdown" role="menu">
            <a href="auctions.html?cat=real-estate"><span class="dd-title">Real Estate Auctions</span><span class="dd-sub">Residential · Land &amp; Farms · Commercial · Luxury</span></a>
            <a href="auctions.html?cat=estate"><span class="dd-title">Estate Services &amp; Downsizing</span><span class="dd-sub">Antiques · Luxury · Vehicles · Equipment</span></a>
            <a href="auctions.html?status=live"><span class="dd-title">Bidding Now</span><span class="dd-sub">All live and time-definite events</span></a>
            <a href="auctions.html?status=upcoming"><span class="dd-title">Upcoming</span><span class="dd-sub">Calendar of scheduled auctions</span></a>
            <a href="auctions.html?status=past"><span class="dd-title">Sold &amp; Results</span><span class="dd-sub">Trade-range and outcome archive</span></a>
            <a href="warroom.html"><span class="dd-title">Auctioneer War Room</span><span class="dd-sub">Live operator console (staff)</span></a>
          </div>
        </li>
        <li class="has-dropdown" aria-expanded="false">
          <button class="nav-trigger" aria-haspopup="true">Services</button>
          <div class="dropdown" role="menu">
            <a href="services.html#residential"><span class="dd-title">Residential Real Estate</span><span class="dd-sub">Average homes to lakefront &amp; luxury</span></a>
            <a href="services.html#land"><span class="dd-title">Land &amp; Farms</span><span class="dd-sub">Acreage, timber, agricultural</span></a>
            <a href="services.html#commercial"><span class="dd-title">Commercial &amp; Hotels</span><span class="dd-sub">Income property &amp; hospitality</span></a>
            <a href="services.html#estate"><span class="dd-title">Cates Estate Services</span><span class="dd-sub">Antiques, luxury goods, vehicles, equipment</span></a>
            <a href="services.html#downsizing"><span class="dd-title">Cates Downsizing</span><span class="dd-sub">Valuation → sale → move-in: one-stop</span></a>
            <a href="services.html#contents"><span class="dd-title">Contents of Home</span><span class="dd-sub">Full personal property dispositions</span></a>
          </div>
        </li>
        <li><a href="buyers.html">Buyers</a></li>
        <li><a href="sellers.html">Sellers</a></li>
        <li><a href="agents.html">Agents</a></li>
        <li><a href="gallery.html">Gallery</a></li>
        <li><a href="blog.html">Insights</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <button class="icon-btn" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      </button>
      <a href="dashboard.html#notifications" class="icon-btn" aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        <span class="badge" data-notif-count>0</span>
      </a>
      <a href="dashboard.html#watchlist" class="icon-btn" aria-label="Watchlist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span class="badge" data-watch-count>0</span>
      </a>
      <span data-auth-area class="cluster" style="gap:.5rem">
        <a href="dashboard.html" class="btn btn--ghost btn--sm">My Account</a>
        <a href="signin.html#register" class="btn btn--gold btn--sm">Register to Bid</a>
      </span>
      <button class="icon-btn mobile-only" data-open-drawer aria-label="Menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
</header>

<div class="drawer" id="mobileDrawer" aria-hidden="true">
  <div class="drawer-inner">
    <button class="icon-btn" data-close-drawer aria-label="Close" style="margin-left:auto">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <span class="group-h">Auctions</span>
    <a href="auctions.html?cat=real-estate">Real Estate Auctions</a>
    <a href="auctions.html?cat=estate">Estate Services &amp; Downsizing</a>
    <a href="auctions.html?status=live">Bidding Now</a>
    <span class="group-h">Services</span>
    <a href="services.html#residential">Residential</a>
    <a href="services.html#land">Land &amp; Farms</a>
    <a href="services.html#commercial">Commercial &amp; Hotels</a>
    <a href="services.html#estate">Cates Estate Services</a>
    <a href="services.html#downsizing">Cates Downsizing</a>
    <span class="group-h">Company</span>
    <a href="buyers.html">Buyers</a>
    <a href="sellers.html">Sellers</a>
    <a href="agents.html">Agents</a>
    <a href="gallery.html">Gallery</a>
    <a href="blog.html">Insights</a>
    <a href="about.html">About</a>
    <a href="faq.html">FAQ</a>
    <a href="signin.html" class="btn btn--gold" style="margin-top:1rem">Sign in / Register</a>
  </div>
</div>
`;

const CHROME_FOOT = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <a class="brand" href="index.html" style="color:white">
          <span class="mark">C</span>
          <span class="name" style="color:white">Cates<small>Real Estate &amp; Auction · Est. 1942</small></span>
        </a>
        <p>Award-winning marketing. Brokerage-grade representation. Time-definite auction technology. Four generations and counting.</p>
        <div class="socials" aria-label="Follow us">
          <a href="#" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9V15h-2.5v-3h2.5V9.8c0-2.5 1.5-3.8 3.7-3.8 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 3h-2.3v6.9A10 10 0 0 0 22 12z"/></svg></a>
          <a href="#" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
          <a href="#" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v16H4zM6 2.5A2.5 2.5 0 1 1 6 7.5a2.5 2.5 0 0 1 0-5zM10 8h4v2.2c.6-1 2-2.4 4.3-2.4 4.6 0 5.4 3 5.4 6.9V20h-4v-4.6c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V20h-4z"/></svg></a>
          <a href="#" aria-label="YouTube"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7.2s-.2-1.5-.8-2.1c-.7-.8-1.6-.8-2-.9C16.3 4 12 4 12 4s-4.3 0-7.2.2c-.4.1-1.3.1-2 .9C2.2 5.7 2 7.2 2 7.2S1.8 9 1.8 10.7v1.5C1.8 14 2 15.7 2 15.7s.2 1.5.8 2.1c.7.8 1.7.8 2.1.9 1.5.1 6.4.2 6.4.2s4.3 0 7.2-.2c.4-.1 1.3-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.5v-1.5c0-1.7-.2-3.5-.2-3.5zM10 14.4V8l5.5 3.2L10 14.4z"/></svg></a>
          <a href="#" aria-label="TikTok"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 8.3c-1.7 0-3.3-.7-4.5-1.9v8.5a5.6 5.6 0 1 1-5.6-5.6c.4 0 .7 0 1.1.1V12a3.2 3.2 0 1 0 2.2 3V2h2.4c.2 1.4.9 2.7 2 3.6 1 .9 2.4 1.4 3.8 1.4v2.5z"/></svg></a>
          <a href="#" aria-label="X"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 2H22l-7.5 8.6L23 22h-7l-5.4-7-6.2 7H1l8-9.2L1 2h7.2l4.9 6.5L18.3 2zm-1.2 18h2L7 4H5l12.1 16z"/></svg></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Auctions</h4>
        <ul>
          <li><a href="auctions.html?cat=real-estate">Real Estate Auctions</a></li>
          <li><a href="auctions.html?cat=estate">Estate Auctions</a></li>
          <li><a href="auctions.html?status=live">Bidding Now</a></li>
          <li><a href="auctions.html?status=upcoming">Upcoming</a></li>
          <li><a href="auctions.html?status=past">Sold &amp; Results</a></li>
          <li><a href="learn.html">How auctions work</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <ul>
          <li><a href="services.html#residential">Residential</a></li>
          <li><a href="services.html#land">Land &amp; Farms</a></li>
          <li><a href="services.html#luxury">Lakefront &amp; Luxury</a></li>
          <li><a href="services.html#commercial">Commercial &amp; Hotels</a></li>
          <li><a href="services.html#estate">Cates Estate Services</a></li>
          <li><a href="services.html#downsizing">Cates Downsizing</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About</a></li>
          <li><a href="agents.html">Agents</a></li>
          <li><a href="buyers.html">Buyers</a></li>
          <li><a href="sellers.html">Sellers</a></li>
          <li><a href="gallery.html">Gallery</a></li>
          <li><a href="blog.html">Insights</a></li>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="learn.html">Learn / Wiki</a></li>
        </ul>
        <div style="margin-top:1.25rem; font-size:.85rem; color:rgba(255,255,255,.78)">
          <strong style="color:var(--gold-2);display:block;margin-bottom:4px">Cates HQ</strong>
          221 Heritage Square<br>Cookeville, TN 38501<br>
          <a href="tel:18005552837">1-800-555-CATES</a><br>
          <a href="tel:19315552837">+1 (931) 555-2837</a>
        </div>
      </div>
      <div class="footer-col">
        <div class="valuation">
          <div class="title"><strong>Real-Time Valuation</strong></div>
          <form class="form" onsubmit="event.preventDefault();">
            <input type="text" placeholder="Property address or APN" aria-label="Property address">
            <button class="btn btn--gold btn--sm" type="submit">Value</button>
          </form>
          <div class="sources">Blended from <strong>5 sources:</strong> CoreLogic · ATTOM · Black Knight · Zillow · Cates Deep-Learner</div>
        </div>
        <div class="newsletter" style="margin-top:1rem">
          <h4 style="margin-bottom:.5rem">Newsletter</h4>
          <form onsubmit="event.preventDefault();">
            <input type="email" placeholder="you@example.com" aria-label="Email">
            <div class="checks">
              <label><input type="checkbox" checked> Auctions alerts</label>
              <label><input type="checkbox" checked> Market intelligence</label>
              <label><input type="checkbox"> Estate &amp; downsizing</label>
              <label><input type="checkbox"> Agent updates</label>
            </div>
            <button class="btn btn--gold btn--sm btn--block" type="submit" style="margin-top:.65rem">Subscribe</button>
          </form>
        </div>
        <div class="app-buttons">
          <a class="app-btn" href="#"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.5c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3.1-2-3.7-2-1.6-.2-3 .9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6s1.7-.8 3.3-.8 1.9.8 3.3.8c1.4 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8z"/></svg><span class="lbl"><small>Download on the</small><b>App Store</b></span></a>
          <a class="app-btn" href="#"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.6 1.7C3.2 2.1 3 2.7 3 3.5v17c0 .8.2 1.4.6 1.8l11-11-11-9.6z"/></svg><span class="lbl"><small>Get it on</small><b>Google Play</b></span></a>
        </div>
      </div>
    </div>
    <div class="freemium">
      <a class="freemium-card" href="#"><span class="ico">📋</span><span class="nm">Buyer's pre-bid checklist</span><span class="ds">8 things every bidder should do</span><span class="dl">Download PDF →</span></a>
      <a class="freemium-card" href="#"><span class="ico">🏷️</span><span class="nm">Seller pricing tiers</span><span class="ds">Auction vs traditional</span><span class="dl">Download PDF →</span></a>
      <a class="freemium-card" href="#"><span class="ico">📦</span><span class="nm">The downsizing playbook</span><span class="ds">14 steps, valuation → move-in</span><span class="dl">Download PDF →</span></a>
      <a class="freemium-card" href="#"><span class="ico">📈</span><span class="nm">Quarterly trade ranges</span><span class="ds">Where every market clears</span><span class="dl">Download PDF →</span></a>
      <a class="freemium-card" href="#"><span class="ico">🏛️</span><span class="nm">Estate inventory template</span><span class="ds">XLSX + photo guide</span><span class="dl">Download XLSX →</span></a>
      <a class="freemium-card" href="#"><span class="ico">🏘️</span><span class="nm">Auction marketing brief</span><span class="ds">Award-winning campaign anatomy</span><span class="dl">Download PDF →</span></a>
    </div>
    <div class="footer-meta">
      <div>© 1942–2026 Cates Real Estate &amp; Auction Company. All rights reserved. Licensed in TN, KY, NC, GA, AL, MS, VA, SC. Equal Housing Opportunity. Firm License #00012947.</div>
      <div><a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Cookies</a> · <a href="#">Accessibility</a></div>
    </div>
  </div>
</footer>

<button class="a11y-fab" aria-label="Display preferences">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><path d="M5 9l7 1 7-1M9 22l3-9 3 9M12 10v3"/></svg>
</button>
<div class="a11y-panel" role="dialog" aria-label="Display preferences">
  <h4>Theme</h4>
  <div class="row">
    <button data-pref="theme" data-val="">Light</button>
    <button data-pref="theme" data-val="dark">Dark</button>
    <button data-pref="theme" data-val="contrast">Contrast</button>
  </div>
  <h4>Text size</h4>
  <div class="row">
    <button data-pref="fontscale" data-val="">Standard</button>
    <button data-pref="fontscale" data-val="lg">Large</button>
    <button data-pref="fontscale" data-val="xl">XL</button>
    <button data-pref="fontscale" data-val="xxl">XXL</button>
  </div>
  <h4>Motion</h4>
  <div class="row">
    <button data-pref="motion" data-val="">Standard</button>
    <button data-pref="motion" data-val="reduced">Reduced</button>
  </div>
</div>
`;

// Inject synchronously so main.js (loaded after) can bind to the rendered nodes.
(function injectChrome() {
  const head = document.querySelector("[data-chrome-head]");
  if (head) head.outerHTML = CHROME_HEAD;
  const foot = document.querySelector("[data-chrome-foot]");
  if (foot) foot.outerHTML = CHROME_FOOT;
})();
