"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, Response, make_response, send_file, redirect, render_template
from functools import wraps
from api.models import db, User, Scans, Case, Blog, Price_Request
from api.utils import generate_sitemap, APIException
from werkzeug.utils import secure_filename
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies, unset_jwt_cookies,unset_access_cookies
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import verify_jwt_in_request
from flask_jwt_extended import get_jwt

from datetime import datetime, timezone, timedelta
import requests
import os
import bcrypt
import base64
import io
import os
from pydo import Client
from flask_cors import CORS, cross_origin
import boto3

import shippo
from shippo.models import components



utc = timezone.utc
eastern = timezone(timedelta(hours=-4))


app = Flask(__name__)
app.url_map.strict_slashes = False
db_url = os.getenv("DATABASE_URL")
shippo_token = os.getenv("SHIPPO_TOKEN")
shippo_test = os.getenv("SHIPPO_TEST")

jwt = JWTManager(app) 

# @jwt.unauthorized_loader
# def unauthorized_callback(callback):
#     # No auth header
#     return redirect(app.config['BASE_URL'] + '/api/signup', 302)

# @jwt.invalid_token_loader
# def invalid_token_callback(callback):
#     # Invalid Fresh/Non-Fresh Access token in auth header
#     # resp = make_response(redirect(app.config['BASE_URL'] + '/api/signup'))
#     resp = make_response("no token")
#     unset_jwt_cookies(resp)
#     return resp, 302

# @jwt.expired_token_loader
# def expired_token_callback(callback):
#     # Expired auth header
#     resp = make_response(redirect(app.config['BASE_URL'] + '/api/token/refresh'))
#     unset_access_cookies(resp)
#     return resp, 302

def assign_access_refresh_tokens(email, url):
    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)
    resp = make_response(redirect(url, 302))
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    return resp

def calculate_business_days(submission_date_str, number_of_days):
    # Convert the string date to a datetime object
    submission_date = datetime.strptime(submission_date_str, "%m/%d/%Y %H:%M:%S")
    current_date = submission_date
    days_added = 0

    while days_added < number_of_days:
        current_date += timedelta(days=1)
        if current_date.weekday() < 5:  # 0-4 are Monday to Friday
            days_added += 1
            
    return current_date  # Returns a datetime object





SPACE_NAME = 'case-scans'
REGION = 'nyc3'
ACCESS_KEY = os.getenv('SPACES_KEY')
SECRET_KEY = os.getenv('SPACES_SECRET_KEY')

s3_client = boto3.client(
    's3',
    region_name='nyc3',
    endpoint_url='https://nyc3.digitaloceanspaces.com',
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY
)

s3 = boto3.client('s3', 
                  region_name=REGION, 
                  endpoint_url=f'https://{REGION}.digitaloceanspaces.com',
                  aws_access_key_id=ACCESS_KEY,
                  aws_secret_access_key=SECRET_KEY)



api = Blueprint('api', __name__)
CORS(app, supports_credentials=True)


