/* ===================================================================
   CATES RENDER — DOM helpers driven by Cates engine
   =================================================================== */
(function (root) {
  const C = root.Cates;
  if (!C) return;

  const heart = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  const pin   = `<span aria-hidden="true">📍</span>`;
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

  function specsHtml(lot) {
    const s = lot.specs || {};
    const cells = [];
    if (s.bd != null)    cells.push(`<span><strong>${s.bd}</strong> bd</span>`);
    if (s.ba != null)    cells.push(`<span><strong>${s.ba}</strong> ba</span>`);
    if (s.sqft != null)  cells.push(`<span><strong>${s.sqft.toLocaleString()}</strong> sqft</span>`);
    if (s.ac != null)    cells.push(`<span><strong>${s.ac}</strong> ac</span>`);
    if (s.tracts != null)   cells.push(`<span><strong>${s.tracts}</strong> tracts</span>`);
    if (s.tillable != null) cells.push(`<span><strong>${s.tillable}</strong> tillable</span>`);
    if (s.homesites != null)cells.push(`<span><strong>${s.homesites}</strong> homesites</span>`);
    if (s.frontage)         cells.push(`<span><strong>${s.frontage}</strong></span>`);
    if (s.keys)             cells.push(`<span><strong>${s.keys}</strong> keys</span>`);
    if (s.NOI)              cells.push(`<span><strong>${s.NOI}</strong> NOI</span>`);
    if (s.cap)              cells.push(`<span><strong>${s.cap}</strong> cap</span>`);
    if (s.units)            cells.push(`<span><strong>${s.units}</strong> units</span>`);
    if (s.lots)             cells.push(`<span><strong>${s.lots}</strong> lots</span>`);
    if (s.appraised)        cells.push(`<span><strong>${s.appraised}</strong> appraised</span>`);
    if (s.cars)             cells.push(`<span><strong>${s.cars}</strong> cars</span>`);
    if (s.era)              cells.push(`<span><strong>${s.era}</strong></span>`);
    if (s.tractors)         cells.push(`<span><strong>${s.tractors}</strong> tractors</span>`);
    if (s.timber)           cells.push(`<span><strong>${s.timber}</strong> timber</span>`);
    if (s.creeks)           cells.push(`<span><strong>${s.creeks}</strong> creeks</span>`);
    if (s.stalls)           cells.push(`<span><strong>${s.stalls}</strong> stalls</span>`);
    if (s.homes)            cells.push(`<span><strong>${s.homes}</strong> homes</span>`);
    return cells.slice(0, 4).join("");
  }

  function statusTags(lot) {
    const tags = [];
    const a = lot.auction;
    if (a) {
      if (a.status === "live")     tags.push(`<span class="tag tag--live">Live Auction</span>`);
      if (a.status === "upcoming") tags.push(`<span class="tag tag--upcoming">Upcoming</span>`);
      if (a.status === "closed")   tags.push(`<span class="tag tag--sold">Sold</span>`);
    } else {
      tags.push(`<span class="tag tag--new">Traditional</span>`);
    }
    if (lot.featured)            tags.push(`<span class="tag tag--featured">Featured</span>`);
    if ((lot.tags || []).includes("absolute")) tags.push(`<span class="tag tag--hot">Absolute</span>`);
    return tags.join("");
  }

  function priceRow(lot) {
    if (lot.auction) {
      const a = lot.auction;
      if (a.status === "upcoming") {
        return `<div class="price-row">
          <div><span class="label">Reserve</span><br><span class="val">${a.reserve ? C.fmt.money(a.reserve) : "Absolute"}</span></div>
          <span class="bids">Pre-bid open</span>
        </div>`;
      }
      const label = a.status === "closed" ? "Hammer" : "Current Bid";
      return `<div class="price-row">
        <div><span class="label">${label}</span><br><span class="val" data-current-bid="${lot.id}">${C.fmt.money(a.currentBid || a.startingBid)}</span></div>
        <span class="bids" data-bid-count="${lot.id}">${a.bidCount} bids · ${a.watchers.toLocaleString()} watching</span>
      </div>`;
    } else {
      return `<div class="price-row">
        <div><span class="label">Asking</span><br><span class="val">${C.fmt.money(lot.listing.askingPrice)}</span></div>
        <span class="bids">Traditional listing</span>
      </div>`;
    }
  }

  function countdownChip(lot) {
    const a = lot.auction;
    if (!a || a.status === "closed") return "";
    const lbl = a.status === "upcoming" ? "Opens in" : "Closes in";
    const target = a.status === "upcoming" ? a.opensAt : a.closesAt;
    return `<div class="countdown">
      <span class="pulse"></span>
      <span class="lbl">${lbl}</span>
      <span class="clock mono" data-end="${target}" data-variant="compact">—</span>
    </div>`;
  }

  function card(lot, opts = {}) {
    const liked = C.isWatching(lot.id);
    const cls = lot.auction ? "is-auction" : "is-traditional";
    return `
      <article class="card ${cls}" data-lot="${lot.id}" data-type="${lot.type}" data-sale="${lot.sale}" data-tags="${(lot.tags||[]).join(' ')}">
        <a class="media" href="listing.html?lot=${lot.id}">
          <img src="${esc(lot.heroImg)}" alt="${esc(lot.title)}">
          <div class="tags">${statusTags(lot)}</div>
          <button class="like" data-id="${lot.id}" aria-pressed="${liked ? "true" : "false"}" aria-label="Watchlist">${heart}</button>
          ${countdownChip(lot)}
        </a>
        <div class="body">
          <div class="head">
            <div>
              <h3 class="title">${esc(lot.title)}</h3>
              <span class="loc">${pin} ${esc(lot.location)}</span>
            </div>
          </div>
          <div class="specs">${specsHtml(lot)}</div>
          ${priceRow(lot)}
        </div>
      </article>`;
  }

  function renderGrid(target, lots, opts = {}) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    el.innerHTML = lots.map(l => card(l, opts)).join("");
    const cnt = document.querySelector("[data-result-count]");
    if (cnt) cnt.textContent = lots.length;
  }

  function bidHistoryRow(h, isMine) {
    return `<div class="bid-row ${isMine ? "mine" : ""}">
      <span class="pad">${esc(h.paddle)}</span>
      <span class="who">${esc(h.name)}${isMine ? " (you)" : ""}</span>
      <span class="amt">${C.fmt.money(h.amount)}</span>
      <span class="at">${C.fmt.ago(h.ts)}</span>
    </div>`;
  }

  function notificationItem(n) {
    const sevColor = { warn:"var(--burgundy)", success:"var(--success)" }[n.severity] || "var(--gold)";
    const sevBg = { warn:"rgba(166,58,58,.05)", success:"rgba(47,122,85,.05)" }[n.severity] || "rgba(180,135,57,.05)";
    return `<li data-notif="${n.id}" style="padding:10px 12px; border-left:3px solid ${sevColor}; background:${sevBg}; border-radius:0 6px 6px 0; opacity:${n.read ? .6 : 1};">
      <strong>${esc(n.message)}</strong>
      <div class="muted" style="font-size:.82rem">${C.fmt.ago(n.ts)}${n.lotId ? ` · <a href="listing.html?lot=${n.lotId}">view lot</a>` : ""}</div>
    </li>`;
  }

  function invoiceRow(inv) {
    const status = inv.status === "paid" ? `<span class="bid-status win">Paid</span>` :
      inv.status === "pending" ? `<span class="bid-status watch">Wire pending</span>` :
      `<span class="bid-status">${esc(inv.status)}</span>`;
    const pay = inv.status === "paid" ? `<a href="#" class="btn btn--ghost btn--sm" data-print-invoice="${inv.id}">PDF</a>`
                                      : `<a href="#" class="btn btn--gold btn--sm" data-pay-invoice="${inv.id}">Pay now</a>`;
    return `<tr>
      <td class="mono">${esc(inv.id)}</td>
      <td>${esc(inv.lotName)}</td>
      <td class="mono">${C.fmt.money(inv.total)}</td>
      <td>${status}</td>
      <td>${new Date(inv.date).toLocaleDateString()}</td>
      <td>${pay}</td>
    </tr>`;
  }

  /* ---------- Activity ticker (a thin band that any page can host) ---------- */
  function renderActivityBar(target) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    const acts = C.activity().slice(0, 6);
    el.innerHTML = acts.map(a => {
      if (a.type === "bid") {
        const lot = C.lot(a.lotId);
        return `<span class="act"><span class="pad">#${esc(a.paddle)}</span> ${esc(a.name)} bid <strong>${C.fmt.money(a.amount)}</strong> on <a href="listing.html?lot=${a.lotId}">${esc((lot && lot.title) || a.lotId)}</a></span>`;
      }
      if (a.type === "extend") return `<span class="act">⏰ ${esc(a.message)}</span>`;
      if (a.type === "broadcast") return `<span class="act">📡 Auctioneer: ${esc(a.message)}</span>`;
      return `<span class="act">${esc(a.message || a.type)}</span>`;
    }).join('<span class="dot">·</span>');
  }

  /* ---------- Update only the dynamic bits across already-rendered cards ---------- */
  function updateLotEverywhere(lot) {
    // Update current-bid value in any card or panel for this lot
    document.querySelectorAll(`[data-current-bid="${lot.id}"]`).forEach(el => {
      el.textContent = C.fmt.money(lot.auction.currentBid || lot.auction.startingBid);
    });
    document.querySelectorAll(`[data-bid-count="${lot.id}"]`).forEach(el => {
      el.textContent = `${lot.auction.bidCount} bids · ${lot.auction.watchers.toLocaleString()} watching`;
    });
  }

  /* ---------- Header chrome: auth + counts ---------- */
  function syncHeader() {
    const u = C.user();
    document.querySelectorAll("[data-watch-count]").forEach(el => {
      const c = u.watchlist.length;
      el.textContent = c;
      el.style.display = c ? "" : "none";
    });
    document.querySelectorAll("[data-notif-count]").forEach(el => {
      const c = C.unreadCount();
      el.textContent = c;
      el.style.display = c ? "" : "none";
    });
    document.querySelectorAll("[data-auth-area]").forEach(el => {
      if (u.isAuthed) {
        el.innerHTML = `
          <a href="dashboard.html" class="btn btn--ghost btn--sm" title="Account">
            <span style="display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--gold-2),var(--burgundy));color:white;font-size:.7rem;font-weight:700;margin-right:6px">${esc((u.name||"U")[0])}</span>
            ${esc(u.name)} · #${esc(u.paddle)}
          </a>
          <button class="btn btn--ghost btn--sm" data-signout>Sign out</button>`;
      } else {
        el.innerHTML = `
          <a href="dashboard.html" class="btn btn--ghost btn--sm">My Account</a>
          <a href="signin.html#register" class="btn btn--gold btn--sm">Register to Bid</a>`;
      }
    });

    // KYC pill on bid box
    document.querySelectorAll("[data-kyc-area]").forEach(el => {
      const k = u.kyc;
      el.innerHTML = `
        <div style="font-size:.85rem; color: var(--text-soft); display:flex; justify-content:space-between"><span>${k.idVerified ? "✅" : "○"} Identity verified</span><span class="muted">step 1/4</span></div>
        <div style="font-size:.85rem; color: var(--text-soft); display:flex; justify-content:space-between"><span>${k.fundsVerified ? "✅" : "○"} Proof of funds on file</span><span class="muted">step 2/4</span></div>
        <div style="font-size:.85rem; color: var(--text-soft); display:flex; justify-content:space-between"><span>${k.signed ? "✅" : "○"} Sign T&amp;C and PSA</span><span class="muted">step 3/4</span></div>
        <div style="font-size:.85rem; color: var(--text-soft); display:flex; justify-content:space-between"><span>${u.isAuthed ? "✅" : "○"} Registered &amp; verified</span><span class="muted">step 4/4</span></div>
        ${u.isAuthed && k.idVerified && k.fundsVerified
          ? `<div class="btn btn--gold btn--block" style="text-align:center; pointer-events:none; opacity:.7">Paddle #${esc(u.paddle)} active</div>`
          : `<a href="signin.html#register" class="btn btn--gold btn--block">Activate paddle</a>`}`;
    });
  }

  /* ---------- Public ---------- */
  root.CatesRender = {
    card, renderGrid,
    bidHistoryRow, notificationItem, invoiceRow,
    renderActivityBar, updateLotEverywhere,
    syncHeader, esc
  };
})(window);
