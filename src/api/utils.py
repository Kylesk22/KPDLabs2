from flask import jsonify, url_for
from bs4 import BeautifulSoup
import zipfile
import json
import re
from io import BytesIO


class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)

    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return """
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">"""+links_html+"</ul></div>"


# --- Zip Processing ---

def detect_scanner_type(zip_file):
    names = zip_file.namelist()
    for name in names:
        filename = name.split('/')[-1]
        if filename.startswith('Rx_') and filename.endswith('.html'):
            return 'itero'
        if 'PrintableOrderForm.html' in name:
            return '3shape'
    return None


def get_scanner_id(zip_file, scanner_type):
    if scanner_type == 'itero':
        for name in zip_file.namelist():
            filename = name.split('/')[-1]
            if filename.startswith('Rx_') and filename.endswith('.html'):
                return filename.replace('Rx_', '').replace('.html', '')
    elif scanner_type == '3shape':
        # existing 3shape logic
        root = zip_file.namelist()[0].split('/')[0]
        return root.split('_')[0]
    return None


def find_prescription_html(zip_file, scanner_type):
    if scanner_type == 'itero':
        for name in zip_file.namelist():
            filename = name.split('/')[-1]
            if filename.startswith('Rx_') and filename.endswith('.html'):
                return zip_file.read(name).decode('utf-8', errors='ignore')
    elif scanner_type == '3shape':
        # existing 3shape logic
        for name in zip_file.namelist():
            if 'PrintableOrderForm.html' in name:
                return zip_file.read(name).decode('utf-8', errors='ignore')
    return None


def extract_prescription(html_content, scanner_type):
    soup = BeautifulSoup(html_content, 'html.parser')
    if scanner_type == '3shape':
        return _extract_3shape(soup)
    elif scanner_type == 'itero':
        return _extract_itero(soup)
    return {"error": "Unknown scanner type"}


def _extract_3shape(soup):
    def get_field(label):
        for td in soup.find_all('td'):
            if td.get_text(strip=True) == label:
                next_td = td.find_next_sibling('td')
                if next_td:
                    return next_td.get_text(strip=True)
        return None

    # Patient name — normalize to Last, First
    raw_name = get_field('Patient name:')
    patient_name = None
    if raw_name:
        parts = raw_name.strip().split()
        if len(parts) >= 2:
            patient_name = f"{parts[-1]}, {' '.join(parts[:-1])}"
        else:
            patient_name = raw_name

    # Dates
    delivery_raw = get_field('Delivery date:')
    due_date = None
    if delivery_raw:
        match = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', delivery_raw)
        if match:
            due_date = match.group(1)

    # Scanning date — use earliest scan file date
    scanning_date = None
    scan_dates = []
    for row in soup.select('table.tableSub tr'):
        cells = row.find_all('td')
        if len(cells) >= 3:
            date_text = cells[2].get_text(strip=True)
            match = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', date_text)
            if match:
                scan_dates.append(match.group(1))
    if scan_dates:
        scanning_date = scan_dates[0]

    # Teeth and restoration details
    teeth = []
    shades_by_tooth = {}
    implant_details = {"manufacturer": None, "connection": None, "system": None}

    for block in soup.select('table.tableRestorationsSub'):
        tooth_num = None
        shade = None

        unn_td = block.select_one('td.underline')
        if unn_td:
            tooth_num = unn_td.get_text(strip=True)

        for row in block.find_all('tr'):
            cells = row.find_all('td')
            if len(cells) == 2:
                label = cells[0].get_text(strip=True)
                value = cells[1].get_text(strip=True)
                if label == 'Shade':
                    shade = value
                elif label == 'Manufacturer':
                    implant_details['manufacturer'] = value
                elif label == 'Connection':
                    implant_details['connection'] = value
                elif label == 'System':
                    implant_details['system'] = value

        if tooth_num:
            teeth.append(tooth_num)
            if shade:
                shades_by_tooth[tooth_num] = shade

    # Normalize shade
    unique_shades = list(set(shades_by_tooth.values()))
    shade = unique_shades[0] if len(unique_shades) == 1 else None
    multiple_shades = len(unique_shades) > 1

    # Notes
    notes = None
    comments_caption = soup.find('caption', string='Comments')
    if comments_caption:
        textblock = comments_caption.find_next('p', class_='textblock')
        if textblock:
            notes = textblock.get_text(strip=True)

    return {
        "patientName": patient_name,
        "dueDate": due_date,
        "scanningDate": scanning_date,
        "teeth": teeth,
        "shade": shade,
        "multipleShades": multiple_shades,
        "shadesByTooth": shades_by_tooth,
        "notes": notes,
        "implantDetails": implant_details,
        "confidence": {
            "patientName": "high",
            "dueDate": "high",
            "scanningDate": "high",
            "teeth": "high",
            "shade": "high",
            "notes": "high"
        }
    }