@api.route('/list_files/<folder>', methods=['GET'])
def list_files(folder):
    
    # try:
    #     response = s3.list_objects_v2(Bucket=SPACE_NAME, Prefix=f'{folder}/')
        
    #     if 'Contents' not in response or len(response['Contents']) == 0:
    #         return jsonify([])  
    #     files = [
    #         f"https://case-scans.nyc3.cdn.digitaloceanspaces.com/{obj['Key']}"
    #         for obj in response['Contents']
    #     ]
    #     return jsonify(files)
    # except Exception as e:
    #     return jsonify({'error': str(e)}), 500  
    try:
        # List objects in the specified folder
        response = s3_client.list_objects_v2(Bucket=SPACE_NAME, Prefix=f'{folder}/')

        if 'Contents' not in response or len(response['Contents']) == 0:
            return jsonify([])  # Return an empty list if no files found

        files_data = []
        for obj in response['Contents']:
            file_key = obj['Key']
            filename = file_key.split('/')[-1]  # Extract the filename

            # Generate a signed URL for the file
            signed_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': SPACE_NAME, 'Key': file_key},
                ExpiresIn=3600  # URL expires in 1 hour
            )

            files_data.append({
                'filename': filename,
                'url': signed_url  # The signed URL
            })

        return jsonify(files_data)

    except NoCredentialsError:
        return jsonify({'error': 'Credentials not available'}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500





@api.route('/get_cookies', methods=['GET'])
def your_route():
    access_token = request.cookies.get('access_token_cookie')
    print(access_token)  # Access the cookie here
    return jsonify(access_token)


@api.route('/slack', methods=['POST'])
def slackMessage():
    msg = request.json.get("msg", None)
    slack_webhook_url = os.getenv('SLACK_WEBHOOK')

    # Define the payload
    payload = {
        'text': msg
    }

    # Define the headers
    headers = {
        'Content-Type': 'application/json'
    }

    try:
        # Make the POST request
        response = requests.post(slack_webhook_url, json=payload, headers=headers)
        
        # Check if the request was successful
        # response.raise_for_status()  
        # Raise an HTTPError for bad responses (4xx and 5xx)
        
        # Print the response JSON data
        print('Success:', response.json())
        return jsonify({'message': 'Success'}), 200
    except requests.exceptions.RequestException as e:
        # Print the error if something went wrong
        print('Error:', e)
        return jsonify({'message': 'Contact Admin'})


@api.route('/pricing', methods=['POST'])
def get_pricing():
    

    user_info = request.get_json()

    
    price_request = Price_Request(
        email = user_info["email"],
        first_name = user_info["firstName"],
        last_name = user_info["lastName"],
        practice_name = user_info["practiceName"],
        office_phone = user_info["officeNumber"],
        mobile_phone = user_info["mobileNumber"],
        position = user_info["position"],
        find_us = user_info["findUs"],
        
    )

    db.session.add(price_request)
    db.session.commit()

    
    return jsonify({'message': 'We will send you a price list shortly! Thank you!'}), 200


@api.route('/signup', methods=['POST'])
def signup():
    now_utc = datetime.now(utc)
    now_eastern = now_utc.astimezone(eastern)

    user_info = request.get_json()

    unsaltPass = user_info['password'].encode('utf-8')
    unsaltAnswer1 = user_info['security1Answer'].encode('utf-8')
    unsaltAnswer2 = user_info['security2Answer'].encode('utf-8')

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(unsaltPass, salt)
    hashedA1 = bcrypt.hashpw(unsaltAnswer1, salt)
    hashedA2 = bcrypt.hashpw(unsaltAnswer2, salt)


    exists = User.query.filter(User.email == user_info['email']).first()

    response_body = {
        "message": "Email already in use. Please Login or create a new account."
    }
    if exists is not None:
        return jsonify(response_body), 400
    
    new_user = User(
        email = user_info["email"],
        role = "User",
        password = hashed.decode("utf-8", "ignore"),
        address = user_info["address"],
        fname = user_info["firstName"],
        lname = user_info["lastName"],
        creation_date = now_eastern.strftime("%m/%d/%Y %H:%M:%S"),
        license_number = user_info["license"],
        pricing_package = "Intro",
        security_question_1 = user_info["security1"],
        security_question_2 = user_info["security2"],
        security_answer_1 = hashedA1.decode("utf-8", "ignore"),
        security_answer_2 = hashedA2.decode("utf-8", "ignore"),
        
    )

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=user_info['email'])

    res = make_response(new_user.serialize())
    res.headers['Content-Type'] = 'application/json'
    print(f"response:{res}")
    # user= new_user.serialize()
    set_access_cookies(res, access_token, max_age=3600)

    #---working---
    # res.set_cookie('token', access_token, max_age=7200, httponly=True)
    # res.set_cookie('info', user)
    return res, 200



@api.route('/admin-login', methods=['POST'])
def admin_login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    unSaltPass = password.encode('utf-8')
    checkEmail = User.query.filter_by(email=email).first()

    if checkEmail is not None and bcrypt.checkpw(unSaltPass, checkEmail.password.encode('utf-8')) and checkEmail.role == "Admin":
       
        admin_token = create_access_token(identity=email)

        
        
        # Create a response with the serialized user and token
        res = make_response(jsonify({'email': email}))
        response = make_response(checkEmail.serialize())
        
      
        
        set_access_cookies(response, admin_token, max_age=100000, )
        
        return response, 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401
    
