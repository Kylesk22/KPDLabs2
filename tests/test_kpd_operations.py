"""Offline tests: synthetic cases, SQLite, fake Shippo; never imports production app.py."""
import csv
import importlib.util
import io
import json
import os
from pathlib import Path
import sys
import tarfile
import tempfile
import unittest
from unittest.mock import patch
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError, reset_tzpath

# Windows has no system IANA database. Reuse python-dateutil's bundled timezone
# data for offline tests; production Linux uses its normal system zoneinfo.
try:
    ZoneInfo('America/New_York')
except ZoneInfoNotFoundError:
    import dateutil.zoneinfo
    tz_root = Path(tempfile.mkdtemp(prefix='kpd-test-tz-'))
    target = tz_root / 'America' / 'New_York'
    target.parent.mkdir()
    with tarfile.open(Path(dateutil.zoneinfo.__file__).parent / 'dateutil-zoneinfo.tar.gz') as archive:
        target.write_bytes(archive.extractfile('America/New_York').read())
    reset_tzpath([str(tz_root)])

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from flask import Flask, Blueprint
from flask_jwt_extended import JWTManager, create_access_token, decode_token
from api.models import db, User, Case
from api.kpd_reporting import build_report, money_cents, quantity, local_day, report_csv
from api.kpd_shipments import KPDShipment, KPDShipmentCase, ShippoProvider
from api.kpd_operations import register_operations


def record(id=1, **overrides):
    data = dict(id=id, user_id=2, customer='Adele Example', doctor_name='Adele Example', name='Demo patient', type='crown', product='Zirconia',
                teeth='{"8","9","10"}', status='Design', price='150.00', hold=None,
                update_date='11/16/2026 09:00:00', log=json.dumps(['Submitted: 11/16/2026 09:00:00']))
    data.update(overrides)
    return data


