# FlowX deployment guide

## Local run

```bash
npm install
npm run dev
```

## Optional mock API

```bash
npm run server
```

The frontend works without the mock API because each service falls back to local mock data.

## Production build

```bash
npm run build
npm run preview
```

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Add this redirect rule if using deep links:

```txt
/* /index.html 200
```

## Vercel

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

Set the public directory to `dist` and configure the app as a single-page app.
