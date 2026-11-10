
/*
 * FORMULACIJA — Consent Manager
 *
 * Trenutno je iskljucen jer dostavljeni sajt nema analitiku ni reklamne skripte.
 *
 * Kada dodas opcionu analitiku ili oglase:
 * 1. Promeni ENABLED na true.
 * 2. Ucitaj njihove skripte ISKLJUCIVO preko
 *    FormulacijaConsent.whenGranted(...).
 *
 * VAZNO:
 * Ovaj fajl ne presrece niti kontrolise postojeci
 * localStorage cache iz api.js.
 */

(function () {
  "use strict";

  const CONFIG = {
    ENABLED: false,

    VERSION: "1.0",

    STORAGE_KEY: "formulacija-consent-v1",

    VALID_DAYS: 180,

    PRIVACY_URL: "./html/pravneinformacije.html#kolacici"
  };

  const OPTIONAL_CATEGORIES = [
    "preferences",
    "analytics",
    "marketing"
  ];

  let currentConsent = readConsent();

  let bannerElement = null;
  let overlayElement = null;
  let launcherElement = null;

  let callbacks = {
    preferences: [],
    analytics: [],
    marketing: []
  };

  let listeners = [];

  function now() {
    return Date.now();
  }

  /* citanje pristanka */

  function readConsent() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);

      if (!raw) return null;

      const saved = JSON.parse(raw);

      if (
        !saved ||
        saved.version !== CONFIG.VERSION ||
        !saved.savedAt
      ) {
        return null;
      }

      const age = now() - Number(saved.savedAt);

      if (
        !Number.isFinite(age) ||
        age < 0 ||
        age > CONFIG.VALID_DAYS * 86400000
      ) {
        return null;
      }

      return {
        necessary: true,
        preferences: saved.preferences === true,
        analytics: saved.analytics === true,
        marketing: saved.marketing === true,
        version: CONFIG.VERSION,
        savedAt: Number(saved.savedAt)
      };

    } catch (_) {
      return null;
    }
  }

  function defaultConsent() {
    return {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
      version: CONFIG.VERSION,
      savedAt: null
    };
  }

  function getConsent() {
    return Object.assign(
      {},
      currentConsent || defaultConsent()
    );
  }

  /* provera dozvole */

  function hasConsent(category) {
    if (category === "necessary") return true;

    if (!OPTIONAL_CATEGORIES.includes(category)) {
      return false;
    }

    return !!(
      currentConsent &&
      currentConsent[category] === true
    );
  }

  /* obavestenje o promeni pristanka */

  function notify(previous) {
    const next = getConsent();

    try {
      window.dispatchEvent(
        new CustomEvent("formulacija:consentchange", {
          detail: {
            consent: next,
            previous: previous || null
          }
        })
      );
    } catch (_) {}

    listeners.forEach(function (listener) {
      try {
        listener(next, previous || null);
      } catch (error) {
        console.error(
          "FORMULACIJA consent listener:",
          error
        );
      }
    });

    runGrantedCallbacks();
  }

  /* pokretanje servisa koji su dozvoljeni */

  function runGrantedCallbacks() {
    OPTIONAL_CATEGORIES.forEach(function (category) {
      if (!hasConsent(category)) return;

      callbacks[category].forEach(function (entry) {
        if (entry.ran) return;

        entry.ran = true;

        try {
          entry.callback();
        } catch (error) {
          console.error(
            "FORMULACIJA consent callback (" +
            category +
            "):",
            error
          );
        }
      });
    });
  }

  /* cuvanje izbora */

  function saveConsent(selection) {
    const previous = getConsent();

    const next = {
      necessary: true,

      preferences: selection.preferences === true,

      analytics: selection.analytics === true,

      marketing: selection.marketing === true,

      version: CONFIG.VERSION,

      savedAt: now()
    };

    currentConsent = next;

    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch (error) {
      console.warn(
        "FORMULACIJA: izbor privatnosti nije moguće sačuvati u ovom pregledaču.",
        error
      );
    }

    closeSettings();

    removeBanner();

    notify(previous);
  }

  /* glavni baner */

  function createBanner() {
    if (bannerElement) return;

    bannerElement = document.createElement("section");

    bannerElement.className = "fc-banner";

    bannerElement.setAttribute("role", "dialog");

    bannerElement.setAttribute("aria-modal", "false");

    bannerElement.setAttribute(
      "aria-labelledby",
      "fc-banner-title"
    );

    bannerElement.innerHTML = `
      <div class="fc-brand-row">
        <span class="fc-brand">FORMULACIJA</span>

        <span class="fc-kicker">
          Podešavanja privatnosti
        </span>
      </div>

      <h2 id="fc-banner-title">
        Vaša privatnost nam je važna
      </h2>

      <p>
        Neophodne tehnologije omogućavaju osnovni rad sajta.
        Uz vašu saglasnost možemo koristiti i opcionalne
        tehnologije za podešavanja, analitiku i marketing.
        Izbor možete promeniti u bilo kom trenutku.
        Pročitajte
        <a href="${CONFIG.PRIVACY_URL}">
          Politiku privatnosti
        </a>.
      </p>

      <div class="fc-actions">

        <button
          class="fc-btn fc-btn-quiet"
          type="button"
          data-fc-action="reject"
        >
          Samo neophodni
        </button>

        <button
          class="fc-btn"
          type="button"
          data-fc-action="settings"
        >
          Podešavanja
        </button>

        <button
          class="fc-btn fc-btn-primary"
          type="button"
          data-fc-action="accept"
        >
          Prihvati sve
        </button>

      </div>
    `;

    bannerElement.addEventListener(
      "click",
      onBannerClick
    );

    document.body.appendChild(bannerElement);
  }

  function onBannerClick(event) {
    const button = event.target.closest(
      "[data-fc-action]"
    );

    if (!button) return;

    const action = button.getAttribute(
      "data-fc-action"
    );

    if (action === "reject") {
      saveConsent({});
    }

    if (action === "accept") {
      saveConsent({
        preferences: true,
        analytics: true,
        marketing: true
      });
    }

    if (action === "settings") {
      openSettings();
    }
  }

  /* uklanja baner */

  function removeBanner() {
    if (bannerElement) {
      bannerElement.remove();
    }

    bannerElement = null;
  }

  /* zatvara podesavanja */

  function closeSettings() {
    if (overlayElement) {
      overlayElement.remove();
    }

    overlayElement = null;
  }

  /* otvara podesavanja */

  function openSettings() {
    if (!CONFIG.ENABLED) return false;

    closeSettings();

    const consent = getConsent();

    overlayElement = document.createElement("div");

    overlayElement.className = "fc-overlay";

    overlayElement.innerHTML = `

      <section
        class="fc-settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fc-settings-title"
      >

        <div class="fc-settings-heading">

          <div>
            <div class="fc-kicker">
              FORMULACIJA
            </div>

            <h2 id="fc-settings-title">
              Podešavanja privatnosti
            </h2>
          </div>

          <button
            class="fc-close"
            type="button"
            aria-label="Zatvori podešavanja"
            data-fc-action="close"
          >
            ×
          </button>

        </div>

        <p>
          Možete izabrati koje opcionalne kategorije
          želite da dozvolite. Neophodne tehnologije
          su uvek aktivne jer su potrebne za osnovne
          funkcije i bezbednost sajta.
        </p>

        <div class="fc-category-list">

          <div class="fc-category-row">

            <div class="fc-category-copy">
              <strong>Neophodni</strong>

              <span>
                Osnovni rad, bezbednost i pamćenje izbora privatnosti.
              </span>
            </div>

            <span class="fc-always-on">
              Uvek aktivni
            </span>

          </div>

          <div class="fc-category-row">

            <div class="fc-category-copy">
              <strong>Podešavanja</strong>

              <span>
                Pamćenje opcionalnih izbora i podešavanja sajta.
              </span>
            </div>

            <label class="fc-switch">

              <input
                type="checkbox"
                data-fc-category="preferences"
                ${consent.preferences ? "checked" : ""}
              >

              <span></span>

            </label>

          </div>

          <div class="fc-category-row">

            <div class="fc-category-copy">
              <strong>Analitika</strong>

              <span>
                Statistika poseta i način korišćenja sajta,
                radi njegovog unapređenja.
              </span>
            </div>

            <label class="fc-switch">

              <input
                type="checkbox"
                data-fc-category="analytics"
                ${consent.analytics ? "checked" : ""}
              >

              <span></span>

            </label>

          </div>

          <div class="fc-category-row">

            <div class="fc-category-copy">
              <strong>Marketing i oglasi</strong>

              <span>
                Prikazivanje, merenje i optimizacija reklamnih kampanja.
              </span>
            </div>

            <label class="fc-switch">

              <input
                type="checkbox"
                data-fc-category="marketing"
                ${consent.marketing ? "checked" : ""}
              >

              <span></span>

            </label>

          </div>

        </div>

        <div class="fc-settings-footer">

          <button
            class="fc-btn fc-btn-quiet"
            type="button"
            data-fc-action="reject"
          >
            Samo neophodni
          </button>

          <button
            class="fc-btn fc-btn-primary"
            type="button"
            data-fc-action="save"
          >
            Sačuvaj izbor
          </button>

        </div>

        <p style="margin-top:14px;font-size:.8rem">
          <a href="${CONFIG.PRIVACY_URL}">
            Pročitajte Politiku privatnosti
          </a>.
        </p>

      </section>
    `;

    overlayElement.addEventListener(
      "click",
      function (event) {

        if (event.target === overlayElement) {
          closeSettings();
        }

        const button = event.target.closest(
          "[data-fc-action]"
        );

        if (!button) return;

        const action = button.getAttribute(
          "data-fc-action"
        );

        if (action === "close") {
          closeSettings();
        }

        if (action === "reject") {
          saveConsent({});
        }

        if (action === "save") {

          const selection = {};

          OPTIONAL_CATEGORIES.forEach(
            function (category) {

              const input = overlayElement.querySelector(
                '[data-fc-category="' + category + '"]'
              );

              selection[category] = !!(
                input && input.checked
              );
            }
          );

          saveConsent(selection);
        }
      }
    );

    document.body.appendChild(overlayElement);

    const firstInput = overlayElement.querySelector(
      "input"
    );

    if (firstInput) {
      firstInput.focus();
    }

    return true;
  }

  /* dugme sto opet otvara podesavanja */

  function showLauncher() {
    if (launcherElement) return;

    launcherElement = document.createElement("button");

    launcherElement.type = "button";

    launcherElement.className = "fc-privacy-launcher";

    launcherElement.textContent =
      "Podešavanja privatnosti";

    launcherElement.addEventListener(
      "click",
      openSettings
    );

    document.body.appendChild(launcherElement);
  }


  function initUI() {
    if (!CONFIG.ENABLED) return;

    showLauncher();

    if (!currentConsent) {
      createBanner();
    }
  }

  /* API */

  const api = {

    getConsent: getConsent,

    hasConsent: hasConsent,

    openSettings: openSettings,

    onChange: function (callback) {

      if (typeof callback !== "function") {
        return function () {};
      }

      listeners.push(callback);

      return function () {
        listeners = listeners.filter(
          function (item) {
            return item !== callback;
          }
        );
      };
    },

    whenGranted: function (category, callback) {

      if (!OPTIONAL_CATEGORIES.includes(category)) {
        throw new Error(
          "Nepoznata kategorija pristanka: " + category
        );
      }

      if (typeof callback !== "function") {
        throw new TypeError(
          "Callback mora biti funkcija."
        );
      }

      const entry = {
        callback: callback,
        ran: false
      };

      callbacks[category].push(entry);

      if (hasConsent(category)) {
        runGrantedCallbacks();
      }

      return function () {
        callbacks[category] = callbacks[category].filter(
          function (item) {
            return item !== entry;
          }
        );
      };
    },

    clearConsent: function () {

      const previous = getConsent();

      currentConsent = null;

      try {
        localStorage.removeItem(
          CONFIG.STORAGE_KEY
        );
      } catch (_) {}

      if (CONFIG.ENABLED) {
        createBanner();
      }

      notify(previous);
    },

    isEnabled: function () {
      return CONFIG.ENABLED;
    }

  };

  window.FormulacijaConsent = api;

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initUI,
      { once: true }
    );

  } else {

    initUI();

  }

})();
