"""Intake boundary for a server-authenticated lab; no browser storage credentials.

Storage/repository adapters must be supplied by the server. This module is not a
public upload endpoint. File acceptance here is transport validation, not geometry
or manufacturing approval. A durable repository and private storage are required.
"""
import json
import hashlib
import re
import secrets

MAX_FILE_BYTES = 100 * 1024 * 1024
MAX_CASE_BYTES = 300 * 1024 * 1024
MAX_FILES = 12
EXTENSIONS = {'.stl', '.ply', '.obj', '.jpg', '.jpeg', '.png', '.pdf'}


class Intake:
    def __init__(self, repository, storage):
        self.repository, self.storage = repository, storage

    def submit(self, principal, reference, files, request_key=None):
        # Principal is supplied by verified server auth, never a request lab_id.
        if not principal or principal.get('adw_approved') is not True or not principal.get('lab_id'):
            raise PermissionError('Approved lab access required')
        if not isinstance(reference, str) or not re.fullmatch(r'[A-Za-z0-9_-]{3,40}', reference):
            raise ValueError('Use a non-identifying case reference')
        if not isinstance(files, list) or not 1 <= len(files) <= MAX_FILES:
            raise ValueError('Invalid number of files')
        prepared, total = [], 0
        for file in files:
            name, content = file.get('name'), file.get('content')
            if (not isinstance(name, str) or len(name) > 160 or
                    any(c in name for c in '/\\\x00\r\n') or '.' not in name):
                raise ValueError('Invalid filename')
            extension = '.' + name.rsplit('.', 1)[1].lower()
            if extension not in EXTENSIONS or not isinstance(content, bytes) or not 0 < len(content) <= MAX_FILE_BYTES:
                raise ValueError('Unsupported or oversized file')
            total += len(content)
            if total > MAX_CASE_BYTES:
                raise ValueError('Case exceeds size limit')
            prepared.append((extension, content))
        fingerprint = hashlib.sha256(json.dumps([reference, [
            [ext, len(content), hashlib.sha256(content).hexdigest()]
            for ext, content in prepared]], separators=(',', ':')).encode()).hexdigest()
        return self._persist(principal, reference, [
            (ext, content, len(content), hashlib.sha256(content).hexdigest())
            for ext, content in prepared], fingerprint, request_key, self.storage.put_private)

    def _persist(self, principal, reference, prepared, fingerprint, request_key, write):
        # Internal only: callers validate bytes/streams and identity first.
        if request_key is not None:
            if not isinstance(request_key, str) or not re.fullmatch(r'[A-Za-z0-9_-]{16,80}', request_key):
                raise ValueError('Invalid upload request key')
            previous = self.repository.get_request(str(principal['lab_id']), request_key)
            if previous:
                return self.replay(previous, fingerprint)
        receipt = 'ADW-'  + secrets.token_hex(16)
        manifest, written = [], []
        persistence_attempted = False
        try:
            for extension, content, length, digest in prepared:
                # Do not retain original names in keys or Shopify. Names may contain PHI.
                key = 'adw/intake/' + receipt + '/' + secrets.token_hex(16) + extension
                written.append(key)
                write(key, content)
                if self.storage.size(key) != length:
                    raise IOError('Upload verification failed')
                manifest.append({'key': key, 'bytes': length, 'sha256': digest})
            row = {'receipt': receipt, 'lab_id': str(principal['lab_id']),
                'reference': reference, 'files': manifest, 'status': 'awaiting_file_review'}
            persistence_attempted = True
            if request_key is None:
                self.repository.insert(row)
            else:
                row.update(request_key=request_key, fingerprint=fingerprint)
                winner = self.repository.insert_once(row)
                if winner['receipt'] != receipt:
                    for key in written:
                        self.storage.delete_or_queue_cleanup(key)
                    written.clear()
                    return self.replay(winner, fingerprint)
        except Exception:
            if persistence_attempted:
                # Commit acknowledgement can fail after the row is durable. Never
                # delete its objects. If lookup also fails, retain objects for
                # reconciliation rather than risk damaging a committed receipt.
                try:
                    committed = self.repository.get(receipt)
                except Exception:
                    raise
                if committed:
                    return {'receipt': committed['receipt'],
                            'file_count': len(committed['files']),
                            'status': committed['status']}
            # Production adapter must queue cleanup if delete fails; do not lose
            # track of abandoned files or convert partial uploads into receipts.
            for key in written:
                self.storage.delete_or_queue_cleanup(key)
            raise
        return {'receipt': receipt, 'file_count': len(manifest), 'status': 'awaiting_file_review'}

    @staticmethod
    def replay(row, fingerprint):
        if row['fingerprint'] != fingerprint:
            raise ValueError('This upload request was already used for different files or a different reference')
        return {'receipt': row['receipt'], 'file_count': len(row['files']), 'status': row['status']}

    def owned_receipt(self, principal, receipt):
        if not principal or principal.get('adw_approved') is not True:
            raise PermissionError('Approved lab access required')
        row = self.repository.get(receipt)
        if not row or row['lab_id'] != str(principal.get('lab_id')):
            raise PermissionError('Receipt unavailable')
        return row
