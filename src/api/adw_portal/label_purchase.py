"""Staged purchase coordinator. No Flask routes, no live wiring."""
import json
import re
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from .lab_review import require_staff

class PurchaseUncertain(RuntimeError):
    pass

class ShippoLabels:

    def __init__(self, token, *, enabled=False, test_mode=True, opener=urlopen):
        if enabled is not True:
            raise ValueError('Label purchasing must be explicitly enabled')
        if not isinstance(token, str) or not token:
            raise ValueError('Shippo token required')
        if type(test_mode) is not bool or not token.startswith('shippo_test_' if test_mode else 'shippo_live_'):
            raise ValueError('Shippo credential does not match the explicitly selected mode')
        (self.token, self.opener) = (token, opener)

    def _request(self, path, payload=None):
        request = Request('https://api.goshippo.com' + path, data=json.dumps(payload).encode() if payload is not None else None, headers={'Authorization': 'ShippoToken ' + self.token, 'Content-Type': 'application/json', 'SHIPPO-API-VERSION': '2018-02-08'})
        with self.opener(request, timeout=30) as response:
            raw = response.read(1000001)
        if len(raw) > 1000000:
            raise ValueError('Oversized provider response')
        return json.loads(raw)

    def create(self, rate_id, request_id):
        return self._request('/transactions/', dict(rate=rate_id, metadata=request_id, label_file_type='PDF', **{'async': False}))

    def retrieve(self, transaction_id):
        if not isinstance(transaction_id, str) or not re.fullmatch('[a-zA-Z0-9]{1,80}', transaction_id):
            raise ValueError('Valid transaction ID required')
        return self._request('/transactions/' + transaction_id + '/')

def verified_result(raw, quote, *, test_mode):
    if not isinstance(raw, dict) or raw.get('status') != 'SUCCESS' or raw.get('test') is not test_mode:
        raise ValueError('Provider result requires reconciliation')
    rate = raw.get('rate')
    rate_id = rate.get('object_id') if isinstance(rate, dict) else rate
    if rate_id != quote['rate_id'] or raw.get('metadata') != quote['id']:
        raise ValueError('Provider result does not match reserved purchase')
    transaction_id = raw.get('object_id')
    tracking = raw.get('tracking_number')
    url = raw.get('label_url')
    if not isinstance(transaction_id, str) or not re.fullmatch('[a-zA-Z0-9]{1,80}', transaction_id) or (not isinstance(tracking, str)) or (not re.fullmatch('[A-Za-z0-9 -]{1,120}', tracking)) or (not isinstance(url, str)) or (len(url) > 2048):
        raise ValueError('Provider label details incomplete')
    parsed = urlparse(url)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError('Invalid provider label URL')
    return dict(transaction_id=transaction_id, tracking_number=tracking, label_url=url, rate_id=rate_id, metadata=quote['id'])

class LabelPurchases:

    def __init__(self, ledger, provider, cases, validate, *, test_mode=True):
        if type(test_mode) is not bool:
            raise ValueError('Explicit test mode required')
        (self.ledger, self.provider, self.cases, self.validate) = (ledger, provider, cases, validate)
        self.test_mode = test_mode

    def buy(self, label_id, *, staff, amount_cents, now):
        require_staff(staff)
        if not self.ledger.claim(label_id, staff=staff, amount_cents=amount_cents, now=now, validate=self.validate):
            return self.ledger.get(label_id, staff=staff)
        quote = self.ledger.get(label_id, staff=staff)
        try:
            raw = self.provider.create(quote['rate_id'], label_id)
            result = verified_result(raw, quote, test_mode=self.test_mode)
            self.ledger.complete(label_id, result, cases=self.cases)
        except Exception:
            self.ledger.uncertain(label_id)
            raise PurchaseUncertain('Purchase outcome needs reconciliation. Do not buy another label.') from None
        return self.ledger.get(label_id, staff=staff)

    def reconcile(self, label_id, transaction_id, *, staff):
        require_staff(staff)
        quote = self.ledger.get(label_id, staff=staff)
        if quote['state'] not in ('submitting', 'needs_reconciliation', 'purchased'):
            raise ValueError('No submitted purchase to reconcile')
        raw = self.provider.retrieve(transaction_id)
        result = verified_result(raw, quote, test_mode=self.test_mode)
        self.ledger.complete(label_id, result, cases=self.cases)
        return self.ledger.get(label_id, staff=staff)
