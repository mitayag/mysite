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
      bootlog.style.display = ""; // bring the log back for the "ACCESS GRANTED" lines
      for (const step of WIN_LINES) {
        await typeLine(step.t, step.c);
        await sleep(140);
      }
      // Full-screen "PC hacked" effect before the whoami window appears
      if (hackOverlay) {
        hackOverlay.hidden = false;
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
            if (ctfWin) ctfWin.hidden = false;
            finishCtf();
          }
        } else {
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
    if (leaderboardSubmit) leaderboardSubmit.hidden = false;
  }

  function formatTime(s) {
    return s < 60 ? s + "s" : Math.floor(s / 60) + "m " + (s % 60) + "s";
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  async function loadLeaderboard() {
    if (!lbBody) return;
    if (!LEADERBOARD_READY) {
      lbBody.innerHTML = '<tr><td colspan="4" class="lb-empty">Leaderboard not connected — add your Supabase keys in js/main.js.</td></tr>';
      return;
    }
    try {
      const res = await fetch(
        SUPABASE_URL + "/rest/v1/" + LEADERBOARD_TABLE + "?select=name,time_seconds,flags_solved&order=time_seconds.asc&limit=10",
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY } }
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = await res.json();
      if (!rows.length) {
        lbBody.innerHTML = '<tr><td colspan="4" class="lb-empty">No scores yet — be the first!</td></tr>';
        return;
      }
      lbBody.innerHTML = rows
        .map((r, i) => "<tr><td>" + (i + 1) + "</td><td>" + escapeHtml(r.name) + "</td><td>" + formatTime(r.time_seconds) + "</td><td>" + r.flags_solved + "/5</td></tr>")
        .join("");
    } catch (e) {
      lbBody.innerHTML = '<tr><td colspan="4" class="lb-empty">Couldn\'t load the leaderboard.</td></tr>';
    }
  }

  if (lbSave) {
    lbSave.addEventListener("click", async () => {
      const name = (lbName ? lbName.value : "").trim();
      if (!name) {
        if (lbFeedback) { lbFeedback.textContent = "Enter a handle first."; lbFeedback.className = "ctf-feedback err"; }
        return;
      }
      if (!LEADERBOARD_READY || ctfElapsed == null) return;
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
