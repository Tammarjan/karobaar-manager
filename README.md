# Karobaar Manager

A simple, mobile-first, offline-first business manager for small business owners.

## Features in the current development build

- Mobile-first dashboard with sales, investment, gross profit, net profit and stock value
- Investment, sales and profit trend chart
- Local IndexedDB storage; no account, backend or Cloudflare required
- Product catalogue, product editing and protected deletion for unused products
- Stock adjustments for damaged, missing, found or physically corrected stock; stock reductions are reflected as losses in net profit
- Partial and full sales returns with optional stock restoration, customer credit / cash refund tracking and adjusted profit
- Selling rate automatically updates when a different product is selected in the sale form
- Purchase / stock-in entries using weighted-average unit cost
- Sales with customer selection, automatic totals and default selling rates
- Individual numbered sales invoices with business name, contact details, address, optional logo URL and custom footer; print / save as PDF
- Amount received defaults to zero, allowing credit sales without extra typing
- One-time selling-rate override or update the saved default rate
- Customer ledger with purchase history, payments received and outstanding balance
- Record later customer payments against their balance
- Business expense records
- Daily, weekly, monthly, yearly and all-time report filters
- CSV export and JSON backup / restore
- PWA manifest and service-worker offline application shell

## Run locally

Serve this folder with any static web server. For example:

```bash
npx serve .
```

Open the local URL in a modern browser. Service workers and installable PWA features require localhost or HTTPS.

## Data and privacy

Business records are stored in IndexedDB in the browser on this device. Clearing browser/app storage or uninstalling the app can remove local records. Use **Backup & settings → Download backup** regularly and store the JSON backup somewhere safe. Restore replaces the current local records after confirmation.

## Accounting notes

- Total investment is the total of recorded stock purchases for the selected period.
- Sales revenue is separate from the cost of goods sold.
- Gross profit = sales total - cost of goods sold.
- Net profit = gross profit - recorded business expenses.
- New purchases update the product's weighted-average unit cost.
- Customer outstanding = sale totals - initial amounts received - later recorded customer payments.
- Stock value is an estimate using the weighted-average unit cost and current stock quantity.

This is an active development build. It has received source-level syntax checks, but it is not yet a final audited accounting release. Test it with sample records and keep backups before using it for live business accounts.
\n\n## Supplier management\n- Supplier directory, optional supplier assignment on stock purchases, supplier payment records, outstanding payable balances and printable supplier account statements.\n
- Business profile settings are stored locally and included in JSON backups.
