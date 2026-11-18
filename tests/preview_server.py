"""Local-only sample-data preview. Never import from the production app.

Run with the repository's Python dependencies, then open http://127.0.0.1:4173.
Uses a fresh in-memory SQLite database and FakeShippo, never live credentials.
"""
from datetime import datetime, timedelta
from pathlib import Path
import json
from flask import request, make_response, send_from_directory, Response
from flask_jwt_extended import create_access_token, set_access_cookies
from test_kpd_operations import make_test_app, db, User, Case, FakeShippo
from api.kpd_reporting import FLORIDA

app = make_test_app()
app.config['TESTING'] = False
preview_root = Path(__file__).resolve().parents[1] / '.preview'
today = datetime.now(FLORIDA)

def stamp(days): return (today - timedelta(days=days)).strftime('%m/%d/%Y 10:00:00')

with app.app_context():
    db.create_all()
    for id, name in [(1, 'Demo Admin'), (2, 'Adele Example'), (3, 'River Dental'), (4, 'Pinecrest Dental')]:
        first, last = name.split(' ', 1)
        db.session.add(User(id=id, role='Admin' if id == 1 else 'Doctor', email=f'demo{id}@example.test', password='demo-only',
                            address='123 Example Street, Haines City, FL, 33844', fname=first, lname=last, practice='', license_number=str(id),
                            security_question_1='Demo', security_answer_1='Demo', security_question_2='Demo', security_answer_2='Demo'))
    for i in range(1, 25):
        customer = 2 if i <= 5 else 3 if i % 2 else 4
        doctor = {2:'Adele Example',3:'River Dental',4:'Pinecrest Dental'}[customer]
        status = 'Ready to Ship' if i <= 5 else ['Design','Manufacturing','Finish','Billed','Shipped','Closed'][i % 6]
        received_days = 1 if i <= 5 else i % 12
        logs = [f'Submitted: {stamp(received_days)}']
        if status in {'Shipped','Billed','Closed'}: logs.append(f'Shipped: {stamp(i % 2)}')
        denture = i % 5 == 0
        db.session.add(Case(id=4200+i, user_id=customer, doctor_name=doctor, name=f'Sample patient {i:02d}',
                            type='newDenture' if denture else 'crown', product='PMMA' if denture else 'Zirconia',
                            teeth='["Upper Arch"]' if denture else '["8","9"]', status=status, price='0' if i==9 else '195' if denture else '110',
                            hold=stamp(1) if i in {6,12,18} else None, update_date=stamp(received_days), log=json.dumps(logs)))
    db.session.commit()

@app.after_request
def demo_label_link(response):
    # Only this preview changes the fake HTTPS URL to a local demonstration PDF.
    if response.is_json:
        raw = response.get_data(as_text=True).replace('https://example.test/label.pdf', '/demo-label.pdf')
        response.set_data(raw)
    return response

@app.route('/demo-label.pdf')
def demo_label():
    stream = b'BT /F1 19 Tf 25 380 Td (DEMO - NOT VALID FOR SHIPPING) Tj 0 -50 Td /F1 14 Tf (KPD 4 x 6 label preview) Tj 0 -35 Td (288 x 432 points) Tj ET'
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
               b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 288 432] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
               b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream']
    data = b'%PDF-1.4\n'; offsets = [0]
    for index,obj in enumerate(objects,1):
        offsets.append(len(data)); data += f'{index} 0 obj\n'.encode()+obj+b'\nendobj\n'
    offset=len(data); data+=b'xref\n0 6\n0000000000 65535 f \n'
    data+=b''.join(f'{value:010} 00000 n \n'.encode() for value in offsets[1:])
    data+=f'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{offset}\n%%EOF'.encode()
    return Response(data,mimetype='application/pdf')

@app.route('/preview.js')
def script(): return send_from_directory(preview_root,'preview.js')

@app.route('/')
@app.route('/admin/<path:path>')
def page(path=''):
    response=make_response('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>KPD Operations — Development Preview</title><style>body{margin:0}*{box-sizing:border-box}</style></head><body><div id="root"></div><script src="/preview.js"></script></body></html>')
    set_access_cookies(response,create_access_token(identity='demo1@example.test'))
    return response

if __name__ == '__main__': app.run(host='127.0.0.1',port=4173,debug=False)
