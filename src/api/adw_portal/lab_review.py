"""Staff-only lab decisions and audit. Local staging; no public route registered."""
import secrets
from sqlalchemy import Table, Column, String, BigInteger, select, update
from .guest_enrollment import metadata, labs
audit = Table('adw_guest_lab_review_audit', metadata, Column('id', String(64), primary_key=True), Column('lab_id', String(80), nullable=False), Column('staff_id', String(80), nullable=False), Column('previous', String(20), nullable=False), Column('decision', String(20), nullable=False), Column('reason', String(500), nullable=False), Column('created', BigInteger, nullable=False))

def require_staff(staff):
    if not isinstance(staff, dict) or staff.get('role') != 'Admin' or (not staff.get('id')):
        raise PermissionError('Staff access required')

class LabReview:

    def __init__(self, engine):
        self.engine = engine

    def pending(self, *, staff):
        require_staff(staff)
        with self.engine.connect() as db:
            return [dict(row) for row in db.execute(select(labs).where(labs.c.lab_review == 'pending', labs.c.blocked.is_(False)).order_by(labs.c.created, labs.c.lab_id).limit(100)).mappings()]

    def decide(self, lab_id, *, staff, decision, expected, reason, now):
        require_staff(staff)
        if decision not in ('approved', 'blocked', 'pending'):
            raise ValueError('Invalid review decision')
        if not isinstance(reason, str) or not reason.strip() or len(reason) > 500:
            raise ValueError('A review reason is required (500 characters maximum)')
        with self.engine.begin() as db:
            row = db.execute(select(labs).where(labs.c.lab_id == lab_id).with_for_update()).mappings().one_or_none()
            if row is None:
                raise ValueError('Lab unavailable')
            previous = 'blocked' if row['blocked'] else row['lab_review']
            if previous != expected:
                raise ValueError('Lab review changed. Reload before deciding.')
            if decision == previous:
                return dict(lab_id=lab_id, decision=decision, changed=False)
            db.execute(update(labs).where(labs.c.lab_id == lab_id).values(blocked=decision == 'blocked', lab_review='pending' if decision == 'blocked' else decision))
            db.execute(audit.insert().values(id=secrets.token_hex(16), lab_id=lab_id, staff_id=str(staff['id']), previous=previous, decision=decision, reason=reason.strip(), created=int(now)))
        return dict(lab_id=lab_id, decision=decision, changed=True)
