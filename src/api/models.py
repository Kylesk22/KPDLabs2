from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.dialects.postgresql import BYTEA
from sqlalchemy import PickleType, LargeBinary
from datetime import datetime
import json

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    address = db.Column(db.String(), unique=False, nullable=False)
    fname = db.Column(db.String(30), unique=False, nullable=False)
    lname = db.Column(db.String(50), unique=False, nullable=False)
    practice = db.Column(db.String(100), unique=False, nullable=True)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    creation_date = db.Column(db.String(50))
    pricing_package = db.Column(db.String(50), unique=False)
    user_scans = db.relationship('Scans', backref='user')
    case_number = db.relationship('Case', backref='user')
    security_question_1 = db.Column(db.String(100), unique=False, nullable=False)
    security_answer_1 = db.Column(db.String(100), unique=False, nullable=False)
    security_question_2 = db.Column(db.String(100), unique=False, nullable=False)
    security_answer_2 = db.Column(db.String(100), unique=False, nullable=False)
    #scans = db.Column(db.)
    

    def __repr__(self):
        return f'<User {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "address":self.address,
            "fname":self.fname,
            "lname":self.lname,
            "practice":self.practice,
            "license":self.license_number,
            "pricing_package": self.pricing_package,
            "created":self.creation_date,
            "security_question_1": self.security_question_1,
            "security_question_2": self.security_question_2,
            # "cases":self.case_number,
            # "scans": self.scans,
            # do not serialize the password, its a security breach
        }
    
class Scans(db.Model):
    __tablename__ = "scans"
    id = db.Column(db.Integer, primary_key=True)
    scan_name = db.Column(db.String(255), nullable= True)
    scan = db.Column(db.String(255), nullable= True)
    # name = db.Column(db.Text, nullable = False)
    # mimetype = db.Column(db.Text, nullable = False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    case_id = db.Column(db.Integer, db.ForeignKey('case.id'))

    def __repr__(self):
        return f'<Scans {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "scan name": self.scan_name,
            "scan": self.scan,
            "uploaded_at": self.uploaded_at,
            "user id":self.user_id,
            "case id":self.case_id,

            # "scans": self.scans,
            # do not serialize the password, its a security breach
        }

class Case(db.Model):
    __tablename__ = "case"
    id = db.Column(db.Integer, primary_key=True)
   
    name = db.Column(db.Text, nullable = True)
    type = db.Column(db.String(50))
    teeth = db.Column(db.String(250), unique=False, nullable=True)
    product = db.Column(db.String(50), unique=False, nullable=True)
    shade = db.Column(db.String(50), unique=False, nullable=True)
    gum_shade = db.Column(db.String(50), unique=False, nullable=True)
    finish = db.Column(db.String(50), unique=False, nullable=True)
    notes = db.Column(db.String(2000), nullable= True)
    status = db.Column(db.String(50), unique=False, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    creation_date = db.Column(db.String(50))
    shipping = db.Column(db.String(50))
    production = db.Column(db.String(50))
    price = db.Column(db.String(50))
    reference_id = db.Column(db.String(50), nullable=True)
    update_date =  db.Column(db.String(255))
    due_date =  db.Column(db.String(255))
    hold =  db.Column(db.String(255), nullable=True)
    model3D = db.Column(db.String(20), nullable=True)
    log = db.Column(db.String(2000), nullable=True)
    case_scans = db.relationship('Scans', backref='case')

    def add_log(self, log_entry):
        existing_logs = self.get_logs()
        existing_logs.append(log_entry)
        self.log = json.dumps(existing_logs)

    def get_logs(self):
        if self.log:
            return json.loads(self.log)
        return []
    

    def __repr__(self):
        return f'<Case {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "user id":self.user_id,
            "type": self.type,
            "teeth":self.teeth,
            "product": self.product,
            "shade": self.shade,
            "gum shade": self.gum_shade,
            "finish": self.finish,
            "notes": self.notes,
            "status": self.status,
            "3DModel": self.model3D,
            "price": self.price,
            "shipping": self.shipping,
            "production": self.production,
            "creation date": self.creation_date,
            "update date": self.update_date,
            "due date": self.due_date,
            "hold": self.hold,
            "reference id": self.reference_id,
            "log": self.get_logs(),
            "case scans":[scan.serialize() for scan in self.case_scans]

            # "scans": self.scans,
            # do not serialize the password, its a security breach
        }


class Blog(db.Model):
    __tablename__ = "blog"
    id = db.Column(db.Integer, primary_key=True)
   
    title = db.Column(db.String(250), nullable = False)
    description = db.Column(db.String(500), nullable = False)
    date = db.Column(db.String(50), unique=False, nullable=False)
    info = db.Column(db.String(2500), unique=False, nullable=True)
   

    def __repr__(self):
        return f'<Blog {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description":self.description,
            "date": self.date,
            "info":self.info,
            
        }
    
class Price_Request(db.Model):
    __tablename__ = "price_request"
    id = db.Column(db.Integer, primary_key=True)
   
    first_name = db.Column(db.String(30), unique=False, nullable=False)
    last_name = db.Column(db.String(50), unique=False, nullable=False)
    practice_name = db.Column(db.String(150), unique=False, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    office_phone = db.Column(db.String(25), unique=False, nullable=False)
    mobile_phone = db.Column(db.String(25), unique=False, nullable=False)
    position = db.Column(db.String(50), unique=False, nullable=False)
    find_us = db.Column(db.String(50), unique=False, nullable=False)
   

    def __repr__(self):
        return f'<Price_Request {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "first name": self.first_name,
            "last name":self.last_name,
            "practice name": self.practice_name,
            "email":self.email,
            "office phone":self.office_phone,
            "mobile phone":self.mobile_phone,
            "position":self.position,
            "find us":self.find_us,
            
        }