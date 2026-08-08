# Starmap Update — Cleanup + Shareable Sky Links

## Fixed
- **Restored the mystical theme.** `index.html` links `css/styles.css`, but the file
  had been renamed to `styles.cssold` — the 735-line Feywild theme (Cinzel type,
  artifact-bronze slider, glow effects) was 404ing and the site ran on bare Tailwind.
  Renamed back; the site now looks the way it was designed to.
- **Dead display-toggle buttons.** `toggle-constellation-names` / `-lines` /
  `toggle-grid` existed twice in the DOM (sidebar + map overlay). Only the sidebar
  set ever worked. Both sets now share `data-toggle` attributes, both are wired, and
  their labels/aria-pressed stay in sync no matter which one is clicked.
- **Tailwind Play CDN removed.** Replaced the runtime `cdn.tailwindcss.com` script
  with a compiled, minified `css/tailwind.css` (18.7 KB). No third-party runtime
  dependency, no flash of unstyled content. To rebuild after editing classes:
  `npx tailwindcss@3.4.17 -i tw-input.css -o css/tailwind.css --minify`
  (config in `tailwind.config.js`; no package.json on purpose so Vercel keeps
  treating this as a static site).
- Removed dead files: `js/enhanced_starmap.jsold`, `css/styles.cssold`.

## New: shareable sky links
The map now reads settings from the URL (URL wins over saved session state):

| Param | Meaning | Values |
|---|---|---|
| `s` | Season & Events | `all`, `winter`, `deep-winter`, `solstice`, `eclipse`, `late-bloom`, `high-spring`, `mid-summer`, `late-summer`, `mid-autumn`, `late-autumn`, `equinox` |
| `t` | Time of Night slider | `0`–`23` (halves allowed) |
| `se` | Show Special Events | `1`/`0` |
| `names`, `lines` | Display toggles | `1`/`0` |
| `grid` | Grid | `1`/`0` (default off) |
| `e` | Emotional filters | comma list of `mourning,revelation,bargain,betrayal` |

Example — a solstice midnight with the full winter sky:
`https://feystarmap.com/?s=winter&t=0&se=1&names=1&lines=1&grid=0`

A **🔗 Copy Link to This Sky** button (sidebar, above Reset View) builds the link
from the current settings and copies it, with a toast confirmation.

## Deploy
Copy these files over the repo working tree, then:
```
git add -A
git rm --cached js/enhanced_starmap.jsold css/styles.cssold 2>/dev/null
git commit -m "Restore theme, fix dead toggles, static Tailwind, shareable sky links"
git push
```
Vercel builds off the repo and will deploy automatically. Check the preview
deployment before promoting if you want to eyeball the restored theme first.
