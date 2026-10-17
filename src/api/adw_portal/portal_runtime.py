"""Explicit portal assembly. No schema creation or network calls on import.

The host owns trusted ingress/address handling and WSGI routing. Checkout stays
disabled until the storefront and paid-order handoff have been reviewed.
"""
import hashlib
import hmac
from sqlalchemy import inspect
from .guest_email_verification import EmailVerification, metadata as email_metadata
from .guest_upload_session import GuestUploadSession, metadata as session_metadata
from .guest_enrollment import GuestEnrollment, metadata as enrollment_metadata
from .guest_checkout import GuestCheckout, metadata as checkout_metadata
from .portal_rate_limits import PortalRateLimits, metadata as quota_metadata
from .shared_receipts import SharedReceiptRepository
from .shared_queues import SharedCleanup
from .schema_registration import INTAKE_TABLES
from .private_storage import PrivateObjectStorage
from .streaming_intake import StreamingIntake
from .transactional_mail import ResendVerificationMail
from .portal_application import create_portal

def create_runtime(engine, storage_client, config, *, client_address, mail_post=None):
    if config.get('ADW_PORTAL_ENABLED') is not True:
        raise ValueError('Explicit portal enablement required')
    if engine.dialect.name != 'postgresql':
        raise ValueError('Shared PostgreSQL required')
    if config.get('ADW_STORAGE_BUCKET') != 'adw-case-files':
        raise ValueError('Dedicated ADW bucket required')
    secret = config.get('ADW_UPLOAD_SIGNING_SECRET')
    if not isinstance(secret, str) or len(secret) < 32:
        raise ValueError('Upload signing secret required')
    if not callable(client_address):
        raise ValueError('Reviewed client address resolver required')

    def derive(purpose):
        return hmac.new(secret.encode(), purpose.encode(), hashlib.sha256).hexdigest()
    inspector = inspect(engine)
    tables = list(INTAKE_TABLES)
    for metadata in (email_metadata, session_metadata, enrollment_metadata, checkout_metadata, quota_metadata):
        tables.extend(metadata.tables.values())
    for table in tables:
        columns = {column['name'] for column in inspector.get_columns(table.name)}
        if not set(table.columns.keys()).issubset(columns):
            raise ValueError('Portal migration required')
    mail = ResendVerificationMail(api_key=config.get('ADW_RESEND_API_KEY'), verification_url='https://portal.americandentalworks.com/adw/verify', enabled=True, post=mail_post)
    verification = EmailVerification(engine, mail, allow_live_delivery=True)
    enrollment = GuestEnrollment(engine)
    receipts = SharedReceiptRepository(engine)
    cleanup = SharedCleanup(engine, 'adw-case-files')
    storage = PrivateObjectStorage(storage_client, 'adw-case-files', cleanup.enqueue)
    sessions = GuestUploadSession(engine, verification, enrollment.resolve, StreamingIntake(receipts, storage), enrollment=enrollment)
    limiter = PortalRateLimits(engine, bytes.fromhex(derive('adw-portal-rate-limits-v1')), client_address=client_address)
    checkout = GuestCheckout(engine, receipts) if config.get('ADW_GUEST_CHECKOUT_ENABLED') is True else None
    app = create_portal(verification, sessions, secret=derive('adw-portal-csrf-v1'), allow_request=limiter, checkout=checkout, enabled=True, request_limit_bytes=config.get('ADW_PORTAL_REQUEST_LIMIT_BYTES', 20 * 1024 * 1024))
    return app
