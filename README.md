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
- Customer outstanding = sale totals - sales returns / credits - initial amounts received - later customer payments + cash refunds paid to customers.
- Supplier payable = assigned purchase totals - recorded supplier payments.
- Gross profit = net sales after returns - cost of goods sold; the cost of returned goods is reversed only when the goods are restocked.
- Net profit = gross profit - recorded business expenses - stock losses from stock reductions.
- Stock value is an estimate using the weighted-average unit cost and current stock quantity.
- Inventory reconciliation compares each product's available stock with the sum of its remaining batch quantities. Lower batch totals are identified as untracked stock; batch totals exceeding product stock and batches without a matching product are flagged for review.

This is an active development build. It has received source-level syntax checks, but it is not yet a final audited accounting release. Test it with sample records and keep backups before using it for live business accounts.
\n\n## Supplier management\n- Supplier directory, optional supplier assignment on stock purchases, supplier payment records, outstanding payable balances and printable supplier account statements.\n
- Business profile settings are stored locally and included in JSON backups.

## Advanced inventory
- Per-product minimum stock levels with low-stock alerts and product search.
- Batch/lot number and expiry-date capture on purchases; remaining batch quantities are tracked using earliest-expiry-first stock consumption.
- Expiry alerts for batches due within 30 days and expired batches.
- Product transaction history with purchases, sales, returns, stock adjustments and batch balances.
- Inventory reconciliation panel compares product stock with remaining batch quantities and flags over-allocated or orphan batches.

## Barcode / QR assisted POS
- Optional unique barcode/QR value per product.
- Quick POS sale accepts keyboard barcode scanners and manual code entry.
- Uses the browser BarcodeDetector API for camera scanning where supported; external scanner entry remains available as fallback.
- Camera scanning requires HTTPS, camera permission and browser support.


## Multi-product POS invoices
- Add multiple products and quantities to one invoice, remove cart lines before saving, and apply a fixed invoice discount.
- Invoice totals and received payments are allocated across item-level sale records so existing customer balances, product returns and stock batch tracking continue to work.
- Invoice printout groups all products under one invoice number.


## Accounting unit tests

Pure accounting calculations are shared by the app and Node's built-in test runner. With Node.js 20 or newer installed, run:

```sh
node --test tests/accounting.test.mjs
```

Tests cover multi-item invoice aggregation, customer balances, supplier payables, returned-stock COGS reversal, stock losses and legacy records with missing optional values. GitHub Actions runs this suite on pushes and pull requests.


## Transaction safety

POS invoice creation re-reads current product and batch stock inside one IndexedDB read-write transaction. Stock validation, FEFO batch deductions, product quantity updates and invoice line inserts commit together or are aborted together. This prevents stale stock snapshots from overwriting newer inventory when two tabs attempt sales close together. Sales returns and stock adjustments also read the latest sale, return history, product stock and batch balances inside their own read-write transactions; validation and all related writes commit together or abort together. Customer and supplier statements sort by their stored ISO dates before formatting. Stock purchases read the latest product quantity and unit cost, then atomically save the weighted-average cost, stock increase, purchase row and new batch. Supplier selection is verified in the same transaction.


## Payment transaction safety

Customer and supplier payments now recalculate the latest outstanding balance inside read-write transactions before inserting a payment record. This prevents two tabs from accepting payments against the same stale balance.
