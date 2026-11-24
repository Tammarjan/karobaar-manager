# Karobaar Manager

A simple, mobile-first, offline-first business manager for small business owners.

## Current foundation

- Responsive dashboard designed for phone and desktop
- Local IndexedDB database (no account, server, or Cloudflare required)
- Products and stock records
- Purchase / stock-in entries with weighted-average unit cost
- Sales with customer selection and saved default selling rates
- Per-sale rate override with an option to update the default rate
- Customer list and purchase totals
- Business expense records
- Gross profit and net profit summaries
- CSV report export
- PWA manifest and service-worker offline shell

## Run locally

Serve this folder with any static web server. For example:

```bash
npx serve .
```

Open the local URL in a modern browser. Service workers and installable PWA features require localhost or HTTPS.

## Data and privacy

Business records are stored in the browser's IndexedDB on this device. Clearing browser/app storage can delete these records. Export and backup/restore workflows will be added before the production release.

## Accounting notes

- Sales revenue is recorded separately from the cost of goods sold.
- Gross profit = sales total - cost of goods sold.
- Net profit = gross profit - recorded expenses.
- Product unit cost uses a weighted average when new purchases are added.
- Current stock value is an estimate using that weighted-average unit cost.

This is an initial development build, not a final audited accounting system.
