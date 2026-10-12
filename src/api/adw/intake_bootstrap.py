"""Disabled-by-default host wiring. Never create or migrate database tables."""
from .schema_registration import register_intake_metadata, INTAKE_TABLES
from .intake_runtime import register_intake_runtime, register_approval_commands, BUCKET


def configure_intake(app, db, environ, *, client_factory=None):
    register_intake_metadata(db.metadata)
    if environ.get('ADW_INTAKE_ENABLED', '').lower() != 'true':
        return None
    # Check configuration before accessing any live client or database.
    required = ('ADW_SHOPIFY_SECRET', 'ADW_UPLOAD_SIGNING_SECRET',
                'ADW_STORAGE_ACCESS_KEY_ID', 'ADW_STORAGE_SECRET_ACCESS_KEY')
    if any(not environ.get(key) for key in required):
        app.logger.error('ADW intake disabled: required configuration missing.')
        return None
    config = {key: environ[key] for key in required}
    if (min(len(config[key]) for key in required[:2]) < 32 or
            config[required[0]] == config[required[1]] or
            environ.get('ADW_STORAGE_BUCKET') != BUCKET):
        app.logger.error('ADW intake disabled: invalid isolated configuration.')
        return None
    try:
        with app.app_context():
            engine = db.engine
            if engine.dialect.name != 'postgresql':
                raise ValueError('PostgreSQL required')
            # Read-only readiness check: no patient data, writes or schema DDL.
            from sqlalchemy import inspect
            inspector = inspect(engine)
            for table in INTAKE_TABLES:
                columns = {item['name'] for item in inspector.get_columns(table.name)}
                if not set(table.columns.keys()).issubset(columns):
                    raise ValueError('Migration missing')
        if client_factory is None:
            import boto3
            client_factory = boto3.client
        from botocore.config import Config
        client = client_factory('s3', endpoint_url='https://nyc3.digitaloceanspaces.com',
            region_name='nyc3', aws_access_key_id=config[required[2]],
            aws_secret_access_key=config[required[3]],
            config=Config(connect_timeout=5, read_timeout=60,
                          retries={'max_attempts': 2, 'mode': 'standard'}))
    except Exception:
        # Do not log exception text: SDK/database errors can contain secrets.
        app.logger.error('ADW intake disabled: storage or schema readiness failed.')
        return None
    config.update(ADW_INTAKE_ENABLED=True, ADW_STORAGE_BUCKET=BUCKET)
    # Start with a bounded pilot. Raising this requires checking host request
    # timeouts and temporary disk capacity, not merely changing browser text.
    app.config['ADW_REQUEST_LIMIT_BYTES'] = 20 * 1024 * 1024
    services = register_intake_runtime(app, engine, client, config)
    register_approval_commands(app, services['memberships'])
    app.extensions['adw_intake'] = services
    return services
