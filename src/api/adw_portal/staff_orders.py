"""Staff order review service; no routes or production enablement on import."""
from sqlalchemy import select
import re
from .guest_enrollment import labs
from .lab_review import require_staff
from .order_verification import verify_order
from .order_shipping import normalize_address
from .order_review_snapshot import review_fingerprint

class StaffOrders:

    def __init__(self, handoff):
        self.handoff = handoff

    def waiting(self, *, staff, after=None):
        require_staff(staff)
        from .shared_queues import jobs
        from .kpd_case_links import links
        if after is not None and (not re.fullmatch('[1-9][0-9]{0,31}', after)):
            raise ValueError('Invalid order cursor')
        query = select(jobs.c.order_id, jobs.c.status).where(jobs.c.shop == self.handoff.shop, ~select(links.c.case_id).where(links.c.shop == jobs.c.shop, links.c.order_id == jobs.c.order_id).exists())
        if after is not None:
            query = query.where(jobs.c.order_id > after)
        with self.handoff.engine.connect() as db:
            rows = list(db.execute(query.order_by(jobs.c.order_id).limit(26)).mappings())
        return dict(orders=[dict(row) for row in rows[:25]], next_cursor=rows[24]['order_id'] if len(rows) > 25 else None)

    def profile(self, lab_id):
        with self.handoff.engine.connect() as db:
            row = db.execute(select(labs).where(labs.c.lab_id == lab_id)).mappings().one_or_none()
        if row is None:
            raise ValueError('Lab unavailable')
        return dict(row)

    def prepare(self, order_id, *, staff):
        require_staff(staff)
        service = self.handoff
        current = service.client.fetch_order(order_id)
        plan = verify_order(current, shop=service.shop, memberships=service.memberships, receipts=service.receipts, catalog=service.catalog, guest_checkout=service.guest_checkout, now=service.clock())
        profile = self.profile(plan['lab_id'])
        address = normalize_address(current.get('shippingAddress')) if any((line['sku'] != 'ADW-CAD-CB' for line in plan['lines'])) else None
        service.claims.reserve_for_review(plan)
        lines = []
        for line in plan['lines']:
            receipt = service.receipts.get(line['receipt'])
            lines.append(dict(line, files=[{'index': index, 'bytes': entry['bytes']} for (index, entry) in enumerate(receipt['files'])]))
        return dict(order_id=plan['order_id'], lab=profile, lines=lines, shipping=address, production_release=False, review_fingerprint=review_fingerprint(plan, address, profile, service.receipts))

    def accept(self, order_id, *, staff, fingerprint, files_reviewed):
        require_staff(staff)
        if files_reviewed is not True:
            raise ValueError('Confirm file review before creating cases')
        if not isinstance(fingerprint, str) or not re.fullmatch('[0-9a-f]{64}', fingerprint):
            raise ValueError('Load this order for review first')
        plan = self.handoff.claims.get_review(self.handoff.shop, order_id)
        if not plan:
            raise ValueError('Load this order for review first')
        return self.handoff.submit(order_id, staff=staff, lab_profile=self.profile(plan['lab_id']), expected_review=fingerprint)
