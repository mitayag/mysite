/* ============================================================
   MARLON I. TAYAG — site interactions
   ------------------------------------------------------------
   EASY EDITS:
   - Rotating hero roles: edit the ROLES array below.
   - "Hack" boot animation lines: edit the BOOT array below.
   - Contact form: it composes an email via mailto: (no backend).
     To use a form service instead, see README "Contact form".
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     SUPABASE LEADERBOARD CONFIG  ← EDIT ME
     ------------------------------------------------------------
     1. Create a free project at https://supabase.com
     2. Open the SQL Editor and run the SQL block in the README
        (it creates the "leaderboard" table + public read/write).
     3. Project Settings → API → copy your Project URL and the
        "anon public" key into the two lines below.
     ============================================================ */
  const SUPABASE_URL = "https://jrzvscjivieldhnibjtp.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyenZzY2ppdmllbGRobmlianRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMDgxMTYsImV4cCI6MjEwMjc4NDExNn0.up296qeLN67b-keY2HP7xr-x8E22jiyVmTdvvgdomic";
  const LEADERBOARD_TABLE = "leaderboard";
  const LEADERBOARD_READY = !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR-ANON");

  /* ---------- Sound effects (Web Audio — no files needed) ---------- */
  const Sound = (() => {
    let ctx = null;
    let muted = false;
    try { muted = localStorage.getItem("soundMuted") === "1"; } catch (e) {}
    const VOLUME = 1.4; // overall loudness multiplier

    function ensureCtx() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }

    function tone(freq, dur, type, vol, when, slideTo) {
      const c = ensureCtx();
      if (!c) return;
      const t = c.currentTime + (when || 0);
      const v = Math.min(0.5, (vol || 0.14) * VOLUME);
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.03);
    }

    // A short filtered noise burst — used for keyboard ticks and glitch
    function noise(dur, vol, when, freq, q) {
      const c = ensureCtx();
      if (!c) return;
      const t = c.currentTime + (when || 0);
      const v = Math.min(0.5, (vol || 0.1) * VOLUME);
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource();
      src.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = freq || 2400;
      f.Q.value = q || 1.2;
      const g = c.createGain();
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start(t);
    }

    const FX = {
      // mechanical keyboard tick
      type()  { noise(0.03, 0.12, 0, 2400, 1.4); tone(170, 0.035, "square", 0.1); },
      // power-up "initiate breach"
      click() { tone(300, 0.18, "sawtooth", 0.09, 0, 1100); noise(0.14, 0.06, 0, 1800); tone(1400, 0.05, "square", 0.05, 0.16); },
      // node cracked — crisp digital "lock open" blip
      crack() { tone(820, 0.05, "square", 0.09); tone(1640, 0.07, "square", 0.08, 0.045); noise(0.035, 0.045, 0.03, 4200, 3); },
      // trap — alarm buzz
      trap()  { tone(520, 0.09, "sawtooth", 0.13); tone(340, 0.12, "sawtooth", 0.13, 0.1, 130); noise(0.1, 0.05, 0, 700, 1); },
      // ACCESS GRANTED — clean ascending chime
      grant() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.22, "sine", 0.13, i * 0.09)); tone(1046.5, 0.45, "sine", 0.07, 0.42); },
      // SYSTEM HACKED — glitchy sweep + noise
      hack()  { noise(0.22, 0.11, 0, 900, 1); tone(1200, 0.5, "sawtooth", 0.11, 0, 110); tone(280, 0.38, "square", 0.07, 0.5, 1500); noise(0.16, 0.07, 0.5, 3000, 2); },
      // CTF complete — bright arpeggio
      win()   { [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => tone(f, 0.2, "triangle", 0.14, i * 0.1)); tone(1318.5, 0.55, "sine", 0.09, 0.5); },
      // CTF wrong — soft descending "error"
      fail()  { tone(340, 0.1, "sine", 0.12); tone(226, 0.16, "sine", 0.12, 0.09); },
      // access denied
      deny()  { tone(392, 0.1, "square", 0.1); tone(311, 0.14, "square", 0.1, 0.1); },
      // winners fanfare
      celebrate() {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.15, "triangle", 0.15, i * 0.08));
        [1046.5, 1318.5, 1568].forEach((f, i) => tone(f, 0.22, "sine", 0.13, 0.34 + i * 0.09));
        tone(2093, 0.5, "sine", 0.1, 0.62);
      },
    };

    function play(name) {
      if (muted || !FX[name]) return;
      try { FX[name](); } catch (e) {}
    }

    function setMuted(m) {
      muted = m;
      try { localStorage.setItem("soundMuted", m ? "1" : "0"); } catch (e) {}
    }
    function isMuted() { return muted; }

    return { play, setMuted, isMuted, ensureCtx };
  })();

  // Browsers block audio until the first user gesture — resume on first tap/key
  ["pointerdown", "keydown"].forEach((ev) =>
    window.addEventListener(ev, () => Sound.ensureCtx(), { once: true, passive: true })
  );

  const soundToggle = document.getElementById("soundToggle");
  function updateSoundIcon() {
    if (soundToggle) soundToggle.textContent = Sound.isMuted() ? "🔇" : "🔊";
  }
  if (soundToggle) {
    updateSoundIcon();
    soundToggle.addEventListener("click", () => {
      Sound.ensureCtx();
      Sound.setMuted(!Sound.isMuted());
      updateSoundIcon();
    });
  }

  /* ---------- Rotating hero roles (EDIT ME) ---------- */
  const ROLES = [
    "Dean, School of Computing @ Holy Angel University",
    "Teacher / Programmer / Web App & Mobile Developer",
    "Cybersecurity · IoT Security · Penetration Testing",
    "Mobile (Flutter) · Web (PHP) · Desktop (.NET / C#)",
    "Cisco Academy Instructor · CCNA · CEH",
  ];

  /* ---------- "Hack" boot sequence lines (EDIT ME) ----------
     c: optional class  (ok | fail | granted) */
  const PRE_LINES = [
    { t: "$ ./init.sh --target marlontayag.io" },
    { t: "[+] establishing encrypted link ............. OK", c: "ok" },
    { t: "[+] scanning ports 1..65535 ................ 22 · 80 · 443 open" },
    { t: "[+] fingerprinting host .................... Holy Angel University" },
    { t: "[+] brute-forcing credentials" },
  ];
  const WIN_LINES = [
    { t: "[+] FIREWALL BYPASSED", c: "ok" },
    { t: "ACCESS GRANTED — identity: MARLON I. TAYAG", c: "granted" },
  ];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav shadow ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Typewriter effect (started after the boot sequence) ---------- */
  const typerEl = document.getElementById("typer");
  let typerTimer = null;
  let roleIdx = 0, charIdx = 0, deleting = false;

  function stopTyper() {
    if (typerTimer) clearTimeout(typerTimer);
    typerTimer = null;
    roleIdx = 0; charIdx = 0; deleting = false;
    if (typerEl) typerEl.textContent = "";
  }

  function startTyper() {
    if (!typerEl) return;
    const SPEED = 55, DELAY = 1600;
    function tick() {
      const current = ROLES[roleIdx];
      if (!deleting) {
        charIdx++;
        typerEl.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          typerTimer = setTimeout(tick, DELAY);
          return;
        }
        typerTimer = setTimeout(tick, SPEED);
      } else {
        charIdx--;
        typerEl.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % ROLES.length;
        }
        typerTimer = setTimeout(tick, SPEED / 2);
      }
    }
    tick();
  }

  /* ---------- "Hack" boot sequence + firewall mini-game ---------- */
  const bootlog = document.getElementById("bootlog");
  const heroReveal = document.getElementById("heroReveal");
  const terminal = document.querySelector(".terminal");
  const replayBtn = document.getElementById("replayBtn");
  const gamePanel = document.getElementById("hackGame");
  const nodeGrid = document.getElementById("nodeGrid");
  const gameBar = document.getElementById("gameBar");
  const gameStatus = document.getElementById("gameStatus");
  const hackOverlay = document.getElementById("hackOverlay");
  const heroCard = document.getElementById("heroCard");
  const heroGrid = document.querySelector(".hero-grid");
  let booting = false;

  const NODES = 9;
  const CRACKS_TO_WIN = 6;

  async function typeLine(text, cls) {
    const line = document.createElement("div");
    line.className = "line" + (cls ? " " + cls : "");
    const txt = document.createElement("span");
    const cur = document.createElement("span");
    cur.className = "cursor";
    line.appendChild(txt);
    line.appendChild(cur);
    bootlog.appendChild(line);
    for (let i = 0; i < text.length; i++) {
      txt.textContent = text.slice(0, i + 1);
      Sound.play("type");
      await sleep(11);
    }
    cur.remove();
  }

  /* ---------- Firewall mini-game ----------
     Step 1: show an intro (hacker avatar + instructions + "Initiate breach").
     Step 2: tap the glowing green nodes to crack the firewall, avoid the red
     traps. Resolves when enough nodes are cracked. */
  const game = { nodes: [], cracks: 0, resolve: null };

  function buildNodes() {
    nodeGrid.innerHTML = "";
    game.nodes = [];
    for (let i = 0; i < NODES; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "node idle";
      b.setAttribute("aria-label", "Firewall node " + (i + 1));
      game.nodes.push(b);
      nodeGrid.appendChild(b);
    }
  }

  function setBar() {
    gameBar.style.width = Math.round((game.cracks / CRACKS_TO_WIN) * 100) + "%";
    gameStatus.textContent =
      game.cracks >= CRACKS_TO_WIN
        ? "firewall bypassed!"
        : "breach progress " + game.cracks + "/" + CRACKS_TO_WIN;
    gameStatus.className = "hack-game-status";
  }

  function render() {
    game.nodes.forEach((n) => {
      if (!n.classList.contains("cracked")) {
        n.className = "node idle";
        n.textContent = "";
      }
    });
    const idle = game.nodes.filter((n) => !n.classList.contains("cracked"));
    if (game.cracks >= CRACKS_TO_WIN) return;
    const target = idle[Math.floor(Math.random() * idle.length)];
    target.classList.add("target");
    target.textContent = "●";
    const rest = idle.filter((n) => n !== target);
    if (rest.length) {
      const trap = rest[Math.floor(Math.random() * rest.length)];
      trap.classList.add("trap");
      trap.textContent = "✕";
    }
    setBar();
  }

  nodeGrid.addEventListener("click", (e) => {
    if (!game.resolve) return;
    const node = e.target.closest(".node");
    if (!node) return;
    if (node.classList.contains("target")) {
      game.cracks++;
      Sound.play("crack");
      node.classList.remove("target", "trap");
      node.classList.add("cracked");
      node.textContent = "✓";
      node.setAttribute("aria-label", "Cracked");
      if (game.cracks >= CRACKS_TO_WIN) {
        setBar();
        const done = game.resolve;
        game.resolve = null;
        done();
        return;
      }
      render();
    } else if (node.classList.contains("trap")) {
      Sound.play("trap");
      node.classList.remove("trap");
      node.classList.add("shake");
      gameStatus.textContent = "ACCESS DENIED — trap node";
      gameStatus.className = "hack-game-status denied";
      setTimeout(() => {
        node.classList.remove("shake");
        render();
      }, 350);
    }
  });

  function playGame() {
    return new Promise((resolve) => {
      const intro = document.getElementById("hackIntro");
      const playArea = document.getElementById("hackPlay");
      const startBtn = document.getElementById("startGameBtn");

      game.cracks = 0;
      game.resolve = resolve;

      gamePanel.hidden = false;
      if (intro) intro.hidden = false;
      if (playArea) playArea.hidden = true;

      const begin = () => {
        Sound.play("click");
        if (intro) intro.hidden = true;
        if (playArea) playArea.hidden = false;
        bootlog.style.display = "none"; // collapse the log so the game box stays compact
        buildNodes();
        setBar();
        render();
      };

      if (startBtn) {
        startBtn.addEventListener("click", begin, { once: true });
      } else {
        begin();
      }
    });
  }

  async function runBoot() {
    if (booting || !bootlog || !heroReveal) return;
    booting = true;

    bootlog.style.display = "";
    bootlog.innerHTML = "";
    heroReveal.classList.remove("revealed");
    if (heroCard) heroCard.classList.remove("revealed");
    if (heroGrid) heroGrid.classList.add("game-on");
    document.body.classList.add("locked");
    stopTyper();
    if (gamePanel) gamePanel.hidden = true;
    if (hackOverlay) hackOverlay.hidden = true;
    if (terminal) terminal.classList.add("boot-running");

    try {
      for (const step of PRE_LINES) {
        await typeLine(step.t, step.c);
        await sleep(150);
      }
      if (gamePanel && nodeGrid) {
        await playGame();
      }
      Sound.play("grant");
      bootlog.style.display = ""; // bring the log back for the "ACCESS GRANTED" lines
      for (const step of WIN_LINES) {
        await typeLine(step.t, step.c);
        await sleep(140);
      }
      // Full-screen "PC hacked" effect before the whoami window appears
      if (hackOverlay) {
        hackOverlay.hidden = false;
        Sound.play("hack");
        await sleep(1800);
        hackOverlay.hidden = true;
      } else {
        await sleep(650);
      }
    } catch (e) {
      /* never leave the hero hidden if something breaks */
    }

    bootlog.style.display = "none";
    if (gamePanel) gamePanel.hidden = true;
    if (terminal) terminal.classList.remove("boot-running");
    if (heroGrid) heroGrid.classList.remove("game-on");
    heroReveal.classList.add("revealed");
    if (heroCard) heroCard.classList.add("revealed");
    document.body.classList.remove("locked");
    startTyper();
    booting = false;
  }

  if (bootlog && heroReveal) {
    runBoot();
    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        if (!booting) runBoot();
      });
    }
  } else if (heroReveal) {
    heroReveal.classList.add("revealed");
    if (heroCard) heroCard.classList.add("revealed");
    document.body.classList.remove("locked");
    startTyper();
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Skill bars (animate when visible) ---------- */
  const bars = document.querySelectorAll(".bar[data-value]");
  if ("IntersectionObserver" in window) {
    const barIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fill = entry.target.querySelector(".bar-fill");
            if (fill) fill.style.width = entry.target.dataset.value + "%";
            barIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    bars.forEach((bar) => barIO.observe(bar));
  } else {
    bars.forEach((bar) => {
      const fill = bar.querySelector(".bar-fill");
      if (fill) fill.style.width = bar.dataset.value + "%";
    });
  }

  /* ---------- Active nav link (scroll spy) ---------- */
  const sections = document.querySelectorAll("main section[id], header[id]");
  const linkMap = {};
  document.querySelectorAll(".nav-links a[href^='#']").forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    if (id) linkMap[id] = a;
  });
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && linkMap[entry.target.id]) {
            document
              .querySelectorAll(".nav-links a.active")
              .forEach((a) => a.classList.remove("active"));
            linkMap[entry.target.id].classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Contact form (mailto compose, no backend) ----------
     To send through a service instead (e.g. Formspree), replace the
     submit handler with a fetch() to your Formspree endpoint.
     See README for details. */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent(
        "Website message from " + (data.get("name") || "someone")
      );
      const body = encodeURIComponent(
        "Name: " + (data.get("name") || "") +
        "\nEmail: " + (data.get("email") || "") +
        "\nPhone: " + (data.get("phone") || "") +
        "\n\n" + (data.get("message") || "")
      );
      window.location.href =
        "mailto:mtayag@hau.edu.ph?subject=" + subject + "&body=" + body;
      if (status) {
        status.textContent =
          "Opening your email app… (message prefilled). Send it from there.";
        status.className = "form-status ok";
      }
    });
  }

  /* ---------- CTF challenges (EDIT ME) ----------
     Each: { title, clue, encoded (optional), hint, flag }
     Flags are checked case-insensitively. The first flag is also hidden in
     an HTML comment in index.html (the "view source" challenge). */
  const CHALLENGES = [
    {
      title: "Inspector",
      clue: "The first flag is hiding in this page's HTML source. View the source and search for \"flag{\".",
      hint: "Right-click → View Page Source (or Ctrl+U / Cmd+Option+U).",
      flag: "flag{source_savvy}",
    },
    {
      title: "Decoder",
      clue: "This string is Base64-encoded. Decode it to reveal the flag.",
      encoded: "ZmxhZ3tiYXNlNjRfZGVjb2Rlcn0=",
      hint: "Look up 'base64 decode' in a search engine.",
      flag: "flag{base64_decoder}",
    },
    {
      title: "Classic",
      clue: "This flag was rotated 13 places. ROT13 it back.",
      encoded: "synt{ebg13_vf_pynffvp}",
      hint: "ROT13 shifts each letter 13 places; many sites offer a ROT13 tool.",
      flag: "flag{rot13_is_classic}",
    },
    {
      title: "Bits",
      clue: "Convert these binary groups to ASCII.",
      encoded: "01100110 01101100 01100001 01100111 01111011 01100010 01101001 01101110 01100001 01110010 01111001 01111101",
      hint: "Each 8-bit group is one ASCII character.",
      flag: "flag{binary}",
    },
    {
      title: "Shift",
      clue: "A Caesar cipher shifted by 3. Decrypt it.",
      encoded: "iodj{fwi_pdvwhu}",
      hint: "Shift each letter back 3 places (D→A, E→B…).",
      flag: "flag{ctf_master}",
    },
  ];

  const ctfGrid = document.getElementById("ctfGrid");
  const ctfScore = document.getElementById("ctfScore");
  const ctfWin = document.getElementById("ctfWin");
  const leaderboardSubmit = document.getElementById("leaderboardSubmit");
  const ctfTime = document.getElementById("ctfTime");
  const lbName = document.getElementById("lbName");
  const lbSave = document.getElementById("lbSave");
  const lbFeedback = document.getElementById("lbFeedback");
  const lbBody = document.getElementById("lbBody");
  const lbPagination = document.getElementById("lbPagination");
  const showWinnersBtn = document.getElementById("showWinnersBtn");
  const winnersModal = document.getElementById("winnersModal");
  const winnersClose = document.getElementById("winnersClose");
  const podium = document.getElementById("podium");
  let ctfSolved = 0;
  let ctfStartTime = null;
  let ctfElapsed = null;

  function renderCtf() {
    if (!ctfGrid) return;
    CHALLENGES.forEach((ch, i) => {
      const card = document.createElement("article");
      card.className = "ctf-card";
      card.innerHTML =
        '<div class="ctf-card-head">' +
          '<span class="ctf-num">' + String(i + 1).padStart(2, "0") + "</span>" +
          "<h4>" + ch.title + "</h4>" +
        "</div>" +
        '<p class="ctf-clue">' + ch.clue + "</p>" +
        (ch.encoded ? '<code class="ctf-code">' + ch.encoded + "</code>" : "") +
        '<div class="ctf-form">' +
          '<input class="ctf-input" type="text" placeholder="flag{...}" aria-label="Flag for ' + ch.title + '">' +
          '<button class="btn btn-ghost btn-sm ctf-submit" type="button">Submit</button>' +
        "</div>" +
        '<button class="ctf-hint" type="button">Show hint</button>' +
        '<p class="ctf-hint-text" hidden>💡 ' + ch.hint + "</p>" +
        '<p class="ctf-feedback"></p>';
      ctfGrid.appendChild(card);

      const input = card.querySelector(".ctf-input");
      const submit = card.querySelector(".ctf-submit");
      const feedback = card.querySelector(".ctf-feedback");
      const hintBtn = card.querySelector(".ctf-hint");
      const hintText = card.querySelector(".ctf-hint-text");

      hintBtn.addEventListener("click", () => {
        hintText.hidden = !hintText.hidden;
        hintBtn.textContent = hintText.hidden ? "Show hint" : "Hide hint";
      });

      function check() {
        if (input.value.trim().toLowerCase() === ch.flag.toLowerCase()) {
          card.classList.add("solved");
          input.disabled = true;
          submit.disabled = true;
          feedback.textContent = "✓ Flag captured!";
          feedback.className = "ctf-feedback ok";
          hintBtn.hidden = true;
          hintText.hidden = true;
          ctfSolved++;
          if (ctfScore) ctfScore.textContent = ctfSolved + "/" + CHALLENGES.length;
          if (ctfSolved === CHALLENGES.length) {
            Sound.play("win");
            if (ctfWin) ctfWin.hidden = false;
            finishCtf();
          } else {
            Sound.play("crack");
          }
        } else {
          Sound.play("fail");
          feedback.textContent = "✕ Incorrect — try again.";
          feedback.className = "ctf-feedback err";
          card.classList.add("shake");
          setTimeout(() => card.classList.remove("shake"), 350);
        }
      }

      submit.addEventListener("click", check);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
      });
      input.addEventListener("focus", ensureTimer);
    });
  }

  /* ---------- CTF leaderboard (Supabase) ---------- */
  function ensureTimer() {
    if (!ctfStartTime) ctfStartTime = Date.now();
  }

  function finishCtf() {
    ctfElapsed = ctfStartTime ? Math.max(1, Math.round((Date.now() - ctfStartTime) / 1000)) : null;
    if (ctfTime) ctfTime.textContent = ctfElapsed ? formatTime(ctfElapsed) : "--";
    if (leaderboardSubmit) {
      leaderboardSubmit.hidden = false;
      setTimeout(() => leaderboardSubmit.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
    }
  }

  function formatTime(s) {
    return s < 60 ? s + "s" : Math.floor(s / 60) + "m " + (s % 60) + "s";
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const PAGE_SIZE = 5;
  let leaderboardRows = [];
  let currentPage = 1;

  function computePoints(flags, time) {
    return Math.max(0, (flags || 0) * 300 - (time || 0) * 2);
  }

  function sortRows(rows) {
    return rows.slice().sort((a, b) => {
      const pa = computePoints(a.flags_solved, a.time_seconds);
      const pb = computePoints(b.flags_solved, b.time_seconds);
      if (pb !== pa) return pb - pa;                       // points desc
      if (a.time_seconds !== b.time_seconds) return a.time_seconds - b.time_seconds; // time asc
      return String(a.name || "").localeCompare(String(b.name || "")); // name asc
    });
  }

  function renderLeaderboard() {
    if (!lbBody) return;
    const totalPages = Math.max(1, Math.ceil(leaderboardRows.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PAGE_SIZE;
    const page = leaderboardRows.slice(start, start + PAGE_SIZE);

    if (!leaderboardRows.length) {
      lbBody.innerHTML = '<tr><td colspan="5" class="lb-empty">No scores yet — be the first!</td></tr>';
      return;
    }
    lbBody.innerHTML = page
      .map((r, i) => {
        const rank = start + i + 1;
        const pts = computePoints(r.flags_solved, r.time_seconds);
        return "<tr><td>" + rank + "</td><td>" + escapeHtml(r.name) + "</td><td>" +
          formatTime(r.time_seconds) + "</td><td>" + r.flags_solved + "/5</td><td>" +
          pts.toLocaleString() + "</td></tr>";
      })
      .join("");
  }

  function renderPagination() {
    if (!lbPagination) return;
    const totalPages = Math.max(1, Math.ceil(leaderboardRows.length / PAGE_SIZE));
    if (totalPages <= 1) {
      lbPagination.innerHTML = "";
      return;
    }
    let html = '<button class="pg-btn" data-page="prev" type="button"' + (currentPage === 1 ? " disabled" : "") + ">‹ Previous</button>";
    for (let p = 1; p <= totalPages; p++) {
      html += '<button class="pg-btn' + (p === currentPage ? " active" : "") + '" data-page="' + p + '" type="button">' + p + "</button>";
    }
    html += '<button class="pg-btn" data-page="next" type="button"' + (currentPage === totalPages ? " disabled" : "") + ">Next ›</button>";
    lbPagination.innerHTML = html;

    lbPagination.querySelectorAll(".pg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = btn.dataset.page;
        if (p === "prev") goToPage(currentPage - 1);
        else if (p === "next") goToPage(currentPage + 1);
        else goToPage(parseInt(p, 10));
      });
    });
  }

  function goToPage(p) {
    const totalPages = Math.max(1, Math.ceil(leaderboardRows.length / PAGE_SIZE));
    currentPage = Math.max(1, Math.min(totalPages, p));
    renderLeaderboard();
    renderPagination();
  }

  async function loadLeaderboard() {
    if (!lbBody) return;
    if (!LEADERBOARD_READY) {
      lbBody.innerHTML = '<tr><td colspan="5" class="lb-empty">Leaderboard not connected — add your Supabase keys in js/main.js.</td></tr>';
      if (lbPagination) lbPagination.innerHTML = "";
      return;
    }
    try {
      const res = await fetch(
        SUPABASE_URL + "/rest/v1/" + LEADERBOARD_TABLE + "?select=name,time_seconds,flags_solved&limit=1000",
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY } }
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      leaderboardRows = sortRows(await res.json());
      currentPage = 1;
      renderLeaderboard();
      renderPagination();
    } catch (e) {
      lbBody.innerHTML = '<tr><td colspan="5" class="lb-empty">Couldn\'t load the leaderboard.</td></tr>';
      if (lbPagination) lbPagination.innerHTML = "";
    }
  }

  /* ---------- Winners modal (top 3 podium) ---------- */
  function renderPodium() {
    if (!podium) return;
    const top = leaderboardRows.slice(0, 3);
    if (!top.length) {
      podium.innerHTML = '<p class="podium-empty">No winners yet — be the first to finish!</p>';
      return;
    }
    const byRank = {};
    top.forEach((r, i) => { byRank[i + 1] = r; });
    const labels = { 1: "CHAMPION", 2: "SECOND", 3: "THIRD" };
    let html = '<div class="podium">';
    [2, 1, 3].forEach((rank) => {
      const r = byRank[rank];
      if (!r) return;
      const pts = computePoints(r.flags_solved, r.time_seconds);
      const icon = rank === 1
        ? '<div class="spot-trophy">🏆</div>'
        : '<div class="spot-medal">' + (rank === 2 ? "🥈" : "🥉") + "</div>";
      html += '<div class="podium-spot spot-' + rank + '">' +
        '<div class="spot-info">' + icon +
          '<div class="spot-name">' + escapeHtml(r.name) + "</div>" +
          '<div class="spot-points">' + pts.toLocaleString() + " pts</div>" +
        "</div>" +
        '<div class="spot-block">' +
          '<div class="spot-num">' + rank + "</div>" +
          '<div class="spot-label">' + labels[rank] + "</div>" +
        "</div>" +
      "</div>";
    });
    html += "</div>";
    podium.innerHTML = html;
  }

  /* ---------- Confetti shower (canvas) ---------- */
  function launchConfetti() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed", inset: "0", zIndex: "1200",
      pointerEvents: "none", width: "100%", height: "100%",
    });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width, h = canvas.height;

    const colors = ["#22d3ee", "#a78bfa", "#fbbf24", "#34d399", "#f472b6", "#f87171", "#ffffff"];
    const parts = [];
    for (let i = 0; i < 170; i++) {
      parts.push({
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.5,
        pw: 6 + Math.random() * 6,
        ph: 10 + Math.random() * 8,
        color: colors[(Math.random() * colors.length) | 0],
        vy: 2 + Math.random() * 3.5,
        vx: -1.5 + Math.random() * 3,
        rot: Math.random() * Math.PI,
        spin: -0.15 + Math.random() * 0.3,
      });
    }

    let frame = 0;
    const MAX_FRAMES = 260; // ~4s
    function step() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx + Math.sin(p.rot) * 1.2;
        p.y += p.vy;
        p.rot += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.pw / 2, -p.ph / 2, p.pw, p.ph);
        ctx.restore();
      }
      frame++;
      if (frame < MAX_FRAMES && parts.some((p) => p.y < h + 40)) {
        requestAnimationFrame(step);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(step);
  }

  function openWinners() {
    if (!winnersModal) return;
    renderPodium();
    winnersModal.hidden = false;
    document.body.style.overflow = "hidden";
    Sound.play("celebrate");
    launchConfetti();
  }

  function closeWinners() {
    if (!winnersModal) return;
    winnersModal.hidden = true;
    document.body.style.overflow = "";
  }

  if (showWinnersBtn) showWinnersBtn.addEventListener("click", openWinners);
  if (winnersClose) winnersClose.addEventListener("click", closeWinners);
  if (winnersModal) {
    const wBackdrop = winnersModal.querySelector(".winners-modal-backdrop");
    if (wBackdrop) wBackdrop.addEventListener("click", closeWinners);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && winnersModal && !winnersModal.hidden) closeWinners();
  });

  if (lbSave) {
    lbSave.addEventListener("click", async () => {
      const name = (lbName ? lbName.value : "").trim();
      if (!name) {
        if (lbFeedback) { lbFeedback.textContent = "Enter a handle first."; lbFeedback.className = "ctf-feedback err"; }
        return;
      }
      if (!LEADERBOARD_READY) {
        if (lbFeedback) { lbFeedback.textContent = "Leaderboard isn't connected yet."; lbFeedback.className = "ctf-feedback err"; }
        return;
      }
      if (ctfElapsed == null) {
        ctfElapsed = ctfStartTime ? Math.max(1, Math.round((Date.now() - ctfStartTime) / 1000)) : 1;
      }
      lbSave.disabled = true;
      if (lbFeedback) { lbFeedback.textContent = "Saving…"; lbFeedback.className = "ctf-feedback"; }
      try {
        const res = await fetch(SUPABASE_URL + "/rest/v1/" + LEADERBOARD_TABLE, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: "Bearer " + SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ name, time_seconds: ctfElapsed, flags_solved: CHALLENGES.length }),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        if (lbFeedback) { lbFeedback.textContent = "Score saved! 🎉"; lbFeedback.className = "ctf-feedback ok"; }
        if (lbName) lbName.disabled = true;
        loadLeaderboard();
      } catch (e) {
        if (lbFeedback) { lbFeedback.textContent = "Save failed — try again."; lbFeedback.className = "ctf-feedback err"; }
        lbSave.disabled = false;
      }
    });
  }

  loadLeaderboard();

  renderCtf();

  /* ---------- Lock pop-up: gated content before the game ---------- */
  const lockModal = document.getElementById("lockModal");
  const lockModalPlay = document.getElementById("lockModalPlay");
  const lockModalClose = document.getElementById("lockModalClose");
  const lockBackdrop = lockModal ? lockModal.querySelector(".lock-modal-backdrop") : null;

  function showLockModal() {
    Sound.play("deny");
    if (lockModal) lockModal.hidden = false;
  }
  function hideLockModal() {
    if (lockModal) lockModal.hidden = true;
  }
  if (lockModal) {
    if (lockModalPlay) {
      lockModalPlay.addEventListener("click", () => {
        hideLockModal();
        const home = document.getElementById("home");
        if (home) home.scrollIntoView({ behavior: "smooth" });
      });
    }
    if (lockModalClose) lockModalClose.addEventListener("click", hideLockModal);
    if (lockBackdrop) lockBackdrop.addEventListener("click", hideLockModal);
  }

  // Intercept nav links (and the scroll cue) while the page is still locked
  document.querySelectorAll(".nav-links a[href^='#'], .scroll-cue").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (a.getAttribute("href") === "#home") return;
      if (document.body.classList.contains("locked")) {
        e.preventDefault();
        showLockModal();
      }
    });
  });
})();
