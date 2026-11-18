# KPD shipping and operations reports

Implemented on `feature/kpd-operations` from local main commit
`b2893ad442f9179ba5eac68ba8874e858cee0278`. The original VS Code checkout,
production database, and live site have not been modified. GitHub access was
unavailable in the execution environment, so remote main has not been compared
and this branch has not been pushed.

## What changes

The admin case dashboard gains Shipping and Reports links. The case detail
Shipping Label button now opens the shipping workspace. The former outbound
purchase endpoint returns a message directing old browser tabs to that workspace,
so they cannot bypass the purchase reservation checks.

Shipping groups eligible cases by customer account and dentist. Each group uses
the customer's saved delivery address. All Ready to Ship cases in that group are
preselected; held cases, ADW-linked cases, existing purchase reservations, and
cases with legacy tracking are excluded. The existing 6 × 4 × 4 inch / 1 lb
package is the editable default. UPS Ground is selected when available; another
service requires an explicit selection. Buying opens a native 4 × 6 PDF and saves
its transaction, label link, price, and tracking against every included case.
Printing does not set Shipped. Confirm box has shipped records the event for all
included cases. Shipment history displays the most recent 100 purchases.

Purchases reserve cases before contacting Shippo. A repeated click/request returns
the existing purchase; a timeout or ambiguous outcome cannot trigger another
purchase. An admin can retrieve the existing Shippo transaction using the stored
`kpd:<shipment-id>` metadata. A verified failed transaction releases the cases;
otherwise reservations remain until the outcome is known. Label refunds, voids,
and editing the contents of a purchased shipment are outside this change.

Reports include received and shipped for the chosen period plus current in-house,
production, on-hold, and ready-to-ship values. Customer, dentist, and product
filters apply to every view. Breakdowns, case details, and CSV exports use the
same filtered records. Case quantities use recorded restoration teeth or explicit
arches; incomplete quantities remain unknown. Product rows separate device types
and unit bases. Values use the stored case total, including a valid $0 remake.

## Report definitions and limits

- Received: earliest explicit impressions-received event if present, otherwise
  earliest Submitted event. Legacy fallback to the saved submission-date field is
  flagged. Created drafts and voided/canceled cases are excluded.
- Shipped: earliest explicit Shipped event. Tracking creation, Billed, and Closed
  are not substituted for a missing shipment date. Missing history is counted and
  disclosed. Repeated status saves do not double-count the same case.
- In-house: current Submitted, Scanning, Design, Manufacturing, Pre-Finish,
  Finish, or Ready to Ship status. It includes work received before the period.
  Production, held, and ready form mutually exclusive subsets.
- Dollars: current case values, not invoices, cash received, or frozen historical
  prices. Editing a case price changes its report value. No separate shipping,
  rush, or unrecorded add-on charges are inferred.
- Time: Florida calendar dates; weeks start Monday. Legacy strings are interpreted
  as the local wall time recorded in them. New shipment confirmations use the
  America/New_York timezone with daylight-saving support.
- ADW-linked cases remain in their separate fulfillment flow and are excluded.

## Validation

The offline unittest suite exercises report periods/backlog, holds and remakes,
product units, missing-history handling, CSV escaping, admin authorization/CSRF,
five-case grouping, held/mixed/changed cases, price verification, overlapping
quotes, idempotent purchases, uncertain and failed purchases, reconciliation,
shipment confirmations, ADW isolation, 4 × 6 provider requests, and the additive
migration. It uses synthetic records, SQLite, and a fake provider; no live
database or postage API is contacted.

Run with the existing project Python dependencies:

```text
python tests/test_kpd_operations.py
npm run build
```

The complete production frontend build succeeds with existing large-asset/bundle
warnings. Browser QA could not run: localhost was inaccessible to the browser and
local file URLs were blocked by browser policy. Physical printing and a Shippo
test-account integration run remain unverified. SQLite tests do not substitute
for a PostgreSQL concurrency test; the implementation uses row locks plus a
unique case reservation key for that database.

## Review preview

Open `docs/KPD-operations-preview.html` in a local browser. This self-contained
preview reuses the production React pages with a synthetic API simulator; every
patient, amount, and purchase is a demonstration. It makes no network requests.
It supports reports, filters, drill-through, shipping preparation, simulated
purchases, and shipment confirmation. Refreshing resets the example data. The
simulator is not included in the production entry point.

For an API-integrated local preview using a synthetic Flask database:

```text
node node_modules/webpack/bin/webpack.js --config tests/preview.webpack.js
python tests/preview_server.py
```

Open `http://127.0.0.1:4173`. It binds to loopback only, auto-signs into a synthetic
admin account, and uses fake shipping responses. Never deploy the preview server.

## Before production deployment

1. Compare the branch with current remote main and preserve newer work before
   merging. No production branch has been pushed by this change.
2. Review the sample UI and verify one 4 × 6 print with the actual thermal printer.
3. On staging, check the existing Alembic revision and a database backup. The new
   revision `kpd_operations_20261118` follows `adw_paid_20261020`; if production is
   behind that predecessor, review those other migrations separately.
4. Apply the additive migration on staging, then run a Shippo test-mode label and
   PostgreSQL concurrent-purchase test. Reconcile report totals with a known week
   of real cases using read-only access.
5. Apply the migration before deploying the new application/UI. It creates only
   `kpd_shipment` and `kpd_shipment_case`; it does not rewrite case data. Use the
   existing server-side Shippo configuration. Never include secrets in frontend
   builds. Run the normal production build so deployment-specific public settings
   replace development values.
6. Retain shipment tables and any purchase reservations during rollback. Do not
   reactivate the old purchasing flow while any new purchase is unresolved.
