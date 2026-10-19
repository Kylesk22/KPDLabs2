"""Opt-in direct-host guest verification, never registered on import.

Host must supply a shared abuse limiter (not per-worker memory) and isolate
portal host routing from KPD. Shopify app proxies cannot carry these cookies.
"""
import re
import secrets
import time
import json
from urllib.parse import quote
from threading import BoundedSemaphore
from pathlib import Path
from flask import Blueprint, request, jsonify, make_response
from itsdangerous import URLSafeTimedSerializer, BadSignature
from .intake import MAX_CASE_BYTES
from werkzeug.exceptions import RequestEntityTooLarge
ORIGIN = 'https://portal.americandentalworks.com'
BINDING = '__Host-adw-binding'
UPLOAD = '__Host-adw-upload'

def blueprint(verification, sessions, *, secret, allow_request, checkout=None, enabled=False, clock=time.time, request_limit_bytes=20 * 1024 * 1024, direct_upload=None):
    if enabled is not True or not isinstance(secret, str) or len(secret) < 32:
        raise ValueError('Reviewed portal configuration required')
    if not callable(allow_request):
        raise ValueError('Shared abuse limiter required')
    if type(request_limit_bytes) is not int or not 1024 * 1024 < request_limit_bytes <= MAX_CASE_BYTES + 1024 * 1024:
        raise ValueError('Reviewed request limit required')
    signer = URLSafeTimedSerializer(secret, salt='adw-portal-csrf-v1')
    routes = Blueprint('adw_guest_portal', __name__)
    upload_slot = BoundedSemaphore(1)

    def binding():
        value = request.cookies.get(BINDING, '')
        if not re.fullmatch('[A-Za-z0-9_-]{43}', value):
            raise PermissionError('Open the verification page in this browser first')
        return value

    @routes.before_request
    def protect():
        if request.host != 'portal.americandentalworks.com' or not request.is_secure:
            return (jsonify(message='ADW portal required'), 403)
        if request.method == 'POST':
            if request.headers.get('Origin') != ORIGIN:
                return (jsonify(message='Same-origin request required'), 403)
            maximum = request_limit_bytes if request.path == '/adw/upload' else 8192
            if request.content_length is None or request.content_length > maximum:
                return (jsonify(message='Invalid request size'), 413)
            try:
                token = request.headers.get('X-CSRF-Token', '')
                if len(token) > 1024 or signer.loads(token, max_age=1800) != binding():
                    raise PermissionError()
            except (BadSignature, PermissionError):
                return (jsonify(message='Reload this page and try again'), 403)
            if allow_request(request) is not True:
                return (jsonify(message='Please wait before trying again'), 429)
            if request.path in ('/adw/upload', '/adw/checkout') or request.path.startswith('/adw/direct/'):
                try:
                    sessions.principal(request.cookies.get(UPLOAD, ''), binding(), now=clock())
                except PermissionError:
                    return (jsonify(message='Verify your email again before uploading'), 401)

    @routes.after_request
    def private(response):
        response.headers.update({'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"})
        if direct_upload is not None:
            response.headers['Content-Security-Policy'] = response.headers['Content-Security-Policy'].replace("connect-src 'self'", "connect-src 'self' https://adw-case-files.nyc3.digitaloceanspaces.com")
        return response

    @routes.get('/adw/verify')
    def page():
        page = Path(__file__).with_name('guest_portal.html').read_text(encoding='utf-8')
        case_limit = MAX_CASE_BYTES if direct_upload is not None else request_limit_bytes - 1024 * 1024
        page = page.replace('{{CASE_BYTES}}', str(case_limit)).replace('{{FILE_BYTES}}', str(min(100 * 1024 * 1024, case_limit)))
        page = page.replace('{{CASE_MB}}', str(case_limit // (1024 * 1024))).replace('{{FILE_MB}}', str(min(100, case_limit // (1024 * 1024))))
        page = page.replace('{{CHECKOUT_ENABLED}}', 'true' if checkout is not None else 'false')
        page = page.replace('{{DIRECT_ENABLED}}', 'true' if direct_upload is not None else 'false')
        page = page.replace('{{DIRECT_SCRIPT}}', '<script src="/adw/direct-upload.js" defer></script>' if direct_upload is not None else '')
        response = make_response(page)
        try:
            value = binding()
        except PermissionError:
            value = secrets.token_urlsafe(32)
        response.set_cookie(BINDING, value, secure=True, httponly=True, samesite='Lax', path='/', max_age=3600)
        return response

    @routes.get('/adw/verify.js')
    def script():
        response = make_response(Path(__file__).with_name('guest_portal.js').read_text(encoding='utf-8'))
        response.mimetype = 'application/javascript'
        return response

    @routes.get('/adw/direct-upload.js')
    def direct_script():
        if direct_upload is None:
            return (jsonify(message='Unavailable'), 404)
        response = make_response(Path(__file__).with_name('direct_upload_client.js').read_text(encoding='utf-8'))
        response.mimetype = 'application/javascript'
        return response

    @routes.post('/adw/direct/<action>')
    def direct_action(action):
        if direct_upload is None:
            return (jsonify(message='Unavailable'), 404)
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            return (jsonify(message='Invalid upload request'), 400)
        authorize = lambda : sessions.principal(request.cookies.get(UPLOAD, ''), binding(), now=clock())
        if not upload_slot.acquire(blocking=False):
            return (jsonify(message='Upload processing. Retry shortly.'), 429)
        try:
            if action == 'begin':
                result = direct_upload.begin(authorize, body.get('reference'), body.get('files'), body.get('request_key'))
            elif action == 'part':
                result = direct_upload.part(authorize, body.get('id'), body.get('file'), body.get('part'))
            elif action == 'complete-file':
                result = direct_upload.complete_file(authorize, body.get('id'), body.get('file'))
            elif action == 'finish':
                result = direct_upload.finish(authorize, body.get('id'))
            elif action == 'cancel':
                result = direct_upload.cancel(authorize, body.get('id'))
            else:
                return (jsonify(message='Unavailable'), 404)
            return jsonify(result)
        except PermissionError:
            return (jsonify(message='Verify your email again before uploading'), 401)
        except ValueError as error:
            return (jsonify(message=str(error)), 400)
        except Exception:
            return (jsonify(message='Upload could not be confirmed. Retry with the same files.'), 503)
        finally:
            upload_slot.release()

    @routes.get('/adw/verification/state')
    def state():
        try:
            return jsonify(csrf=signer.dumps(binding()))
        except PermissionError:
            return (jsonify(message='Open the verification page first'), 403)

    @routes.post('/adw/verification/start')
    def start():
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            return (jsonify(message='Email required'), 400)
        try:
            return jsonify(verification.start(body.get('email'), binding(), now=clock()))
        except ValueError as error:
            return (jsonify(message=str(error)), 400)
        except Exception:
            return (jsonify(message='Unable to send verification email. Please try again.'), 503)

    @routes.post('/adw/verification/finish')
    def finish():
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            return (jsonify(message='Verification details required'), 400)
        try:
            token = sessions.begin(body.get('proof'), binding(), now=clock(), registration=body.get('registration'))
            response = jsonify(message='Email verified. Your lab details are ready for case submission.')
            response.set_cookie(UPLOAD, token, secure=True, httponly=True, samesite='Strict', path='/', max_age=1800)
            return response
        except (ValueError, PermissionError) as error:
            return (jsonify(message=str(error)), 400)
        except Exception:
            return (jsonify(message='Unable to complete verification. Please request a new link.'), 503)

    @routes.post('/adw/verification/details')
    def details():
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            return (jsonify(message='Verification required'), 400)
        try:
            identity = verification.inspect(body.get('proof'), binding(), now=clock())
            profile = sessions.resolver(identity['email'])
            if profile.get('blocked') is True:
                raise PermissionError()
            return jsonify(registration_required=not bool(profile))
        except PermissionError:
            return (jsonify(message='This link is unavailable. Request a new verification email.'), 403)
        except Exception:
            return (jsonify(message='Unable to verify this link. Please try again.'), 503)

    @routes.post('/adw/upload')
    def upload():
        if not upload_slot.acquire(blocking=False):
            return (jsonify(message='Another upload is processing. Please retry shortly.'), 429)
        try:
            result = sessions.submit_streams(request.cookies.get(UPLOAD, ''), binding(), request.form.get('reference', ''), [dict(name=item.filename, stream=item.stream) for item in request.files.getlist('files')], request.headers.get('Idempotency-Key'), clock=clock)
            return (jsonify(result), 201)
        except PermissionError:
            return (jsonify(message='Verify your email again before uploading'), 401)
        except RequestEntityTooLarge:
            return (jsonify(message='Upload exceeds the case size limit.'), 413)
        except ValueError as error:
            return (jsonify(message=str(error)), 400)
        except Exception:
            return (jsonify(message='Upload could not be confirmed. Retry with the same files.'), 503)
        finally:
            upload_slot.release()

    @routes.post('/adw/checkout')
    def prepare_checkout():
        if checkout is None:
            return (jsonify(message='Ordering connection is not enabled yet'), 503)
        body = request.get_json(silent=True)
        products = {'zirconia': 'multilayer-zirconia', 'cad': 'crown-bridge-cad-design'}
        if not isinstance(body, dict) or body.get('service') not in products:
            return (jsonify(message='Choose an available service'), 400)
        try:
            receipt = body.get('receipt', '')
            proof = sessions.checkout_proof(request.cookies.get(UPLOAD, ''), binding(), receipt, checkout=checkout, shop='0z8umb-uq.myshopify.com', now=clock())
            row = checkout.receipts.get(receipt)
            payload = json.dumps(dict(receipt=receipt, reference=row['reference'], proof=proof), separators=(',', ':'))
            return jsonify(url='https://americandentalworks.com/products/' + products[body['service']] + '#adw-intake=' + quote(payload, safe=''))
        except (ValueError, PermissionError):
            return (jsonify(message='This receipt is unavailable. Verify your email and try again.'), 403)
        except Exception:
            return (jsonify(message='Unable to prepare checkout. Please try again.'), 503)
    return routes
