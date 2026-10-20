"""Rate lookup only. This module has no label-purchase operation."""
import json
from decimal import Decimal, InvalidOperation
from urllib.request import Request, urlopen
from urllib.error import URLError
DEFAULT_PARCEL = {'length': '6', 'width': '4', 'height': '4', 'weight': '1'}

def parcel_details(values):
    if not isinstance(values, dict) or set(values) != set(DEFAULT_PARCEL):
        raise ValueError('Enter length, width, height and weight')
    result = {}
    for field in DEFAULT_PARCEL:
        value = values[field]
        if not isinstance(value, (str, int, float)) or isinstance(value, bool):
            raise ValueError('Package measurements must be positive numbers')
        try:
            number = Decimal(str(value))
            if not number.is_finite() or not 0 < number <= (150 if field == 'weight' else 108):
                raise ValueError('Package measurements are outside supported limits')
            result[field] = format(number, 'f')
        except InvalidOperation:
            raise ValueError('Package measurements must be positive numbers') from None
    return dict(result, distance_unit='in', mass_unit='lb')

def shippo_address(address):
    mapping = {'name': 'name', 'company': 'company', 'address1': 'street1', 'address2': 'street2', 'city': 'city', 'provinceCode': 'state', 'zip': 'zip', 'countryCodeV2': 'country', 'phone': 'phone'}
    return {target: address[source] for (source, target) in mapping.items() if address.get(source)}

class RatesUnavailable(RuntimeError):
    pass

class ShippoRates:

    def __init__(self, token, *, opener=urlopen):
        if not isinstance(token, str) or not token:
            raise ValueError('Shippo credentials required')
        (self.token, self.opener) = (token, opener)

    def quote(self, sender, destination, parcel):
        payload = dict(address_from=shippo_address(sender), address_to=shippo_address(destination), parcels=[parcel_details(parcel)], **{'async': False})
        request = Request('https://api.goshippo.com/shipments/', data=json.dumps(payload).encode(), method='POST', headers={'Authorization': 'ShippoToken ' + self.token, 'Content-Type': 'application/json', 'SHIPPO-API-VERSION': '2018-02-08'})
        try:
            with self.opener(request, timeout=30) as response:
                raw = response.read(2000001)
            if len(raw) > 2000000:
                raise ValueError()
            result = json.loads(raw)
            if not isinstance(result, dict) or result.get('status') != 'SUCCESS':
                raise ValueError()
            rates = result.get('rates')
            if not isinstance(rates, list) or len(rates) > 200:
                raise ValueError()
            prepared = []
            for rate in rates:
                if not isinstance(rate, dict):
                    raise ValueError()
                if rate.get('currency') != 'USD':
                    continue
                amount = Decimal(str(rate['amount']))
                if not amount.is_finite() or amount < 0 or amount * 100 != (amount * 100).to_integral_value():
                    raise ValueError()
                provider = rate.get('provider')
                level = rate.get('servicelevel')
                if not isinstance(level, dict):
                    raise ValueError()
                service = level.get('name')
                if not isinstance(provider, str) or not isinstance(service, str):
                    raise ValueError()
                prepared.append(dict(carrier=provider[:100], service=service[:100], amount=format(amount, '.2f'), currency='USD'))
            if not prepared:
                raise ValueError()
            return sorted(prepared, key=lambda rate: Decimal(rate['amount']))
        except (URLError, TimeoutError, OSError, ValueError, KeyError, TypeError, InvalidOperation):
            raise RatesUnavailable('Shipping rates unavailable. Check the address and try again.') from None
