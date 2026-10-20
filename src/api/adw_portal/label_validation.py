"""Recheck authoritative shipment state while reserving a label purchase."""
from sqlalchemy import select
from .guest_enrollment import labs
from .kpd_case_links import links
from .order_claims import orders
from .order_shipping import destinations, destination_for_cases, normalize_address
from .order_verification import verify_order
from .staff_shipping import SENDER
from .shipping_rates import DEFAULT_PARCEL, parcel_details

class LabelValidation:

    def __init__(self, handoff, cases, *, required_status='Ready to Ship'):
        if required_status not in ('Ready to Ship', 'Shipped'):
            raise ValueError('Unsupported shipment validation status')
        self.required_status = required_status
        (self.handoff, self.cases) = (handoff, cases)

    def __call__(self, db, snapshot):
        service = self.handoff
        ids = snapshot['case_ids']
        if snapshot.get('sender') != SENDER:
            raise ValueError('Sender changed. Get fresh rates.')
        parcel = snapshot.get('parcel', {})
        if parcel_details({key: parcel.get(key) for key in DEFAULT_PARCEL}) != parcel:
            raise ValueError('Package requires fresh rates')
        selected = db.execute(select(links).where(links.c.case_id.in_(ids)).order_by(links.c.case_id).with_for_update()).mappings().all()
        if len(selected) != len(ids):
            raise ValueError('Case linkage changed')
        lab_ids = {row['lab_id'] for row in selected}
        approved = db.execute(select(labs).where(labs.c.lab_id.in_(lab_ids)).order_by(labs.c.lab_id).with_for_update()).mappings().all()
        if len(approved) != len(lab_ids) or any((row['lab_review'] != 'approved' or row['blocked'] for row in approved)):
            raise ValueError('Lab approval required before shipping')
        cases = db.execute(select(self.cases).where(self.cases.c.id.in_(ids)).order_by(self.cases.c.id).with_for_update()).mappings().all()
        if len(cases) != len(ids) or any((row['status'] != self.required_status or row['hold'] not in (None, '') for row in cases)):
            raise ValueError('Every selected case must be ' + self.required_status + ' and not on hold')
        expected = {(row['shop'], row['order_id']) for row in selected}
        saved = snapshot.get('orders', [])
        if len(saved) != len(expected) or {(row['shop'], row['order_id']) for row in saved} != expected:
            raise ValueError('Order linkage changed')
        for entry in sorted(saved, key=lambda row: (row['shop'], row['order_id'])):
            (shop, order_id) = (entry['shop'], entry['order_id'])
            if shop != service.shop:
                raise ValueError('Unexpected order store')
            stored = db.execute(select(orders.c.plan).where(orders.c.shop == shop, orders.c.order_id == order_id).with_for_update()).scalar_one_or_none()
            address = db.execute(select(destinations.c.address).where(destinations.c.shop == shop, destinations.c.order_id == order_id).with_for_update()).scalar_one_or_none()
            if stored != entry['plan'] or address != snapshot['destination']:
                raise ValueError('Order changed. Review it before shipping.')
            current = service.client.fetch_order(order_id)
            plan = verify_order(current, shop=shop, memberships=service.memberships, receipts=service.receipts, catalog=service.catalog, guest_checkout=service.guest_checkout, now=service.clock())
            if plan != stored or normalize_address(current.get('shippingAddress')) != address:
                raise ValueError('Payment or destination changed. Review the order.')
        if destination_for_cases(db, ids) != snapshot['destination']:
            raise ValueError('Shipment destination changed')
