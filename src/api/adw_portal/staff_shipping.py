"""Read-only shipment preparation from immutable order destinations."""
from .lab_review import require_staff
from .order_shipping import destination_for_cases
SENDER = {'name': 'American Dental Works', 'address1': '3393 Us Highway 17 92 W', 'address2': '', 'city': 'Haines City', 'provinceCode': 'FL', 'zip': '33844', 'countryCodeV2': 'US', 'phone': '8634382109'}

def preview_shipment(engine, case_ids, *, staff):
    require_staff(staff)
    if not isinstance(case_ids, list) or not 1 <= len(case_ids) <= 100:
        raise ValueError('Select between 1 and 100 cases')
    with engine.connect() as connection:
        destination = destination_for_cases(connection, case_ids)
    return {'sender': dict(SENDER), 'destination': destination, 'case_ids': list(case_ids), 'label_purchased': False}