@api.route('/admin/<int:id>', methods=['GET'])
@jwt_required()
def getAllInfo(id):

    now_utc = datetime.now(utc)
    now_eastern = now_utc.astimezone(eastern)
    current_user_email = get_jwt_identity()
    eastern_offset = timezone(timedelta(hours=-5))

    
    
    current_user = User.query.filter_by(email=current_user_email).first()
    
    if current_user.role == "Admin":
        all_users = User.query.all()
        all_cases = Case.query.all()

        for case in all_cases:
            # Check if the case has a hold
               if case.hold and case.hold_date_check is not now_eastern.strftime('%m/%d/%Y %H:%M:%S'):  # Assuming 'hold' is a string in 'MM/DD/YYYY HH:MM:SS' format
                hold_start_date = datetime.strptime(case.hold, '%m/%d/%Y %H:%M:%S')  # Convert to naive datetime
                hold_start_date = hold_start_date.replace(tzinfo=eastern_offset)  # Localize to Eastern Time

                hold_duration_days = (now_eastern - hold_start_date).days  # Calculate days since hold started

                # Update the due date
                if case.due_date and case.hold_date_check is not now_eastern.strftime('%m/%d/%Y %H:%M:%S'):  # Check if there's an existing due date
                    case.hold_date_check = now_eastern.strftime('%m/%d/%Y %H:%M:%S')
                    original_due_date = datetime.strptime(case.due_date, '%m/%d/%Y %H:%M:%S')  # Convert to naive datetime
                    original_due_date = original_due_date.replace(tzinfo=eastern_offset)  # Localize to Eastern Time
                    new_due_date = original_due_date + timedelta(days=hold_duration_days)  # Add days on hold
                    case.due_date = new_due_date.strftime('%m/%d/%Y %H:%M:%S')  # Update to desired format

                    # Save the updated due date back to the database
                    db.session.commit()

        all_users_list = list(map(lambda x: x.serialize(), all_users))
        all_cases_list = list(map(lambda x: x.serialize(), all_cases))


        return jsonify({"users": all_users_list, "cases":all_cases_list})
    else:
        return jsonify({"message": "You are not an admin, please log in at kpdlabs.com"})

@api.route('/login', methods=['POST'])
def login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    unSaltPass = password.encode('utf-8')
    checkEmail = User.query.filter_by(email=email).first()
  

    if checkEmail is not None and bcrypt.checkpw(unSaltPass, checkEmail.password.encode('utf-8')):
        access_token = create_access_token(identity=email)
        # refresh_token = create_refresh_token(identity=email)
        
        cookies_res =  make_response(jsonify({'email': email}))

        res = make_response(checkEmail.serialize())

        # res.set_cookie('token', access_token, max_age=7200, httponly=True, samesite=None)

        #---------add for Development---------------
        # res.headers['Set-Cookie'] = f'access_token_cookie={access_token}; SameSite=None; Secure'

        # res.headers['Set-Cookie'] = f'refresh_token_cookie={refresh_token}; SameSite=None; Secure'
    
        set_access_cookies(res, access_token, max_age=3600)
        # set_refresh_cookies(res, refresh_token, max_age=3600)
        
        return res, 200
    else: 
        
        res = make_response(
                jsonify(
                    {"message": "Invalid username or password"}
                ),
                401,
            )
        return res
    
@api.route('/updatePassword', methods=['PUT'])
def update_pw():
    email = request.json.get("email", None)
    new_pass = request.json.get("newPW")
    user_info = User.query.filter_by(email=email).first()

    unsaltPass = new_pass.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(unsaltPass, salt)


    user_info.password = hashed.decode("utf-8", "ignore")
    db.session.commit()

    id = user_info.id

    res = make_response(
        jsonify(
            {"id": id }
        )
    )


   
    return(res)


