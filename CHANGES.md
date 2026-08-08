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

---

# UI Overhaul (same package, second commit or squash together)

## The look
The restored twilight/gold theme now actually gets its typefaces: **Cinzel**
(declared in the theme for years, never loaded) for the brand, section titles,
and constellation names, with **Alegreya Sans** as the UI body face. Loaded via
Google Fonts `<link>` — swap to self-hosted files later if you'd rather not
depend on the CDN.

## Sidebar → chart plates
The sidebar is rebuilt as collapsible "plates" (native `<details>`, keyboard-
and screen-reader-friendly): Tonight's Sky (open), Emotional Resonance, View &
Share, Display, Visible Constellations (open). Each section header is drawn as a
constellation rule — the title runs out along a faint star-path with node stars,
and its four-point star marker kindles gold and rotates when the section opens.
Keyboard shortcuts moved out of the sidebar into the Help modal. Emotional
filters are now labeled chips that light in their resonance color.

## New: search
A "Search the sky…" field filters the constellation list live by name or
alternate name, with an in-voice empty state. Search narrows the list only —
the sky itself stays governed by season/time/filters.

## Mobile
Below 900px the sidebar becomes an off-canvas drawer (☰ button, scrim,
Esc/scrim-tap to close). The canvas gains full touch support: one-finger pan,
two-finger pinch zoom (clamped to the same 0.1–4× range as the wheel), and a
still tap opens the constellation under your finger. Detail panel goes
full-width on phones; touch targets widen; the map-corner overlay toggles hide
(the drawer has the same controls).

## Quality floor
Visible gold focus outlines throughout, `prefers-reduced-motion` respected
(animations and transitions off), tabular numerals on FPS/time readouts, themed
scrollbars, `100dvh` layout so mobile URL bars don't clip the chart.

## Not changed
Every element ID, `name="emotional-filter"`, `data-toggle` contract, and the
`translate-x-full`/`hidden` panel mechanics are preserved — the engine JS is
untouched except for three additive features (search, drawer, touch). The
"Lore & Usage" detail section was dropped: no code ever populated it.

---

# Phase 4: the night in motion

- **Time-lapse (▶ by the clock):** press play and the whole night wheels past —
  the slider and clock advance (~1.2 game-hours per second), constellations
  rotate, wanderers drift, hour-gated stars rise and set live. Dragging the
  slider pauses playback. `?play=1` in a shared link autoplays — set a comet
  solstice night with `?s=winter&t=20&comet=1&play=1` on a TV behind the table
  and let it run. Reduced-motion clients never autoplay.
