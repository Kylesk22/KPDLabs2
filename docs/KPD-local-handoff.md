# Bring the tested changes into the usual local KPD repository

The completed code is in a separate local checkout on `feature/kpd-operations`.
The live site and database have not been changed. Kyle will handle GitHub pushes.

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
