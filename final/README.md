# Premier Concepts OS Enterprise

A consolidated, no-dependency, Netlify-ready operating system for construction and real-estate investment.

## Included
- Projects Hub and portfolio dashboard
- RentCast property lookup via secure Netlify Function
- Property facts, sales/tax history, comps
- Deal analyzer, MAO, ROI, financing, sensitivity analysis
- Full expandable rehab categories
- Materials and supplier purchasing tracker
- Contractors, schedule, Gantt, daily logs, punch list
- CRM and communication tracking
- Financing comparison
- Documents: invoices, estimates, contracts, change orders, agreements, scopes, inspections
- Reports, PDF print, CSV export, backup/import
- Dark mode, mobile responsive, offline local storage
- Supabase schema for cloud migration

## Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Add environment variable: `RENTCAST_API_KEY`
- Use Node 20

## GitHub update
Replace all files in your repository with this package, commit, then trigger:
`Clear cache and deploy site`.

## Important
Local mode is fully functional. Live property data requires your RentCast key.
Supabase cloud sync requires adding authentication and API credentials to your deployment.
