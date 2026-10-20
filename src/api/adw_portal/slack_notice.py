"""Best-effort staff alert using KPD's existing Slack destination."""
import re
from urllib.parse import urlsplit
import requests

class SlackNotice:

    def __init__(self, url, *, post=requests.post):
        parsed = urlsplit(url or '')
        if parsed.scheme != 'https' or parsed.netloc != 'hooks.slack.com' or (not parsed.path.startswith('/services/')) or parsed.query or parsed.fragment:
            raise ValueError('Existing Slack incoming webhook required')
        (self.url, self.post) = (url, post)

    def send(self, order_id):
        if not isinstance(order_id, str) or not re.fullmatch('[1-9][0-9]{0,31}', order_id):
            raise ValueError('Order identifier required')
        try:
            response = self.post(self.url, json={'text': f'New ADW paid order received (Shopify ID {order_id}). Open the ADW staff panel in <https://kpdlabs.com|KPD> to review payment and files. Not approved for production.'}, timeout=(0.5, 1.5), allow_redirects=False)
            return response.status_code == 200 and response.text.strip() == 'ok'
        except Exception:
            return False
