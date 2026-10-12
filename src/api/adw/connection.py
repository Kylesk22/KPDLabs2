"""Read-only Shopify connection probe, isolated from KPD session/case routes."""
import time
from flask import Blueprint, jsonify, request, Response
from .shopify_identity import verified_customer

SHOP = '0z8umb-uq.myshopify.com'
ORIGIN = 'https://' + SHOP
PATH = '/adw/integration/connection'
PAGE = '''<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ADW connection check</title><style>
body{font:17px system-ui;background:#f5f7fa;color:#142738;margin:0;padding:40px}
main{max-width:640px;margin:auto;background:white;padding:32px;border:1px solid #d6dfe6}
button{background:#a63c31;color:white;padding:14px;border:0;font:inherit;cursor:pointer}
p{line-height:1.6}</style><main><p>AMERICAN DENTAL WORKS</p>
<h1>Connection check</h1><p>Your signed-in Shopify identity was verified.
This check does not upload files, create a case, or take payment.</p>
<button id="check">Check secure connection</button><p id="result" role="status"></p>
</main><script>
document.getElementById('check').onclick=async function(){
this.disabled=true;const result=document.getElementById('result');
result.textContent='Checking…';try{
const response=await fetch(location.pathname,{method:'POST',credentials:'same-origin',
headers:{'Content-Type':'application/json'},body:'{}'});
const data=await response.json();
result.textContent=response.ok&&data.check==='adw_connection_v1'&&data.origin_verified
?'Connection verified. Signed-in identity and browser security checks passed.'
:'Connection not verified. Please let us know; no case data was changed.';
}catch(error){result.textContent='Connection could not be verified. No case data was changed.'}
this.disabled=false;};</script></html>'''


def register_connection_probe(app, env, *, clock=time.time):
    """Invalid/missing ADW settings disable this probe without breaking KPD."""
    if env.get('ADW_CONNECTION_CHECK_ENABLED', '').lower() != 'true':
        return False
    secret=env.get('ADW_SHOPIFY_SECRET','')
    if not isinstance(secret,str) or len(secret)<32:
        app.logger.warning('ADW connection check disabled: app secret is missing or invalid')
        return False
    secret=secret.encode('utf-8')
    bp=Blueprint('adw_connection_check',__name__)

    @bp.route(PATH,methods=['GET','POST'])
    def connection():
        try:
            verified_customer(request.query_string.decode('ascii'),secret=secret,
                shop=SHOP,path_prefix='/apps/adw',now=clock())
        except (PermissionError,ValueError,UnicodeError):
            return jsonify(check='adw_connection_v1',identity_verified=False,
                           message='Sign in through the ADW storefront to run this check.'),403
        if request.method=='GET':
            return Response(PAGE,content_type='text/html; charset=utf-8')
        if request.content_length is None or request.content_length>1024:
            return jsonify(check='adw_connection_v1',message='Invalid check request'),413
        # Never read or echo the body. This endpoint cannot persist any data.
        valid=request.headers.get('Origin')==ORIGIN
        return jsonify(check='adw_connection_v1',identity_verified=True,
                       origin_verified=valid),200 if valid else 403

    def protect_response(response):
        if request.path==PATH:
            response.headers['Cache-Control']='no-store'
            response.headers['X-Content-Type-Options']='nosniff'
            response.headers['Referrer-Policy']='no-referrer'
            response.headers['Content-Security-Policy']="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'"
            # Run after KPD's global CORS; never allow a foreign site to read it.
            for name in ('Access-Control-Allow-Origin','Access-Control-Allow-Credentials',
                         'Access-Control-Allow-Headers','Access-Control-Allow-Methods'):
                response.headers.pop(name,None)
        return response
    app.register_blueprint(bp)
    app.after_request_funcs.setdefault(None,[]).insert(0,protect_response)
    return True