class ReportTests(unittest.TestCase):
    def test_dentist_title_variants_share_filters_totals_and_breakdown(self):
        cases = [record(doctor_name='Adele Example'),
                 record(2, doctor_name='Dr. Adele Example', status='Shipped',
                        log='["Submitted: 11/16/2026 09:00:00", "Shipped: 11/17/2026 10:00:00"]'),
                 record(3, doctor_name='  dr.  adele\u00a0Example  '),
                 record(4, doctor_name=' ', customer='Adele Example'),
                 record(5, doctor_name='Dr. Adele Other')]
        for choice in ('Adele Example', 'Dr. Adele Example', ' DR Adele   Example '):
            result = build_report(cases, '2026-11-16', '2026-11-18', doctor=choice)
            self.assertEqual(result['filters']['doctors'], ['Adele Example', 'Adele Other'])
            self.assertEqual(result['summary']['received']['cases'], 4)
            self.assertEqual(result['summary']['received']['value_cents'], 60000)
            self.assertEqual(result['summary']['shipped']['cases'], 1)
            self.assertEqual(result['summary']['in_house']['cases'], 3)
            self.assertEqual(len(result['breakdowns']['doctor']), 1)
            self.assertEqual(result['breakdowns']['doctor'][0]['name'], 'Adele Example')
        self.assertEqual(cases[1]['doctor_name'], 'Dr. Adele Example')
        # Similar names are not fuzzy-matched and account constraints still apply.
        result = build_report(cases, '2026-11-16', '2026-11-18', doctor='Adele')
        self.assertEqual(result['rows'], [])
        result = build_report(cases, '2026-11-16', '2026-11-18', doctor='Adele Example', customer_id=99)
        self.assertEqual(result['rows'], [])

    def test_period_flow_and_all_time_backlog_are_distinct(self):
        cases = [record(), record(2, status='Ready to Ship', update_date='11/01/2026 09:00:00', log='["Submitted: 11/01/2026 09:00:00"]'),
                 record(3, status='Billed', price='300', log='["Submitted: 11/01/2026 09:00:00", "Shipped: 11/17/2026 10:00:00", "Billed: 11/18/2026 10:00:00"]')]
        result = build_report(cases, '2026-11-16', '2026-11-18')
        self.assertEqual(result['summary']['received']['cases'], 1)
        self.assertEqual(result['summary']['shipped']['value_cents'], 30000)
        self.assertEqual(result['summary']['in_house']['cases'], 2)
        self.assertEqual(result['summary']['ready']['cases'], 1)

    def test_holds_partition_in_house_and_zero_price_counts(self):
        result = build_report([record(hold='11/17/2026', price='0'), record(2, status='Ready to Ship'), record(3)], '2026-11-16', '2026-11-18')
        self.assertEqual(result['summary']['held']['cases'], 1)
        self.assertEqual(result['summary']['held']['value_cents'], 0)
        self.assertEqual(sum(result['summary'][k]['cases'] for k in ('held', 'production', 'ready')), 3)

    def test_voids_and_drafts_excluded_closed_history_included(self):
        result = build_report([record(status='Void'), record(2, status='Created'), record(3, status='Closed', log='["Shipped: 11/18/2026 23:59:59"]')], '2026-11-18', '2026-11-18', 'shipped')
        self.assertEqual([r['id'] for r in result['rows']], [3])

    def test_billing_and_tracking_do_not_invent_shipment_date(self):
        result = build_report([record(status='Billed', log='["Tracking Number: EXAMPLE", "Billed: 11/18/2026 09:00:00"]')], '2026-11-16', '2026-11-18', 'shipped')
        self.assertEqual(result['rows'], [])
        self.assertEqual(result['quality']['missing_shipped'], 1)

    def test_physical_receipt_takes_precedence_and_fallback_is_flagged(self):
        result = build_report([record(log='["Submitted: 11/10/2026 09:00:00", "KPD: Impressions Received 11/17/2026 10:00:00"]'), record(2, log='bad json')], '2026-11-16', '2026-11-18')
        self.assertEqual(result['summary']['received']['cases'], 2)
        self.assertEqual(result['quality']['inferred_received'], 1)

    def test_earliest_event_prevents_double_counting_status_edits(self):
        result = build_report([record(status='Shipped', log='["Shipped: 11/15/2026 10:00:00", "Shipped: 11/18/2026 10:00:00"]')], '2026-11-16', '2026-11-18', 'shipped')
        self.assertEqual(result['rows'], [])

    def test_filters_apply_to_snapshots_too(self):
        result = build_report([record(), record(2, doctor_name='Other', product='PMMA')], '2026-11-16', '2026-11-18', doctor='Adele Example', product='Zirconia')
        self.assertEqual(result['summary']['in_house']['cases'], 1)

    def test_quantities_and_money_do_not_guess(self):
        self.assertEqual(quantity(record()), (3, 'tooth', False))
        self.assertEqual(quantity(record(teeth='8')), (1, 'tooth', False))
        self.assertEqual(quantity(record(type='newDenture', teeth='["Upper Arch","Lower Arch"]')), (2, 'arch', False))
        self.assertIsNone(quantity(record(teeth=''))[0])
        self.assertEqual(money_cents('$1,234.56'), 123456)
        self.assertEqual(money_cents('0'), 0)
        for value in ('', None, 'NaN', '-10', 'oops'):
            self.assertIsNone(money_cents(value))

    def test_date_boundaries_and_florida_conversion(self):
        self.assertEqual(local_day('2026-11-19T03:59:59Z'), '2026-11-18')
        self.assertEqual(local_day('2026-07-19T03:59:59Z'), '2026-07-18')
        self.assertIsNone(local_day('02/30/2026'))
        with self.assertRaises(ValueError): build_report([], '2026-11-19', '2026-11-18')

    def test_csv_matches_details_and_neutralizes_formulas(self):
        report = build_report([record(name='=SUM(A1)', price='1.01')], '2026-11-16', '2026-11-18')
        rows = list(csv.reader(io.StringIO(report_csv(report).lstrip('\ufeff'))))
        self.assertEqual(rows[1][3], "'=SUM(A1)")
        self.assertEqual(rows[1][-1], '1.01')


class FakeShippo:
    def __init__(self): self.purchases = 0; self.mode = 'success'; self.last = None
    def quote(self, snapshot):
        return {'rates': [dict(object_id='express', amount='22.00', currency='USD', provider='UPS', servicelevel=dict(name='Next Day Air', token='ups_next_day_air')),
                          dict(object_id='ground', amount='8.25', currency='USD', provider='UPS', servicelevel=dict(name='Ground', token='ups_ground'))]}
    def buy(self, rate, shipment):
        self.purchases += 1
        number = 122 + self.purchases
        self.last = dict(status='SUCCESS', object_id=f'transaction{number}', rate=rate, metadata='kpd:' + shipment,
                         tracking_number=f'DEMO{number}', label_url=f'https://example.test/label.pdf?box={number}')
        if self.mode == 'timeout': raise TimeoutError('synthetic timeout')
        if self.mode == 'failed': return dict(status='ERROR', object_id='error123')
        return self.last
    def retrieve(self, transaction): return dict(self.last)


