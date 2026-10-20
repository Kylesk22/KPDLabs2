"""Bind staff acceptance to the order, destination, lab and files reviewed."""
import hashlib
import json

def review_fingerprint(plan, address, profile, receipts):
    manifests = []
    for line in plan['lines']:
        receipt = receipts.get(line['receipt'])
        if not receipt or receipt.get('lab_id') != plan['lab_id']:
            raise ValueError('Reviewed files unavailable')
        manifests.append({'receipt': line['receipt'], 'files': receipt.get('files'), 'status': receipt.get('status')})
    snapshot = dict(plan=plan, address=address, files=manifests, lab={key: profile.get(key) for key in ('lab_id', 'practice', 'contact_name', 'phone', 'verified_email', 'lab_review', 'blocked')})
    return hashlib.sha256(json.dumps(snapshot, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
