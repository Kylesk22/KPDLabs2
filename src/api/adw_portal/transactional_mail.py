"""Staged Resend adapter. Not registered with the live verification service.

Only server configuration may enable delivery. Never log keys, payloads or
provider response bodies: verification links contain single-use credentials.
"""
import hashlib
import re
from urllib.parse import urlsplit

class DeliveryUnavailable(Exception):
    pass

class ResendVerificationMail:

    def __init__(self, *, api_key, verification_url, enabled=False, post=None):
        if enabled is not True:
            raise ValueError('Verification email delivery is disabled')
        if not isinstance(api_key, str) or not re.fullmatch('re_[A-Za-z0-9_-]{10,}', api_key):
            raise ValueError('Valid server email credential required')
        parsed = urlsplit(verification_url)
        approved = parsed.netloc == 'americandentalworks.com' and parsed.path.startswith('/apps/adw/') or (parsed.netloc == 'portal.americandentalworks.com' and parsed.path == '/adw/verify')
        if parsed.scheme != 'https' or not approved or parsed.query or parsed.fragment or ('%' in parsed.path) or ('..' in parsed.path) or ('\\' in parsed.path):
            raise ValueError('Approved ADW verification URL required')
        self._api_key = api_key
        self.verification_url = verification_url
        if post is None:
            import requests
            post = requests.post
        self._post = post

    def send_upload_link(self, recipient, url):
        if not isinstance(recipient, str) or len(recipient) > 254 or (not re.fullmatch('[^\\s@<>,;]+@[^\\s@<>,;]+\\.[^\\s@<>,;]+', recipient)):
            raise ValueError('One valid recipient required')
        parsed = urlsplit(url)
        if url != self.verification_url + '#' + parsed.fragment or not re.fullmatch('[A-Za-z0-9_-]{43}', parsed.fragment):
            raise ValueError('Approved verification link required')
        payload = {'from': 'American Dental Works <verify@notify.americandentalworks.com>', 'to': [recipient], 'reply_to': 'orders@americandentalworks.com', 'subject': 'Verify your email for American Dental Works', 'text': 'Verify your email to continue your ADW case submission.\n\n' + url + '\n\nThis link expires in 15 minutes. Open it in the same browser where you started your submission.\n\nIf you did not request this email, you can ignore it.\n\nAmerican Dental Works | Manufacturing for Dental Labs'}
        key = hashlib.sha256((recipient + '\n' + url).encode()).hexdigest()
        try:
            response = self._post('https://api.resend.com/emails', json=payload, headers={'Authorization': 'Bearer ' + self._api_key, 'Idempotency-Key': 'adw-verification-' + key}, timeout=(5, 15), allow_redirects=False)
            if response.status_code != 200:
                raise DeliveryUnavailable()
            body = response.json()
            if not isinstance(body, dict) or not isinstance(body.get('id'), str) or (not body['id']):
                raise DeliveryUnavailable()
        except Exception:
            raise DeliveryUnavailable('Verification email delivery unavailable') from None
        finally:
            if 'response' in locals():
                try:
                    response.close()
                except Exception:
                    pass
        return {'accepted': True}
