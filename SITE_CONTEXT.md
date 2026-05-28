# Greenfly website — site context

A briefing doc for picking up work on this repo in a new session. Skim this first, then ask the user what's next.

## Repo & deploy

- **Local**: `/Users/glindahl/Documents/Code/gf-website-local`
- **GitHub**: `glindahl-gf/cache-money` (intentionally goofy name; URL is unguessable)
- **Hosted**: GitHub Pages → `https://glindahl-gf.github.io/cache-money/`
- **Local dev**: `node .claude/serve.js` (static server, port 8765). Defaults `/` → `platform-with-copy.html`. _Don't run `open URL` after edits_ — user refreshes their own tab.
- **Workflow**: feature branch → PR to `main` → merge → Pages auto-deploys. Conventional branch names so far: `platform`, `review`, `pages`, `extract`.

## Architecture (post-extraction)

Plain static HTML — no framework, no build step.

```
/                              ← deployable root
├── *.html                     ← 17 pages (root) + legal/*.html (4)
├── css/
│   ├── base.css               ← shared layer: tokens, reset, primitives, btns, NAV, FOOTER, responsive
│   └── <page>.css             ← page-specific only
├── js/
│   ├── include.js             ← partial loader + nav/footer wiring
│   └── <page>.js              ← page-specific only
├── partials/
│   ├── nav.html               ← single source for the nav (logo, links, Solutions dropdown, Login, CTA)
│   └── footer.html            ← single source for the footer (3-col link grid + animated hex-cell bg)
├── images/                    ← brand/, homepage/, platform/, partners/, team/, life/, library/, 404/
└── archive/                   ← pre-Jazzy work; never delete, move here
```

### Partial-include pattern

Pages mount partials with `<div data-include="partials/nav.html"></div>`. `js/include.js`:

1. Detects `/legal/` subpages and rewrites `./paths` → `../paths` in fetched partials
2. Sets `.active` on the nav-link whose `data-nav` matches the current page (`platform`, `solutions`, `company` — solutions-* verticals all key off `solutions`)
3. Wires nav: `is-scrolled` blur after scrollY>8, `nav-on-light` color flip when a `.section-light` block sits at y=72px
4. Wires the responsive hamburger (≤768px): click toggle, click any link to close, Escape to close
5. Builds the footer's hex-cell grid SVG (R=42, reflows on resize)

**Tradeoff**: ~50-100ms FOUC on first paint since the partial loads via `fetch()`. Acceptable for review/marketing use. If it becomes a problem, the next step is Eleventy (the simplest static site generator) to pre-render partials at build time.

### Page wiring (every page except review.html)

```html
<link rel="stylesheet" href="css/base.css">      ← shared
<link rel="stylesheet" href="css/<page>.css">    ← page-specific
<script src="js/include.js" defer></script>     ← shared loader
...
<div data-include="partials/nav.html"></div>
...
<div data-include="partials/footer.html"></div>
<script src="js/<page>.js" defer></script>      ← optional, page-specific
```

Legal subpages use `../css/`, `../js/`, etc. (include.js handles partial paths automatically).

## Brand & design decisions

- **Electric Green `#B6F500`** — anchor color, dark sections
- **Field Green `#79982D`** — secondary, used on `.section-light` (variable swap via `--accent` override)
- **Fonts**: Oswald (display) + Barlow Condensed (body, nav, buttons). Springboard `index.html` uses plain Barlow as body; the nav is explicitly pinned to Barlow Condensed in base.css to stay consistent across pages.
- **Border-radius: 5px** on every button (`.btn`, `.btn-primary`, `.btn-ghost`, `.nav-cta`). Intentionally NOT pill — leadership wants to differentiate from SaaS (Linear/Vercel/Stripe). Matches the app's 5px and roughly the hex corner-rounding proportion.
- **Hexagons**: brand "container language." Flat-top, ~10–15% corner rounding. Used as backdrops (electric-green on dark, field-green on light) and as IQ-Suite callouts on photos.
- **Nav behavior**: always sticky (no auto-hide on scroll-down — that pattern reads as SaaS/news, not editorial). Blur background activates after scrollY>8. Text/CTA colors flip when crossing a `.section-light` block.