def _extract_itero(soup):
    result = {}
    confidence = {}

    # Helper to extract text after a label
    def find_field(label):
        for font in soup.find_all('font'):
            text = font.get_text(strip=True)
            if text.startswith(label):
                return text.replace(label, '').strip()
        return None

    # Patient name — format is "Last, First"
    patient_raw = find_field('Patient:')
    if patient_raw:
        result['patientName'] = patient_raw
        confidence['patientName'] = 'high'

    # Dates
    scanning_date = find_field('Scanning Date:')
    if scanning_date:
        result['scanningDate'] = scanning_date
        confidence['scanningDate'] = 'high'

    due_date = find_field('Due Date:')
    if due_date:
        result['dueDate'] = due_date
        confidence['dueDate'] = 'high'

    # Teeth — look for all "Tooth: ADA XX" entries
    teeth = []
    shades = []
    for font in soup.find_all('font', color='#000099'):
        text = font.get_text(strip=True)
        if text.startswith('Tooth: ADA'):
            # Extract ADA number
            match = re.search(r'ADA\s+(\d+)', text)
            if match:
                teeth.append(f" {match.group(1)}")

        # Shade is in the next table after each tooth
    # Get shade from Tooth Color fields
    for td in soup.find_all('td'):
        b = td.find('b')
        if b and 'Tooth Color' in b.get_text():
            sibling = td.find_next_sibling('td')
            if sibling:
                shade_text = sibling.get_text(strip=True)
                if shade_text:
                    shade_values = re.findall(r':\s*([A-Z0-9.]+)', shade_text)
                    if shade_values:
                        shades.append('/'.join(shade_values))

    if teeth:
        result['teeth'] = teeth
        confidence['teeth'] = 'high'

    if shades:
        unique_shades = list(set(shades))
        # Always pick the most detailed shade (longest string)
        best_shade = max(unique_shades, key=len)
        result['shade'] = best_shade
        result['multipleShades'] = len(unique_shades) > 1
        confidence['shade'] = 'high' if len(unique_shades) == 1 else 'low'

    notes_table = soup.find('table', id='table5')
    if notes_table:
        notes_lines = []
        for font in notes_table.find_all('font', attrs={'color': lambda c: c != '#000099'}):
            text = font.get_text(strip=True)
            if text:
                notes_lines.append(text)
        if notes_lines:
            result['notes'] = '\n'.join(notes_lines)
            confidence['notes'] = 'high'

    result['confidence'] = confidence
    return result


def process_zip(zip_bytes):
    zip_buffer = BytesIO(zip_bytes)
    with zipfile.ZipFile(zip_buffer, 'r') as zip_file:
        scanner_type = detect_scanner_type(zip_file)
        if scanner_type == 'unknown':
            return {"error": "Unrecognized zip format. Expected iTero or 3Shape prescription."}
        scanner_id = get_scanner_id(zip_file, scanner_type)
        html_content = find_prescription_html(zip_file, scanner_type)
        if not html_content:
            return {"error": f"Could not find prescription HTML in {scanner_type} zip."}
        extracted = extract_prescription(html_content, scanner_type)
        extracted['scannerId'] = scanner_id
        extracted['scannerType'] = scanner_type
        return extracted