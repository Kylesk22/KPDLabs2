"""Staff-only download service. Never accepts a bucket/key from a browser.

Not registered in production. Host must derive staff identity from its session.
Bytes are checked against the accepted upload before any response is released.
"""
import hashlib
import re
import tempfile
from .private_storage import KEY
from .intake import MAX_FILE_BYTES

class StaffFiles:

    def __init__(self, claims, receipts, client, *, bucket, shop):
        if bucket != 'adw-case-files':
            raise ValueError('Dedicated ADW bucket required')
        (self.claims, self.receipts, self.client) = (claims, receipts, client)
        (self.bucket, self.shop) = (bucket, shop)

    def open(self, staff, order_id, line_id, index):
        if not staff or staff.get('role') != 'Admin' or (not staff.get('id')):
            raise PermissionError('Staff access required')
        if not isinstance(order_id, str) or not re.fullmatch('[1-9][0-9]{0,31}', order_id) or (not isinstance(line_id, str)) or (not re.fullmatch('[1-9][0-9]{0,31}', line_id)) or (type(index) is not int) or (index < 0):
            raise ValueError('Invalid file selection')
        plan = self.claims.get_review(self.shop, order_id)
        line = next((item for item in (plan or {}).get('lines', []) if item['line_id'] == line_id), None)
        if not line:
            raise LookupError('File unavailable')
        receipt = self.receipts.get(line['receipt'])
        if not receipt or receipt.get('lab_id') != plan['lab_id'] or receipt.get('reference') != line['reference'] or (index >= len(receipt.get('files', []))):
            raise LookupError('File unavailable')
        entry = receipt['files'][index]
        (key, size, digest) = (entry.get('key'), entry.get('bytes'), entry.get('sha256'))
        if not isinstance(key, str) or not KEY.fullmatch(key) or (not key.startswith('adw/intake/' + line['receipt'] + '/')) or (type(size) is not int) or (not 0 < size <= MAX_FILE_BYTES) or (not isinstance(digest, str)) or (not re.fullmatch('[0-9a-f]{64}', digest)):
            raise ValueError('Invalid stored file manifest')
        output = tempfile.SpooledTemporaryFile(max_size=1024 * 1024)
        body = None
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=key)
            body = response['Body']
            if response.get('ContentLength') != size:
                raise IOError('Stored file verification failed')
            (total, check) = (0, hashlib.sha256())
            while True:
                chunk = body.read(min(1024 * 1024, size - total + 1))
                if not chunk:
                    break
                total += len(chunk)
                if total > size:
                    raise IOError('Stored file verification failed')
                check.update(chunk)
                output.write(chunk)
            if total != size or check.hexdigest() != digest:
                raise IOError('Stored file verification failed')
            output.seek(0)
            return (output, 'ADW-' + order_id + '-' + line_id + '-' + str(index + 1) + '.' + key.rsplit('.', 1)[1])
        except Exception:
            output.close()
            raise
        finally:
            if body is not None:
                body.close()
