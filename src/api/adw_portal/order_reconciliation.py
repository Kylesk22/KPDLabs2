"""Fetch authoritative order state before atomically reserving a review plan.

Deliberately not registered in the live app. A notice is only a lookup hint.
"""
from .order_verification import verify_order
import time

class Reconciler:

    def __init__(self, client, memberships, receipts, claims, *, shop, catalog, guest_checkout=None, clock=time.time):
        (self.client, self.memberships, self.receipts, self.claims) = (client, memberships, receipts, claims)
        (self.shop, self.catalog) = (shop, dict(catalog))
        (self.guest_checkout, self.clock) = (guest_checkout, clock)

    def reconcile(self, order_id):
        current = self.client.fetch_order(order_id)
        plan = verify_order(current, shop=self.shop, memberships=self.memberships, receipts=self.receipts, catalog=self.catalog, guest_checkout=self.guest_checkout, now=self.clock())
        return self.claims.reserve_for_review(plan)
