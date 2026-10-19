"""Staged orchestration. HTTP adapter must supply fresh authorize callback.

Not production enabled: requires migration, cleanup and constrained network
timeouts. authorize rechecks session and revocation before every durable result.
"""
import json
from .direct_multipart_storage import PART_BYTES

class DirectUploadService:

    def __init__(self, reservations, storage, receipts, clock):
        (self.reservations, self.storage, self.receipts, self.clock) = (reservations, storage, receipts, clock)

    def begin(self, authorize, reference, files, request_key):
        row = self.reservations.begin(authorize(), reference, files, request_key, now=self.clock())
        previous = self.receipts.get(row['id'])
        if previous:
            return self._receipt(previous)
        if row['state'] == 'finalizing':
            return self.finish(authorize, row['id'])
        if row['state'] not in ('reserved', 'uploading', 'finalizing'):
            raise ValueError('This upload was cancelled. Start a new upload.')
        return {'id': row['id'], 'part_bytes': PART_BYTES, 'files': [{'id': f['id']} for f in json.loads(row['manifest'])]}

    def part(self, authorize, reservation_id, file_id, part):
        file = self.reservations.claim_file(authorize(), reservation_id, file_id, now=self.clock())
        values = {}
        try:
            if file.get('complete'):
                return {'complete': True}
            upload_id = file.get('upload_id')
            if not upload_id:
                upload_id = self.storage.initiate(file['key'], file['bytes'])
                values['upload_id'] = upload_id
            url = self.storage.sign_part(file['key'], file['bytes'], upload_id, part)
            self.reservations.save_file(authorize(), reservation_id, file_id, file['lease'], values)
            return {'url': url}
        except Exception:
            try:
                self.reservations.save_file(authorize(), reservation_id, file_id, file['lease'], values)
            except Exception:
                pass
            raise
        finally:
            if file.get('complete'):
                self.reservations.save_file(authorize(), reservation_id, file_id, file['lease'], {})

    def complete_file(self, authorize, reservation_id, file_id):
        file = self.reservations.claim_file(authorize(), reservation_id, file_id, now=self.clock())
        if file.get('complete'):
            self.reservations.save_file(authorize(), reservation_id, file_id, file['lease'], {})
            return {'complete': True}
        if not file.get('upload_id'):
            raise ValueError('File has not been uploaded')
        try:
            self.storage.complete(file['key'], file['bytes'], file['upload_id'])
            digest = self.storage.checksum(file['key'], file['bytes'])
            self.reservations.save_file(authorize(), reservation_id, file_id, file['lease'], {'complete': True, 'sha256': digest})
        except Exception:
            try:
                self.reservations.save_file(authorize(), reservation_id, file_id, file['lease'], {})
            except Exception:
                pass
            raise
        return {'complete': True}

    @staticmethod
    def _receipt(row):
        return {'receipt': row['receipt'], 'file_count': len(row['files']), 'status': row['status']}

    def finish(self, authorize, reservation_id):
        row = self.reservations.finalize(authorize(), reservation_id)
        files = json.loads(row['manifest'])
        if not all((f.get('complete') and f.get('sha256') for f in files)):
            raise ValueError('Finish uploading every file first')
        receipt = {'receipt': row['id'], 'lab_id': row['lab_id'], 'reference': row['reference'], 'request_key': 'direct-' + row['id'], 'fingerprint': row['fingerprint'], 'status': 'awaiting_file_review', 'files': [{k: f[k] for k in ('key', 'bytes', 'sha256')} for f in files]}
        authorize()
        winner = self.receipts.insert_once(receipt)
        if winner['receipt'] != row['id']:
            raise ValueError('Receipt conflict')

        def finished(current, manifest):
            current['state'] = 'received'
        self.reservations.change(authorize(), reservation_id, finished)
        return self._receipt(winner)

    def cancel(self, authorize, reservation_id):
        self.reservations.cancel(authorize(), reservation_id, now=self.clock())
        return {'message': 'Upload cancelled. Its temporary files are awaiting cleanup.'}