def make_test_app():
    app = Flask(__name__)
    app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI='sqlite://', SQLALCHEMY_TRACK_MODIFICATIONS=False,
                      JWT_SECRET_KEY='offline-kpd-test-secret-not-a-production-secret', JWT_TOKEN_LOCATION=['cookies'], JWT_COOKIE_CSRF_PROTECT=True)
    db.init_app(app); JWTManager(app)
    api = Blueprint('test_operations', __name__)
    register_operations(api); app.register_blueprint(api, url_prefix='/api')
    app.extensions['kpd_shipping_provider'] = FakeShippo()
    return app


class OperationsTests(unittest.TestCase):
    def setUp(self):
        self.app = make_test_app(); self.ctx = self.app.app_context(); self.ctx.push(); db.create_all()
        for id, role, name in [(1, 'Admin', 'Admin'), (2, 'Doctor', 'Adele'), (3, 'Doctor', 'Other')]:
            db.session.add(User(id=id, role=role, email=f'{name}@example.test', password='test-only', address='123 Example St, Orlando, FL, 32801', fname=name, lname='Example', license_number=str(id),
                                security_question_1='Test', security_answer_1='Test', security_question_2='Test', security_answer_2='Test'))
        for id in range(1, 6):
            db.session.add(Case(id=id, user_id=2, doctor_name='Adele Example', name=f'Demo patient {id}', type='crown', product='Zirconia', teeth='8,9', status='Ready to Ship', price='100', log='["Submitted: 11/16/2026 09:00:00"]'))
        db.session.commit()
        self.client = self.app.test_client(); self.headers = self.login('Admin@example.test')
        self.provider = self.app.extensions['kpd_shipping_provider']
    def tearDown(self): db.session.remove(); db.drop_all(); self.ctx.pop()
    def login(self, email):
        token = create_access_token(identity=email); csrf = decode_token(token)['csrf']
        self.client.set_cookie('access_token_cookie', token); self.client.set_cookie('csrf_access_token', csrf)
        return {'X-CSRF-TOKEN': csrf}
    def post(self, path, body): return self.client.post('/api/admin/operations/' + path, json=body, headers=self.headers)
    def quote(self, ids=None):
        return self.post('shipping/quotes', {'cases': ids or [1,2,3,4,5], 'parcel': {'length':'6','width':'4','height':'4','weight':'1'}})
    def buy(self, quote): return self.post(f"shipping/{quote['id']}/buy", {'rate_id':'ground','amount_cents':825})
    def test_admin_permissions_and_csrf(self):
        self.headers = self.login('Adele@example.test')
        self.assertEqual(self.client.get('/api/admin/operations/reports').status_code, 403)
        self.assertEqual(self.quote().status_code, 403)
        self.headers = self.login('Admin@example.test')
        self.assertEqual(self.client.post('/api/admin/operations/shipping/quotes', json={}).status_code, 401)
        self.assertEqual(self.provider.purchases, 0)
    def test_queue_groups_five_cases_and_excludes_hold(self):
        data = self.client.get('/api/admin/operations/shipping').json
        self.assertEqual(len(data['groups']), 1); self.assertEqual(len(data['groups'][0]['cases']), 5)
        db.session.get(Case, 5).hold = 'today'; db.session.commit()
        self.assertEqual(len(self.client.get('/api/admin/operations/shipping').json['groups'][0]['cases']), 4)
    def test_quote_sorts_ground_and_buy_is_idempotent(self):
        quote = self.quote().json; self.assertEqual(quote['rates'][0]['token'], 'ups_ground')
        first = self.buy(quote); self.assertEqual(first.status_code, 200)
        self.assertEqual(self.buy(quote).status_code, 200); self.assertEqual(self.provider.purchases, 1)
        self.assertEqual(db.session.get(Case, 1).status, 'Ready to Ship')
        self.assertEqual(self.quote().status_code, 409)
        self.assertEqual(self.client.get('/api/admin/operations/shipping').json['groups'], [])
    def test_mark_shipped_updates_all_cases_once(self):
        quote = self.quote().json; self.buy(quote)
        path = f"shipping/{quote['id']}/shipped"
        self.assertEqual(self.post(path, {}).status_code, 200)
        self.assertEqual(self.post(path, {}).status_code, 200)
        for case in Case.query.all():
            self.assertEqual(case.status, 'Shipped'); self.assertEqual(sum(s.startswith('Shipped:') for s in case.get_logs()), 1)
    def test_uncertain_purchase_cannot_charge_again_reconciles(self):
        quote = self.quote().json; self.provider.mode='timeout'
        self.assertEqual(self.buy(quote).status_code, 409)
        self.assertEqual(db.session.get(KPDShipment,quote['id']).state,'uncertain')
        self.assertEqual(self.buy(quote).status_code, 409); self.assertEqual(self.quote().status_code,409)
        self.assertEqual(self.provider.purchases,1)
        recovered = self.post(f"shipping/{quote['id']}/reconcile", {'transaction_id':'transaction123'})
        self.assertEqual(recovered.status_code,200); self.assertEqual(recovered.json['state'],'purchased')
    def test_wrong_transaction_cannot_reconcile(self):
        quote = self.quote().json; self.provider.mode='timeout'; self.buy(quote)
        self.provider.last['metadata']='kpd:another-shipment'
        self.assertEqual(self.post(f"shipping/{quote['id']}/reconcile", {'transaction_id':'other'}).status_code,409)
        self.assertIsNone(db.session.get(KPDShipment,quote['id']).label_url)
    def test_reconciled_failure_releases_cases_without_buying_again(self):
        quote=self.quote().json; self.provider.mode='timeout'; self.buy(quote)
        self.provider.last['status']='ERROR'
        response=self.post(f"shipping/{quote['id']}/reconcile",{'transaction_id':'transaction123'})
        self.assertEqual(response.status_code,200); self.assertEqual(response.json['state'],'failed')
        self.assertEqual(KPDShipmentCase.query.count(),0); self.assertEqual(self.provider.purchases,1)
    def test_failed_purchase_releases_reservation(self):
        quote = self.quote().json; self.provider.mode='failed'
        self.assertEqual(self.buy(quote).status_code,409)
        self.assertEqual(KPDShipmentCase.query.count(),0)
        self.assertEqual(self.quote().status_code,200)
    def test_changed_status_hold_address_and_price_block_purchase(self):
        quote=self.quote().json
        self.assertEqual(self.post(f"shipping/{quote['id']}/buy", {'rate_id':'ground','amount_cents':1}).status_code,409)
        case=db.session.get(Case,1); case.status='Design'; db.session.commit()
        self.assertEqual(self.buy(quote).status_code,409)
        case.status='Ready to Ship'; case.hold='held'; db.session.commit()
        self.assertEqual(self.buy(quote).status_code,409)
        case.hold=None; db.session.get(User,2).address='99 Changed St, Orlando, FL, 32801'; db.session.commit()
        self.assertEqual(self.buy(quote).status_code,409); self.assertEqual(self.provider.purchases,0)
    def test_two_quotes_cannot_buy_same_cases(self):
        a=self.quote().json; b=self.quote().json
        self.assertEqual(self.buy(a).status_code,200); self.assertEqual(self.buy(b).status_code,409)
        self.assertEqual(self.provider.purchases,1)
    def test_corrupt_or_full_history_blocks_before_buying(self):
        case=db.session.get(Case,1); case.log='invalid'; db.session.commit()
        self.assertEqual(self.quote().status_code,409)
        case.log=json.dumps(['X'*1950]); db.session.commit()
        self.assertEqual(self.quote().status_code,409)
        self.assertEqual(self.provider.purchases,0)
    def test_mixed_dentists_and_legacy_tracking_blocked(self):
        db.session.get(Case,5).doctor_name='Other dentist'; db.session.commit()
        self.assertEqual(self.quote().status_code,409)
        db.session.get(Case,1).add_log('Tracking Number: LEGACY'); db.session.commit()
        self.assertEqual(self.quote([1]).status_code,409)
        self.assertEqual(len(self.client.get('/api/admin/operations/shipping').json['legacy']),1)
    def test_report_reads_closed_cases_and_csv(self):
        case=db.session.get(Case,1); case.status='Closed'; case.add_log('Shipped: 11/18/2026 10:00:00'); db.session.commit()
        query='reports?start=2026-11-18&end=2026-11-18&view=shipped'
        report=self.client.get('/api/admin/operations/'+query)
        self.assertEqual(report.status_code,200); self.assertEqual(report.json['summary']['shipped']['cases'],1)
        csv_response=self.client.get('/api/admin/operations/'+query+'&format=csv')
        self.assertIn('100.00',csv_response.text); self.assertEqual(csv_response.headers['Cache-Control'],'no-store')
    def test_report_dentist_dropdown_round_trip_includes_titled_cases_and_csv(self):
        case = db.session.get(Case, 1)
        case.doctor_name = 'Dr. Adele Example'
        case.status = 'Shipped'
        case.add_log('Shipped: 11/18/2026 10:00:00')
        db.session.commit()
        url = '/api/admin/operations/reports'
        query = dict(start='2026-11-16', end='2026-11-18', view='received')
        initial = self.client.get(url, query_string=query).json
        self.assertEqual(initial['filters']['doctors'], ['Adele Example'])
        query['doctor'] = initial['filters']['doctors'][0]
        result = self.client.get(url, query_string=query).json
        self.assertEqual(result['summary']['received']['cases'], 5)
        self.assertEqual(result['summary']['shipped']['cases'], 1)
        self.assertEqual(result['summary']['in_house']['cases'], 4)
        query.update(view='shipped', format='csv')
        rows = list(csv.reader(io.StringIO(self.client.get(url, query_string=query).text.lstrip('\ufeff'))))
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[1][0], '1')
        self.assertEqual(rows[1][2], 'Adele Example')
    def test_adw_linked_case_excluded_and_rejected(self):
        db.session.execute(db.text('CREATE TABLE adw_kpd_case_link (case_id INTEGER PRIMARY KEY)'))
        db.session.execute(db.text('INSERT INTO adw_kpd_case_link VALUES (1)')); db.session.commit()
        self.assertEqual(self.quote([1]).status_code,409)
        self.assertEqual(len(self.client.get('/api/admin/operations/shipping').json['groups'][0]['cases']),4)
        report=self.client.get('/api/admin/operations/reports?start=2026-11-16&end=2026-11-18').json
        self.assertEqual(report['summary']['received']['cases'],4)
    def test_shippo_adapter_requests_4x6_and_no_retry(self):
        with patch.dict(os.environ, {'SHIPPO_TOKEN':'shippo_test_example'}), patch('api.kpd_shipments.requests.request') as request:
            request.return_value.json.return_value={'status':'SUCCESS'}
            ShippoProvider().buy('ground','test123')
            self.assertEqual(request.call_args.kwargs['json']['label_file_type'],'PDF_4x6')
            self.assertEqual(request.call_args.kwargs['json']['metadata'],'kpd:test123')
            self.assertEqual(request.call_count,1)

    def group_quote(self, ids=None):
        ids = ids or [[1,2,3], [4,5]]
        return self.post('shipping/groups/quotes', {'boxes': [dict(cases=box, parcel=dict(length='6',width='4',height='4',weight=str(index+1))) for index,box in enumerate(ids)]})

    def group_buy(self, quote, total=None):
        return self.post(f"shipping/groups/{quote['id']}/buy", dict(boxes=[dict(id=b['id'],rate_id='ground',amount_cents=825) for b in quote['boxes']], total_cents=total if total is not None else 825*len(quote['boxes'])))

    def test_ten_cases_two_boxes_keep_distinct_tracking_and_confirm_separately(self):
        for id in range(6,11):
            db.session.add(Case(id=id,user_id=2,doctor_name='Adele Example',name=f'Demo {id}',type='crown',product='Zirconia',teeth='8',status='Ready to Ship',price='100',log='[]'))
        db.session.commit()
        quote=self.group_quote([list(range(1,6)),list(range(6,11))]).json
        response=self.group_buy(quote)
        self.assertEqual(response.status_code,200)
        boxes=response.json['boxes']
        self.assertEqual([b['box_number'] for b in boxes],[1,2])
        self.assertNotEqual(boxes[0]['tracking_number'],boxes[1]['tracking_number'])
        self.assertNotEqual(boxes[0]['label_url'],boxes[1]['label_url'])
        self.assertEqual(Case.query.filter_by(status='Ready to Ship').count(),10)
        for box in boxes:
            for id in box['cases']:
                logs=db.session.get(Case,id).get_logs()
                self.assertIn('Tracking Number: '+box['tracking_number'],logs)
                self.assertEqual(sum(s.startswith('Tracking Number:') for s in logs),1)
        self.assertEqual(self.group_buy(quote).status_code,200)
        self.assertEqual(self.provider.purchases,2)
        self.assertEqual(self.post(f"shipping/{boxes[0]['id']}/shipped",{}).status_code,200)
        self.assertEqual(Case.query.filter_by(status='Shipped').count(),5)
        self.assertEqual(Case.query.filter_by(status='Ready to Ship').count(),5)
        self.assertEqual(self.post(f"shipping/groups/{quote['id']}/shipped",{}).status_code,200)
        self.assertEqual(self.post(f"shipping/groups/{quote['id']}/shipped",{}).status_code,200)
        self.assertEqual(Case.query.filter_by(status='Shipped').count(),10)
        self.assertTrue(all(sum(s.startswith('Shipped:') for s in c.get_logs())==1 for c in Case.query.all()))

    def test_invalid_box_assignments_rejected(self):
        for ids in ([[1,2],[2,3]], [[1],[]], []):
            response=self.post('shipping/groups/quotes',{'boxes':[dict(cases=b,parcel=dict(length='6',width='4',height='4',weight='1')) for b in ids]})
            self.assertEqual(response.status_code,409)
        db.session.get(Case,5).doctor_name='Other'; db.session.commit()
        self.assertEqual(self.group_quote().status_code,409)
        self.assertEqual(KPDShipment.query.count(),0)

    def test_group_preflight_checks_last_box_before_any_charge(self):
        quote=self.group_quote().json
        self.assertEqual(self.group_buy(quote,total=1).status_code,409)
        db.session.get(Case,5).hold='held'; db.session.commit()
        self.assertEqual(self.group_buy(quote).status_code,409)
        self.assertEqual(self.provider.purchases,0)
        self.assertEqual(KPDShipmentCase.query.count(),0)
        self.assertTrue(all(s.state=='quoted' for s in KPDShipment.query.all()))

    def test_partial_purchase_retains_first_label_and_releases_unattempted_box(self):
        quote=self.group_quote([[1,2],[3,4],[5]]).json
        original=self.provider.buy
        def fail_second(rate, shipment):
            if self.provider.purchases==1: self.provider.mode='failed'
            return original(rate,shipment)
        with patch.object(self.provider,'buy',side_effect=fail_second):
            response=self.group_buy(quote)
        self.assertEqual(response.status_code,200)
        self.assertEqual([b['state'] for b in response.json['boxes']],['purchased','failed','not_purchased'])
        self.assertEqual(self.provider.purchases,2)
        self.assertEqual(KPDShipmentCase.query.count(),2)
        self.assertEqual(self.group_buy(quote).status_code,409)
        self.assertEqual(self.provider.purchases,2)
        self.assertEqual(self.post(f"shipping/groups/{quote['id']}/shipped",{}).status_code,409)
        self.assertEqual(self.post(f"shipping/{quote['boxes'][0]['id']}/shipped",{}).status_code,200)
        self.assertEqual(Case.query.filter_by(status='Shipped').count(),2)
        queued=self.client.get('/api/admin/operations/shipping').json['groups'][0]['cases']
        self.assertEqual([c['id'] for c in queued],[3,4,5])

    def test_group_timeout_keeps_uncertain_box_reserved(self):
        quote=self.group_quote([[1,2],[3,4],[5]]).json
        original=self.provider.buy
        def timeout_second(rate, shipment):
            if self.provider.purchases==1: self.provider.mode='timeout'
            return original(rate,shipment)
        with patch.object(self.provider,'buy',side_effect=timeout_second): response=self.group_buy(quote)
        self.assertEqual([b['state'] for b in response.json['boxes']],['purchased','uncertain','not_purchased'])
        self.assertEqual(KPDShipmentCase.query.count(),4)
        second=quote['boxes'][1]
        self.assertEqual(self.post(f"shipping/{second['id']}/reconcile",{'transaction_id':'transaction124'}).status_code,200)
        self.assertEqual(self.provider.purchases,2)
        self.assertEqual(self.group_buy(quote).status_code,409)

    def test_group_confirmation_rolls_back_all_if_one_box_held(self):
        quote=self.group_quote().json; self.group_buy(quote)
        db.session.get(Case,5).hold='held'; db.session.commit()
        self.assertEqual(self.post(f"shipping/groups/{quote['id']}/shipped",{}).status_code,409)
        self.assertEqual(Case.query.filter_by(status='Shipped').count(),0)
        self.assertTrue(all(s.state=='purchased' for s in KPDShipment.query.all()))

    def test_group_quote_failure_does_not_save_half_a_group(self):
        original=self.provider.quote
        def fail_second(snapshot):
            if 5 in snapshot['cases']: raise ValueError('No rate for second box')
            return original(snapshot)
        with patch.object(self.provider,'quote',side_effect=fail_second): self.assertEqual(self.group_quote().status_code,409)
        self.assertEqual(KPDShipment.query.count(),0)

    def test_group_boxes_cannot_be_purchased_via_single_endpoint(self):
        quote=self.group_quote().json
        self.assertEqual(self.buy(quote['boxes'][0]).status_code,409)
        self.assertEqual(self.provider.purchases,0)

    def test_left_behind_cases_remain_ready_and_unreserved(self):
        quote=self.group_quote([[1,2],[3,4]]).json
        self.assertEqual(self.group_buy(quote).status_code,200)
        self.assertEqual(self.post(f"shipping/groups/{quote['id']}/shipped",{}).status_code,200)
        self.assertEqual(db.session.get(Case,5).status,'Ready to Ship')
        self.assertIsNone(db.session.get(KPDShipmentCase,5))

    def test_overlapping_group_quotes_do_not_charge_twice(self):
        first=self.group_quote().json; second=self.group_quote([[1,3],[2,4,5]]).json
        self.assertEqual(self.group_buy(first).status_code,200)
        self.assertEqual(self.group_buy(second).status_code,409)
        self.assertEqual(self.provider.purchases,2)

    def test_additive_migration_preserves_cases_and_reserves_uniquely(self):
        from alembic.migration import MigrationContext
        from alembic.operations import Operations
        from sqlalchemy import inspect
        KPDShipmentCase.__table__.drop(db.engine)
        KPDShipment.__table__.drop(db.engine)
        path = Path(__file__).resolve().parents[1] / 'migrations/versions/kpd_operations_20261118.py'
        spec = importlib.util.spec_from_file_location('kpd_migration',path)
        migration = importlib.util.module_from_spec(spec); spec.loader.exec_module(migration)
        with db.engine.begin() as connection:
            with Operations.context(MigrationContext.configure(connection)):
                migration.upgrade()
            self.assertEqual(inspect(connection).get_pk_constraint('kpd_shipment_case')['constrained_columns'],['case_id'])
        self.assertEqual(Case.query.count(),5)
        self.assertEqual(self.buy(self.quote().json).status_code,200)


