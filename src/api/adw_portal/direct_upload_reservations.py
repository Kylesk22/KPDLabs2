"""Staged durable reservations. No routes or schema creation on import.

Principal must come from GuestUploadSession on EVERY operation. Reservations
retain quota until explicitly reconciled; expiry alone never frees storage.
External storage calls must not run while holding the per-lab database lock.
"""
import hashlib
import json
import re
import secrets
from sqlalchemy import MetaData, Table, Column, String, BigInteger, Text, select, UniqueConstraint
from sqlalchemy.exc import IntegrityError
from .intake import EXTENSIONS, MAX_FILES
metadata = MetaData()
locks = Table('adw_direct_upload_lock', metadata, Column('lab_id', String(80), primary_key=True), Column('version', BigInteger, nullable=False))
reservations = Table('adw_direct_upload_reservation', metadata, Column('id', String(36), primary_key=True), Column('lab_id', String(80), nullable=False, index=True), Column('request_key', String(80), nullable=False), Column('fingerprint', String(64), nullable=False), Column('reference', String(40), nullable=False), Column('manifest', Text, nullable=False), Column('bytes', BigInteger, nullable=False), Column('state', String(24), nullable=False), Column('created', BigInteger, nullable=False), UniqueConstraint('lab_id', 'request_key'))
FILE_LIMIT = 100 * 1024 * 1024
CASE_LIMIT = 300 * 1024 * 1024
PENDING_LIMIT = 900 * 1024 * 1024

def lab_identity(principal):
    if not isinstance(principal, dict) or principal.get('adw_approved') is not True:
        raise PermissionError('Verified lab required')
    lab = str(principal.get('lab_id') or '')
    if not lab or len(lab) > 80:
        raise PermissionError('Verified lab required')
    return lab

def manifest_for(reference, files):
    if not isinstance(reference, str) or not re.fullmatch('[A-Za-z0-9_-]{3,40}', reference):
        raise ValueError('Use a non-identifying case reference')
    if not isinstance(files, list) or not 1 <= len(files) <= MAX_FILES:
        raise ValueError('Invalid number of files')
    result = []
    for file in files:
        if not isinstance(file, dict):
            raise ValueError('Invalid file')
        (name, size) = (file.get('name'), file.get('bytes'))
        if not isinstance(name, str) or len(name) > 160 or '.' not in name or any((c in name for c in '/\\\x00\r\n')):
            raise ValueError('Invalid filename')
        ext = '.' + name.rsplit('.', 1)[1].lower()
        if ext not in EXTENSIONS or type(size) is not int or (not 0 < size <= FILE_LIMIT):
            raise ValueError('Unsupported or oversized file')
        result.append({'extension': ext, 'bytes': size})
    if sum((f['bytes'] for f in result)) > CASE_LIMIT:
        raise ValueError('Case exceeds size limit')
    return result

