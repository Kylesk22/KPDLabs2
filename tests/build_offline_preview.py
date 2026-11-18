"""Package an offline HTML UI review using synthetic API fixtures."""
import base64
import json
from pathlib import Path
from preview_server import app
from flask_jwt_extended import create_access_token, decode_token

root=Path(__file__).resolve().parents[1]
with app.app_context():
    client=app.test_client()
    token=create_access_token(identity='demo1@example.test')
    client.set_cookie('access_token_cookie',token)
    csrf=decode_token(token)['csrf']
    report=client.get('/api/admin/operations/reports?start=2000-01-01&end=2100-01-01&view=received').json
    queue=client.get('/api/admin/operations/shipping').json
    quoted=client.post('/api/admin/operations/shipping/quotes',json=dict(cases=[4201,4202,4203,4204,4205],parcel=queue['default_parcel']),headers={'X-CSRF-TOKEN':csrf}).json
    pdf=client.get('/demo-label.pdf').data
    fixture=dict(report=report,queue=queue,rates=quoted['rates'],today=report['snapshot_at'][:10],label_url='data:application/pdf;base64,'+base64.b64encode(pdf).decode())
script=(root/'.preview/offline.js').read_text(encoding='utf-8').replace('</script','<\\/script')
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KPD Reports &amp; Shipping Preview</title><style>body{margin:0}*{box-sizing:border-box}</style></head><body><div id="root"></div><script>window.KPD_PREVIEW_FIXTURE='+json.dumps(fixture).replace('<','\\u003c')+';</script><script>'+script+'</script></body></html>'
path=root/'docs/KPD-operations-preview.html'
path.write_text(html,encoding='utf-8')
print(str(path))
