"""Short-lived upload grants. Internal helper; issuance route not exposed yet.

Issuance must first verify Shopify identity, exact request origin/CSRF, and current
lab membership. Grant is a bearer secret: never log it or put it in a URL. Upload
consumer rechecks membership and hashes received bytes. Replays use the same
receipt request key, not a new upload. No filenames or patient fields in claims.
"""
import base64
import hashlib
import hmac
import json
import re
from .intake import EXTENSIONS, MAX_FILES, MAX_FILE_BYTES, MAX_CASE_BYTES

def encode(value):
    return base64.urlsafe_b64encode(value).rstrip(b'=').decode('ascii')

def fingerprint(reference, manifest):
    if not isinstance(reference, str) or not re.fullmatch('[A-Za-z0-9_-]{3,40}', reference):
        raise ValueError('Invalid case reference')
    if not isinstance(manifest, list) or not 1 <= len(manifest) <= MAX_FILES:
        raise ValueError('Invalid file count')
    normalized = []
    for f in manifest:
        if not isinstance(f, dict) or f.get('extension') not in EXTENSIONS or type(f.get('bytes')) is not int or (not 0 < f['bytes'] <= MAX_FILE_BYTES) or (not isinstance(f.get('sha256'), str)) or (not re.fullmatch('[0-9a-f]{64}', f['sha256'])):
            raise ValueError('Invalid file manifest')
        normalized.append([f['extension'], f['bytes'], f['sha256']])
    if sum((x[1] for x in normalized)) > MAX_CASE_BYTES:
        raise ValueError('Case size limit exceeded')
    return hashlib.sha256(json.dumps([reference, normalized], separators=(',', ':')).encode()).hexdigest()

class UploadGrants:

    def __init__(self, secret, memberships, shop):
        if not isinstance(secret, bytes) or len(secret) < 32:
            raise ValueError('Separate upload signing secret required')
        (self.secret, self.memberships, self.shop) = (secret, memberships, shop)

    def issue(self, verified_identity, reference, manifest, request_key, *, now):
        if verified_identity.get('shop') != self.shop:
            raise PermissionError('Wrong store')
        principal = self.memberships.principal(self.shop, verified_identity.get('customer_id'))
        if not isinstance(request_key, str) or not re.fullmatch('[A-Za-z0-9_-]{16,80}', request_key):
            raise ValueError('Invalid request key')
        payload = {'v': 1, 'purpose': 'adw-upload', 'shop': self.shop, 'customer': principal['customer_id'], 'lab': principal['lab_id'], 'request': request_key, 'fingerprint': fingerprint(reference, manifest), 'issued': int(now), 'expires': int(now) + 600}
        body = encode(json.dumps(payload, sort_keys=True, separators=(',', ':')).encode())
        return body + '.' + encode(hmac.new(self.secret, body.encode(), hashlib.sha256).digest())

    def verify(self, token, reference, manifest, *, now):
        (principal, key, expected) = self.authenticate(token, now=now)
        if expected != fingerprint(reference, manifest):
            raise PermissionError('Files do not match upload authorization')
        return (principal, key)

    def authenticate(self, token, *, now):
        if not isinstance(token, str) or len(token) > 4096:
            raise PermissionError('Invalid upload authorization')
        try:
            (body, signature) = token.split('.')
            expected = encode(hmac.new(self.secret, body.encode('ascii'), hashlib.sha256).digest())
            if not hmac.compare_digest(signature, expected):
                raise ValueError()
            claims = json.loads(base64.b64decode(body + '=' * (-len(body) % 4), altchars=b'-_', validate=True))
            if claims['v'] != 1 or claims['purpose'] != 'adw-upload' or claims['shop'] != self.shop or (type(claims['issued']) is not int) or (type(claims['expires']) is not int) or (not claims['issued'] <= now < claims['expires']) or (claims['expires'] - claims['issued'] != 600) or (not isinstance(claims['fingerprint'], str)):
                raise ValueError()
            principal = self.memberships.principal(self.shop, claims['customer'])
            if principal['lab_id'] != claims['lab']:
                raise ValueError()
            return (principal, claims['request'], claims['fingerprint'])
        except (ValueError, KeyError, TypeError, UnicodeError):
            raise PermissionError('Invalid or expired upload authorization') from None

class AuthorizedIntake:
    """Server-side consumer. Hash actual bytes, never trust posted manifest hashes.

Transport streaming/resource limits and grant issuance CSRF remain separate.
    """

    def __init__(self, grants, intake):
        (self.grants, self.intake) = (grants, intake)

    def submit(self, token, reference, files, *, now):
        if not isinstance(files, list) or not 1 <= len(files) <= MAX_FILES:
            raise ValueError('Invalid file count')
        manifest = []
        total = 0
        for f in files:
            name = f.get('name')
            content = f.get('content')
            if not isinstance(name, str) or len(name) > 160 or '.' not in name or any((c in name for c in '/\\\x00\r\n')) or (not isinstance(content, bytes)) or (not 0 < len(content) <= MAX_FILE_BYTES):
                raise ValueError('Invalid file')
            total += len(content)
            if total > MAX_CASE_BYTES:
                raise ValueError('Case size limit exceeded')
            manifest.append(dict(extension='.' + name.rsplit('.', 1)[1].lower(), bytes=len(content), sha256=hashlib.sha256(content).hexdigest()))
        (principal, key) = self.grants.verify(token, reference, manifest, now=now)
        return self.intake.submit(principal, reference, files, key)
