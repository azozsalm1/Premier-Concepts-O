# Premier Concepts OS — Netlify Fast Build Fix

This edition has **zero npm dependencies**. Netlify does not need to download React, Vite, Supabase, or any other package.

## Replace the old GitHub files
Upload all files from this folder and overwrite the files with the same names. The important replacements are:

- `package.json`
- `package-lock.json`
- `netlify.toml`
- `.nvmrc`
- `index.html`

Also upload:
- `app.js`
- `styles.css`
- `build.mjs`
- `manifest.json`
- `icon.svg`
- `netlify/functions/property-lookup.js`

The old `src` folder can remain; it is not used by this version.

## Netlify settings
- Branch: `main`
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: blank

## Environment variable
Create a **new** RentCast key. In Netlify add:

`RENTCAST_API_KEY = your new key`

Then trigger **Deploys > Trigger deploy > Clear cache and deploy site**.

## Why the previous build timed out
The previous lockfile contained download URLs for a private/internal package registry. Netlify could not access it. This lockfile has no package downloads at all.
