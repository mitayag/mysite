/* ============================================================
   MARLON I. TAYAG — site interactions
   ------------------------------------------------------------
   EASY EDITS:
   - Rotating hero roles: edit the ROLES array below.
   - Contact form: it composes an email via mailto: (no backend).
     To use a form service instead, see README "Contact form".
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Rotating hero roles (EDIT ME) ---------- */
  const ROLES = [
    "Dean, School of Computing @ Holy Angel University",
    "Teacher / Programmer / Web App & Mobile Developer",
    "Cybersecurity · IoT Security · Penetration Testing",
    "Mobile (Flutter) · Web (PHP) · Desktop (.NET / C#)",
    "Cisco Academy Instructor · CCNA · CEH",
  ];

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

  /* ---------- Typewriter effect ---------- */
  const typer = document.getElementById("typer");
  if (typer) {
    let roleIdx = 0, charIdx = 0, deleting = false;
    const SPEED = 55, DELAY = 1600;

    function tick() {
      const current = ROLES[roleIdx];
      if (!deleting) {
        charIdx++;
        typer.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, DELAY);
          return;
        }
        setTimeout(tick, SPEED);
      } else {
        charIdx--;
        typer.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % ROLES.length;
        }
        setTimeout(tick, SPEED / 2);
      }
    }
    tick();
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

  /* ---------- Research filter ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const researchCards = document.querySelectorAll(".research-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      researchCards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !show);
      });
    });
  });

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
})();
