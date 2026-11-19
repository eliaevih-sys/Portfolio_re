/* ==========================================================================
   ELIA EVIH — PORTFOLIO « DU BRUIT AU SIGNAL »
   Interactions : navigation, révélations, carrousel, dialogues, formulaire
   ========================================================================== */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const rafThrottle = (fn) => {
    let queued = false;
    return (...args) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn(...args);
      });
    };
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setYear();
    initHeader();
    initScrollProgress();
    initMobileMenu();
    initDialogues();
    initReveals();
    initSignalIndex();
    initTicker();
    initContactForm();
    initCopyEmail();

    document.body.classList.add("is-ready");
  }

  /* ---------- Année ---------- */
  function setYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- En-tête : fond au scroll + lien actif ---------- */
  function initHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const onScroll = rafThrottle(() => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const links = Array.from(
      document.querySelectorAll('.nav-desktop a[href^="#"]')
    );
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    if (!links.length || !sections.length) return;

    const setActive = (id) => {
      links.forEach((link) => {
        const match = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", match);
        if (match) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    if (!("IntersectionObserver" in window)) {
      setActive(sections[0].id);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Progression de lecture ---------- */
  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;

    const update = rafThrottle(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = "scaleX(" + progress + ")";
    });

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Menu mobile ---------- */
  function initMobileMenu() {
    const dialog = document.getElementById("mobile-menu");
    const toggle = document.querySelector(".menu-toggle");
    if (!dialog || !toggle) return;

    const setExpanded = (open) => toggle.setAttribute("aria-expanded", String(open));

    const openMenu = () => {
      if (dialog.open) return;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      setExpanded(true);
      syncBodyLock();
    };

    const closeMenu = () => {
      if (!dialog.open) return;
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      setExpanded(false);
      syncBodyLock();
    };

    toggle.addEventListener("click", openMenu);
    dialog.querySelectorAll("[data-dialog-close]").forEach((button) => {
      button.addEventListener("click", closeMenu);
    });
    dialog.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeMenu();
    });

    dialog.addEventListener("close", () => {
      setExpanded(false);
      syncBodyLock();
    });
  }

  /* ---------- Dialogues natifs ---------- */
  function initDialogues() {
    const triggers = document.querySelectorAll("[data-dialog-open]");

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const id = trigger.getAttribute("data-dialog-open");
        const dialog = id ? document.getElementById(id) : null;
        if (!dialog) return;

        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        syncBodyLock();
      });
    });

    document.querySelectorAll("dialog").forEach((dialog) => {
      dialog.querySelectorAll("[data-dialog-close]").forEach((button) => {
        button.addEventListener("click", () => {
          if (typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        });
      });

      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
          if (typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        }
      });

      dialog.addEventListener("close", syncBodyLock);
    });
  }

  function syncBodyLock() {
    const hasOpenDialog = Boolean(document.querySelector("dialog[open]"));
    document.body.classList.toggle("modal-open", hasOpenDialog);
  }

  /* ---------- Révélations au scroll ---------- */
  function initReveals() {
    const items = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    // On observe le parent, jamais l'élément clippé : sinon une cible
    // entièrement masquée ne peut pas déclencher sa propre révélation.
    // Certains parents sont en `display: contents` (sans boîte) : on remonte
    // alors au premier ancêtre réellement mesurable.
    const getTrigger = (el) => {
      let node = el.parentElement || el;
      while (node && node !== document.body) {
        const rect = node.getBoundingClientRect();
        if (getComputedStyle(node).display !== "contents" && (rect.width || rect.height)) {
          return node;
        }
        node = node.parentElement;
      }
      return el;
    };

    const groups = new Map();
    const delays = [0, 55, 95, 145, 190];
    items.forEach((el) => {
      const trigger = getTrigger(el);
      if (!groups.has(trigger)) groups.set(trigger, []);
      const siblings = groups.get(trigger);
      el.style.setProperty(
        "--reveal-delay",
        delays[siblings.length % delays.length] + "ms"
      );
      siblings.push(el);
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (groups.get(entry.target) || []).forEach((el) =>
            el.classList.add("is-visible")
          );
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -6% 0px" }
    );

    groups.forEach((_, trigger) => observer.observe(trigger));
  }

  /* ---------- Index des signaux ---------- */
  function initSignalIndex() {
    const root = document.querySelector("[data-signal-index]");
    if (!root) return;

    const links = Array.from(root.querySelectorAll("[data-index-link]"));
    const panels = Array.from(root.querySelectorAll("[data-index-panel]"));
    const label = root.querySelector("[data-index-label]");
    if (!links.length) return;

    const activate = (index) => {
      links.forEach((link, i) => link.classList.toggle("is-active", i === index));
      panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
      if (!label) return;
      const num = links[index].querySelector(".index__num");
      const title = links[index].querySelector(".index__title");
      label.textContent =
        (num ? num.textContent.trim() : "") +
        " — " +
        (title ? title.textContent.trim() : "");
    };

    activate(0);

    links.forEach((link, index) => {
      link.addEventListener("focus", () => activate(index));
      if (finePointer) link.addEventListener("pointerenter", () => activate(index));
    });

    root.addEventListener("pointerleave", () => activate(0));
    root.addEventListener("focusout", (event) => {
      if (!root.contains(event.relatedTarget)) activate(0);
    });
  }

  /* ---------- Bandeau défilant ---------- */
  function initTicker() {
    const ticker = document.querySelector(".ticker");
    const button = ticker ? ticker.querySelector(".ticker__toggle") : null;
    if (!ticker || !button) return;

    button.addEventListener("click", () => {
      const paused = ticker.classList.toggle("is-paused");
      button.setAttribute("aria-pressed", String(paused));
      button.setAttribute(
        "aria-label",
        paused ? "Relancer le bandeau défilant" : "Mettre le bandeau en pause"
      );
    });
  }

  /* ---------- Formulaire : ouverture de la messagerie ---------- */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const status = form.querySelector(".contact-form__status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const subject =
        String(data.get("subject") || "").trim() || "Contact portfolio — " + name;
      const message = String(data.get("message") || "").trim();

      const body =
        "Bonjour Elia,\n\n" +
        message +
        "\n\n—\n" +
        name +
        "\n" +
        email +
        "\n\n(Envoyé depuis le portfolio)";

      const mailto =
        "mailto:evihelia.dev@gmail.com?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      if (status) {
        status.textContent =
          "Votre messagerie va s'ouvrir avec le message pré-rempli. Envoyez-le pour finaliser.";
      }

      window.location.href = mailto;
    });
  }

  /* ---------- Copie de l'email ---------- */
  function initCopyEmail() {
    const buttons = document.querySelectorAll("[data-copy-email]");

    const fallbackCopy = (text) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (error) {
        // Le bouton conserve son libellé d'origine si la copie échoue.
      }
      document.body.removeChild(textarea);
    };

    buttons.forEach((button) => {
      const value = button.getAttribute("data-copy-email");
      if (!value) return;
      const original = button.innerHTML;

      button.addEventListener("click", async () => {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
          } else {
            fallbackCopy(value);
          }
          button.innerHTML = 'Copié <span aria-hidden="true">✓</span>';
          button.setAttribute("aria-label", "Adresse email copiée");
          window.setTimeout(() => {
            button.innerHTML = original;
            button.setAttribute("aria-label", "Copier l'adresse email");
          }, 1800);
        } catch (error) {
          fallbackCopy(value);
          button.innerHTML = 'Copié <span aria-hidden="true">✓</span>';
        }
      });
    });
  }
})();
