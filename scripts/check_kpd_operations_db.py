"""Read-only deployment check. No Flask app import, migrations, or case queries."""
import os
from pathlib import Path
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url


def safe_connection_error(error):
    """Classify the driver error without returning any of its private text."""
    original = getattr(error, 'orig', error)
    message = str(original).lower()
    code = getattr(original, 'pgcode', None)
    if code == '28P01' or 'password authentication failed' in message:
        return 'Database login rejected: the configured username or password was not accepted.'
    if 'no pg_hba.conf entry' in message:
        return 'Database access rejected: this connection is not allowed by the server access rules.'
    if code == '3D000' or ('database' in message and 'does not exist' in message):
        return 'The configured database name was not found on the server.'
    if code == '42501' or 'permission denied for' in message:
        return 'Connected, but the database account cannot read the migration metadata.'
    if any(part in message for part in ('could not translate host name', 'getaddrinfo', 'name or service not known', 'no such host', 'nodename nor servname')):
        return 'DNS lookup failed: this computer could not resolve the configured database hostname.'
    if any(part in message for part in ('timeout expired', 'timed out', 'timeout')):
        return 'Connection timed out: the database did not respond. Network access, database availability, or DigitalOcean trusted sources may be responsible.'
    if 'connection refused' in message or 'actively refused' in message:
        return 'Connection refused: the configured database host and port did not accept the connection.'
    if any(part in message for part in ('certificate verify failed', 'root certificate', 'ssl error', 'does not support ssl', 'ssl connection')):
        return 'An SSL connection error prevented the database check.'
    if 'permission denied' in message or 'forbidden by its access permissions' in message:
        return 'This computer or execution environment blocked the network connection.'
    if any(part in message for part in ('network is unreachable', 'no route to host', 'network is down')):
        return 'The network could not reach the configured database server.'
    if 'server closed the connection' in message or 'connection reset' in message:
        return 'The database connection was closed before the check completed.'
    return f'The database check failed ({type(original).__name__}); the cause needs further inspection.'


def main():
    load_dotenv(Path(__file__).resolve().parents[1] / '.env', override=False)
    value = os.getenv('DATABASE_URL')
    if not value:
        print('DATABASE_URL is not configured. Run this in the existing KPD project or server environment.')
        return 1
    try:
        url = make_url(value.replace('postgres://', 'postgresql://', 1))
        if url.get_backend_name() != 'postgresql':
            print('This check requires the KPD PostgreSQL database. No changes made.')
            return 1
        engine = create_engine(url, connect_args={'connect_timeout': 10, 'sslmode': 'require'})
        with engine.connect() as connection:
            connection.execute(text('SET TRANSACTION READ ONLY'))
            connection.execute(text("SET LOCAL statement_timeout = '10s'"))
            schema = inspect(connection)
            revision = list(connection.execute(text('SELECT version_num FROM alembic_version')).scalars()) if schema.has_table('alembic_version') else []
            print('Database: PostgreSQL (SSL required; read-only check)')
            print('Migration revision: ' + (', '.join(revision) or 'No Alembic revision recorded'))
            for name in ('kpd_shipment', 'kpd_shipment_case'):
                exists = schema.has_table(name)
                print(name + ': ' + ('present' if exists else 'not created yet'))
            if revision == ['adw_paid_20261020']:
                print('Expected predecessor found. The new KPD migration can be applied on its own.')
            elif revision == ['kpd_operations_20261118']:
                print('KPD operations migration is recorded as applied.')
            else:
                print('Review this revision before upgrading. Do not stamp or run unrelated migrations automatically.')
            print('No database changes made. No patient data or credentials read out.')
        engine.dispose()
        return 0
    except Exception as error:
        # Driver errors can contain database addresses/usernames. Return only a
        # safe category; never print the URL, password, or raw exception string.
        print(safe_connection_error(error))
        print('No changes made. Connection details and credentials are hidden.')
        return 1


if __name__ == '__main__':
    sys.exit(main())