class DirectReservations:

    def __init__(self, engine):
        self.engine = engine

    def _lock(self, db, lab):
        try:
            with db.begin_nested():
                db.execute(locks.insert().values(lab_id=lab, version=0))
        except IntegrityError:
            pass
        db.execute(locks.update().where(locks.c.lab_id == lab).values(version=locks.c.version + 1))

    def begin(self, principal, reference, files, request_key, *, now):
        lab = lab_identity(principal)
        if not isinstance(request_key, str) or not re.fullmatch('[A-Za-z0-9_-]{16,80}', request_key):
            raise ValueError('Invalid request key')
        manifest = manifest_for(reference, files)
        fingerprint = hashlib.sha256(json.dumps([reference, manifest], sort_keys=True).encode()).hexdigest()
        with self.engine.begin() as db:
            self._lock(db, lab)
            previous = db.execute(select(reservations).where(reservations.c.lab_id == lab, reservations.c.request_key == request_key)).mappings().one_or_none()
            if previous:
                if previous['fingerprint'] != fingerprint:
                    raise ValueError('Request already used for different files')
                return dict(previous)
            pending = db.execute(select(reservations.c.bytes).where(reservations.c.lab_id == lab, reservations.c.state.in_(['reserved', 'uploading', 'reconciling', 'finalizing', 'cleanup_pending']))).scalars().all()
            size = sum((f['bytes'] for f in manifest))
            if len(pending) >= 3 or sum(pending) + size > PENDING_LIMIT:
                raise ValueError('Finish or cancel your pending uploads first')
            receipt = 'ADW-' + secrets.token_hex(16)
            for file in manifest:
                file['id'] = secrets.token_hex(16)
                file['key'] = 'adw/intake/' + receipt + '/' + file['id'] + file['extension']
            row = dict(id=receipt, lab_id=lab, request_key=request_key, fingerprint=fingerprint, reference=reference, manifest=json.dumps(manifest), bytes=size, state='reserved', created=int(now))
            db.execute(reservations.insert().values(**row))
            return row

    def owned(self, principal, reservation_id):
        lab = lab_identity(principal)
        with self.engine.connect() as db:
            row = db.execute(select(reservations).where(reservations.c.id == reservation_id, reservations.c.lab_id == lab)).mappings().one_or_none()
        if row is None:
            raise PermissionError('Upload unavailable')
        return dict(row)

    def change(self, principal, reservation_id, edit):
        """Trusted internal mutation. edit must not perform network I/O."""
        lab = lab_identity(principal)
        with self.engine.begin() as db:
            self._lock(db, lab)
            row = db.execute(select(reservations).where(reservations.c.id == reservation_id, reservations.c.lab_id == lab)).mappings().one_or_none()
            if row is None:
                raise PermissionError('Upload unavailable')
            row = dict(row)
            manifest = json.loads(row['manifest'])
            result = edit(row, manifest)
            db.execute(reservations.update().where(reservations.c.id == reservation_id).values(manifest=json.dumps(manifest), state=row['state']))
            return result

    def claim_file(self, principal, reservation_id, file_id, *, now):

        def claim(row, files):
            if row['state'] not in ('reserved', 'uploading'):
                raise ValueError('Upload is not active')
            file = next((f for f in files if f['id'] == file_id), None)
            if file is None:
                raise PermissionError('File unavailable')
            if file.get('lease_until', 0) > now:
                raise ValueError('File operation already in progress; retry shortly')
            lease = secrets.token_hex(16)
            file.update(lease=lease, lease_until=int(now) + 180)
            row['state'] = 'uploading'
            return dict(file)
        return self.change(principal, reservation_id, claim)

    def save_file(self, principal, reservation_id, file_id, lease, values):
        if not set(values).issubset({'upload_id', 'sha256', 'complete'}):
            raise ValueError('Invalid internal file update')

        def save(row, files):
            if row['state'] not in ('reserved', 'uploading'):
                raise ValueError('Upload is no longer active')
            file = next((f for f in files if f['id'] == file_id), None)
            if file is None or file.get('lease') != lease:
                raise ValueError('File lease changed; retry')
            file.update(values)
            file.pop('lease', None)
            file.pop('lease_until', None)
        self.change(principal, reservation_id, save)

    def finalize(self, principal, reservation_id):

        def claim(row, files):
            if row['state'] not in ('reserved', 'uploading', 'finalizing', 'received'):
                raise ValueError('Upload is no longer active')
            if not all((f.get('complete') and re.fullmatch('[0-9a-f]{64}', f.get('sha256', '')) for f in files)):
                raise ValueError('Finish uploading every file first')
            if row['state'] != 'received':
                row['state'] = 'finalizing'
            return dict(row, manifest=json.dumps(files))
        return self.change(principal, reservation_id, claim)

    def cancel(self, principal, reservation_id, *, now):

        def cancel(row, files):
            if row['state'] == 'cleanup_pending':
                return
            if row['state'] not in ('reserved', 'uploading'):
                raise ValueError('A submitted upload cannot be cancelled here')
            row['state'] = 'cleanup_pending'
            for file in files:
                file['cleanup_after'] = int(now) + 900
                file.pop('lease', None)
                file.pop('lease_until', None)
        self.change(principal, reservation_id, cancel)
