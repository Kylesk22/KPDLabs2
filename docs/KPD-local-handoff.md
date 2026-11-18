# Bring the tested changes into the usual local KPD repository

## Current handoff: manufacturing labels - November 18, 2026

The feature is ready for Kyle's GitHub push. The usual local main was verified
at `cee9787` (Cases styling). Transfer the committed feature branch locally:

```powershell
git -C 'C:\Users\Kyle\Desktop\CrownDental\react-flask-hello' pull --ff-only 'C:\Users\Kyle\Documents\Codex\2026-11-18\new-chat\work\kpd-website' feature/kpd-operations
```

Then push from the usual repository. No additional database script is needed.
If the local transfer reports diverged history or conflicts, preserve the error;
do not reset or force. A remote push rejection also needs review, not force-push.

The additive migration `kpd_manufacturing_20261118`, following
`kpd_operations_20261118`, was applied through the authenticated DigitalOcean
console. The transaction checked the expected database and predecessor, locked
the migration row, used an advisory lock and short timeouts, created only
`kpd_manufacturing_label`, and recorded the revision. Verification confirmed the
new revision, zero receipt rows, and primary key `case_id`. No existing cases
were rewritten. Keep this table when rolling back application code.

Validation: 46 offline backend tests, manufacturing markup/escaping checks,
production webpack build and portable preview build passed. Existing asset-size
and old Browserslist warnings remain. Browser layout and physical thermal output
still require the first real printer check; no actual labels were printed here.

After deployment: Cases > Manufacturing > Print new labels. Select one case for
the first test. Use 4 x 6 paper, 100%/actual size, and no browser headers/footers.
Confirm only labels that physically printed. Use Reprint / already printed for
historic labels; individual case Print buttons have no confirmation receipts.
See `KPD-manufacturing-labels.md` for the workflow and recovery details.

## Historical shipping deployment checkpoint - November 18, 2026

The instructions below describe the earlier shipping delivery. The current
handoff above supersedes its pending-deployment and database-check steps.

The production database step is now complete. Through the authenticated
DigitalOcean App Platform console, the live app's existing connection confirmed
`adw_paid_20261020` and the absence of the two new tables. The exact additive
`kpd_operations_20261118` migration was then applied transactionally, with a
database target check, version-row lock, advisory lock, and short lock timeout.
Verification confirmed both tables exist with zero rows and the case reservation
primary key is `case_id`. Existing cases and network/trusted-source settings were
not modified. Do not rerun the migration snippet or the earlier database setup.

Verified hosting: DigitalOcean App Platform `shark-app`, service `kpd`, app ID
`d2a50000-502b-4478-bcc1-51b3c1854124`. Source is `Kylesk22/KPDLabs2`, branch `main`,
autodeploy On. The running commit before this update is `b2893ad`. Build command
is `npm run build`; run command is Gunicorn with two workers, four threads and
a 60-second timeout. The database UI advertises seven-day point-in-time recovery;
no new backup cluster was created.

The personal-PC timeout remains unexplained. Its configured host/port/database
match the live app and DO connection details. Saved home/work IPs exist, but the
PC's current public address was not verified. Access changes were not needed to
complete this deployment step through the existing app connection.

Kyle still needs to push the completed code from the usual local repository.
Application deployment, live UI verification and physical label printing remain
pending. The earlier instructions below describe the original handoff.

The completed code is in a separate local checkout on `feature/kpd-operations`.
Kyle will handle GitHub pushes.

In the VS Code PowerShell terminal:

```powershell
git -C 'C:\Users\Kyle\Desktop\CrownDental\react-flask-hello' pull --ff-only 'C:\Users\Kyle\Documents\Codex\2026-11-18\new-chat\work\kpd-website' feature/kpd-operations
```

This fetches the local feature branch and fast-forwards the usual checkout. It
does not contact GitHub, push, deploy, or modify the database. Existing ignored
configuration such as `.env` stays in place. If Git reports conflicting changes
or a diverged branch, stop and keep the message; do not reset or force anything.

Before pushing the production branch, check the actual database revision:

```powershell
Set-Location 'C:\Users\Kyle\Desktop\CrownDental\react-flask-hello'
pipenv run python scripts/check_kpd_operations_db.py
```

The check uses the existing project configuration. It opens a read-only SSL
connection, reports migration revision and table presence, and does not query
patient records or print credentials. Share its output to finish the deployment
step. If pipenv is unavailable, use the existing VS Code project interpreter to
run that script instead.

The additive migration `kpd_operations_20261118` creates `kpd_shipment` and
`kpd_shipment_case`. Its expected predecessor is `adw_paid_20261020`. Confirm the
target database and revision before applying it; an older revision needs review
so unrelated ADW migrations are not inadvertently deployed. Do not use stamp/reset.
Apply the migration before the updated site serves shipping requests. Existing
case records are not rewritten by this migration.

After the database step and remote-branch comparison, push from the usual local
repository. The actual hosting build must supply its normal frontend settings
and existing server-side `SHIPPO_TOKEN`. The local build used placeholder public
settings for compilation only; its output is not part of this handoff.

Validation: 36 offline tests pass and production webpack build passes with the
existing asset-size warnings. The updated HTML preview contains invented cases
and simulated purchases only. Actual printer output, live provider integration,
and PostgreSQL concurrent purchase behavior have not been verified here.

After deployment: log in as an admin, check Reports against a known period,
prepare a ready dentist group, verify weights and case assignments, and print
the first actual purchased 4 x 6 label at 100%. Confirm Shipped only when the box
leaves. Saved label links can be reprinted without purchasing again. Retain the
new shipment tables and purchase reservations if rolling back application code.