- **Remember this sky (🌙, under Tonight's Sky):** pins the current sky as a
  memory. A "Show remembered sky" toggle draws it as a faint dashed ghost —
  hollow violet stars and dotted lines — beneath tonight's stars. Change the
  hour (or play the time-lapse over it) and the differences are visible:
  anchors sit dead still on their ghosts, wanderers drift off theirs. The
  memory survives the session (saved with your other state) until you Forget.

---

# Smoothing pass: motion & labels

- **No more midnight snap.** The renderer now runs on a continuous, unwrapped
  clock during time-lapse — rotation math no longer jumps when the slider wraps
  23→0. Manual slider drags still jump to where you point (that's direct
  manipulation, not a glitch).
- **Stars rise and set instead of blinking.** Hour-gated constellations
  (byTimeOfNight) now fade in over ~0.6s and out over ~0.9s rather than popping.
  The sidebar list, count, and click-targets still use the strict truth — a
  mostly-set constellation can't be clicked, only seen going.
- **Labels stopped fighting.** Names are collected and drawn in one
  collision-aware pass after all constellations: sorted by priority (navigation
  value + magical intensity), each label tries four positions (anchor, below,
  above, further below) and sits out if the sky is too crowded there — the
  important names always keep their spot. Every label now has a thin dark halo
  so it stays readable across stars, and labels for constellations that are
  mostly risen/set don't draw at all.

---

# Rare skies: the ambient event ladder

A rarity ladder for the background, shooting stars staying the everyday sight:

- **Shooting stars** (common, unchanged) — every 5–12s, plus a brief natural
  flurry of 8–10 in a couple of seconds every few minutes.
- **Distant galaxies** (uncommon) — every ~1–2 minutes a faint galaxy fades in
  somewhere in the upper sky for ~25–35s and fades away: spirals with two arms
  or squashed ellipticals, tinted violet/teal/gold, slowly turning, drawn
  BEHIND the stars where the deep sky belongs.
- **Auroras** (rare, or summoned) — on its own, roughly every 3–6 minutes the
  sky has a 45% chance of a ~50s aurora: three sinuous curtains near the top,
  green fading up into violet, screen-blended so stars shine through, breathing
  on an 8s ramp. The **✨ Aurora veil** checkbox (or `aurora=1`) holds it on
  permanently and slightly brighter.
- **Meteor shower** (summoned only) — the **💫 Meteor shower** checkbox (or
  `shower=1`) opens a proper radiant: 2–3 meteors per second all streaming
  outward from a single point in the upper sky, the way real showers work.

All ambient randomness respects `prefers-reduced-motion` (forced aurora renders
as a static gentle veil). New URL params: `aurora=1`, `shower=1` — stack with
everything else, e.g. `?s=winter&t=0&comet=1&aurora=1&play=1`.

**Module handshake:** Frostfey Tundra v1.11.0's sky link now appends `aurora=1`
whenever the weather is the Feylight Veil — set the aurora in Foundry, and the
same lights ripple across feystarmap.com for everyone who clicks.

---

# Movement system v2: the sky stops spinning in circles

The old motion rotated every constellation in place at ~15°/hour with speed
multipliers — uniform, and the "chaotic" profile was high-frequency jitter
(the Shattered Path teleported). Replaced wholesale:

- **The sky wheel.** All non-anchor constellations now turn rigidly about a
  celestial pole up near the Frozen Throne's station — each at its own radius
  and bearing, exactly like a real night sky wheeling around a pole star. Low
  constellations sweep long arcs; high ones barely stir. Uniformity gone at
  the foundation.
- **Each movement type has a voice on top of the wheel:**
  - *steady* — the pure wheel, dignified and predictable
  - *seasonal* — the stars breathe, easing apart and together (±6%, ~6h period)
  - *wandering* — meanders off the wheel-path on two slow tides and drifts back
  - *mystical* — hangs and sways like something underwater, with a ±4° shimmer
  - *chaotic* — smooth three-octave layered noise: genuinely unpredictable
    roaming with **zero discontinuities**, plus per-star fragment drift — the
    Shattered Path's individual stars each slide on their own slow paths, so
    the broken trail visibly re-breaks itself without ever teleporting
  - *anchor* — still never moves
- Amplitudes and rates still scale from your data's movement profiles, so the
  per-constellation tuning you authored carries straight over.

---

# Movement v3, the real comet, richer aurora

- **Fixed closed orbits (drift bug fixed).** v2's pole-wheel made constellations
  slowly orbit away from their stations — breaking bearings. Every non-anchor
  constellation now owns a FIXED tilted ellipse around its home, traced at its
  own period (10–18h), direction, and tilt, with type epicycles at integer
  multiples of the orbit rate so each path closes exactly and loops with no
  seam. Purely periodic in continuous time: no reset, no drift, ever. All the
  rotation/morphing character (crawl, breathing, fragment drift) is preserved;
  wanderers spirograph, chaotics roam their neighbourhood — and everything is
  back in its station every orbit, so the Throne is north and the Pack is
  northwest forever.
- **The comet is now real.** Uses the provided comet artwork (alpha-trimmed,
  screen-blended, rotated to its heading) and — the big one — travels in WORLD
  space: a random fixed arc through the star field each pass (deterministic per
  pass), so it pans and zooms with the sky instead of floating awkwardly above
  it. And when it crosses a star, that star turns comet-blue and swells for 30
  seconds — background stars and constellation stars both, constellation stars
  with a cyan glow. Watching it drag a line of blue through the Wolf Pack is
  worth setting up on purpose.
- **Aurora got its full palette:** violet crowns the display, pink rides the
  middle curtain, green hangs lowest — matching real aurora altitude banding.
  The module's screen aurora got the same treatment (stronger pink, new magenta
  ribbon) in Frostfey Tundra v1.12.0, which also swaps its overlay comet to the
  same artwork.
