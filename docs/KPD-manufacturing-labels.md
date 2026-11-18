# Manufacturing case labels

Cases > Manufacturing now includes Print new labels with a pending count, plus
Reprint / already printed. All eligible KPD manufacturing cases are included,
independent of the dashboard search. Held cases and ADW cases are excluded.

New labels are preselected, up to 100 per job. Staff can uncheck cases before
printing. The browser opens one print window, with one case per 4 x 6 page and
the existing case information and tooth artwork. Set the thermal driver to
4 x 6, actual size (100%), and disable browser headers/footers. Stored due dates
are used. Long notes wrap; an excessively dense label stops printing and identifies
the case for individual handling. Wisdom teeth remain text-only, as in the old
28-tooth illustration. The individual case Print button is unchanged.

After printing, explicitly confirm the labels that succeeded. Uncheck failures,
or Leave unconfirmed after cancelling. Preparation and opening the print dialog
write no receipts. A successful confirmation records the case content hash,
staff ID, batch ID and UTC time; it never moves cases to another status. Shared
receipts remove confirmed labels from the new-label list across staff accounts.
Changes to printed case details return the case to that list. Reprint remains
available for unchanged labels.

Historic individual prints cannot be detected automatically. Use Reprint /
already printed, select those cases, then These labels are already printed to
record that their current labels already exist. Do not use it merely because
a print dialog opened. The same option can recover after leaving the page before
confirming a successful physical print. The application cannot detect a printer
jam or guarantee that the OS sent pages to the selected device.

Reviews expire after eight hours. Case-content changes, holds, or status changes
between preparation and confirmation block the entire confirmation request; review
the current cases again. Confirmations may cover only a subset of the reviewed
job. Retrying the same successful confirmation is idempotent. Refreshing or leaving
the page loses the unconfirmed review, but leaves the cases pending. Simultaneous
staff can still physically print overlapping jobs before either confirms; receipts
track confirmed printing, not exclusive printer ownership.

## Deployment and validation

Additive revision `kpd_manufacturing_20261118` follows
`kpd_operations_20261118` and creates one receipt table. It was applied and verified
on November 18, 2026 through the existing DigitalOcean app connection. Existing
case records and database network access were not changed. Application code
awaits Kyle's GitHub push. Retain receipts during code rollback.

46 offline backend tests pass, including eligibility, authorization/CSRF, no
writes on preparation, partial confirmation, idempotency, stale contents, invalid
tokens, reprinting, historical confirmation and additive migration preservation.
Node rendering checks cover escaped patient text, tooth selection and per-label
artwork attributes. Production and offline preview builds pass with existing
asset-size warnings. The portable preview uses synthetic cases and simulated
receipts, reset on reload. Physical print output, browser pagination, and
PostgreSQL concurrent confirmation behavior have not been exercised here.
