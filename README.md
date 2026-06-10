# GymTrack 🏋️

A mobile-first weightlifting tracker PWA built with Vite, React, TypeScript
and Tailwind CSS. All data lives in your browser's localStorage — no
account, no server.

## Features

- **Routines** — create named routines as ordered lists of exercises,
  reorder/edit them, and start a workout from one with a single tap (or
  start an empty quick workout).
- **Workout logging** — log sets with large +/− steppers for weight
  (2.5 kg steps) and reps; new sets are pre-filled from your last set or
  your previous session of that exercise. An in-progress workout survives
  page reloads and can be resumed from any tab.
- **History** — every finished session with per-exercise sets, total set
  count and total volume; expand for details, delete mistakes.
- **Progress** — per-exercise chart of top-set weight over time plus a
  session-by-session list.
- **Backup** — export all data as a JSON file and import it back on any
  device (Data tab).
- **PWA** — installable, works offline via a precaching service worker.

## Development

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build locally
npm run icons    # regenerate PWA icons in public/
```

## Design

Chalk-and-iron light theme with accents taken from IWF competition plate
colors (red 25 / blue 20 / yellow 15 / green 10); typography is Barlow +
Barlow Condensed, self-hosted so offline use keeps working. In the workout
logger, a plate-stack glyph shows how to load one side of a 20kg bar for
the entered weight. The repo ships Anthropic's `frontend-design` skill at
`.claude/skills/frontend-design/` for future UI work in Claude Code.

## Deploying to Vercel

The repo is ready for Vercel out of the box (`vercel.json` sets the Vite
framework preset and SPA rewrites):

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project**, import the repo and accept the
   detected defaults (build `npm run build`, output `dist`).
3. Deploy. Subsequent pushes to the production branch deploy automatically.

Or from the CLI: `npm i -g vercel && vercel`.

## Data & privacy

Data is stored under the `gymtrack:*` keys in localStorage of the browser
you use. Clearing site data deletes it — use **Data → Export backup**
first. Importing a backup replaces all current data after confirmation.