@api.route('/forgotPassword', methods=['POST'])
def forgot_pw():
    email = request.json.get("email", None)
    checkEmail = User.query.filter_by(email=email).first()

    if checkEmail is not None:
        res = make_response(
            jsonify(
                {"message": "Email found!"},
                {"data": checkEmail.serialize()}
            )
        )
        return(res)
    else:
        res = make_response(
            jsonify(
                {"message": "Email not found, please check entered email is correct."},
                {"data": "Email not found"}
            )
        )
        return(res)
    
@api.route('/validateanswers', methods=['POST'])
def validate_answers():
    email = request.json.get("email", None)
    security1 = request.json.get("securityAnswer1", None)
    unSaltSecurity1 = security1.encode('utf-8')
    security2 = request.json.get("securityAnswer2", None)
    unSaltSecurity2 = security2.encode('utf-8')
    user_info = User.query.filter_by(email=email).first()
    saved_answer_1 = user_info.security_answer_1
    saved_answer_2 = user_info.security_answer_2

    

    if bcrypt.checkpw(unSaltSecurity1, saved_answer_1.encode('utf-8')) and bcrypt.checkpw(unSaltSecurity2, saved_answer_2.encode('utf-8')):
        res = make_response(
            jsonify(
                {"message": "Success"},
            )
        )
        return(res)
    else:
        res = make_response(
            jsonify(
                {"message": "Answer Incorrect, Please Try Again"},
            )
        )
        return(res)

    

# @api.route('/logout', methods=['GET'])
# def unset_jwt():
#     resp = make_response(redirect(app.config[db_url] + '/', 302))
#     unset_jwt_cookies(resp)
#     return resp
# @api.route('/token/refresh', methods=['GET'])
# @jwt_required(refresh=True)
# def refresh():
#     # Refreshing expired Access token
#     email = get_jwt_identity()
#     print(email)
#     access_token = create_access_token(identity=email)
#     resp = make_response(jsonify({"message":"Created"}), 302)
#     set_access_cookies(resp, access_token)
#     return resp

#######ADD FOR DEVELOPMENT#####
# @app.route('/<int:id>', methods=['OPTIONS'])
# def handle_options():
#     response = jsonify({'message': 'Preflight request successful'})
#     response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
#     response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
#     response.headers.add('Access-Control-Allow-Credentials', 'true')

    
    # return response, 200

#getting user info for userPage
@api.route('/<int:id>', methods=['GET'])
@jwt_required()
def getInfo(id):
    
    username = get_jwt_identity()
    print(username)
    print(id)
    info = User.query.filter_by(id=id).first()
 
    res = make_response(jsonify(info.serialize()), 200)
    # res.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    # res.headers.add('Access-Control-Allow-Credentials', 'true')
    # res.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    # res.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')

    

    return res, 200



#uploading stl scans
@api.route('/upload', methods=['POST'])
def upload():
    scans = request.files['scans']

    if not scans:
        return 'No files uploaded', 400
    
    # scan =
    # user_id =
    # case_id = 
    
    # filename = secure_filename(scans.filename)
    # mimetype = scans.mimetype
    # img = Scans(scan = scans.read(), mimetype = mimetype, name=filename )
    db.session.add(img)
    db.session.commit()

    #return 'Img has been uploaded!', 200
    return print("Hello")

#uploading stl scans
@api.route('/<int:id>/new_scans', methods=['POST'])
def upload_file(id):
    # file = request.files['file']
    # print(file)
    # if file:
    #     new_file = Scans(file_name=file.filename, file_data=file.read())
    #     new_file.user_id = id
    #     db.session.add(new_file)
    #     db.session.commit()
    print('file', request.files)
    return ("hello"),200
    #     return {'message': 'File uploaded successfully'}, 200
    # else:
    #     return {'error': 'No file uploaded'}, 400
    
#download stl scans 
@api.route('/<int:file_id>/download_scans', methods=['GET'])
def download_file(file_id):
    uploaded_file = Scans.query.get(file_id)
    if uploaded_file:
        return send_file(
            io.BytesIO(uploaded_file.file_data),
            attachment_filename=uploaded_file.file_name,
            as_attachment=True
        )
    else:
        return {'error': 'File not found'}, 404



