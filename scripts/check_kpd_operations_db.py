"""Read-only deployment check. No Flask app import, migrations, or case queries."""
import os
from pathlib import Path
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url


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
        print(f'Unable to complete read-only check ({type(error).__name__}). Check database connectivity and trusted sources. No changes made.')
        return 1


if __name__ == '__main__':
    sys.exit(main())
