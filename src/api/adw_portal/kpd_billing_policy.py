"""Policy for the pending KPD adapter; not yet wired to live routes.

ADW identity must come from a durable case link, never browser fields, notes,
or the account name. Validate a whole bulk selection before changing any case.
"""

def validate_status_change(staff, case_ids, status, linked_case_ids):
    if not staff or staff.get('role') != 'Admin' or (not staff.get('id')):
        raise PermissionError('Administrator access required')
    if not isinstance(case_ids, list) or not case_ids or any((type(case_id) is not int or case_id <= 0 for case_id in case_ids)) or (len(set(case_ids)) != len(case_ids)):
        raise ValueError('Select valid cases')
    if not isinstance(status, str) or not status:
        raise ValueError('Status required')
    if status == 'Billed' and set(case_ids).intersection(linked_case_ids):
        raise ValueError('ADW cases are prepaid through Shopify and must not be billed again')

def billing_summary(case_link):
    if case_link is None:
        return None
    return dict(source='ADW', billing_system='Shopify', bill_in_kpd=False, label='ADW — billing handled in Shopify', ordering_lab=case_link['lab_id'], order_id=case_link['order_id'])
