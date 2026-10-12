"""Bounded-memory intake, not an exposed HTTP route.

Copies each incoming stream to a private temporary file while hashing. The
verified snapshot, not a mutable input stream, is sent to object storage.
The caller must limit concurrent requests and total request size at ingress.
"""
import hashlib
import tempfile
from contextlib import ExitStack
from .intake import Intake, EXTENSIONS, MAX_FILES, MAX_FILE_BYTES, MAX_CASE_BYTES
from .upload_grants import fingerprint

CHUNK = 1024 * 1024


class StreamingIntake(Intake):
    def submit_authorized(self, grants, token, reference, files, *, clock):
        if not isinstance(files, list) or not 1 <= len(files) <= MAX_FILES:
            raise ValueError('Invalid file count')
        with ExitStack() as resources:
            prepared, manifest, total = [], [], 0
            for file in files:
                name, source = file.get('name'), file.get('stream')
                if (not isinstance(name, str) or len(name) > 160 or '.' not in name
                        or any(c in name for c in '/\\\x00\r\n')):
                    raise ValueError('Invalid filename')
                extension = '.' + name.rsplit('.', 1)[1].lower()
                if extension not in EXTENSIONS or not callable(getattr(source, 'read', None)):
                    raise ValueError('Invalid file')
                target = resources.enter_context(tempfile.TemporaryFile(mode='w+b'))
                digest, size = hashlib.sha256(), 0
                while True:
                    chunk = source.read(min(CHUNK, MAX_FILE_BYTES-size+1, MAX_CASE_BYTES-total+1))
                    if not isinstance(chunk, bytes):
                        raise ValueError('Binary file stream required')
                    if not chunk:
                        break
                    size += len(chunk)
                    total += len(chunk)
                    if size > MAX_FILE_BYTES or total > MAX_CASE_BYTES:
                        raise ValueError('Case or file exceeds size limit')
                    digest.update(chunk)
                    target.write(chunk)
                if not size:
                    raise ValueError('Empty file')
                target.seek(0)
                manifest.append(dict(extension=extension, bytes=size, sha256=digest.hexdigest()))
                prepared.append((extension, target, size, digest.hexdigest()))
            # Check current time and approval AFTER receiving the files too.
            principal, request_key = grants.verify(token, reference, manifest, now=clock())
            return self._persist(principal, reference, prepared,
                                 fingerprint(reference, manifest), request_key,
                                 self.storage.put_private_stream)
