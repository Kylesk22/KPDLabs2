# Report filters, manufacturing labels and the Partial card

The live dentist filter split Adele Mirbey-Stallard from Dr. Adele
Mirbey-Stallard. The untitled entry showed zero for November 16-18, 2026;
selecting the titled entry showed 11 received cases ($1,860), 13 shipped
($1,840), and 17 currently in-house ($3,400) when inspected. These are
observations of the existing live data, not guaranteed future totals.

Reports now use one dentist name for title, casing and whitespace variants.
The dropdown, filters, breakdowns and CSV agree. Full names still must match;
different names are not fuzzy-matched. Customer and product filters continue
to apply. Saved cases and shipment dates are unchanged; no migration is needed.

The Partial order-selection image now occupies the same square image area as
the neighboring products, with the photo centered and its proportions retained.
The extra material subtitle has been removed from that card. Material and shade
information remain in the order form and product page.

The preceding print fix removes the scaled, absolutely positioned content and
fixed-height clipping box. Labels lay out at their final size. Each case starts
on a new 4 x 6 label; long notes can continue onto more labels. Case notes and
the case total are retained. Print confirmation behavior is unchanged.

Validation: 48 offline backend tests pass, including dentist variants through
the HTTP endpoint and CSV export. Batch-print regression checks pass for full
notes/totals, escaping, tooth selection and removal of the clipping container.
The production build passes with existing asset-size warnings. The fixed code
has not yet been deployed or verified on the physical thermal printer.

Kyle should transfer the committed feature branch to the usual local checkout,
then push to GitHub. No database script is required.
