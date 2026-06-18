/* ===================================================================
   CATES — Page wiring (consumes Cates engine + CatesRender)
   =================================================================== */
(function () {
  const C  = window.Cates;
  const R  = window.CatesRender;

  /* ---------- Accessibility prefs ---------- */
  const prefs = {
    get: () => { try { return JSON.parse(localStorage.getItem("cates.prefs") || "{}"); } catch { return {}; } },
    set: (k, v) => { const p = prefs.get(); p[k] = v; localStorage.setItem("cates.prefs", JSON.stringify(p)); apply(p); }
  };
  function apply(p) {
    document.documentElement.dataset.theme     = p.theme     || "";
    document.documentElement.dataset.fontscale = p.fontscale || "";
    document.documentElement.dataset.motion    = p.motion    || "";
  }
  apply(prefs.get());

  function $(s, root=document) { return root.querySelector(s); }
  function $$(s, root=document) { return Array.from(root.querySelectorAll(s)); }
  function qs(name) { return new URLSearchParams(location.search).get(name); }

  /* =================================================================
     COUNTDOWN TICK
     ================================================================= */
  function tickCountdowns() {
    $$("[data-end]").forEach(el => {
      const end = new Date(el.dataset.end).getTime();
      const ms = end - Date.now();
      const variant = el.dataset.variant || "compact";
      if (ms <= 0) {
        el.textContent = "closed";
        el.classList.add("is-over");
        return;
      }
      const sec = Math.floor(ms/1000);
      const d = Math.floor(sec/86400);
      const h = String(Math.floor((sec%86400)/3600)).padStart(2,"0");
      const m = String(Math.floor((sec%3600)/60)).padStart(2,"0");
      const s = String(sec%60).padStart(2,"0");
      if (variant === "compact") {
        el.textContent = (d ? `${d}d ` : "") + `${h}:${m}:${s}`;
      } else {
        el.innerHTML = `<span>${d}<small>d</small></span> <span>${h}<small>h</small></span> <span>${m}<small>m</small></span> <span>${s}<small>s</small></span>`;
      }
    });
  }
  setInterval(tickCountdowns, 1000);

  /* =================================================================
     SPARKLINES
     ================================================================= */
  function paintSparklines() {
    $$("svg.spark").forEach(svg => {
      if (svg.dataset.painted === "1") return;
      const data = (svg.dataset.values || "").split(",").map(Number).filter(Number.isFinite);
      if (!data.length) return;
      const w = svg.clientWidth || 240, h = svg.clientHeight || 60, pad = 2;
      const min = Math.min(...data), max = Math.max(...data);
      const span = max - min || 1;
      const pts = data.map((v,i) => {
        const x = pad + (i*(w-pad*2))/(Math.max(1,data.length-1));
        const y = h - pad - ((v-min)/span)*(h-pad*2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.innerHTML =
        `<polyline fill="rgba(212,162,74,0.12)" stroke="none" points="${pad},${h-pad} ${pts} ${w-pad},${h-pad}"/>` +
        `<polyline fill="none" stroke="#b6893a" stroke-width="2" points="${pts}"/>`;
      svg.dataset.painted = "1";
    });
  }

  /* =================================================================
     GLOBAL: header / watchlist / sign-out / live banner
     ================================================================= */
  function refreshAll() {
    R.syncHeader();
    paintSparklines();
    R.renderActivityBar("[data-activity-bar]");
  }

  document.addEventListener("click", (e) => {
    // mobile drawer
    if (e.target.closest("[data-open-drawer]")) {
      $("#mobileDrawer")?.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    if (e.target.matches(".drawer") || e.target.closest("[data-close-drawer]")) {
      $("#mobileDrawer")?.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    // watchlist heart
    const heart = e.target.closest(".like");
    if (heart) {
      e.preventDefault(); e.stopPropagation();
      const id = heart.dataset.id;
      const watching = C.toggleWatch(id);
      $$(`.like[data-id="${id}"]`).forEach(b => {
        b.classList.toggle("is-liked", watching);
        b.setAttribute("aria-pressed", watching ? "true" : "false");
      });
    }

    // sign out
    if (e.target.closest("[data-signout]")) {
      C.signOut();
      location.reload();
    }

    // header dropdown trigger
    const trig = e.target.closest(".has-dropdown .nav-trigger");
    if (trig) {
      e.preventDefault();
      const li = trig.closest(".has-dropdown");
      const open = li.getAttribute("aria-expanded") === "true";
      $$(".has-dropdown[aria-expanded='true']").forEach(o => o.setAttribute("aria-expanded","false"));
      li.setAttribute("aria-expanded", open ? "false" : "true");
    } else if (!e.target.closest(".has-dropdown")) {
      $$(".has-dropdown[aria-expanded='true']").forEach(o => o.setAttribute("aria-expanded","false"));
    }

    // a11y panel toggle
    if (e.target.closest(".a11y-fab")) {
      $(".a11y-panel")?.classList.toggle("is-open");
    }
    const prefBtn = e.target.closest("[data-pref]");
    if (prefBtn) {
      const k = prefBtn.dataset.pref, v = prefBtn.dataset.val;
      prefs.set(k, v);
      prefBtn.parentElement.querySelectorAll("button")
        .forEach(b => b.setAttribute("aria-pressed", b === prefBtn ? "true" : "false"));
    }

    // pay invoice / mark notification read
    const pay = e.target.closest("[data-pay-invoice]");
    if (pay) { e.preventDefault(); C.payInvoice(pay.dataset.payInvoice); }
    const ackAll = e.target.closest("[data-notif-ack-all]");
    if (ackAll) { e.preventDefault(); C.markAllNotificationsRead(); }
    const reset = e.target.closest("[data-demo-reset]");
    if (reset) {
      e.preventDefault();
      if (confirm("Reset the demo state? This clears your bids, watchlist, invoices, and notifications on this device.")) {
        C.reset(); location.reload();
      }
    }
  });

  // Engine subscriptions
  C.on("user:authed",      refreshAll);
  C.on("user:signedout",   refreshAll);
  C.on("user:updated",     refreshAll);
  C.on("watchlist:changed",refreshAll);
  C.on("notification:new", () => { R.syncHeader(); renderNotifPanel(); });
  C.on("notification:read", refreshAll);
  C.on("notification:read-all", refreshAll);
  C.on("activity:new",     () => R.renderActivityBar("[data-activity-bar]"));
  C.on("state:reloaded",   () => location.reload());
  C.on("lot:updated",      (lot) => {
    R.updateLotEverywhere(lot);
    if (location.pathname.endsWith("listing.html") && qs("lot") === lot.id) renderListing(lot);
    if (location.pathname.endsWith("warroom.html")) renderWarRoom();
    if (location.pathname.endsWith("dashboard.html")) renderDashboard();
  });
  C.on("invoice:created",  () => location.pathname.endsWith("dashboard.html") && renderDashboard());
  C.on("invoice:updated",  () => location.pathname.endsWith("dashboard.html") && renderDashboard());

  /* =================================================================
     PAGE: HOMEPAGE
     ================================================================= */
  function renderHome() {
    const grid = $("[data-listing-grid]");
    if (!grid) return;
    const all = C.catalog();
    R.renderGrid(grid, all);
    bindFilter();
    // Hero banner stats
    const liveLots = all.filter(l => l.auction && l.auction.status === "live");
    const watchers = liveLots.reduce((s,l) => s + l.auction.watchers, 0);
    const bidsLastHour = C.state().meta.liveActivity.filter(a => a.type === "bid" && (Date.now() - new Date(a.ts).getTime()) < 3600_000).length + 312; // demo baseline
    const soonest = liveLots.map(l => l.auction.closesAt).sort()[0];
    $("[data-hero-live]")    && ($("[data-hero-live]").textContent    = liveLots.length + " events");
    $("[data-hero-bidders]") && ($("[data-hero-bidders]").textContent = watchers.toLocaleString() + " online");
    $("[data-hero-bidsph]")  && ($("[data-hero-bidsph]").textContent  = bidsLastHour.toLocaleString());
    if (soonest && $("[data-hero-soonest]")) $("[data-hero-soonest]").dataset.end = soonest;
  }

  function bindFilter() {
    const root = $("[data-listing-filter]");
    if (!root) return;
    const grid = $("[data-listing-grid]");
    const state = { type: "all", sale: "all", q: "" };
    function applyFilter() {
      const filtered = C.catalog().filter(lot => {
        if (state.type !== "all" && lot.type !== state.type) return false;
        if (state.sale !== "all" && lot.sale !== state.sale) return false;
        if (state.q) {
          const hay = [lot.title, lot.location, ...(lot.tags||[])].join(" ").toLowerCase();
          if (!hay.includes(state.q.toLowerCase())) return false;
        }
        return true;
      });
      R.renderGrid(grid, filtered);
      paintSparklines();
    }
    root.querySelectorAll("[data-filter='type']").forEach(c => c.addEventListener("click", () => {
      root.querySelectorAll("[data-filter='type']").forEach(x => x.setAttribute("aria-pressed","false"));
      c.setAttribute("aria-pressed","true"); state.type = c.dataset.val; applyFilter();
    }));
    root.querySelectorAll("[data-filter='sale']").forEach(c => c.addEventListener("click", () => {
      root.querySelectorAll("[data-filter='sale']").forEach(x => x.setAttribute("aria-pressed","false"));
      c.setAttribute("aria-pressed","true"); state.sale = c.dataset.val; applyFilter();
    }));
    root.querySelector("input[type='search']")?.addEventListener("input", e => { state.q = e.target.value; applyFilter(); });
    root.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => {
      root.querySelectorAll("[data-view]").forEach(x => x.setAttribute("aria-pressed","false"));
      b.setAttribute("aria-pressed","true");
      grid.classList.toggle("is-list", b.dataset.view === "list");
    }));
  }

  /* =================================================================
     PAGE: LISTING DETAIL
     ================================================================= */
  function renderListing(forceLot) {
    const id = qs("lot") || "lot-1041";
    const lot = forceLot || C.lot(id);
    if (!lot) { $("[data-listing-root]")?.replaceChildren(document.createTextNode("Lot not found.")); return; }

    // Title bar
    $("[data-l-title]")  && ($("[data-l-title]").textContent  = lot.title);
    $("[data-l-loc]")    && ($("[data-l-loc]").textContent    = "📍 " + (lot.address || lot.location));
    $("[data-l-status]") && ($("[data-l-status]").innerHTML   = (lot.auction
        ? `<span class="tag ${lot.auction.status === 'live' ? 'tag--live' : 'tag--upcoming'}">${lot.auction.status === 'live' ? 'Live Auction' : (lot.auction.status === 'upcoming' ? 'Upcoming' : 'Sold')}</span>`
        : `<span class="tag tag--new">Traditional Listing</span>`)
      + ` <span class="tag">Lot #${lot.id.replace("lot-","").toUpperCase()}</span>`);

    // Hero gallery
    const gal = $("[data-l-gallery]");
    if (gal) {
      const imgs = lot.images || [lot.heroImg];
      gal.innerHTML = `
        <div class="g main"><img src="${imgs[0]}" alt=""></div>
        <div class="g"><img src="${imgs[1] || imgs[0]}" alt=""></div>
        <div class="g"><img src="${imgs[2] || imgs[0]}" alt=""></div>
        <div class="g"><img src="${imgs[3] || imgs[0]}" alt=""></div>
        <div class="g"><img src="${imgs[4] || imgs[0]}" alt="">
          <button class="more-btn" type="button">+ ${(lot.images||[]).length || 1} photos · 6 videos</button>
        </div>`;
    }

    // Description / highlights
    $("[data-l-description]") && ($("[data-l-description]").textContent = lot.description || "");
    const hl = $("[data-l-highlights]");
    if (hl) hl.innerHTML = (lot.highlights || []).map(h => `<li>${R.esc(h)}</li>`).join("");

    // Specs
    const sp = $("[data-l-specs]");
    if (sp) {
      const s = lot.specs || {};
      const items = Object.entries(s).map(([k,v]) => `<div class="item"><div class="k">${R.esc(k)}</div><div class="v">${R.esc(v)}</div></div>`);
      sp.innerHTML = items.join("");
    }

    // Bid box
    const bidBox = $("[data-bid-box]");
    if (bidBox) {
      if (!lot.auction) {
        bidBox.innerHTML = `
          <div class="price-line is-current"><div class="label">Asking</div><div class="val">${C.fmt.money(lot.listing.askingPrice)}</div></div>
          <p class="muted">This is a traditional brokerage listing. Submit an offer or schedule a tour with a Cates agent.</p>
          <a href="tel:18005552837" class="btn btn--gold btn--block">📞 Schedule a tour</a>
          <button class="like btn btn--ghost btn--block" data-id="${lot.id}" aria-pressed="${C.isWatching(lot.id) ? 'true' : 'false'}">♡ Watch</button>`;
      } else {
        const a = lot.auction;
        const min = C.nextRequired(lot);
        bidBox.innerHTML = `
          <div class="countdown-lg">
            <div class="lbl">${a.status === 'live' ? 'Auction closes in' : (a.status === 'upcoming' ? 'Bidding opens in' : 'Auction closed')}</div>
            <div class="clock" data-end="${a.status === 'upcoming' ? a.opensAt : a.closesAt}" data-variant="compact">—</div>
            <div class="ends">${new Date(a.closesAt).toLocaleString()} · soft-close 5 min</div>
          </div>
          <div class="price-line is-current"><div class="label">Current bid</div><div class="val" data-current-bid="${lot.id}">${C.fmt.money(a.currentBid || a.startingBid)}</div></div>
          <div class="price-line"><div class="label">Next required</div><div class="val">${C.fmt.money(min)}</div></div>
          <div class="price-line"><div class="label">Cates AVM</div><div class="val">${C.fmt.money(a.avm.median)}</div></div>
          ${a.status === 'live' ? `
          <form class="bid-form" data-bid-form data-lot="${lot.id}">
            <div class="row">
              <input type="number" name="bid" placeholder="${C.fmt.money(min).replace('$','')} min" inputmode="decimal" aria-label="Your bid">
              <button class="btn btn--burgundy" type="submit">Place Bid</button>
            </div>
            <div class="increments">
              <button data-inc="${a.increment}" type="button">+${C.fmt.money(a.increment)}</button>
              <button data-inc="${a.increment*2}" type="button">+${C.fmt.money(a.increment*2)}</button>
              <button data-inc="${a.increment*5}" type="button">+${C.fmt.money(a.increment*5)}</button>
              <button data-inc="${a.increment*10}" type="button">+${C.fmt.money(a.increment*10)}</button>
            </div>
            <label style="font-size:.85rem; color:var(--text-soft); display:flex; gap:8px; align-items:center; padding-top:6px;">
              <input type="checkbox" data-set-max>Set this as my max (proxy bids on my behalf)
            </label>
            <div style="background: var(--cream); border-radius:6px; padding: 10px 12px; font-size: .82rem; color: var(--text-soft);">
              💡 Proxy bidding posts only the next required increment on your behalf, up to your ceiling. Your max is private.
            </div>
          </form>
          ` : ''}
          <div class="bid-meta-row">
            <div class="cell"><div class="v" data-bid-meta-bids>${a.bidCount}</div><div class="k">bids</div></div>
            <div class="cell"><div class="v">${a.paddles}</div><div class="k">paddles</div></div>
            <div class="cell"><div class="v">${a.watchers.toLocaleString()}</div><div class="k">watching</div></div>
          </div>
          <div data-kyc-area style="display:flex; flex-direction:column; gap: 8px; border-top:1px solid var(--line); padding-top:1rem"></div>
          <div style="display:flex; gap:.5rem;">
            <button class="like btn btn--ghost btn--sm btn--block" data-id="${lot.id}" aria-pressed="${C.isWatching(lot.id) ? 'true' : 'false'}" style="flex:1">♡ Watch</button>
          </div>`;
      }
    }

    // Bid history table (Bids tab)
    const hist = $("[data-l-history]");
    if (hist && lot.auction) {
      const rows = (lot.auction.history || []).slice(0, 20).map(h => `
        <tr><td class="mono">${C.fmt.time(h.ts)}</td><td>#${R.esc(h.paddle)}${C.user().isAuthed && h.paddle === C.user().paddle ? " (you)" : ""}</td><td class="mono">${C.fmt.money(h.amount)}</td><td>${R.esc(h.channel)}</td></tr>`).join("");
      hist.innerHTML = rows || `<tr><td colspan="4" class="muted">No bids yet.</td></tr>`;
    }

    // AVM pressure strip
    const press = $("[data-l-pressure]");
    if (press && lot.auction) {
      const a = lot.auction;
      press.innerHTML = `
        <div class="seg"><span class="k">Bid Pressure</span><span class="v" style="color:var(--burgundy)">+${Math.min(99, Math.round((a.bidCount||1)*1.5))}%</span></div>
        <div class="seg"><span class="k">Trade Range</span><span class="v">${C.fmt.money(a.avm.low)} – ${C.fmt.money(a.avm.high)}</span></div>
        <div class="seg"><span class="k">Cates AVM</span><span class="v">${C.fmt.money(a.avm.median)}</span></div>
        <div class="seg"><span class="k">Confidence</span><span class="v" style="color:var(--success)">${a.avm.confidence}%</span></div>
        <div class="seg"><span class="k">Engagement</span><span class="v">${a.watchers.toLocaleString()} watching</span></div>`;
    }

    // Spark
    const spark = $("svg.spark[data-l-spark]");
    if (spark && lot.auction) {
      const hist = (lot.auction.history || []).slice().reverse();
      const vals = hist.length > 1 ? hist.map(h => Math.round(h.amount/1000)) : [
        Math.round(lot.auction.startingBid/1000),
        Math.round(((lot.auction.currentBid||lot.auction.startingBid))/1000)
      ];
      spark.dataset.values = vals.join(",");
      spark.dataset.painted = "0";
      paintSparklines();
    }

    R.syncHeader();
    paintSparklines();
  }

  /* Bid form submit (delegated) */
  document.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-bid-form]");
    if (!form) return;
    e.preventDefault();
    const lotId = form.dataset.lot;
    const lot = C.lot(lotId);
    const input = form.querySelector("input[name='bid']");
    const amount = +input.value;
    if (!C.user().isAuthed || !C.user().kyc.idVerified) {
      if (confirm("You need a paddle to place a bid. Sign in or register now?")) location.href = "signin.html#register";
      return;
    }
    const r = C.placeBid(lotId, amount);
    if (!r.ok) { alert(r.error); return; }
    if (form.querySelector("[data-set-max]")?.checked) C.setMaxBid(lotId, amount);
    input.value = "";
    renderListing(C.lot(lotId));
  });
  document.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-bid-form] [data-inc]");
    if (!inc) return;
    const form = inc.closest("[data-bid-form]");
    const input = form.querySelector("input[name='bid']");
    const lot = C.lot(form.dataset.lot);
    const min = C.nextRequired(lot);
    const incAmt = +inc.dataset.inc;
    const cur = Math.max(+input.value || 0, min - lot.auction.increment);
    input.value = cur + incAmt;
  });

  /* =================================================================
     PAGE: WAR ROOM
     ================================================================= */
  function renderWarRoom() {
    const stage = $("[data-war-stage]");
    if (!stage) return;
    const liveLots = C.catalog().filter(l => l.auction && l.auction.status === "live");
    if (!liveLots.length) {
      stage.innerHTML = `<div class="war-card"><h3>No live auctions right now.</h3><p class="muted">When a lot opens, it will appear here.</p></div>`;
      return;
    }
    const lot = liveLots[0]; const a = lot.auction;
    $("[data-war-title]") && ($("[data-war-title]").textContent = lot.title);
    $("[data-war-loc]")   && ($("[data-war-loc]").textContent = lot.address || lot.location);
    $("[data-war-end]")   && ($("[data-war-end]").dataset.end = a.closesAt);
    $("[data-war-bid]")   && ($("[data-war-bid]").textContent = C.fmt.money(a.currentBid || a.startingBid));
    $("[data-war-next]")  && ($("[data-war-next]").textContent = C.fmt.money(C.nextRequired(lot)));
    $("[data-war-leader]")&& ($("[data-war-leader]").textContent = `Paddle #${a.leaderPaddle || '—'} — ${a.leaderName || '—'}`);

    // Bid feed
    const feed = $("[data-war-feed]");
    if (feed) {
      const rows = (a.history || []).slice(0, 30).map(h => `
        <div class="bid-row">
          <span class="pad">${R.esc(h.paddle)}</span>
          <span class="who">${R.esc(h.name)}</span>
          <span class="amt">${C.fmt.money(h.amount)}</span>
          <span class="at">${C.fmt.time(h.ts)}</span>
        </div>`).join("");
      feed.innerHTML = rows;
    }

    // Bidder list (synthetic from history paddles)
    const blist = $("[data-war-bidders]");
    if (blist) {
      const seen = new Map();
      (a.history || []).forEach(h => { if (!seen.has(h.paddle)) seen.set(h.paddle, h); });
      const items = [...seen.values()].slice(0, 12).map(h => {
        const isLeader = h.paddle === a.leaderPaddle;
        return `<li class="${isLeader ? 'is-leader' : ''} is-online">
          <span class="pad">${R.esc(h.paddle)}</span>
          <div><span class="nm">${R.esc(h.name)}</span><div class="meta">${R.esc(h.channel)} · last bid ${C.fmt.ago(h.ts)}</div></div>
          <span class="max">${isLeader ? "leading" : "·"}</span>
        </li>`;
      }).join("");
      blist.innerHTML = items;
    }

    // Lot queue
    const q = $("[data-war-queue]");
    if (q) {
      q.innerHTML = C.catalog().filter(l => l.auction).slice(0, 8).map((l, i) => {
        const isNow = l.id === lot.id;
        return `<div style="padding:.6rem; border-radius:6px; border:1px solid ${isNow ? 'var(--gold)' : 'rgba(255,255,255,.08)'}; background: ${isNow ? 'rgba(180,135,57,.12)' : 'transparent'}">
          <div class="mono" style="color:${isNow ? 'var(--gold-2)' : 'rgba(255,255,255,.55)'}; font-size:.72rem">${isNow ? 'NOW · ' : ''}${l.id.toUpperCase()}</div>
          <div style="color:white; font-weight:${isNow ? 600 : 400}">${R.esc(l.title)}</div>
          <div class="muted" style="color:rgba(255,255,255,.55); font-size:.78rem">${R.esc(l.location)}</div>
        </div>`;
      }).join("");
    }

    paintSparklines();
  }

  /* War room broadcast */
  document.addEventListener("click", (e) => {
    const send = e.target.closest("[data-war-send]");
    if (!send) return;
    const ta = $("[data-war-msg]");
    const msg = (ta && ta.value || "").trim();
    if (!msg) return;
    C.broadcast(msg);
    ta.value = "";
  });

  /* War room "ask" / hammer buttons */
  document.addEventListener("click", (e) => {
    const ask = e.target.closest("[data-war-ask]");
    if (!ask) return;
    const liveLots = C.catalog().filter(l => l.auction && l.auction.status === "live");
    if (!liveLots.length) return;
    const lot = liveLots[0];
    const action = ask.dataset.warAsk;
    if (action === "fair") C.broadcast(`Fair warning at ${C.fmt.money(lot.auction.currentBid)} on ${lot.title}.`);
    if (action === "hammer") {
      lot.auction.closesAt = new Date(Date.now() + 1500).toISOString();
      C.broadcast(`Hammer down on ${lot.title} at ${C.fmt.money(lot.auction.currentBid)}.`);
    }
  });

  /* =================================================================
     PAGE: DASHBOARD
     ================================================================= */
  function renderDashboard() {
    if (!$("[data-dash]")) return;
    const u = C.user();

    // Auth gate
    const gate = $("[data-auth-gate]");
    if (!u.isAuthed) {
      if (gate) gate.style.display = "";
      $("[data-dash-main]") && ($("[data-dash-main]").style.display = "none");
      return;
    }
    if (gate) gate.style.display = "none";
    $("[data-dash-main]") && ($("[data-dash-main]").style.display = "");

    // Greeting
    $("[data-d-greeting]") && ($("[data-d-greeting]").textContent = `Welcome back, ${u.name.split(" ")[0]}.`);
    $("[data-d-name]") && ($("[data-d-name]").textContent = u.name);
    $("[data-d-paddle]") && ($("[data-d-paddle]").textContent = `Verified Bidder · Paddle #${u.paddle}`);
    $("[data-d-avatar]") && ($("[data-d-avatar]").textContent = (u.name||"U").split(" ").map(s=>s[0]).join("").slice(0,2));

    // KPIs
    const myBids = C.catalog().filter(l => l.auction && (
      Object.keys(u.maxBids).includes(l.id) ||
      (l.auction.history || []).some(h => h.paddle === u.paddle)
    ));
    const winning = myBids.filter(l => l.auction.leaderPaddle === u.paddle);
    const outbid = myBids.filter(l => l.auction.leaderPaddle && l.auction.leaderPaddle !== u.paddle && l.auction.status === "live");
    $("[data-k-active]") && ($("[data-k-active]").textContent = myBids.length);
    $("[data-k-winning]") && ($("[data-k-winning]").textContent = winning.length);
    $("[data-k-outbid]") && ($("[data-k-outbid]").textContent = outbid.length);
    $("[data-k-watch]") && ($("[data-k-watch]").textContent = u.watchlist.length);
    $("[data-k-lifetime]") && ($("[data-k-lifetime]").textContent = C.fmt.money(u.lifetime || 0));
    $("[data-k-credits]") && ($("[data-k-credits]").textContent = (u.credits||0).toLocaleString());

    // Active bids table
    const tbody = $("[data-d-bids]");
    if (tbody) {
      tbody.innerHTML = myBids.map(lot => {
        const a = lot.auction;
        const status = a.leaderPaddle === u.paddle
          ? `<span class="bid-status win">Winning</span>`
          : (a.status === "live" ? `<span class="bid-status out">Outbid</span>` : `<span class="bid-status watch">${a.status}</span>`);
        return `<tr>
          <td><div style="display:flex; gap:10px; align-items:center;">
            <img src="${lot.heroImg}" width="60" height="48" style="border-radius:4px; object-fit:cover" alt="">
            <div><strong>${R.esc(lot.title)}</strong><br><small class="muted">${R.esc(lot.location)}</small></div>
          </div></td>
          <td class="mono">${u.maxBids[lot.id] ? C.fmt.money(u.maxBids[lot.id]) : '—'}</td>
          <td class="mono" data-current-bid="${lot.id}">${C.fmt.money(a.currentBid || a.startingBid)}</td>
          <td>${status}</td>
          <td class="mono" data-end="${a.closesAt}">—</td>
          <td><a class="btn btn--ghost btn--sm" href="listing.html?lot=${lot.id}">View</a></td>
        </tr>`;
      }).join("") || `<tr><td colspan="6" class="muted">You have no active bids. <a href="auctions.html">Browse auctions →</a></td></tr>`;
    }

    // Watchlist grid
    const watchG = $("[data-d-watchlist]");
    if (watchG) {
      const lots = u.watchlist.map(id => C.lot(id)).filter(Boolean);
      watchG.innerHTML = lots.map(l => R.card(l)).join("") || `<p class="muted">Your watchlist is empty. <a href="auctions.html">Browse auctions →</a></p>`;
    }

    // Auctions watching panel
    const aw = $("[data-d-auctions]");
    if (aw) {
      const lots = u.watchlist.map(id => C.lot(id)).filter(l => l && l.auction).slice(0, 6);
      aw.innerHTML = lots.map(l => `
        <div style="border:1px solid var(--line); border-radius:8px; padding:1rem; background:var(--surface-2)">
          <div class="cluster mb-2" style="justify-content:space-between">
            <span class="tag ${l.auction.status === 'live' ? 'tag--live' : 'tag--upcoming'}">${l.auction.status.toUpperCase()}</span>
            <span class="mono" data-end="${l.auction.status === 'upcoming' ? l.auction.opensAt : l.auction.closesAt}">—</span>
          </div>
          <strong style="display:block; font-family:var(--serif); font-size:1.1rem">${R.esc(l.title)}</strong>
          <div class="muted" style="font-size:.85rem">${R.esc(l.location)}</div>
          <a href="listing.html?lot=${l.id}" class="btn ${l.auction.status === 'live' ? 'btn--burgundy' : 'btn--ghost'} btn--sm" style="margin-top:.75rem">${l.auction.status === 'live' ? 'Watch live' : 'Pre-bid'}</a>
        </div>`).join("") || `<p class="muted">Watch auctions to see them here.</p>`;
    }

    // Invoices
    const invT = $("[data-d-invoices]");
    if (invT) {
      invT.innerHTML = u.invoices.map(R.invoiceRow).join("") || `<tr><td colspan="6" class="muted">No invoices yet.</td></tr>`;
    }

    // Notifications
    renderNotifPanel();
  }

  function renderNotifPanel() {
    const ul = $("[data-d-notifications]");
    if (!ul) return;
    const items = C.notifications().slice(0, 12).map(R.notificationItem).join("");
    ul.innerHTML = items || `<li class="muted">No notifications yet.</li>`;
  }

  /* =================================================================
     PAGE: SIGNIN / REGISTER
     ================================================================= */
  function bindAuth() {
    const auth = $("[data-auth-steps]");
    if (!auth) return;
    const steps = $$("[data-step]", auth);
    const bar = $(".step-bar", auth);
    let idx = 0;
    function show(i) {
      steps.forEach((s, n) => s.hidden = (n !== i));
      if (bar) [...bar.children].forEach((b, n) => b.classList.toggle("is-done", n <= i));
    }
    auth.addEventListener("click", (e) => {
      const next = e.target.closest("[data-next]");
      const back = e.target.closest("[data-back]");
      if (next) {
        // Validate then progress
        const cur = steps[idx];
        const required = $$("input[required]", cur);
        for (const r of required) {
          if (!r.value) { r.focus(); r.style.outline = "2px solid var(--burgundy)"; setTimeout(()=>r.style.outline="",1500); return; }
        }
        // Apply step side-effects
        if (idx === 0) {
          const f = (n) => $(`input[name='${n}']`, cur)?.value || "";
          window._catesPending = {
            firstName: f("first"), lastName: f("last"),
            email: f("email"), phone: f("phone")
          };
        }
        if (idx === 1) {
          // Identity verify
          window._catesPending.idVerified = true;
        }
        if (idx === 2) {
          window._catesPending.fundsVerified = true;
        }
        if (idx < steps.length - 1) { idx++; show(idx); }
      }
      if (back && idx > 0) { idx--; show(idx); }
    });
    auth.addEventListener("submit", (e) => {
      e.preventDefault();
      const consents = {};
      $$("input[type='checkbox'][data-consent]", auth).forEach(c => consents[c.dataset.consent] = c.checked);
      C.register({
        ...window._catesPending,
        consents,
        signed: true
      });
      location.href = "dashboard.html";
    });
    show(0);

    // Quick sign-in (top right of auth side)
    $("[data-quick-signin]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.querySelector("input[type='email']").value;
      C.signIn(email);
      location.href = "dashboard.html";
    });
  }

  /* =================================================================
     PAGE: AUCTIONS (full grid)
     ================================================================= */
  function renderAuctionsPage() {
    const grid = $("[data-listing-grid]");
    if (!grid) return;
    R.renderGrid(grid, C.catalog());
    bindFilter();
  }

  /* =================================================================
     INIT — pick what to render based on page
     ================================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    R.syncHeader();
    R.renderActivityBar("[data-activity-bar]");

    if ($("[data-listing-grid]"))   renderHome();
    if ($("[data-listing-root]"))   renderListing();
    if ($("[data-war-stage]"))      renderWarRoom();
    if ($("[data-dash]"))           renderDashboard();
    if ($("[data-auth-steps]"))     bindAuth();

    paintSparklines();
    tickCountdowns();
  });

  // Periodic refresh of the activity bar timestamps
  setInterval(() => R.renderActivityBar("[data-activity-bar]"), 30_000);
})();
