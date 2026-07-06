# NVIDIA

Redesign based on billbill-world.

Local React + Vite build for the Mirror Life Rehearsal front-end prototype.

## Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:5173/deep-rehearsal.html
```

## Build

```bash
npm run build
```

## Deploy

This project is configured for Netlify:

```bash
npm run build
npx netlify deploy --dir=dist
```

Use production deploy when ready:

```bash
npx netlify deploy --prod --dir=dist
```

## Notes

- The deep rehearsal result page is a local preview state, not a backend-generated production result.
- The Spline background is loaded from `https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode`.
- The entry-scene HLS background is loaded from Mux through `hls.js`.
