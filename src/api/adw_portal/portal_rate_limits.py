"""Shared atomic fixed-window quotas. No raw client IPs are persisted.

Client address must come from reviewed trusted ingress configuration, never
from an arbitrary forwarded header. Limits are consumed even on failed sends.
"""
import hashlib
import hmac
import ipaddress
import time
from sqlalchemy import MetaData, Table, Column, String, BigInteger, delete
metadata = MetaData()
buckets = Table('adw_portal_rate_bucket', metadata, Column('key', String(64), primary_key=True), Column('window', BigInteger, primary_key=True), Column('count', BigInteger, nullable=False))

class PortalRateLimits:

    def __init__(self, engine, secret, *, client_address, clock=time.time, allow_sqlite_for_tests=False):
        if engine.dialect.name != 'postgresql' and (not allow_sqlite_for_tests):
            raise ValueError('Shared PostgreSQL limits required')
        if not isinstance(secret, bytes) or len(secret) < 32 or (not callable(client_address)):
            raise ValueError('Trusted address resolver and secret required')
        (self.engine, self.secret, self.address, self.clock) = (engine, secret, client_address, clock)

    def __call__(self, request):
        try:
            address = ipaddress.ip_address(self.address(request))
            identity = str(ipaddress.ip_network(str(address) + '/64', strict=False)) if address.version == 6 else str(address)
            sending = request.path == '/adw/verification/start'
            category = 'mail' if sending else 'request'
            limits = [(category + ':' + identity, 10 if sending else 120), (category + ':global', 80 if sending else 3000)]
            window = int(self.clock()) // 3600
            if self.engine.dialect.name == 'postgresql':
                from sqlalchemy.dialects.postgresql import insert
            else:
                from sqlalchemy.dialects.sqlite import insert
            allowed = True
            with self.engine.begin() as db:
                for (name, limit) in limits:
                    key = hmac.new(self.secret, name.encode(), hashlib.sha256).hexdigest()
                    statement = insert(buckets).values(key=key, window=window, count=1)
                    result = db.execute(statement.on_conflict_do_update(index_elements=['key', 'window'], set_={'count': buckets.c.count + 1}, where=buckets.c.count < limit))
                    allowed = allowed and result.rowcount == 1
                db.execute(delete(buckets).where(buckets.c.window < window - 48))
            return allowed
        except Exception:
            return False