@api.route('/<int:id>/new_case', methods=['POST', 'PUT'])
@jwt_required()
def new_case(id):
    now_utc = datetime.now(utc)
    now_eastern = now_utc.astimezone(eastern)
    if request.method == 'PUT':

        caseCheck = request.json.get("case", None)
        checking_case = Case.query.filter_by(id=caseCheck).first()
        
       
        userobj = User.query.filter_by(id=id).first()


        if checking_case.name is None:
            case = request.json.get("case", None)
            name = request.json.get("name", None)
            teeth = request.json.get("teeth", None)
            product = request.json.get("product", None)
            shade = request.json.get("shade", None)
            notes = request.json.get("note", None)
            finish = request.json.get("finish", None)
            blob_scans = request.json.get("stl_urls", None)
            photos = request.json.get("photos", None)
            type = request.json.get("type", None)
            gum_shade = request.json.get("gum_shade", None)
            price = request.json.get("price", None)
            shipping = request.json.get("shipping", None)
            production = request.json.get("production", None)
            update_date  = now_eastern.strftime("%m/%d/%Y %H:%M:%S")
            due_date = calculate_business_days(update_date, 6)
            
            status = request.json.get("status", None)
            model3D = request.json.get("model3D", None)

            # if (request.json.get("logNote", None)):
            #     update_case.add_log(f"{}: {request.json.get('logNote', None)}")

            if (request.json.get("reference id", None)):
                reference_id = request.json.get("reference Id", None)
            else:
                reference_id = ""
            
            
            
            update_case = Case.query.filter_by(id=case).first()
            
            update_case.name = name
            update_case.teeth = teeth
            update_case.product = product
            update_case.shade = shade
            update_case.notes = notes
            update_case.finish = finish
            update_case.model3D = model3D

            if update_case.status == "Created":
                update_case.status = "Submitted"
            else: 
                update_case.status = status
            update_case.type = type
            update_case.gum_shade = gum_shade
            update_case.price = price
            update_case.shipping = shipping
            update_case.production = production
            update_case.reference_id = reference_id
            update_case.add_log(f"Submitted: {now_eastern.strftime('%m/%d/%Y %H:%M:%S')}")
            
        
            update_case.update_date = update_date
            update_case.due_date = due_date.strftime("%m/%d/%Y %H:%M:%S")
            db.session.commit()
            
            if blob_scans:
                for scan in blob_scans:
                    

                
                    new_scan = Scans(
                        scan = scan,
                        scan_name = scan,
                        user_id = id,
                        case_id = case
                    )
                    db.session.add(new_scan)
                    db.session.commit()
            
            if photos:
                for photo in photos:
                    
                    new_photo = Scans(
                        scan = photo,
                        scan_name = photo,
                        user_id = id,
                        case_id = case
                    )
                    db.session.add(new_photo)
                    db.session.commit()

            res = make_response("updated")
            res.headers['Content-Type'] = 'application/json'
            print(f"response:{res}")

            return jsonify({"msg": "Updated"}), 200 

        elif request.json.get("user", None) and request.json.get("logNote", None):
            case = request.json.get("case", None)
            update_case = Case.query.filter_by(id=case).first()
            print("hit this line")
            update_case.add_log(f"Dr. {userobj.lname}: {request.json.get('logNote', None)}")
            db.session.commit()
            return jsonify({"msg": "Updated"}), 200
        
        elif request.json.get("admin", None):
            case = request.json.get("case", None)
            name = request.json.get("name", None)
            teeth = request.json.get("teeth", None)
            product = request.json.get("product", None)
            shade = request.json.get("shade", None)
            notes = request.json.get("note", None)
            finish = request.json.get("finish", None)
            blob_scans = request.json.get("stl_urls", None)
            photos = request.json.get("photos", None)
            type = request.json.get("type", None)
            gum_shade = request.json.get("gum_shade", None)
            price = request.json.get("price", None)
            shipping = request.json.get("shipping", None)
            production = request.json.get("production", None)
            update_date  = now_eastern.strftime("%m/%d/%Y %H:%M:%S")
            status = request.json.get("status", None)
            model3D = request.json.get("model3D", None)

            if (request.json.get("reference id", None)):
                reference_id = request.json.get("reference Id", None)
            else:
                reference_id = ""
            
            
            
            update_case = Case.query.filter_by(id=case).first()
            
            update_case.name = name
            update_case.teeth = teeth
            update_case.product = product
            update_case.shade = shade
            update_case.notes = notes
            update_case.finish = finish
            update_case.model3D = model3D

            if update_case.status == "Created":
                update_case.status = "Submitted"
            else: 
                update_case.status = status
            if (request.json.get("logNote", None)):
                update_case.add_log(f"KPD: {request.json.get('logNote', None)} {now_eastern.strftime('%m/%d/%Y %H:%M:%S')}")
            
            else:
                update_case.add_log(f"{update_case.status}: {now_eastern.strftime('%m/%d/%Y %H:%M:%S')}")
                

            if (request.json.get("hold", None) == "add"):
                update_case.hold = now_eastern.strftime('%m/%d/%Y %H:%M:%S')
            elif (request.json.get("hold", None) == "remove"):
                update_case.hold = None


            # if (request.json.get("dueDate", None)):
            #     update_case.due_date = request.json.get("dueDate", None)

            update_case.type = type
            update_case.gum_shade = gum_shade
            update_case.price = price
            update_case.shipping = shipping
            update_case.production = production
            update_case.reference_id = reference_id
        
            # update_case.update_date = update_date
            db.session.commit()

            return jsonify({"msg": "Updated"}), 200 

        else:
            return jsonify({"msg": "Case Number Already in Use, Please refresh and Resubmit"}), 500  
    
    if request.method == 'POST':
        
        user = User.query.filter_by(id=id).first()
        print(user.case_number)
        # if user.case_number != []:
        #     user_case = user.case_number[-1]
        
            # if user_case.name == None:
            #     return (user_case.serialize()), 200
        
        print(user)
        if user is not None:
            cases = user.case_number
            sorted_cases = sorted(cases, key=lambda case: case.id)
           
            if user.case_number:  # Check if case_number is not empty or None
                
                
                # user_case = user.case_number[-1]

                user_case = sorted_cases[-1]
                if user_case.name is None:
                    
                    return user_case.serialize(), 200
                else:
                    
                    user_id = id

                    dt_string = now_eastern.strftime("%m/%d/%Y %H:%M:%S")
                
                    new_case = Case(
                        user_id = user_id,
                        creation_date = dt_string,
                        status= "Created"
                    
                    )

                    db.session.add(new_case)
                    db.session.commit()

                    res = make_response(new_case.serialize())
                    res.headers['Content-Type'] = 'application/json'
                    

                    return res, 200
                
            else:
                
                user_id = id

                dt_string = now_eastern.strftime("%m/%d/%Y %H:%M:%S")
            
                new_case = Case(
                    user_id = user_id,
                    creation_date = dt_string,
                    status= "Created"
                )

                db.session.add(new_case)
                db.session.commit()

                res = make_response(new_case.serialize())
                res.headers['Content-Type'] = 'application/json'
                

                return res, 200
                
        return "user not found", 404
            
                
        # else:

            # user_id = id
            
            # new_case = Case(
            #     user_id = user_id,
            
            # )

            # db.session.add(new_case)
            # db.session.commit()

            # res = make_response(new_case.serialize())
            # res.headers['Content-Type'] = 'application/json'
            # print(f"response:{res}")

            # return res, 200
  
    # filename = secure_filename(scans.filename)
    # mimetype = scans.mimetype
    # img = Scans(scan = scans.read(), mimetype = mimetype, name=filename )
    # db.session.add(new_case)
    # db.session.commit()

    #return 'Img has been uploaded!', 200
    # return print("Hello")

