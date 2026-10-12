"""Server-only S3-compatible adapter. Client is constructed outside this module.

Use a dedicated private bucket/prefix and server credentials. Bucket policy,
encryption, lifecycle, malware handling and production access need separate checks.
"""
import base64
import hashlib
import re

KEY = re.compile(r'adw/intake/ADW-[0-9a-f]{32}/[0-9a-f]{32}\.(stl|ply|obj|jpg|jpeg|png|pdf)\Z')

class PrivateObjectStorage:
    def __init__(self, client, bucket, cleanup_queue):
        if not bucket or not callable(cleanup_queue):raise ValueError('Storage configuration required')
        self.client,self.bucket,self.cleanup_queue=client,bucket,cleanup_queue
    def validate(self,key):
        if not isinstance(key,str) or not KEY.fullmatch(key):raise ValueError('Invalid intake object key')
    def put_private(self,key,content):
        self.validate(key)
        self.client.put_object(Bucket=self.bucket,Key=key,Body=content,ACL='private',
            ContentType='application/octet-stream',ContentDisposition='attachment',
            ContentMD5=base64.b64encode(hashlib.md5(content).digest()).decode(),
            Metadata={'sha256':hashlib.sha256(content).hexdigest()})
    def size(self,key):
        self.validate(key)
        return self.client.head_object(Bucket=self.bucket,Key=key)['ContentLength']
    def put_private_stream(self,key,stream):
        self.validate(key)
        stream.seek(0)
        md5,sha,size=hashlib.md5(),hashlib.sha256(),0
        while True:
            chunk=stream.read(1024*1024)
            if not chunk:break
            md5.update(chunk);sha.update(chunk);size+=len(chunk)
        stream.seek(0)
        self.client.put_object(Bucket=self.bucket,Key=key,Body=stream,
            ContentLength=size,ACL='private',ContentType='application/octet-stream',
            ContentDisposition='attachment',
            ContentMD5=base64.b64encode(md5.digest()).decode(),
            Metadata={'sha256':sha.hexdigest()})
    def delete_or_queue_cleanup(self,key):
        self.validate(key)
        try:self.client.delete_object(Bucket=self.bucket,Key=key)
        except Exception:self.cleanup_queue(self.bucket,key)
