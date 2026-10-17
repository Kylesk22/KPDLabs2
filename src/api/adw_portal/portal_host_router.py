"""Explicit WSGI host split; install outside both Flask applications.

The deployment must normalize trusted proxy headers before this router.
Never trust a client-supplied X-Forwarded-Host here.
"""
from werkzeug.wrappers import Response
PORTAL_HOST = 'portal.americandentalworks.com'

class PortalHostRouter:

    def __init__(self, kpd_app, portal_app, *, kpd_hosts):
        (self.kpd_app, self.portal_app) = (kpd_app, portal_app)
        self.kpd_hosts = frozenset(kpd_hosts)
        if not self.kpd_hosts or PORTAL_HOST in self.kpd_hosts:
            raise ValueError('Explicit separate KPD hosts required')

    def __call__(self, environ, start_response):
        host = environ.get('HTTP_HOST', '').lower()
        if host == PORTAL_HOST:
            if environ.get('wsgi.url_scheme') != 'https':
                return Response('HTTPS required', status=403)(environ, start_response)
            return self.portal_app(environ, start_response)
        if host in self.kpd_hosts:
            return self.kpd_app(environ, start_response)
        return Response('Unknown host', status=421)(environ, start_response)
