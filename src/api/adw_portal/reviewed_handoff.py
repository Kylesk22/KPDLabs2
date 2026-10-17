"""Atomic KPD handoff after fresh Shopify verification and staff review.

Local staging only. Host supplies a tested case writer and authenticated staff.
"""
from .order_verification import verify_order
from .order_shipping import normalize_address, save_destination
from .lab_provisioning import provision_lab
from .kpd_case_links import create_reviewed_cases
import time

class ReviewedHandoff:

    def __init__(self, engine, users, client, memberships, receipts, claims, *, shop, catalog, writer, auth_guard_enabled=False, guest_checkout=None, clock=time.time):
        (self.engine, self.users, self.client) = (engine, users, client)
        (self.memberships, self.receipts, self.claims) = (memberships, receipts, claims)
        (self.shop, self.catalog, self.writer) = (shop, dict(catalog), writer)
        self.auth_guard_enabled = auth_guard_enabled
        (self.guest_checkout, self.clock) = (guest_checkout, clock)

    def submit(self, order_id, *, staff, lab_profile):
        if not staff or staff.get('role') != 'Admin' or (not staff.get('id')):
            raise PermissionError('Staff review required')
        if lab_profile.get('lab_review') != 'approved' or lab_profile.get('blocked') is True:
            raise PermissionError('Lab review must be approved before production')
        current = self.client.fetch_order(order_id)
        plan = verify_order(current, shop=self.shop, memberships=self.memberships, receipts=self.receipts, catalog=self.catalog, guest_checkout=self.guest_checkout, now=self.clock())
        if lab_profile.get('lab_id') != plan['lab_id']:
            raise ValueError('Verified lab profile required')
        physical = any((line['sku'] != 'ADW-CAD-CB' for line in plan['lines']))
        address = normalize_address(current.get('shippingAddress')) if physical else None
        account_address = lab_profile.get('address')
        if not account_address:
            account_address = ', '.join((address[field] for field in ['address1', 'address2', 'city', 'provinceCode', 'zip'] if address[field])) if address else 'Digital delivery - no shipping address'
        self.claims.reserve_for_review(plan)
        with self.engine.begin() as connection:
            provision_lab(connection, self.users, lab_id=plan['lab_id'], practice=lab_profile['practice'], address=account_address, auth_guard_enabled=self.auth_guard_enabled)
            if address is not None:
                save_destination(connection, self.shop, plan['order_id'], address)
            return create_reviewed_cases(connection, plan, staff=staff, writer=self.writer)
