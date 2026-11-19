"""Archive API regression checks with synthetic SQLite records only."""
import json
import unittest
from unittest.mock import patch
from sqlalchemy import event
from test_kpd_operations import make_test_app
from api.models import db, Case, User, Scans
from flask_jwt_extended import create_access_token


class ArchiveTests(unittest.TestCase):
    def setUp(self):
        self.app = make_test_app()
        self.ctx = self.app.app_context(); self.ctx.push(); db.create_all()
        for id, role, first in [(1, 'Admin', 'Staff'), (2, 'Doctor', 'Office')]:
            db.session.add(User(id=id, role=role, email=f'{first}@example.test', password='test', address='test', fname=first, lname='Account', license_number=str(id), security_question_1='test', security_answer_1='test', security_question_2='test', security_answer_2='test'))
        for number in range(1, 62):
            db.session.add(Case(id=number, user_id=2, name=f'Patient {number}', doctor_name='Dr. Adele Example', status='Closed' if number <= 60 else 'Design', product='Zirconia', type='crown', update_date='11/18/2026 10:00:00', notes='Private prescription', log='["Shipped: 11/18/2026 09:00:00"]', scanner_id=f'iTero-{number}'))
            db.session.add(Scans(case_id=number, user_id=2, scan_name='scan.stl', scan='synthetic-only'))
        db.session.commit()
        self.client = self.app.test_client()
        self.login('Staff')

    def tearDown(self):
        db.session.remove(); db.drop_all(); self.ctx.pop()

    def login(self, name):
        self.client.set_cookie('access_token_cookie', create_access_token(identity=f'{name}@example.test'))

    def get(self, **args):
        return self.client.get('/api/admin/operations/archive', query_string=args)

    def test_pages_repeat_no_overlap_and_out_of_range(self):
        first = self.get().json
        second = self.get(page=2).json
        self.assertEqual(first['total'], 60)
        self.assertEqual(len(first['cases']), 25)
        self.assertEqual(first['cases'][0]['id'], 60)
        self.assertEqual(first, self.get().json)
        self.assertFalse({row['id'] for row in first['cases']} & {row['id'] for row in second['cases']})
        last = self.get(page=500).json
        self.assertEqual(last['page'], 3)
        self.assertEqual(len(last['cases']), 10)
        self.assertEqual(Case.query.count(), 61)

    def test_search_fields_scope_and_literal_wildcards(self):
        for text in ('1', '#1', 'iTero-1'):
            result = self.get(q=text).json
            self.assertTrue(any(row['id'] == 1 for row in result['cases']))
        self.assertEqual(self.get(q='1').json['total'], 1)
        self.assertEqual(self.get(q='patient 60').json['total'], 1)
        self.assertEqual(self.get(q='adele').json['total'], 60)
        self.assertEqual(self.get(q='office account').json['total'], 60)
        self.assertEqual(self.get(q='61').json['total'], 0)
        self.assertEqual(self.get(q='61', scope='all').json['total'], 1)
        self.assertEqual(self.get(q='no results').json['total'], 0)
        self.assertEqual(self.get(q='%').json['total'], 0)
        self.assertEqual(self.get(q='_').json['total'], 0)
        self.assertEqual(self.get(q="' OR 1=1 --").json['total'], 0)
        self.assertEqual(self.get(q='9' * 100).json['total'], 0)

    def test_date_range_is_inclusive_and_supports_legacy_and_iso(self):
        db.session.get(Case, 1).update_date = '12/31/2025 23:59:59'
        db.session.get(Case, 2).update_date = '2026-01-01T00:00:00'
        db.session.get(Case, 3).update_date = None
        db.session.commit()
        self.assertEqual(self.get(start='2025-12-31', end='2025-12-31').json['cases'][0]['id'], 1)
        self.assertEqual(self.get(start='2026-01-01', end='2026-01-01').json['cases'][0]['id'], 2)
        self.assertEqual(self.get(start='2026-01-01', end='2026-12-31').json['total'], 58)
        self.assertEqual(self.get(q='3').json['total'], 1)
        self.assertEqual(self.get(sort='date', direction='asc', start='2025-01-01').json['cases'][0]['id'], 1)

    def test_sort_is_global_stable_and_fallback_doctor_works(self):
        self.assertEqual(self.get(sort='case', direction='asc').json['cases'][0]['id'], 1)
        self.assertEqual(self.get(sort='patient', direction='asc').json['cases'][0]['id'], 1)
        db.session.get(Case, 1).doctor_name = ' '
        db.session.get(Case, 2).user_id = None
        db.session.commit()
        self.assertEqual(self.get(q='1').json['cases'][0]['doctor'], 'Office Account')
        self.assertEqual(self.get(q='2').json['total'], 1)

    def test_admin_auth_and_input_validation(self):
        self.client.delete_cookie('access_token_cookie')
        self.assertEqual(self.get().status_code, 401)
        self.login('Office')
        self.assertEqual(self.get().status_code, 403)
        self.login('Staff')
        for args in ({'page': 'bad'}, {'page': 0}, {'page': 1000001}, {'scope': 'bad'}, {'sort': 'notes'}, {'direction': 'bad'}, {'q': 'a'*201}, {'start': '2026-02-30'}, {'start': '2026-11-19', 'end': '2026-11-18'}):
            self.assertEqual(self.get(**args).status_code, 400, args)

    def test_no_full_case_serialization_or_scan_queries(self):
        statements = []
        def capture(connection, cursor, statement, *args): statements.append(statement.lower())
        event.listen(db.engine, 'before_cursor_execute', capture)
        try:
            with patch.object(Case, 'serialize', side_effect=AssertionError('Full case serialized')):
                response = self.get()
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers['Cache-Control'], 'no-store')
            self.assertLessEqual(len(statements), 8)
            self.assertFalse(any('from scans' in sql for sql in statements))
            self.assertNotIn('notes', response.json['cases'][0])
            self.assertNotIn('log', response.json['cases'][0])
            self.assertNotIn('scan', response.json['cases'][0])
        finally:
            event.remove(db.engine, 'before_cursor_execute', capture)
        detail = db.session.get(Case, 1).serialize()
        self.assertEqual(detail['notes'], 'Private prescription')
        self.assertEqual(len(detail['case scans']), 1)
        self.assertTrue(detail['log'])

    def test_adw_cases_are_excluded(self):
        with patch('api.kpd_archive.adw_case_ids', return_value={60}):
            self.assertEqual(self.get().json['total'], 59)
            self.assertEqual(self.get(q='60', scope='all').json['total'], 0)


if __name__ == '__main__': unittest.main()
