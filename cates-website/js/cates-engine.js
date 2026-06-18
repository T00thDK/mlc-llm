/* ===================================================================
   CATES ENGINE — client-side MVP backend
   ---------------------------------------------------------------
   Single source of truth for:
   - catalog of lots (auctions + traditional listings)
   - user (auth, KYC, paddle, watchlist, max bids, invoices, notifs)
   - auction lifecycle (live tick, soft close, anti-snipe, hammer)
   - simulated competing bidders for live demo realism
   - pub/sub + cross-tab sync via localStorage 'storage' events
   =================================================================== */
(function (root) {
  const KEY = "cates.state.v2";
  const HALF_LIFE = 1000 * 60 * 60 * 24 * 30; // demo session window

  /* ---------------- DEFAULT CATALOG ---------------- */
  const now = Date.now();
  const inMin   = (m) => new Date(now + m * 60_000).toISOString();
  const inHour  = (h) => new Date(now + h * 3_600_000).toISOString();
  const inDay   = (d) => new Date(now + d * 86_400_000).toISOString();
  const agoMin  = (m) => new Date(now - m * 60_000).toISOString();

  const defaultCatalog = {
    "lot-1041": {
      id: "lot-1041", slug: "sunset-bluff",
      title: "Sunset Bluff — 5BR Lakefront Estate",
      location: "Watts Bar Lake, TN",
      address: "412 Sunset Bluff Road, Watts Bar Lake, TN 37763",
      type: "luxury", sale: "auction",
      tags: ["lakefront", "luxury", "absolute"],
      featured: true, hero: true,
      heroImg: "https://picsum.photos/seed/cates-luxlake/1200/900",
      images: ["https://picsum.photos/seed/cates-luxlake/1200/900",
               "https://picsum.photos/seed/cates-l1041-b/600/400",
               "https://picsum.photos/seed/cates-l1041-c/600/400",
               "https://picsum.photos/seed/cates-l1041-d/600/400",
               "https://picsum.photos/seed/cates-l1041-e/600/400"],
      specs: { bd: 5, ba: "4.5", sqft: 5820, ac: 2.4, year: 2014 },
      description: "A 5-bedroom, 4.5-bath custom estate on 2.4 deeded acres of Watts Bar Lake's most desirable bluff. Year-round deep water, a covered double-slip boathouse, panoramic sunset orientation.",
      highlights: ["188 ft of TVA shoreline", "Double-slip covered boathouse", "1,140 sqft guest house", "5-bay garage; backup whole-house Generac", "Geothermal HVAC, Lutron + Crestron"],
      auction: {
        status: "live",
        opensAt: agoMin(60 * 18),
        closesAt: inHour(28),
        startingBid: 750000, increment: 25000, isAbsolute: true, reserve: null,
        currentBid: 1205000, leaderPaddle: "317", leaderName: "R. Holloway",
        bidCount: 38, watchers: 2847, paddles: 7,
        avm: { median: 1265000, low: 1180000, high: 1340000, sources: 5, confidence: 94 },
        history: [
          { paddle:"317", name:"R. Holloway",  amount:1205000, ts: agoMin(2),  channel:"Web" },
          { paddle:"204", name:"K. Trenton",   amount:1195000, ts: agoMin(3),  channel:"iOS" },
          { paddle:"427", name:"E. Whitford",  amount:1180000, ts: agoMin(4),  channel:"Web" },
          { paddle:"112", name:"B. Marshall",  amount:1160000, ts: agoMin(7),  channel:"Web" },
          { paddle:"PHN", name:"Phone bid",    amount:1145000, ts: agoMin(12), channel:"Phone" },
          { paddle:"622", name:"M. O'Connor",  amount:1120000, ts: agoMin(18), channel:"Android" }
        ]
      }
    },

    "lot-l-2210": {
      id: "lot-l-2210", slug: "cumberland-farmhouse",
      title: "The Cumberland Farmhouse — Restored 1898",
      location: "Cookeville, TN",
      address: "147 Cumberland Pike, Cookeville, TN 38501",
      type: "residential", sale: "traditional",
      tags: ["historic", "farmhouse", "new"], heroImg: "https://picsum.photos/seed/cates-farmhouse/1200/900",
      images: ["https://picsum.photos/seed/cates-farmhouse/1200/900"],
      specs: { bd: 4, ba: 3, sqft: 3140, ac: 14.2, year: 1898 },
      description: "Fully restored 1898 farmhouse on 14.2 acres, with original heart-pine floors, modern systems, and a working hen house.",
      listing: { askingPrice: 789500 }
    },

    "lot-1092": {
      id: "lot-1092", slug: "walnut-ridge-farm",
      title: "Walnut Ridge Working Farm — 480 ac",
      location: "Marshall County, KY",
      type: "land", sale: "auction",
      tags: ["farm", "land", "multi-tract", "absolute"],
      heroImg: "https://picsum.photos/seed/cates-farm480/1200/900",
      images: ["https://picsum.photos/seed/cates-farm480/1200/900"],
      specs: { tracts: 3, tillable: 120, homesites: 2, frontage: "1.4mi creek" },
      description: "480-acre working farm offered in three tracts and combinations. 120 tillable, 2 homesites, 1.4mi of creek frontage.",
      auction: {
        status: "live",
        opensAt: agoMin(60 * 24 * 4),
        closesAt: inDay(2.5),
        startingBid: 1200000, increment: 25000, isAbsolute: true, reserve: null,
        currentBid: 2140000, leaderPaddle: "204", leaderName: "K. Trenton",
        bidCount: 71, watchers: 304, paddles: 14,
        avm: { median: 2050000, low: 1900000, high: 2300000, sources: 5, confidence: 91 },
        history: [
          { paddle:"204", name:"K. Trenton",  amount:2140000, ts: agoMin(34), channel:"Web" },
          { paddle:"427", name:"E. Whitford", amount:2120000, ts: agoMin(48), channel:"Web" },
          { paddle:"739", name:"J. Vance",    amount:2080000, ts: agoMin(96), channel:"Web" }
        ]
      }
    },

    "lot-1100": {
      id: "lot-1100", slug: "magnolia-hotel",
      title: "The Magnolia — 38-Key Boutique Hotel",
      location: "Asheville, NC",
      type: "commercial", sale: "auction",
      tags: ["hotel", "commercial", "income"], heroImg: "https://picsum.photos/seed/cates-hotel/1200/900",
      images: ["https://picsum.photos/seed/cates-hotel/1200/900"],
      specs: { keys: 38, NOI: "$2.1M", cap: "9.2%", ac: 0.8 },
      description: "Turnkey 38-key boutique hotel in downtown Asheville. $2.1M NOI on a 9.2% cap. Brand-flexible.",
      auction: {
        status: "upcoming",
        opensAt: inDay(11),
        closesAt: inDay(18),
        startingBid: 6000000, increment: 100000, isAbsolute: false, reserve: 8400000,
        currentBid: 0, leaderPaddle: null, leaderName: null,
        bidCount: 0, watchers: 412, paddles: 0,
        avm: { median: 8800000, low: 7900000, high: 9600000, sources: 5, confidence: 87 },
        history: []
      }
    },

    "lot-est-417": {
      id: "lot-est-417", slug: "whitfield-estate",
      title: "Whitfield Estate — 412 Lots",
      location: "Nashville, TN",
      type: "estate", sale: "auction",
      tags: ["estate", "antiques", "art", "vehicles"], heroImg: "https://picsum.photos/seed/cates-estate/1200/900",
      images: ["https://picsum.photos/seed/cates-estate/1200/900"],
      specs: { lots: 412, appraised: "$2.4M", featured: "1934 Packard", categories: 14 },
      description: "Aggregate estate auction across 412 lots: antiques, fine art, jewelry, vehicles (incl. a 1934 Packard).",
      auction: {
        status: "live",
        opensAt: agoMin(60 * 30),
        closesAt: inHour(7),
        startingBid: 500000, increment: 10000, isAbsolute: true, reserve: null,
        currentBid: 1180000, leaderPaddle: "622", leaderName: "M. O'Connor",
        bidCount: 948, watchers: 1240, paddles: 88,
        avm: { median: 1900000, low: 1700000, high: 2200000, sources: 5, confidence: 89 },
        history: []
      }
    },

    "lot-l-2407": {
      id: "lot-l-2407", slug: "highpoint-modern",
      title: "Highpoint — Modernist Hilltop Residence",
      location: "Lookout Mountain, TN",
      type: "luxury", sale: "traditional",
      tags: ["modern", "luxury", "new"], heroImg: "https://picsum.photos/seed/cates-modern/1200/900",
      images: ["https://picsum.photos/seed/cates-modern/1200/900"],
      specs: { bd: 6, ba: 7, sqft: 9400, ac: 3.1, year: 2019 },
      description: "Modernist 9,400-sqft estate cantilevered into the brow of Lookout Mountain.",
      listing: { askingPrice: 4200000 }
    },

    "lot-1112": {
      id: "lot-1112", slug: "westfield-lane",
      title: "412 Westfield Lane — 4BR Family Home",
      location: "Knoxville, TN",
      type: "residential", sale: "auction",
      tags: ["residential"], heroImg: "https://picsum.photos/seed/cates-suburb/1200/900",
      images: ["https://picsum.photos/seed/cates-suburb/1200/900"],
      specs: { bd: 4, ba: "2.5", sqft: 2640, ac: 0.4 },
      description: "Move-in-ready 4BR/2.5BA in West Knoxville. Selling absolute.",
      auction: {
        status: "upcoming",
        opensAt: inDay(7),
        closesAt: inDay(14),
        startingBid: 200000, increment: 5000, isAbsolute: true, reserve: null,
        currentBid: 285000, leaderPaddle: "427", leaderName: "E. Whitford",
        bidCount: 6, watchers: 184, paddles: 4,
        avm: { median: 380000, low: 340000, high: 420000, sources: 5, confidence: 92 },
        history: []
      }
    },

    "lot-est-512": {
      id: "lot-est-512", slug: "pemberton-garage",
      title: "Pemberton Garage — 22 Classic Vehicles",
      location: "Lexington, KY",
      type: "estate", sale: "auction",
      tags: ["vehicles", "classic", "estate"], heroImg: "https://picsum.photos/seed/cates-classic/1200/900",
      images: ["https://picsum.photos/seed/cates-classic/1200/900"],
      specs: { cars: 22, era: "1932-1989", appraised: "$3.8M", tractors: 3 },
      description: "Estate of John Pemberton — 22 documented classic vehicles including a 1957 Mercedes 300SL Roadster.",
      auction: {
        status: "live",
        opensAt: agoMin(60 * 20),
        closesAt: inDay(1.8),
        startingBid: 800000, increment: 10000, isAbsolute: true, reserve: null,
        currentBid: 1920000, leaderPaddle: "427", leaderName: "E. Whitford",
        bidCount: 521, watchers: 880, paddles: 56,
        avm: { median: 2400000, low: 2100000, high: 2800000, sources: 5, confidence: 88 },
        history: []
      }
    },

    "lot-1130": {
      id: "lot-1130", slug: "heritage-square-retail",
      title: "Heritage Square — Retail Strip",
      location: "Cookeville, TN",
      type: "commercial", sale: "auction",
      tags: ["commercial", "retail"], heroImg: "https://picsum.photos/seed/au-1130/1200/900",
      images: ["https://picsum.photos/seed/au-1130/1200/900"],
      specs: { units: 14, NOI: "$840K", cap: "8.1%", ac: 0.9 },
      auction: {
        status: "live", opensAt: agoMin(60 * 48), closesAt: inDay(4.5),
        startingBid: 6000000, increment: 50000, isAbsolute: false, reserve: 7800000,
        currentBid: 8140000, leaderPaddle: "739", leaderName: "J. Vance",
        bidCount: 14, watchers: 96, paddles: 5,
        avm: { median: 8400000, low: 7900000, high: 9200000, sources: 5, confidence: 86 },
        history: []
      }
    },

    "lot-l-2412": {
      id: "lot-l-2412", slug: "bluegrass-ranch",
      title: "Bluegrass Ranch — 240 ac Equestrian",
      location: "Versailles, KY",
      type: "land", sale: "traditional",
      tags: ["land", "equestrian"], heroImg: "https://picsum.photos/seed/au-l2412/1200/900",
      images: ["https://picsum.photos/seed/au-l2412/1200/900"],
      specs: { ac: 240, stalls: 14, homes: 3, frontage: "1.2mi" },
      listing: { askingPrice: 5400000 }
    },

    "lot-1148": {
      id: "lot-1148", slug: "cumberland-timber",
      title: "Cumberland Plateau — 1,840 ac Timber",
      location: "Pickett County, TN",
      type: "land", sale: "auction", tags: ["land", "timber"],
      heroImg: "https://picsum.photos/seed/au-1148/1200/900",
      images: ["https://picsum.photos/seed/au-1148/1200/900"],
      specs: { ac: 1840, tracts: 3, timber: "$1.2M", creeks: 2 },
      auction: {
        status: "upcoming", opensAt: inDay(20), closesAt: inDay(35),
        startingBid: 2200000, increment: 50000, isAbsolute: false, reserve: 3200000,
        currentBid: 0, leaderPaddle: null, leaderName: null,
        bidCount: 0, watchers: 142, paddles: 0,
        avm: { median: 3400000, low: 3000000, high: 3800000, sources: 5, confidence: 84 },
        history: []
      }
    }
  };

  const defaultUser = {
    isAuthed: false, paddle: null, name: null, email: null, phone: null,
    kyc: { idVerified: false, fundsVerified: false, signed: false },
    consents: { auctionAlerts: true, sms: true, push: true, mail: false, personalization: true, cleanRoom: false },
    watchlist: [],
    interests: ["lakefront", "land", "historic"],
    maxBids: {},
    invoices: [],
    notifications: [],
    credits: 0, tier: "Bidder", lifetime: 0
  };

  /* ---------------- STATE LOAD/SAVE ---------------- */
  function clone(o){ return JSON.parse(JSON.stringify(o)); }

  function makeDefaultState() {
    return {
      v: 2,
      ts: Date.now(),
      catalog: clone(defaultCatalog),
      user: clone(defaultUser),
      meta: { liveActivity: [], lastTickAt: Date.now() }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return makeDefaultState();
      const parsed = JSON.parse(raw);
      if (parsed.v !== 2) return makeDefaultState();
      // refresh time-anchored auction times if expired beyond demo window
      if (Date.now() - parsed.ts > HALF_LIFE) return makeDefaultState();
      // Ensure catalog has all default lots (in case we added new ones since save)
      const fresh = clone(defaultCatalog);
      Object.keys(fresh).forEach(id => {
        if (!parsed.catalog[id]) parsed.catalog[id] = fresh[id];
      });
      return parsed;
    } catch { return makeDefaultState(); }
  }

  let state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch(e) { /* quota or denied */ }
  }

  /* ---------------- PUB / SUB ---------------- */
  const subs = {};
  function on(evt, fn) {
    (subs[evt] = subs[evt] || []).push(fn);
    return () => { subs[evt] = (subs[evt] || []).filter(f => f !== fn); };
  }
  function emit(evt, payload) {
    (subs[evt] || []).slice().forEach(fn => { try { fn(payload); } catch(e){ console.error(e); } });
    (subs["*"]   || []).slice().forEach(fn => { try { fn(evt, payload); } catch(e){ console.error(e); } });
  }

  // cross-tab sync
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = load();
      emit("state:reloaded");
    }
  });

  /* ---------------- USER / AUTH ---------------- */
  function genPaddle() {
    return String(Math.floor(100 + Math.random() * 899));
  }

  function register(payload) {
    state.user = {
      ...clone(defaultUser),
      isAuthed: true,
      paddle: genPaddle(),
      name: payload.name || (payload.firstName + " " + (payload.lastName || "")).trim() || "Bidder",
      email: payload.email || null,
      phone: payload.phone || null,
      kyc: { idVerified: !!payload.idVerified, fundsVerified: !!payload.fundsVerified, signed: !!payload.signed },
      consents: { ...clone(defaultUser.consents), ...(payload.consents || {}) },
      tier: "Estate",
      credits: 250
    };
    pushNotification({ type: "welcome", message: `Welcome to Cates, ${state.user.name}. Your paddle is #${state.user.paddle}.` });
    save(); emit("user:authed", state.user);
  }

  function signIn(email) {
    if (!email) return false;
    if (!state.user.isAuthed) {
      // demo: any sign-in becomes Eleanor Whitford
      state.user = { ...clone(defaultUser), isAuthed: true, paddle: "427", name: "Eleanor Whitford", email,
        kyc: { idVerified: true, fundsVerified: true, signed: true },
        tier: "Estate", credits: 14820, lifetime: 840000,
        invoices: [
          { id: "INV-24812", lotId: "lot-est-512", lotName: "1957 Mercedes 300SL", total: 1738000, status: "paid", date: agoDays(3) },
          { id: "INV-24744", lotId: "lot-est-417", lotName: "Whitfield Estate — 14 lots", total: 94250, status: "paid", date: agoDays(10) },
          { id: "INV-24690", lotId: "lot-l-2210",  lotName: "Norris Lake Cottage",       total: 985500, status: "pending", date: agoDays(13) }
        ],
        watchlist: ["lot-1041", "lot-est-417", "lot-l-2210"],
        maxBids: { "lot-1041": 1400000, "lot-1112": 340000, "lot-est-512": 1650000 }
      };
      save();
      emit("user:authed", state.user);
    }
    return true;
  }

  function agoDays(d){ return new Date(now - d * 86_400_000).toISOString(); }

  function signOut() {
    state.user = clone(defaultUser);
    save(); emit("user:signedout");
  }

  function setKyc(stepKey, value) {
    state.user.kyc[stepKey] = value;
    save(); emit("user:updated", state.user);
  }

  function setConsent(k, v) {
    state.user.consents[k] = v;
    save(); emit("user:updated", state.user);
  }

  /* ---------------- WATCHLIST ---------------- */
  function isWatching(lotId) {
    return state.user.watchlist.includes(lotId);
  }
  function toggleWatch(lotId) {
    const w = state.user.watchlist;
    if (w.includes(lotId)) {
      state.user.watchlist = w.filter(x => x !== lotId);
    } else {
      state.user.watchlist = [...w, lotId];
      pushNotification({ type:"watch", lotId, message:`Added to watchlist: ${state.catalog[lotId].title}` });
    }
    save();
    emit("watchlist:changed", { lotId, watching: isWatching(lotId) });
    return isWatching(lotId);
  }

  /* ---------------- BID PLACEMENT ---------------- */
  function nextRequired(lot) {
    const a = lot.auction;
    if (!a) return 0;
    return a.currentBid > 0 ? a.currentBid + a.increment : a.startingBid;
  }

  function placeBid(lotId, amount, opts={}) {
    const lot = state.catalog[lotId];
    if (!lot || !lot.auction) return { ok:false, error:"Not an auction lot" };
    const a = lot.auction;
    if (a.status === "closed") return { ok:false, error:"Auction is closed" };
    if (a.status === "upcoming") return { ok:false, error:"Auction has not opened yet" };
    const minBid = nextRequired(lot);
    if (amount < minBid) return { ok:false, error:`Minimum bid is $${minBid.toLocaleString()}` };

    const prevLeader = { paddle: a.leaderPaddle, name: a.leaderName };
    const paddle = opts.paddle || (state.user.isAuthed ? state.user.paddle : `G${Math.floor(Math.random()*900+100)}`);
    const name   = opts.name   || (state.user.isAuthed ? state.user.name   : "Guest");
    const channel = opts.channel || "Web";

    a.currentBid = amount;
    a.leaderPaddle = paddle;
    a.leaderName = name;
    a.bidCount = (a.bidCount || 0) + 1;
    a.history = [{ paddle, name, amount, ts: new Date().toISOString(), channel }, ...(a.history || [])].slice(0, 100);

    // soft close: any bid in last 5 min extends close by 5 min
    const remainingMs = new Date(a.closesAt).getTime() - Date.now();
    if (remainingMs > 0 && remainingMs < 5 * 60_000) {
      a.closesAt = new Date(Date.now() + 5 * 60_000).toISOString();
      pushLiveActivity({ type:"extend", lotId, message:`Soft-close extended on ${lot.title}` });
    }

    // Notification: outbid (any prior leader who isn't this paddle)
    if (prevLeader.paddle && prevLeader.paddle !== paddle && state.user.isAuthed && state.user.paddle === prevLeader.paddle) {
      pushNotification({ type:"outbid", lotId, severity:"warn",
        message:`You've been outbid on ${lot.title}. New bid: $${amount.toLocaleString()}` });
    }
    // Notification: now winning
    if (state.user.isAuthed && paddle === state.user.paddle) {
      pushNotification({ type:"winning", lotId, severity:"success",
        message:`You are now the high bidder on ${lot.title} at $${amount.toLocaleString()}` });
    }

    pushLiveActivity({ type:"bid", lotId, paddle, amount, name });

    save();
    emit("bid:placed", { lotId, amount, paddle, name, lot });
    emit("lot:updated", lot);
    return { ok:true, lot, amount };
  }

  function setMaxBid(lotId, amount) {
    state.user.maxBids[lotId] = amount;
    save(); emit("maxbid:changed", { lotId, amount });
  }

  /* ---------------- AUCTION TICK / LIFECYCLE ---------------- */
  function tick() {
    let dirty = false;
    Object.values(state.catalog).forEach(lot => {
      if (!lot.auction) return;
      const a = lot.auction;
      const t = Date.now();
      const opens  = new Date(a.opensAt).getTime();
      const closes = new Date(a.closesAt).getTime();

      if (a.status === "upcoming" && t >= opens && t < closes) {
        a.status = "live"; dirty = true;
        pushNotification({ type:"opened", lotId: lot.id, message:`Bidding has opened on ${lot.title}` });
        emit("lot:updated", lot);
      }
      if (a.status === "live" && t >= closes) {
        a.status = "closed"; dirty = true;
        finalizeAuction(lot);
        emit("lot:updated", lot);
      }
      // Closing soon notifications (10 / 5 / 1 min)
      const remaining = closes - t;
      if (a.status === "live" && state.user.isAuthed) {
        const watching = state.user.watchlist.includes(lot.id);
        const bidding  = state.user.maxBids[lot.id] !== undefined || (a.leaderPaddle && a.leaderPaddle === state.user.paddle);
        if ((watching || bidding) && !a._notif10 && remaining < 10*60_000 && remaining > 0) {
          a._notif10 = true; dirty = true;
          pushNotification({ type:"closing-soon", lotId: lot.id, message:`Closing in 10 min: ${lot.title}` });
        }
      }
    });
    if (dirty) { save(); emit("tick"); }
  }

  function finalizeAuction(lot) {
    const a = lot.auction;
    if (!a.leaderPaddle) {
      pushNotification({ type:"unsold", lotId:lot.id, message:`${lot.title} closed without a sale.` });
      return;
    }
    if (!a.isAbsolute && a.reserve && a.currentBid < a.reserve) {
      pushNotification({ type:"reserve-not-met", lotId:lot.id, severity:"warn",
        message:`${lot.title} closed below reserve at $${a.currentBid.toLocaleString()}.` });
      return;
    }
    // Winning user?
    if (state.user.isAuthed && a.leaderPaddle === state.user.paddle) {
      const premium = Math.round(a.currentBid * 0.10);
      const total = a.currentBid + premium;
      const inv = {
        id: "INV-" + Math.floor(Math.random() * 90000 + 10000),
        lotId: lot.id, lotName: lot.title,
        bid: a.currentBid, premium, total,
        status: "pending", date: new Date().toISOString()
      };
      state.user.invoices = [inv, ...state.user.invoices];
      state.user.lifetime = (state.user.lifetime || 0) + total;
      state.user.credits  = (state.user.credits  || 0) + Math.floor(total / 1000);
      pushNotification({ type:"won", lotId:lot.id, severity:"success",
        message:`Hammer! You won ${lot.title} at $${a.currentBid.toLocaleString()}. Invoice ${inv.id} created.` });
      emit("invoice:created", inv);
    } else {
      pushNotification({ type:"sold", lotId:lot.id,
        message:`${lot.title} sold to paddle #${a.leaderPaddle} at $${a.currentBid.toLocaleString()}.` });
    }
  }

  /* ---------------- SIMULATED COMPETING BIDDERS ---------------- */
  const fakeNames = ["B. Marshall","K. Trenton","R. Holloway","S. Park","D. Almeida","M. O'Connor","J. Vance","N. Sutter","A. Whitfield","T. Reyes"];
  const fakePads  = ["112","204","317","518","622","739","814","902","067","045"];
  let lastSimAt = 0;

  function simulate() {
    const now = Date.now();
    if (now - lastSimAt < 12_000) return; // every 12s
    lastSimAt = now;
    const liveLots = Object.values(state.catalog).filter(l => l.auction && l.auction.status === "live");
    if (!liveLots.length) return;
    // Pick a random live lot weighted by watcher count
    const total = liveLots.reduce((s,l) => s + (l.auction.watchers || 1), 0);
    let pick = Math.random() * total;
    let lot = liveLots[0];
    for (const l of liveLots) { pick -= (l.auction.watchers || 1); if (pick <= 0) { lot = l; break; } }

    const a = lot.auction;
    if (a.leaderPaddle === (state.user.paddle || "_") && Math.random() < 0.35) {
      // The competing bidder may bump our user's bid
      const i = Math.floor(Math.random() * fakeNames.length);
      const inc = a.increment * (Math.random() < 0.7 ? 1 : 2);
      placeBid(lot.id, a.currentBid + inc, { paddle: fakePads[i], name: fakeNames[i], channel:"Web" });
    } else if (Math.random() < 0.4) {
      const i = Math.floor(Math.random() * fakeNames.length);
      const inc = a.increment * (Math.random() < 0.5 ? 1 : (Math.random() < 0.6 ? 2 : 4));
      placeBid(lot.id, a.currentBid + inc, { paddle: fakePads[i], name: fakeNames[i], channel:"Web" });
    }
  }

  /* ---------------- NOTIFICATIONS / ACTIVITY ---------------- */
  function pushNotification(n) {
    n.id = "n_" + Math.random().toString(36).slice(2,9);
    n.ts = new Date().toISOString();
    n.read = false;
    state.user.notifications = [n, ...state.user.notifications].slice(0, 60);
    save(); emit("notification:new", n);
  }
  function markNotificationRead(id) {
    const n = state.user.notifications.find(x => x.id === id);
    if (n) { n.read = true; save(); emit("notification:read", id); }
  }
  function markAllNotificationsRead() {
    state.user.notifications.forEach(n => n.read = true);
    save(); emit("notification:read-all");
  }
  function unreadCount() {
    return state.user.notifications.filter(n => !n.read).length;
  }
  function pushLiveActivity(a) {
    a.ts = new Date().toISOString();
    state.meta.liveActivity = [a, ...state.meta.liveActivity].slice(0, 30);
    save(); emit("activity:new", a);
  }

  /* ---------------- INVOICES ---------------- */
  function payInvoice(id) {
    const inv = state.user.invoices.find(i => i.id === id);
    if (!inv) return false;
    inv.status = "paid";
    pushNotification({ type:"paid", message:`Invoice ${inv.id} marked paid.`, severity:"success" });
    save(); emit("invoice:updated", inv); return true;
  }

  /* ---------------- BROADCAST (war room → bidders) ---------------- */
  function broadcast(message) {
    pushNotification({ type:"broadcast", message:`Auctioneer: ${message}` });
    pushLiveActivity({ type:"broadcast", message });
  }

  /* ---------------- DEMO RESET ---------------- */
  function reset() {
    state = makeDefaultState();
    save(); emit("state:reloaded");
  }

  /* ---------------- TICK LOOP ---------------- */
  setInterval(() => { tick(); simulate(); }, 1500);

  /* ---------------- PUBLIC API ---------------- */
  root.Cates = {
    on, emit,
    state: () => state,
    user: () => state.user,
    catalog: () => Object.values(state.catalog),
    lot: (id) => state.catalog[id],
    register, signIn, signOut, setKyc, setConsent,
    isWatching, toggleWatch,
    nextRequired, placeBid, setMaxBid,
    notifications: () => state.user.notifications,
    unreadCount, markNotificationRead, markAllNotificationsRead,
    invoices: () => state.user.invoices, payInvoice,
    activity: () => state.meta.liveActivity,
    broadcast,
    reset,
    fmt: {
      money: (n) => "$" + Number(n || 0).toLocaleString(),
      countdown: (iso) => {
        const ms = new Date(iso).getTime() - Date.now();
        if (ms <= 0) return { over:true, text:"closed" };
        const s = Math.floor(ms/1000), d = Math.floor(s/86400),
              h = String(Math.floor((s%86400)/3600)).padStart(2,"0"),
              m = String(Math.floor((s%3600)/60)).padStart(2,"0"),
              ss = String(s%60).padStart(2,"0");
        return { over:false, d, h, m, s:ss, text: (d?`${d}d `:"") + `${h}:${m}:${ss}` };
      },
      time: (iso) => new Date(iso).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" }),
      ago: (iso) => {
        const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime())/1000));
        if (s < 60) return s + "s ago";
        if (s < 3600) return Math.floor(s/60) + "m ago";
        if (s < 86400) return Math.floor(s/3600) + "h ago";
        return Math.floor(s/86400) + "d ago";
      }
    }
  };
})(window);
