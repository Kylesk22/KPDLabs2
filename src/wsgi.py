"""Production entry point; ADW portal stays unavailable until enabled."""
import os
from app import app, session_user
from api.models import db
from api.adw_portal.portal_bootstrap import configure_portal

application = configure_portal(app, db, os.environ, staff_lookup=session_user)

if __name__ == "__main__":
    app.run()
