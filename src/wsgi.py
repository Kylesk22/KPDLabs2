"""Production entry point; ADW portal stays unavailable until enabled."""
import os
from app import app
from api.models import db
from api.adw_portal.portal_bootstrap import configure_portal

application = configure_portal(app, db, os.environ)

if __name__ == "__main__":
    app.run()