@api.route('/<int:id>/cases', methods=['GET'])
@jwt_required()
def cases(id):
    user_cases = User.query.filter_by(id=id).first()
    case_list = user_cases.case_number
    serialized_cases=[]
    for case in case_list:
        
        # case.serialize
        
        serialized_cases.append(case.serialize())
        
   
    return serialized_cases, 200

@api.route('/<int:id>/<int:case_id>', methods=['GET'])
@jwt_required()
def case(id, case_id):
    user_id = id
    user_case = Case.query.filter_by(id=case_id).first()
    case = user_case
    
    print(case)  
   
    return case.serialize(), 200

@api.route('/<int:id>/updateAccount', methods=['PUT'])
@jwt_required()
def update_account(id):
    user_info = request.get_json()
    user = User.query.filter_by(id=id).first()
    user.address = user_info["address"]
   

    db.session.commit()
   
   
    return jsonify({"message": "Account updated successfully"}), 200

@api.route('/shippo/create_user', methods=['POST'])
@jwt_required()
def create_shippo_user():
    # Assuming shippo.Shippo() returns the SDK instance
    shippo_sdk = shippo.Shippo(api_key_header=shippo_token)

    # Assuming addresses.create() returns Shippo's response
    shippo_response = shippo_sdk.addresses.create(
        components.AddressCreateRequest(
            name="Shawn Ippotle",
            company="Shippo",
            street1="215 Clayton St.",
            city="San Francisco",
            state="CA",
            zip="94117",
            country="US",  # iso2 country code
            phone="+1 555 341 9393",
            email="shippotle@shippo.com"
        )
    )

    # Return Shippo's response as JSON to the frontend
    return jsonify(shippo_response)