class ManufacturingTests(unittest.TestCase):
    tearDown = OperationsTests.tearDown
    login = OperationsTests.login
    post = OperationsTests.post

    def setUp(self):
        OperationsTests.setUp(self)
        Case.query.update({'status': 'Manufacturing'})
        db.session.get(Case, 5).user_id = 3
        db.session.commit()
        from api.kpd_manufacturing import KPDManufacturingLabel
        self.receipts = KPDManufacturingLabel

    def queue(self):
        response = self.client.get('/api/admin/operations/manufacturing-labels')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Cache-Control'], 'no-store')
        return response.json

    def prepare(self, ids=None, mode='new'):
        return self.post('manufacturing-labels/prepare', {'cases': ids if ids is not None else [1,2], 'mode': mode})

    def confirm(self, batch, ids=None):
        return self.post('manufacturing-labels/confirm', {'token': batch['token'], 'cases': ids if ids is not None else [1,2]})

    def test_queue_excludes_hold_other_status_and_adw(self):
        db.session.get(Case,2).hold='held'
        db.session.get(Case,3).status='Design'
        db.session.commit()
        with patch('api.kpd_manufacturing.adw_case_ids', return_value={4}):
            self.assertEqual([c['id'] for c in self.queue()['cases']], [1,5])
            self.assertEqual(self.prepare([1,4]).status_code, 409)
        self.assertEqual(self.prepare([1,2]).status_code,409)
        self.assertEqual(self.prepare([1,3]).status_code,409)

    def test_preparation_or_cancel_does_not_record_printing(self):
        response=self.prepare([1,5])
        self.assertEqual(response.status_code,200)
        self.assertEqual([r['caseNumber'] for r in response.json['labels']],[1,5])
        self.assertEqual(response.headers['Cache-Control'],'no-store')
        self.assertEqual(self.receipts.query.count(),0)
        self.assertEqual(self.queue()['pending'],5)
        self.assertEqual(Case.query.filter_by(status='Manufacturing').count(),5)

    def test_partial_confirmation_and_idempotent_retry(self):
        batch=self.prepare().json
        self.assertEqual(self.confirm(batch,[1]).status_code,200)
        first=db.session.get(self.receipts,1).printed_at
        self.assertEqual(self.queue()['pending'],4)
        self.assertIsNone(db.session.get(self.receipts,2))
        self.assertEqual(self.confirm(batch,[1]).status_code,200)
        self.assertEqual(db.session.get(self.receipts,1).printed_at,first)
        self.assertEqual(db.session.get(self.receipts,1).printed_by,1)
        self.assertEqual(Case.query.filter_by(status='Manufacturing').count(),5)
        self.assertTrue(all(c.get_logs()==['Submitted: 11/16/2026 09:00:00'] for c in Case.query.all()))

    def test_confirmed_labels_require_reprint_changed_content_returns_to_queue(self):
        batch=self.prepare().json
        self.assertEqual(self.confirm(batch).status_code,200)
        self.assertEqual(self.prepare().status_code,409)
        self.assertEqual(self.prepare(mode='reprint').status_code,200)
        db.session.get(Case,1).notes='New instruction'; db.session.commit()
        result=self.queue()
        self.assertEqual(result['pending'],4)
        self.assertEqual(result['cases'][0]['reason'],'changed')
        self.assertEqual(self.prepare([1]).status_code,200)

    def test_changed_case_blocks_entire_confirmation(self):
        batch=self.prepare().json
        db.session.get(Case,2).shade='B2'; db.session.commit()
        self.assertEqual(self.confirm(batch).status_code,409)
        self.assertEqual(self.receipts.query.count(),0)

    def test_hold_or_status_change_after_preparation_blocks_confirmation(self):
        batch=self.prepare().json
        db.session.get(Case,2).hold='held'; db.session.commit()
        self.assertEqual(self.confirm(batch).status_code,409)
        db.session.get(Case,2).hold=None
        db.session.get(Case,2).status='Finish'; db.session.commit()
        self.assertEqual(self.confirm(batch).status_code,409)
        self.assertEqual(self.receipts.query.count(),0)

    def test_invalid_expired_and_out_of_batch_tokens_cannot_confirm(self):
        from itsdangerous import SignatureExpired
        batch=self.prepare().json
        self.assertEqual(self.confirm(batch,[3]).status_code,409)
        self.assertEqual(self.confirm({'token':batch['token']+'tampered'}).status_code,409)
        with patch('api.kpd_manufacturing.URLSafeTimedSerializer.loads',side_effect=SignatureExpired('expired')):
            self.assertEqual(self.confirm(batch).status_code,409)
        self.assertEqual(self.receipts.query.count(),0)

    def test_validation_admin_and_csrf(self):
        for ids in ([], [1,1], [True], ['1'], [0], [999], list(range(1,102))):
            self.assertEqual(self.prepare(ids).status_code,409)
        self.assertEqual(self.prepare(mode='unknown').status_code,409)
        self.assertEqual(self.client.post('/api/admin/operations/manufacturing-labels/prepare',json={'cases':[1]}).status_code,401)
        self.headers=self.login('Adele@example.test')
        self.assertEqual(self.client.get('/api/admin/operations/manufacturing-labels').status_code,403)
        self.assertEqual(self.prepare().status_code,403)
        self.assertEqual(self.confirm({'token':'invalid'}).status_code,403)

    def test_existing_labels_can_be_recorded_without_printing(self):
        batch=self.prepare([1,5],mode='existing').json
        self.assertEqual(self.confirm(batch,[1,5]).status_code,200)
        self.assertEqual(self.queue()['pending'],3)
        self.assertEqual(self.provider.purchases,0)

    def test_additive_migration_preserves_cases(self):
        from alembic.migration import MigrationContext
        from alembic.operations import Operations
        from sqlalchemy import inspect
        self.receipts.__table__.drop(db.engine)
        path=Path(__file__).resolve().parents[1]/'migrations/versions/kpd_manufacturing_20261118.py'
        spec=importlib.util.spec_from_file_location('manufacturing_migration',path)
        migration=importlib.util.module_from_spec(spec); spec.loader.exec_module(migration)
        self.assertEqual(migration.down_revision,'kpd_operations_20261118')
        with db.engine.begin() as connection:
            with Operations.context(MigrationContext.configure(connection)): migration.upgrade()
            self.assertEqual(inspect(connection).get_pk_constraint('kpd_manufacturing_label')['constrained_columns'],['case_id'])
        self.assertEqual(Case.query.count(),5)
        self.assertEqual(self.confirm(self.prepare().json).status_code,200)


if __name__ == '__main__': unittest.main(verbosity=2)
