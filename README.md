# Premier Concepts OS — Cloud App Starter

This is the first real cloud-ready version:

- React + Vite frontend
- Supabase authentication and cloud project storage
- Netlify Function for secure RentCast property lookup
- Projects Hub
- Deal analysis and maximum-offer calculation
- Local fallback when Supabase is not configured

## 1. Create Supabase

1. Create a free Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy Project URL and anon public key.

## 2. Connect GitHub

1. Create a new GitHub repository.
2. Upload all project files from this folder.
3. In Netlify choose Add new project > Import an existing project.
4. Connect GitHub and choose the repository.

## 3. Netlify environment variables

Add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `RENTCAST_API_KEY`

Delete the RentCast key previously shared in chat and create a new one.

## 4. Deploy

Netlify automatically runs:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Local development

```bash
npm install
npm run dev
```

RentCast lookup only works through Netlify Functions or Netlify Dev.
