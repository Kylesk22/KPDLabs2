"""Host adapter. Disabled by default; never modifies schema or KPD routing.

Only the exact portal host is dispatched here. Other hosts continue through the
existing KPD application unchanged, including existing health-check behavior.
"""
from werkzeug.wrappers import Response
PORTAL_HOST = 'portal.americandentalworks.com'

def configure_portal(kpd_app, db, environ, *, client_factory=None, runtime_factory=None):
    unavailable = Response('ADW case submission is not available yet.', status=503, headers={'Cache-Control': 'no-store', 'Retry-After': '300'})
    portal = unavailable
    if environ.get('ADW_PORTAL_ENABLED', '').lower() == 'true':
        try:
            if environ.get('ADW_PORTAL_INGRESS_VERIFIED') != 'true':
                raise ValueError('Ingress review required')
            hops = int(environ.get('ADW_PORTAL_PROXY_HOPS', '0'))
            if hops not in (1, 2, 3):
                raise ValueError('Explicit trusted hop count required')
            required = ('ADW_UPLOAD_SIGNING_SECRET', 'ADW_RESEND_API_KEY', 'ADW_STORAGE_ACCESS_KEY_ID', 'ADW_STORAGE_SECRET_ACCESS_KEY', 'ADW_STORAGE_BUCKET')
            if any((not environ.get(key) for key in required)):
                raise ValueError('Configuration required')
            config = {key: environ[key] for key in required}
            config.update(ADW_PORTAL_ENABLED=True, ADW_GUEST_CHECKOUT_ENABLED=environ.get('ADW_GUEST_CHECKOUT_ENABLED') == 'true')
            if client_factory is None:
                import boto3
                client_factory = boto3.client
            from botocore.config import Config
            client = client_factory('s3', endpoint_url='https://nyc3.digitaloceanspaces.com', region_name='nyc3', aws_access_key_id=config['ADW_STORAGE_ACCESS_KEY_ID'], aws_secret_access_key=config['ADW_STORAGE_SECRET_ACCESS_KEY'], config=Config(connect_timeout=5, read_timeout=60, retries={'max_attempts': 2, 'mode': 'standard'}))
            if runtime_factory is None:
                from .portal_runtime import create_runtime
                runtime_factory = create_runtime
            with kpd_app.app_context():
                portal = runtime_factory(db.engine, client, config, client_address=lambda request: request.remote_addr)
            from werkzeug.middleware.proxy_fix import ProxyFix
            portal = ProxyFix(portal, x_for=hops, x_proto=1, x_host=0, x_port=0, x_prefix=0)
        except Exception:
            kpd_app.logger.error('ADW portal unavailable: configuration or readiness check failed.')
            portal = unavailable

    def dispatch(environ, start_response):
        host = environ.get('HTTP_HOST', '').lower()
        if host.split(':', 1)[0] == PORTAL_HOST:
            return portal(environ, start_response)
        return kpd_app(environ, start_response)
    return dispatch
