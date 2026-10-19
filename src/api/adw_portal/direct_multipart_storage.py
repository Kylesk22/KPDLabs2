"""Staged private multipart adapter. Not registered with live routes.

Caller must authenticate, reserve quota, persist the upload ID/object key/size,
and recheck ownership on every action. Never accept those fields from clients.
Uses origin Spaces endpoint, never CDN. Only server may complete an upload.
"""
import math
import hashlib
from botocore.exceptions import ClientError
from .private_storage import KEY
PART_BYTES = 8 * 1024 * 1024
MAX_BYTES = 1024 * 1024 * 1024

class DirectMultipartStorage:

    def __init__(self, client):
        self.client = client
        self.bucket = 'adw-case-files'

    def validate(self, key, size):
        if not isinstance(key, str) or not KEY.fullmatch(key):
            raise ValueError('Invalid private object key')
        if type(size) is not int or not 0 < size <= MAX_BYTES:
            raise ValueError('Invalid file size')

    def initiate(self, key, size):
        self.validate(key, size)
        result = self.client.create_multipart_upload(Bucket=self.bucket, Key=key, ACL='private', ContentType='application/octet-stream', ContentDisposition='attachment', Metadata={'adw-reservation': self.reservation_marker(key, size)})
        upload_id = result.get('UploadId')
        if not isinstance(upload_id, str) or not upload_id:
            raise ValueError('Storage did not create upload')
        return upload_id

    def reservation_marker(self, key, size):
        return hashlib.sha256((key + ':' + str(size)).encode()).hexdigest()

    def verified_object(self, key, size):
        actual = self.client.head_object(Bucket=self.bucket, Key=key)
        if actual.get('ContentLength') != size or actual.get('Metadata', {}).get('adw-reservation') != self.reservation_marker(key, size):
            raise ValueError('Completed object does not match reservation')
        return {'bytes': size, 'etag': actual.get('ETag')}

    def sign_part(self, key, size, upload_id, part):
        self.validate(key, size)
        count = math.ceil(size / PART_BYTES)
        if type(part) is not int or not 1 <= part <= count:
            raise ValueError('Invalid part number')
        expected = min(PART_BYTES, size - (part - 1) * PART_BYTES)
        return self.client.generate_presigned_url('upload_part', Params={'Bucket': self.bucket, 'Key': key, 'UploadId': upload_id, 'PartNumber': part, 'ContentLength': expected}, ExpiresIn=600, HttpMethod='PUT')

    def complete(self, key, size, upload_id):
        self.validate(key, size)
        try:
            response = self.client.list_parts(Bucket=self.bucket, Key=key, UploadId=upload_id, MaxParts=1000)
        except ClientError as error:
            if error.response.get('Error', {}).get('Code') != 'NoSuchUpload':
                raise
            return self.verified_object(key, size)
        parts = response.get('Parts', [])
        if response.get('IsTruncated') or len(parts) != math.ceil(size / PART_BYTES):
            raise ValueError('Upload is incomplete')
        completed = []
        for (number, part) in enumerate(parts, 1):
            expected = min(PART_BYTES, size - (number - 1) * PART_BYTES)
            if part.get('PartNumber') != number or part.get('Size') != expected:
                raise ValueError('Uploaded part size does not match reservation')
            etag = part.get('ETag')
            if not isinstance(etag, str) or not etag:
                raise ValueError('Storage integrity tag missing')
            completed.append({'PartNumber': number, 'ETag': etag})
        self.client.complete_multipart_upload(Bucket=self.bucket, Key=key, UploadId=upload_id, MultipartUpload={'Parts': completed})
        return self.verified_object(key, size)

    def abort(self, key, size, upload_id):
        self.validate(key, size)
        self.client.abort_multipart_upload(Bucket=self.bucket, Key=key, UploadId=upload_id)

    def checksum(self, key, size):
        """Stream stored bytes without retaining file contents in server memory."""
        self.validate(key, size)
        verified = self.verified_object(key, size)
        response = self.client.get_object(Bucket=self.bucket, Key=key, IfMatch=verified['etag'])
        body = response['Body']
        try:
            if response.get('ContentLength') != size:
                raise ValueError('Stored size mismatch')
            digest = hashlib.sha256()
            total = 0
            while True:
                chunk = body.read(min(1024 * 1024, size - total + 1))
                if not chunk:
                    break
                total += len(chunk)
                if total > size:
                    raise ValueError('Stored size mismatch')
                digest.update(chunk)
            if total != size:
                raise ValueError('Stored size mismatch')
            return digest.hexdigest()
        finally:
            body.close()

    def discard(self, key, size):
        """Only for a durable cancelled reservation after its grace period."""
        self.validate(key, size)
        listing = self.client.list_multipart_uploads(Bucket=self.bucket, Prefix=key, MaxUploads=1000)
        if listing.get('IsTruncated'):
            raise ValueError('Cleanup requires reconciliation')
        for upload in listing.get('Uploads', []):
            if upload.get('Key') != key:
                continue
            try:
                self.abort(key, size, upload['UploadId'])
            except ClientError as error:
                if error.response.get('Error', {}).get('Code') != 'NoSuchUpload':
                    raise
        self.client.delete_object(Bucket=self.bucket, Key=key)
