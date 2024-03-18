"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, Response, make_response, send_file
from api.models import db, User, Scans, Case
from api.utils import generate_sitemap, APIException
from werkzeug.utils import secure_filename
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from datetime import datetime
import os
import bcrypt
import base64
import io
import os
from pydo import Client

# client = Client(token=os.environ.get("DIGITALOCEAN_TOKEN"))

# req = {
#   "rules": [
#     {
#       "type": "ip_addr",
#       "value": "192.168.1.1"
#     },
#     {
#       "type": "k8s",
#       "value": "ff2a6c52-5a44-4b63-b99c-0e98e7a63d61"
#     },
#     {
#       "type": "droplet",
#       "value": "163973392"
#     },
#     {
#       "type": "tag",
#       "value": "backend"
#     }
#   ]
# }
# update_resp = client.databases.update_firewall_rules(database_cluster_uuid="a7a8bas", body=req)


api = Blueprint('api', __name__)


# @api.route('/hello', methods=['POST', 'GET'])
# def handle_hello():

#     response_body = {
#         "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
#     }

#     return jsonify(response_body), 200


#Signup Route/hash and salt pw/create new user/return jwt
@api.route('/signup', methods=['POST'])
def signup():
    user_info = request.get_json()

    unsaltPass = user_info['password'].encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(unsaltPass, salt)
    exists = User.query.filter(User.email == user_info['email']).first()

    response_body = {
        "message": "Email already in use. Please Login or create a new account."
    }
    if exists is not None:
        return jsonify(response_body), 400
    
    new_user = User(
        email = user_info["email"],
        password = hashed.decode("utf-8", "ignore"),
        address = user_info["address"],
        fname = user_info["firstName"],
        lname = user_info["lastName"],
    )

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=user_info['email'])

    res = make_response(new_user.serialize())
    res.headers['Content-Type'] = 'application/json'
    print(f"response:{res}")
    # user= new_user.serialize()

    res.set_cookie('token', access_token, max_age=7200, httponly=True)
    # res.set_cookie('info', user)
    return res, 200


@api.route('/login', methods=['POST'])
def login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    unSaltPass = password.encode('utf-8')
    checkEmail = User.query.filter_by(email=email).first()
  

    if checkEmail is not None and bcrypt.checkpw(unSaltPass, checkEmail.password.encode('utf-8')):
        access_token = create_access_token(identity=email)
        
        return jsonify(access_token=access_token, user=checkEmail.serialize())
    else: 
        return jsonify({"msg": "Bad username or password"}), 401
    

#getting user info for userPage
@api.route('/<int:id>', methods=['GET'])
def getInfo(id):
    info = User.query.filter_by(id=id).first()


    return jsonify(info.serialize()), 200



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
def new_case(id):
    now = datetime.now()
    if request.method == 'PUT':
        case = request.json.get("case", None)
        name = request.json.get("name", None)
        teeth = request.json.get("teeth", None)
        product = request.json.get("product", None)
        blob_scans = request.json.get("stl_urls")
        update_date  = now.strftime("%d/%m/%Y %H:%M:%S")
        print(name)
        
        update_case = Case.query.filter_by(id=case).first()
        print(update_case)
        update_case.name = name
        update_case.teeth = teeth
        update_case.product = product
        update_case.update_date.append(update_date)
        
        db.session.commit()

        # for scan in blob_scans:
            

        
        #     new_scan = Scans(
        #         scan = scan,
        #         user_id = id,
        #         case_id = case
        #     )
        #     db.session.add(new_scan)
        #     db.session.commit()
        
        res = make_response("updated")
        res.headers['Content-Type'] = 'application/json'
        print(f"response:{res}")

        return jsonify({"msg": "Updated"}), 200    
    
    if request.method == 'POST':
        
        user = User.query.filter_by(id=id).first()
        print(user.case_number)
        # if user.case_number != []:
        #     user_case = user.case_number[-1]
        
            # if user_case.name == None:
            #     return (user_case.serialize()), 200
        
        print(user)
        if user is not None:
           
            if user.case_number:  # Check if case_number is not empty or None
                
                user_case = user.case_number[-1]
                if user_case.name is None:
                    
                    return user_case.serialize(), 200
                else:
                    
                    user_id = id

                    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
                
                    new_case = Case(
                        user_id = user_id,
                        creation_date = dt_string
                    
                    )

                    db.session.add(new_case)
                    db.session.commit()

                    res = make_response(new_case.serialize())
                    res.headers['Content-Type'] = 'application/json'
                    

                    return res, 200
                
            else:
                
                user_id = id

                dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
            
                new_case = Case(
                    user_id = user_id,
                    creation_date = dt_string
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
def cases(id):
    user_cases = User.query.filter_by(id=id).first()
    case_list = user_cases.case_number
    serialized_cases=[]
    for case in case_list:
        
        # case.serialize
        
        serialized_cases.append(case.serialize())
        
   
    return serialized_cases, 200

@api.route('/<int:id>/<int:case_id>', methods=['GET'])
def case(id, case_id):
    user_id = id
    user_case = Case.query.filter_by(id=case_id).first()
    case = user_case
    
    print(case)  
   
    return case.serialize(), 200