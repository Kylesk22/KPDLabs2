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
