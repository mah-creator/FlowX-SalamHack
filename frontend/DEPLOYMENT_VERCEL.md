# Vercel Deployment

Vercel Project Settings:

- Framework Preset: Vite
- Root Directory: frontend
- Install Command: npm install
- Build Command: npm run build
- Output Directory: dist

Environment Variable:

```text
VITE_API_BASE_URL=https://flowx-salamhack-production.up.railway.app
```

Because the frontend and backend are in the same repository, Vercel must use Root Directory = frontend. The Laravel backend should remain deployed separately on Railway.

After adding or changing environment variables in Vercel, redeploy the project.
