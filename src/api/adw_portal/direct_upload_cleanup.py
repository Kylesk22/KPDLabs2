"""Explicit worker for cancelled ADW reservations; no scheduler on import.

No age-based removal of submitted cases. Never uses a key from an HTTP request.
"""
import json
from sqlalchemy import select
from .direct_upload_reservations import reservations

class DirectUploadCleanup:

    def __init__(self, repo, storage, receipts, clock):
        (self.repo, self.storage, self.receipts, self.clock) = (repo, storage, receipts, clock)

    def run(self, limit=20):
        if type(limit) is not int or not 1 <= limit <= 100:
            raise ValueError('Invalid batch limit')
        with self.repo.engine.connect() as db:
            rows = db.execute(select(reservations).where(reservations.c.state == 'cleanup_pending').order_by(reservations.c.created).limit(limit)).mappings().all()
        cleaned = 0
        for row in rows:
            files = json.loads(row['manifest'])
            if any((f.get('cleanup_after', float('inf')) > self.clock() for f in files)):
                continue
            if self.receipts.get(row['id']) is not None:
                continue
            for file in files:
                self.storage.discard(file['key'], file['bytes'])

            def finish(current, manifest):
                if current['state'] != 'cleanup_pending':
                    raise ValueError('Cleanup state changed')
                current['state'] = 'cleaned'
            self.repo.change({'lab_id': row['lab_id'], 'adw_approved': True}, row['id'], finish)
            cleaned += 1
        return cleaned

    def expire_abandoned(self, limit=20):
        """Expire only unsubmitted uploads after 24 hours; never receipts."""
        if type(limit) is not int or not 1 <= limit <= 100:
            raise ValueError('Invalid batch limit')
        now = self.clock()
        with self.repo.engine.connect() as db:
            rows = db.execute(select(reservations).where(reservations.c.state.in_(['reserved', 'uploading']), reservations.c.created <= now - 86400).order_by(reservations.c.created).limit(limit)).mappings().all()
        expired = 0
        for row in rows:
            if self.receipts.get(row['id']) is not None:
                continue

            def expire(current, files):
                if current['state'] not in ('reserved', 'uploading'):
                    return False
                if any((f.get('lease_until', 0) > now for f in files)):
                    return False
                current['state'] = 'cleanup_pending'
                for file in files:
                    file['cleanup_after'] = int(now) + 900
                    file.pop('lease', None)
                    file.pop('lease_until', None)
                return True
            expired += bool(self.repo.change({'lab_id': row['lab_id'], 'adw_approved': True}, row['id'], expire))
        return expired
