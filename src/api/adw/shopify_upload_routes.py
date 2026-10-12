"""Opt-in Shopify grant + direct upload routes. Never registered on import.

Exact browser Origin is required for grant issuance in addition to Shopify HMAC.
If proxy strips Origin, fail closed: validate actual Shopify behavior before launch.
Direct uploads use a bearer grant, no KPD cookies. No credentialed CORS.
"""
import time
from threading import BoundedSemaphore
from pathlib import Path
from urllib.parse import urlsplit
from flask import Blueprint,request,jsonify,render_template_string
from werkzeug.exceptions import RequestEntityTooLarge
from .shopify_identity import verified_customer
from .upload_grants import AuthorizedIntake
from .streaming_intake import StreamingIntake

def register_shopify_intake(app,*,grants,intake,shop,proxy_secret,origin,clock=time.time):
    if app.config.get('ADW_SHOPIFY_INTAKE_ENABLED') is not True:return
    if not origin.startswith('https://') or origin.endswith('/'):
        raise ValueError('Exact HTTPS storefront origin required')
    streaming=app.config.get('ADW_STREAMING_UPLOAD_ENABLED') is True
    ceiling=(301 if streaming else 20)*1024*1024
    limit=app.config.get('ADW_REQUEST_LIMIT_BYTES',ceiling)
    if type(limit) is not int or not 1024*1024<limit<=ceiling:
        raise ValueError('Invalid upload body limit')
    if streaming and not isinstance(intake,StreamingIntake):
        raise ValueError('Streaming upload requires StreamingIntake')
    # One large request per worker process. Deployment must bound total workers
    # and provision temporary disk for multipart spool + verified snapshots.
    upload_slot=BoundedSemaphore(1)
    bp=Blueprint('adw_shopify_intake',__name__,url_prefix='/adw/integration')
    upload_url=app.config.get('ADW_UPLOAD_URL','https://kpdlabs.com/adw/integration/upload')
    parsed=urlsplit(upload_url)
    if (parsed.scheme!='https' or parsed.netloc!='kpdlabs.com'
        or parsed.path!='/adw/integration/upload' or parsed.query or parsed.fragment):
        raise ValueError('Exact KPD upload endpoint required')
    consumer=AuthorizedIntake(grants,intake)
    @bp.before_request
    def boundary():
        if request.method=='GET' and request.path.endswith('/intake'):return
        if request.headers.get('Origin')!=origin:return jsonify(message='Storefront origin required'),403
        if request.method=='POST':
            if request.content_length is None:return jsonify(message='Content length required'),411
            allowed=32768 if request.path.endswith('/grant') else limit
            if request.content_length>allowed:return jsonify(message='Upload exceeds size limit'),413
    @bp.after_request
    def response_headers(response):
        response.headers['Cache-Control']='no-store'
        response.headers['X-Content-Type-Options']='nosniff'
        response.headers['Referrer-Policy']='no-referrer'
        if request.headers.get('Origin')==origin:
            response.headers['Access-Control-Allow-Origin']=origin
            response.headers['Vary']='Origin'
            response.headers['Access-Control-Allow-Methods']='POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers']='Authorization, Content-Type'
        return response
    @bp.get('/intake')
    def intake_page():
        try:
            identity=verified_customer(request.query_string.decode('ascii'),secret=proxy_secret,
                shop=shop,path_prefix='/apps/adw',now=clock())
        except (PermissionError,ValueError,UnicodeError):
            return 'Please sign into your ADW lab account, then return to Send case files.',403
        try:grants.memberships.principal(shop,identity['customer_id'])
        except PermissionError:
            return render_template_string('<h1>Lab approval required</h1><p>Your ADW account is signed in. '
                'ADW must approve your lab before files can be uploaded.</p><p>Account reference: {{ customer }}</p>',
                customer=identity['customer_id']),403
        return render_template_string((Path(__file__).parent/'storefront_intake.html').read_text(encoding='utf-8'),
            upload_url=upload_url,max_case_bytes=limit-1024*1024,
            max_file_bytes=min(100*1024*1024,limit-1024*1024))
    @bp.post('/grant')
    def grant():
        try:
            identity=verified_customer(request.query_string.decode('ascii'),secret=proxy_secret,
                shop=shop,path_prefix='/apps/adw',now=clock())
            payload=request.get_json(silent=True)
            if not isinstance(payload,dict):raise ValueError('JSON manifest required')
            manifest=payload.get('files')
            token=grants.issue(identity,payload.get('reference'),manifest,payload.get('request_key'),now=clock())
            if sum(f['bytes'] for f in manifest)>limit-1024*1024:
                raise ValueError('Files exceed upload limit')
            return jsonify(authorization=token,expires_in=600,max_request_bytes=limit),201
        except PermissionError:return jsonify(message='Approved ADW customer access required'),403
        except (ValueError,UnicodeError):return jsonify(message='Invalid upload manifest or identity'),400
    @bp.post('/upload')
    def upload():
        auth=request.headers.get('Authorization','')
        if not auth.startswith('Bearer ') or len(auth)>4103:return jsonify(message='Upload authorization required'),403
        try:grants.authenticate(auth[7:],now=clock())
        except PermissionError:return jsonify(message='Upload authorization invalid, expired or revoked'),403
        if not upload_slot.acquire(blocking=False):
            response=jsonify(message='Another upload is in progress. Keep your files and retry shortly.')
            response.status_code=429;response.headers['Retry-After']='5'
            return response
        try:
            uploads=request.files.getlist('files')
            if not 1<=len(uploads)<=12:raise ValueError()
            if streaming:
                result=intake.submit_authorized(grants,auth[7:],request.form.get('reference',''),
                    [dict(name=item.filename,stream=item.stream) for item in uploads],clock=clock)
                return jsonify(result),201
            files=[];total=0
            for item in uploads:
                content=item.stream.read(limit-total+1);total+=len(content)
                if total>limit:raise RequestEntityTooLarge()
                files.append(dict(name=item.filename,content=content))
            result=consumer.submit(auth[7:],request.form.get('reference',''),files,now=clock())
            return jsonify(result),201
        except PermissionError:return jsonify(message='Upload authorization invalid, expired or revoked'),403
        except ValueError:return jsonify(message='Files or case reference do not match the authorization'),400
        except RequestEntityTooLarge:return jsonify(message='Upload exceeds pilot size limit'),413
        except Exception:return jsonify(message='Receipt unconfirmed. Retain files and retry with the same request key.'),503
        finally:upload_slot.release()
    app.register_blueprint(bp)
    def final_adw_cors(response):
        # KPD has application-wide credentialed CORS. Run after that handler,
        # scoped only to ADW, so it cannot add KPD cookie access to these routes.
        if request.path.startswith('/adw/integration/'):
            for header in ('Access-Control-Allow-Origin','Access-Control-Allow-Credentials',
                           'Access-Control-Allow-Methods','Access-Control-Allow-Headers'):
                response.headers.pop(header,None)
            if request.headers.get('Origin')==origin:
                response.headers['Access-Control-Allow-Origin']=origin
                response.headers['Access-Control-Allow-Methods']='POST, OPTIONS'
                response.headers['Access-Control-Allow-Headers']='Authorization, Content-Type'
            response.vary.add('Origin')
        return response
    # Flask executes application response handlers in reverse registration order.
    app.after_request_funcs.setdefault(None,[]).insert(0,final_adw_cors)
