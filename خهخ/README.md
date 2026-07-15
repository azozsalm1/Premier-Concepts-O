# Premier Concepts OS — All-in-One v1.1

## Fix in this version
- Uses `/api/property-lookup` with an explicit Netlify redirect.
- The API redirect is placed before the SPA redirect.
- The browser checks the response type before parsing JSON.
- Clear error shown when the Netlify Function folder was not uploaded.

## Required GitHub files
Confirm this exact nested file exists in GitHub:

`netlify/functions/property-lookup.js`

If GitHub only shows the root files and no `netlify` folder, property lookup cannot work.

## Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `RENTCAST_API_KEY`

After uploading the files, use **Clear cache and deploy site**.

Test the function directly after deploy:

`https://YOUR-SITE.netlify.app/api/property-lookup?address=17186%20Santa%20Catherine%2C%20Fountain%20Valley%2C%20CA%2092708`