@api.route('/shippo/get_rates', methods=['POST'])
@jwt_required()
def get_rates():

    user_info = request.get_json()
    

    # Assuming shippo.Shippo() returns the SDK instance
    shippo_sdk = shippo.Shippo(api_key_header=shippo_token)

    address_from = components.AddressCreateRequest(
        name="KPD Labs",
        street1="3393 Us Highway 17 92 W",
        city="Haines City",
        state="FL",
        zip="33844",
        country="US",
        email="kpdlabs@kpdlabs.com",
        phone="8634382109",
        test="true"
    )

    address_to = components.AddressCreateRequest(
        name= request.json.get("name", None),
        street1= request.json.get("street", None),
        city= request.json.get("city", None),
        state= request.json.get("state", None),
        zip= request.json.get("zip", None),
        country="US"
    )

    parcel = components.ParcelCreateRequest(
        length="6",
        width="4",
        height="4",
        distance_unit=components.DistanceUnitEnum.IN,
        weight="1",
        mass_unit=components.WeightUnitEnum.LB
    )

    shipment = shippo_sdk.shipments.create(
        components.ShipmentCreateRequest(
            address_from=address_from,
            address_to=address_to,
            parcels=[parcel],
            async_=False
        )
    )

    # Return Shippo's response as JSON to the frontend
    return jsonify(shipment)

@api.route('/shippo/get_rates_kpd_ups/<int:id>', methods=['POST'])
@jwt_required()
def get_rates_kpd_ups(id):

    user_info = User.query.filter_by(id=id).first()

    address_string = user_info.address

    # Split the address string by commas
    parts = address_string.split(',')

    # Trim any leading or trailing whitespace from each part
    parts = [part.strip() for part in parts]

    # Assign each part to a separate variable
    street_address = parts[0]
    city = parts[1]
    state = parts[2]
    zip_code = parts[3]
    

    # Assuming shippo.Shippo() returns the SDK instance
    shippo_sdk = shippo.Shippo(api_key_header=shippo_token)

    address_from = components.AddressCreateRequest(
        name= f"{user_info.lname}, {user_info.fname}" ,
        street1= street_address,
        city= city,
        state= state,
        zip= zip_code,
        country="US",
        email= user_info.email,
        phone="8634382109",
        
        
    )

    address_to = components.AddressCreateRequest(
        name="KPD Labs",
        street1="3393 Us Highway 17 92 W",
        city="Haines City",
        state="FL",
        zip="33844",
        country="US",
        email= "kpdlabs@kpdlabs.com",
        phone="8634382109",
    )

    parcel = components.ParcelCreateRequest(
        length="6",
        width="4",
        height="4",
        distance_unit=components.DistanceUnitEnum.IN,
        weight="1",
        mass_unit=components.WeightUnitEnum.LB
    )

    shipment = shippo_sdk.shipments.create(
        components.ShipmentCreateRequest(
            address_from=address_from,
            address_to=address_to,
            parcels=[parcel],
            async_=False
        )
    )

    # Return Shippo's response as JSON to the frontend
    return jsonify(shipment)


