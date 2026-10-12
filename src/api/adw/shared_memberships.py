"""Shared lab approval records. Internal staff-authorized operations only."""
from sqlalchemy import Table,Column,String,Boolean,Integer,DateTime,func,select,update
from .shared_receipts import metadata,SharedReceiptRepository
import re

members=Table('adw_lab_membership',metadata,
    Column('shop',String(255),primary_key=True),Column('customer',String(20),primary_key=True),
    Column('lab',String(80),nullable=False),Column('active',Boolean,nullable=False))
audit=Table('adw_lab_membership_audit',metadata,
    Column('id',Integer,primary_key=True),Column('shop',String(255),nullable=False),
    Column('customer',String(20),nullable=False),Column('lab',String(80),nullable=False),
    Column('action',String(20),nullable=False),Column('actor',String(120),nullable=False),
    Column('created_at',DateTime(timezone=True),server_default=func.now(),nullable=False))

class SharedMemberships:
    def __init__(self,engine,*,allow_sqlite_for_tests=False):
        adapter=SharedReceiptRepository(engine,allow_sqlite_for_tests=allow_sqlite_for_tests)
        self.engine=engine;self.insert_builder=adapter.insert_builder
    def approve(self,shop,customer,lab,*,actor):
        if (not isinstance(actor,str) or not 1<=len(actor)<=120
            or not re.fullmatch(r'[a-z0-9-]+\.myshopify\.com',shop)
            or not re.fullmatch(r'[1-9][0-9]{0,19}',customer)
            or not re.fullmatch(r'[A-Za-z0-9_-]{1,80}',lab)):
            raise ValueError('Explicit shop, customer, lab and staff actor required')
        with self.engine.begin() as db:
            db.execute(self.insert_builder(members).values(shop=shop,customer=customer,lab=lab,active=True)
                .on_conflict_do_nothing(index_elements=['shop','customer']))
            row=db.execute(select(members.c.lab).where(members.c.shop==shop,members.c.customer==customer).with_for_update()).scalar_one()
            if row!=lab:raise ValueError('Existing customer lab cannot be reassigned')
            db.execute(update(members).where(members.c.shop==shop,members.c.customer==customer).values(active=True))
            db.execute(audit.insert().values(shop=shop,customer=customer,lab=lab,action='approve',actor=actor))
    def revoke(self,shop,customer,*,actor):
        if not isinstance(actor,str) or not 1<=len(actor)<=120:raise ValueError('Staff actor required')
        with self.engine.begin() as db:
            lab=db.execute(select(members.c.lab).where(members.c.shop==shop,members.c.customer==customer).with_for_update()).scalar_one_or_none()
            if lab is None:raise ValueError('Membership not found')
            db.execute(update(members).where(members.c.shop==shop,members.c.customer==customer).values(active=False))
            db.execute(audit.insert().values(shop=shop,customer=customer,lab=lab,action='revoke',actor=actor))
    def principal(self,shop,customer):
        with self.engine.connect() as db:
            lab=db.execute(select(members.c.lab).where(members.c.shop==shop,members.c.customer==customer,members.c.active.is_(True))).scalar_one_or_none()
        if lab is None:raise PermissionError('Approved ADW lab membership required')
        return dict(adw_approved=True,lab_id=lab,shop=shop,customer_id=customer)
