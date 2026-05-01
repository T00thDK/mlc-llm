/* ===================================================================
   Cates Real Estate & Auction Company — Site behaviors
   =================================================================== */

(function () {
  /* ---------- Theme + accessibility prefs (persisted) ---------- */
  const prefs = {
    get: () => {
      try { return JSON.parse(localStorage.getItem("cates.prefs") || "{}"); }
      catch { return {}; }
    },
    set: (k, v) => {
      const p = prefs.get(); p[k] = v;
      localStorage.setItem("cates.prefs", JSON.stringify(p));
      apply(p);
    }
  };
  function apply(p) {
    document.documentElement.dataset.theme    = p.theme    || "";
    document.documentElement.dataset.fontscale = p.fontscale || "";
    document.documentElement.dataset.motion   = p.motion   || "";
  }
  apply(prefs.get());

  /* ---------- Mobile nav drawer ---------- */
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open-drawer]");
    if (open) {
      document.getElementById("mobileDrawer")?.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    if (e.target.matches(".drawer") || e.target.closest("[data-close-drawer]")) {
      document.getElementById("mobileDrawer")?.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  });

  /* ---------- Header dropdowns (click + keyboard) ---------- */
  document.querySelectorAll(".has-dropdown .nav-trigger").forEach((trig) => {
    trig.addEventListener("click", (e) => {
      e.preventDefault();
      const li = trig.closest(".has-dropdown");
      const open = li.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".has-dropdown[aria-expanded='true']")
        .forEach(o => o.setAttribute("aria-expanded","false"));
      li.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-dropdown")) {
      document.querySelectorAll(".has-dropdown[aria-expanded='true']")
        .forEach(o => o.setAttribute("aria-expanded","false"));
    }
  });

  /* ---------- A11y FAB ---------- */
  const a11y = document.querySelector(".a11y-fab");
  const a11yPanel = document.querySelector(".a11y-panel");
  a11y?.addEventListener("click", () => a11yPanel.classList.toggle("is-open"));
  document.querySelectorAll("[data-pref]").forEach(btn => {
    btn.addEventListener("click", () => {
      const k = btn.dataset.pref, v = btn.dataset.val;
      prefs.set(k, v);
      btn.parentElement.querySelectorAll("button").forEach(b =>
        b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
    });
  });
  // sync pressed state on load
  const p = prefs.get();
  document.querySelectorAll("[data-pref]").forEach(btn => {
    if ((p[btn.dataset.pref] || "") === (btn.dataset.val || "")) {
      btn.setAttribute("aria-pressed","true");
    }
  });

  /* ---------- Countdown timers ---------- */
  function fmt(ms) {
    if (ms <= 0) return { d:0, h:"00", m:"00", s:"00", over:true };
    const sec = Math.floor(ms/1000);
    const d = Math.floor(sec/86400);
    const h = String(Math.floor((sec%86400)/3600)).padStart(2,"0");
    const m = String(Math.floor((sec%3600)/60)).padStart(2,"0");
    const s = String(sec%60).padStart(2,"0");
    return { d, h, m, s, over:false };
  }
  function tickAll() {
    document.querySelectorAll("[data-end]").forEach(el => {
      const end = new Date(el.dataset.end).getTime();
      const f = fmt(end - Date.now());
      const variant = el.dataset.variant || "compact";
      if (f.over) {
        el.textContent = "Auction closed";
        el.classList.add("is-over");
        return;
      }
      if (variant === "compact") {
        el.textContent = (f.d ? `${f.d}d ` : "") + `${f.h}:${f.m}:${f.s}`;
      } else {
        el.innerHTML = `<span>${f.d}<small>d</small></span>
          <span>${f.h}<small>h</small></span>
          <span>${f.m}<small>m</small></span>
          <span>${f.s}<small>s</small></span>`;
      }
    });
  }
  tickAll(); setInterval(tickAll, 1000);

  /* ---------- Likes (watchlist) ---------- */
  function liked() {
    try { return new Set(JSON.parse(localStorage.getItem("cates.watch") || "[]")); }
    catch { return new Set(); }
  }
  function setLiked(set) { localStorage.setItem("cates.watch", JSON.stringify([...set])); updateWatchCount(); }
  function updateWatchCount() {
    const c = liked().size;
    document.querySelectorAll("[data-watch-count]").forEach(el => {
      el.textContent = c;
      el.style.display = c ? "" : "none";
    });
  }
  function syncLikes() {
    const set = liked();
    document.querySelectorAll(".like").forEach(btn => {
      const id = btn.dataset.id;
      btn.classList.toggle("is-liked", set.has(id));
      btn.setAttribute("aria-pressed", set.has(id) ? "true" : "false");
    });
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".like");
    if (!btn) return;
    e.preventDefault();
    const set = liked();
    const id = btn.dataset.id;
    set.has(id) ? set.delete(id) : set.add(id);
    setLiked(set); syncLikes();
  });
  syncLikes(); updateWatchCount();

  /* ---------- Listing filters ---------- */
  const filterRoot = document.querySelector("[data-listing-filter]");
  if (filterRoot) {
    const grid = document.querySelector("[data-listing-grid]");
    const cards = [...grid.querySelectorAll(".card")];
    const state = { type: "all", sale: "all", q: "" };

    function apply() {
      cards.forEach(c => {
        const matchType = state.type === "all" || c.dataset.type === state.type;
        const matchSale = state.sale === "all" || c.dataset.sale === state.sale;
        const matchQ = !state.q || (c.textContent + " " + (c.dataset.tags||""))
          .toLowerCase().includes(state.q.toLowerCase());
        c.style.display = (matchType && matchSale && matchQ) ? "" : "none";
      });
      const visible = cards.filter(c => c.style.display !== "none").length;
      const cnt = document.querySelector("[data-result-count]");
      if (cnt) cnt.textContent = visible;
    }

    filterRoot.querySelectorAll("[data-filter='type']").forEach(c => {
      c.addEventListener("click", () => {
        filterRoot.querySelectorAll("[data-filter='type']").forEach(x => x.setAttribute("aria-pressed","false"));
        c.setAttribute("aria-pressed","true");
        state.type = c.dataset.val;
        apply();
      });
    });
    filterRoot.querySelectorAll("[data-filter='sale']").forEach(c => {
      c.addEventListener("click", () => {
        filterRoot.querySelectorAll("[data-filter='sale']").forEach(x => x.setAttribute("aria-pressed","false"));
        c.setAttribute("aria-pressed","true");
        state.sale = c.dataset.val;
        apply();
      });
    });
    const search = filterRoot.querySelector("input[type='search']");
    search?.addEventListener("input", (e) => { state.q = e.target.value; apply(); });

    filterRoot.querySelectorAll("[data-view]").forEach(b => {
      b.addEventListener("click", () => {
        filterRoot.querySelectorAll("[data-view]").forEach(x => x.setAttribute("aria-pressed","false"));
        b.setAttribute("aria-pressed","true");
        grid.classList.toggle("is-list", b.dataset.view === "list");
      });
    });

    apply();
  }

  /* ---------- Tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(group => {
    const buttons = group.querySelectorAll("[role='tab']");
    const panels  = group.querySelectorAll("[role='tabpanel']");
    buttons.forEach(b => b.addEventListener("click", () => {
      buttons.forEach(x => x.setAttribute("aria-selected", x === b ? "true" : "false"));
      panels.forEach(p => p.hidden = (p.id !== b.getAttribute("aria-controls")));
    }));
  });

  /* ---------- Bid form (listing detail) ---------- */
  const bidForm = document.querySelector("[data-bid-form]");
  if (bidForm) {
    const input = bidForm.querySelector("input[name='bid']");
    const min   = +bidForm.dataset.min || 0;
    const step  = +bidForm.dataset.step || 5000;
    bidForm.querySelectorAll(".increments button").forEach(b => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        const inc = +b.dataset.inc;
        input.value = (Math.max(+input.value || min, min) + inc);
      });
    });
    bidForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = +input.value;
      if (v < min) { alert(`Minimum bid is $${min.toLocaleString()}.`); return; }
      const feed = document.querySelector("[data-bid-feed]");
      if (feed) {
        const row = document.createElement("div");
        row.className = "bid-row new";
        row.innerHTML = `
          <span class="pad">YOU</span>
          <span class="who">You (Paddle 0427)</span>
          <span class="amt">$${v.toLocaleString()}</span>
          <span class="at">just now</span>`;
        feed.prepend(row);
        setTimeout(() => row.classList.remove("new"), 1200);
      }
      const cur = document.querySelector("[data-current-bid]");
      if (cur) cur.textContent = "$" + v.toLocaleString();
      input.value = "";
    });
  }

  /* ---------- War Room: simulated live bids ---------- */
  const warFeed = document.querySelector("[data-war-feed]");
  if (warFeed) {
    const names = ["B. Marshall","K. Trenton","R. Holloway","S. Park","D. Almeida","M. O'Connor","J. Vance","N. Sutter","A. Whitfield","T. Reyes"];
    const pads  = ["112","204","317","405","518","622","739","814","902","067"];
    let cur = 1180000;
    function pushBid() {
      const i = Math.floor(Math.random()*names.length);
      const inc = (Math.random() < .25 ? 50000 : (Math.random() < .6 ? 25000 : 10000));
      cur += inc;
      const row = document.createElement("div");
      row.className = "bid-row new";
      row.innerHTML = `
        <span class="pad">${pads[i]}</span>
        <span class="who">${names[i]}</span>
        <span class="amt">$${cur.toLocaleString()}</span>
        <span class="at">${new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", second:"2-digit"})}</span>`;
      warFeed.prepend(row);
      const stage = document.querySelector("[data-stage-bid]");
      if (stage) stage.textContent = "$" + cur.toLocaleString();
      const next = document.querySelector("[data-stage-next]");
      if (next) next.textContent = "$" + (cur + 25000).toLocaleString();
      setTimeout(() => row.classList.remove("new"), 1200);
      while (warFeed.children.length > 30) warFeed.lastChild.remove();
    }
    setInterval(pushBid, 3500);
  }

  /* ---------- Sparkline (SVG-based, no deps) ---------- */
  document.querySelectorAll("svg.spark").forEach(svg => {
    const data = (svg.dataset.values || "").split(",").map(Number).filter(Number.isFinite);
    if (!data.length) return;
    const w = svg.clientWidth || 240, h = 60, pad = 2;
    const min = Math.min(...data), max = Math.max(...data);
    const span = max - min || 1;
    const pts = data.map((v,i) => {
      const x = pad + (i*(w-pad*2))/(data.length-1);
      const y = h - pad - ((v-min)/span)*(h-pad*2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML =
      `<polyline fill="none" stroke="#b6893a" stroke-width="2" points="${pts}"/>` +
      `<polyline fill="rgba(212,162,74,0.12)" stroke="none" points="${pad},${h-pad} ${pts} ${w-pad},${h-pad}"/>`;
  });

  /* ---------- Multi-step auth (signin) ---------- */
  const auth = document.querySelector("[data-auth-steps]");
  if (auth) {
    const steps = [...auth.querySelectorAll("[data-step]")];
    const bar   = auth.querySelector(".step-bar");
    let idx = 0;
    function show(i) {
      steps.forEach((s, n) => s.hidden = (n !== i));
      if (bar) {
        [...bar.children].forEach((b, n) => b.classList.toggle("is-done", n <= i));
      }
    }
    auth.addEventListener("click", (e) => {
      const next = e.target.closest("[data-next]");
      const back = e.target.closest("[data-back]");
      if (next && idx < steps.length-1) { idx++; show(idx); }
      if (back && idx > 0)               { idx--; show(idx); }
    });
    show(0);
  }
})();
