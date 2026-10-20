"""Validate current production/payment state before quoting a stored destination."""
from sqlalchemy import select
from .kpd_case_links import links
from .guest_enrollment import labs
from .staff_shipping import preview_shipment
from .shipping_rates import parcel_details
from .order_verification import verify_order
from .order_shipping import normalize_address

class StaffShippingRates:

    def __init__(self, handoff, cases, provider):
        (self.handoff, self.cases, self.provider) = (handoff, cases, provider)

    def quote(self, case_ids, parcel, *, staff):
        parcel_details(parcel)
        service = self.handoff
        preview = preview_shipment(service.engine, case_ids, staff=staff)
        with service.engine.connect() as db:
            rows = db.execute(select(self.cases.c.id, self.cases.c.status, self.cases.c.hold).where(self.cases.c.id.in_(case_ids))).mappings().all()
            if len(rows) != len(case_ids) or any((row['status'] != 'Ready to Ship' or row['hold'] not in (None, '') for row in rows)):
                raise ValueError('Every selected case must be Ready to Ship and not on hold')
            selected = db.execute(select(links).where(links.c.case_id.in_(case_ids))).mappings().all()
            lab_ids = {row['lab_id'] for row in selected}
            approved = db.execute(select(labs.c.lab_id).where(labs.c.lab_id.in_(lab_ids), labs.c.lab_review == 'approved', labs.c.blocked.is_(False))).scalars().all()
            if set(approved) != lab_ids:
                raise ValueError('Lab approval required before shipping')
        for (shop, order_id) in {(row['shop'], row['order_id']) for row in selected}:
            if shop != service.shop:
                raise ValueError('Unexpected order store')
            current = service.client.fetch_order(order_id)
            plan = verify_order(current, shop=shop, memberships=service.memberships, receipts=service.receipts, catalog=service.catalog, guest_checkout=service.guest_checkout, now=service.clock())
            if plan != service.claims.get_review(shop, order_id):
                raise ValueError('Order changed; review it before shipping')
            if normalize_address(current.get('shippingAddress')) != preview['destination']:
                raise ValueError('Order destination changed; review it before shipping')
        rates = self.provider.quote(preview['sender'], preview['destination'], parcel)
        return dict(preview, parcel=parcel_details(parcel), rates=rates, message='Rate estimates only. No label purchased.')
