/* Greenfly cookie consent — configuration for the Silktide Consent Manager
 * (vendored, MIT, in js/silktide-consent-manager.js). Mounted site-wide by
 * include.js so every page gets the banner without per-page <head> edits.
 * See issue #21.
 *
 * Categories mirror the current site: Strictly necessary · Functional ·
 * Measurement · Advertising. Non-essential categories default to OFF
 * (denied) per GDPR. Each maps to Google Consent Mode v2 signals via `gtag`.
 *
 * WIRED: GA4 (G-SVDERW6LQ0) under Measurement — gtag.js loads only on opt-in.
 * STILL PENDING (#20): Advertising pixels (Google Ads, Meta, LinkedIn, Marketo)
 * — add each loader under the Advertising category's `scripts: []` once IDs
 * land. The library injects scripts only after opt-in; until then nothing fires.
 */
(function () {
  if (!window.silktideConsentManager || typeof window.silktideConsentManager.init !== 'function') {
    console.warn('Greenfly: Silktide Consent Manager failed to load.');
    return;
  }

  /* Google Consent Mode v2 — set defaults to DENIED before any tags load.
     Harmless with no GTM present; establishes the correct baseline so that
     when GTM is added (in <head>, before this), tags respect consent. */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  });

  /* GA4 (G-SVDERW6LQ0). The gtag.js loader is injected only when the
     Measurement category is granted (see scripts[] below); these queued calls
     then process when it loads. Until opt-in, nothing fires. #20 */
  gtag('js', new Date());
  gtag('config', 'G-SVDERW6LQ0');

  window.silktideConsentManager.init({
    consentTypes: [
      {
        id: 'necessary',
        label: 'Strictly necessary',
        description: 'Required for the website to function and cannot be switched off.',
        required: true,
        defaultValue: true,
      },
      {
        id: 'functional',
        label: 'Functional',
        description: 'Enable enhanced functionality and personalization, such as remembering your choices.',
        defaultValue: false,
        gtag: 'functionality_storage',
      },
      {
        id: 'analytics',
        label: 'Measurement',
        description: 'Help us understand how visitors use the site so we can improve it.',
        defaultValue: false,
        gtag: 'analytics_storage',
        scripts: [
          { url: 'https://www.googletagmanager.com/gtag/js?id=G-SVDERW6LQ0', load: 'async' },
        ],
      },

      {
        id: 'advertising',
        label: 'Advertising',
        description: 'Used to deliver and measure relevant advertising across platforms.',
        defaultValue: false,
        gtag: ['ad_storage', 'ad_user_data', 'ad_personalization'],
        // scripts: [ /* Google Ads / Meta / LinkedIn / X pixels — add once IDs land (#20) */ ],
      },
    ],
    prompt: { position: 'bottomRight' },
    icon: { position: 'bottomLeft' },
    text: {
      prompt: {
        description: '<p>We use cookies to run the site, understand how it’s used, and improve your experience. Accept all, reject non-essential, or choose your preferences. See our <a href="/legal/cookie-policy.html">Cookie Policy</a>.</p>',
        acceptAllButtonText: 'Accept all',
        rejectNonEssentialButtonText: 'Reject non-essential',
        preferencesButtonText: 'Preferences',
      },
      preferences: {
        title: 'Cookie preferences',
        description: '<p>Choose which cookies Greenfly can use. Strictly necessary cookies are always on. You can change this any time from the “Cookie settings” link in the footer. See our <a href="/legal/cookie-policy.html">Cookie Policy</a>.</p>',
        saveButtonText: 'Save and close',
      },
    },
  });

  /* Footer "Cookie settings" link reopens preferences. Delegated so it works
     regardless of when the footer partial loads; it triggers Silktide's
     (hidden) icon button, which already carries the open-preferences handler. #21 */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (!t) return;
    e.preventDefault();
    var icon = document.getElementById('stcm-icon');
    if (icon) icon.click();
  });
})();