## Pages map

| Page | Purpose | Notes |
|---|---|---|
| `index.html` | Homepage springboard (logo-only nav) | 3 cards link to the homepage variants for leadership pick |
| `homepage-with-copy.html` (+ `-2`, `-3`) | Homepage candidates | Leadership will choose one; the chosen one eventually renames to `index.html` |
| `platform.html` | Platform overview | Canonical; has Collect + IQ Suite hex callouts, the animated arc preview wheel |
| `solutions.html` | Solutions hub | + 4 verticals: `-sports`, `-entertainment`, `-brands`, `-live-events` |
| `company.html` | About / careers | Has `#careers` anchor |
| `get-greenfly.html` | CTA / contact | |
| `legal.html` + `legal/biometric.html`, `data-protection.html`, `privacy.html`, `terms.html` | Legal pages | Subfolder paths handled by include.js |
| `404.html` | Not-found | No nav partial (carries its own minimal layout) |
| `automate-rosette-figma.html` | One-off Figma prototype | No nav partial |
| `review.html` | Internal brand-review one-pager | Standalone slide, no nav, **does not link base.css** |

## Conventions

- **New page**: copy the head block from `platform.html`, mount nav + footer partials, create `css/<page>.css` and `js/<page>.js`.
- **New nav item**: edit `partials/nav.html` once. Active-state detection lives in `js/include.js`'s `activeKey` mapping — add a branch for the new key.
- **New solutions vertical**: add to the dropdown in `partials/nav.html` AND to `js/include.js` (active-key logic already covers `solutions-*` filenames).
- **Changing brand colors**: update `:root` in `css/base.css`. Pages with their own `:root` (notably `index.css`) override locally.
- **Don't open new tabs**: when iterating with the user on a browser preview, don't run `open URL` after edits. They refresh their own tab. (Captured in memory file `feedback_browser_refresh.md`.)

## Gotchas & known sharp edges

- **base.css must load first** — page CSS overrides it. Springboard intentionally hides `.nav-links / .nav-utility / .nav-cta` with `!important` so future dedup passes don't strip it.
- **CSS `url()` paths resolve relative to the CSS file** — base.css is in `/css/`, so brand image URLs use `../images/...`.
- **Page CSS files were dedup'd** — they had duplicate copies of nav/footer rules that got stripped. If a page-specific override is needed for the nav/footer, add `!important` so future passes leave it alone, OR add a unique selector.
- **Footer hex grid `<symbol id="fly-silhouette">` paths use `fill="#000"`** — the fly stays black on hover so it pops against the electric-green hex.
- **GitHub Pages serves from `/cache-money/`** — relative paths in the partials use `./` and include.js rewrites for subfolders. Absolute paths starting with `/` would break.

## Open / WIP (as of last commit)

- PR #4 (`extract` → `main`): extraction + base.css/partials + dedup. ~3,750 net lines removed.
- The 13-commit `extract` branch is ready to merge. After merge, the next likely passes are:
  1. Leadership review of the 3 homepage variants → pick one → rename it to `index.html`
  2. Per-page visual polish (the structural pass is done)
  3. Possibly migrate to Eleventy if the partial-include FOUC becomes a concern
- The `.claude/` folder (launch.json + serve.js for local preview) is gitignored — only useful on the user's machine.

## Useful one-liners

```bash
# Restart local dev server (only if process died)
node /Users/glindahl/Documents/Code/gf-website-local/.claude/serve.js

# Verify a page serves
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8765/<page>.html

# Find all partials in use
grep -l "data-include" *.html legal/*.html

# Run sanity check on all JS
for f in js/*.js; do node --check "$f" || echo "FAIL: $f"; done
```