@api.route('/shippo/get_rates/<int:id>', methods=['POST'])
@jwt_required()
def get_rates_to_kpd(id):

    user_info = User.query.filter_by(id=id).first()

    address_string = user_info.address

    # Split the address string by commas
    parts = address_string.split(',')

    # Trim any leading or trailing whitespace from each part
    parts = [part.strip() for part in parts]

    # Assign each part to a separate variable
    street_address = parts[0]
    city = parts[1]
    state = parts[2]
    zip_code = parts[3]
    

    # Assuming shippo.Shippo() returns the SDK instance
    shippo_sdk = shippo.Shippo(api_key_header=shippo_token)

    address_from = components.AddressCreateRequest(
        name= f"{user_info.lname}, {user_info.fname}" ,
        street1= street_address,
        city= city,
        state= state,
        zip= zip_code,
        country="US",
        email= user_info.email,
        phone="8634382109",
        
    )

    address_to = components.AddressCreateRequest(
        name="KPD Labs",
        street1="3393 Us Highway 17 92 W",
        city="Haines City",
        state="FL",
        zip="33844",
        country="US",
    )

    parcel = components.ParcelCreateRequest(
        length="6",
        width="4",
        height="4",
        distance_unit=components.DistanceUnitEnum.IN,
        weight="1",
        mass_unit=components.WeightUnitEnum.LB
    )

    shipment = shippo_sdk.shipments.create(
        components.ShipmentCreateRequest(
            address_from=address_from,
            address_to=address_to,
            parcels=[parcel],
            async_=False
        )
    )

    transaction = shippo_sdk.transactions.create(
    components.InstantTransactionCreateRequest(
        shipment=shipment,
        carrier_account="863887430eed4630aa037fd689c741bc",
        servicelevel_token="usps_priority"
        # carrier_account="ddd71fa28c8a4b4d965aab3225119e3f",
        # servicelevel_token="ups_ground_saver"
    )
    )

    # Return Shippo's response as JSON to the frontend
    return jsonify(transaction.label_url)


@api.route('/shippo/get_label', methods=['POST'])
@jwt_required()
def get_label():
    # Get the first rate in the rates results.
    # Customize this based on your business logic.
    rates = request.json.get("rate", None)
    print(rates)
    shippo_sdk = shippo.Shippo(api_key_header=shippo_token)

    # Purchase the desired rate. 
    transaction = shippo_sdk.transactions.create(
        components.TransactionCreateRequest(
            rate=rates["object_id"],
            label_file_type=components.LabelFileTypeEnum.PDF,
            async_=False
        )
    )

    # Retrieve label url and tracking number or error message
    if transaction.status == "SUCCESS":
        print(transaction.label_url)
        print(transaction.tracking_number)
        return jsonify(transaction.label_url)
    else:
        print(transaction.messages)
        return(transaction.messages)
    
@api.route('/blogs', methods=['GET'])
@jwt_required()
def get_blogs():
    all_blogs = Blog.query.all()
    all_blogs_list = list(map(lambda x: x.serialize(), all_blogs))
    return jsonify(all_blogs_list)



@api.route('/blogs/add', methods=['POST'])
@jwt_required()
def add_blog():
    current_user_email = get_jwt_identity()
    
    current_user = User.query.filter_by(email=current_user_email).first()
    
    if current_user.role == "Admin":
        title = request.json.get("title", None)
        description = request.json.get("description", None)
        date = request.json.get("date", None)
        info = request.json.get("info", None)

        new_blog = Blog(
                    
                    title = title,
                    description = description,
                    date = date,
                    info = info,

                )

        db.session.add(new_blog)
        db.session.commit()
        
        return jsonify({"message": "Blog Posted"}), 200
    
    else:
        return jsonify({"message":"You don't have authorization to do that."})