import React, { useEffect, useRef, useState } from 'react';
import { OperationsLayout, operationsRequest, dollars, CaseLink } from '../component/KPDOperations';

const views = [
  ['received', 'Received this period', 'Incoming work'],
  ['shipped', 'Shipped this period', 'Work that left the lab'],
  ['in_house', 'Currently in-house', 'All remaining work, from any date'],
  ['production', 'In production', 'Active work, excluding holds'],
  ['held', 'On hold', 'Work waiting for a resolution'],
  ['ready', 'Ready to ship', 'Completed work ready to leave']
];

function floridaToday() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = type => parts.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function dateRange(preset) {
  const end = floridaToday(), date = new Date(end + 'T12:00:00Z');
  if (preset === 'week') date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  if (preset === 'month') date.setUTCDate(1);
  if (preset === 'last_month') {
    date.setUTCDate(1); date.setUTCDate(0);
    const last = date.toISOString().slice(0, 10); date.setUTCDate(1);
    return { start: date.toISOString().slice(0, 10), end: last };
  }
  return { start: date.toISOString().slice(0, 10), end };
}

export default function KPDReports() {
  const [range, setRange] = useState(() => dateRange('week'));
  const [preset, setPreset] = useState('week');
  const [view, setView] = useState('received');
  const [customer, setCustomer] = useState('');
  const [doctor, setDoctor] = useState('');
  const [product, setProduct] = useState('');
  const [breakdown, setBreakdown] = useState('product');
  const [data, setData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ customers: [], doctors: [], products: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const query = new URLSearchParams({ ...range, view, customer, doctor, product }).toString();
  const requestNumber = useRef(0);
  useEffect(() => {
    const number = ++requestNumber.current, controller = new AbortController();
    setLoading(true); setData(null); setError(''); setPage(0);
    if (!range.start || !range.end || range.start > range.end) { setError('Choose a start date on or before the end date.'); setLoading(false); return () => controller.abort(); }
    operationsRequest(`reports?${query}`, { signal: controller.signal }).then(result => {
      if (number === requestNumber.current) { setData(result); setFilterOptions(result.filters); }
    }).catch(err => { if (err.name !== 'AbortError' && number === requestNumber.current) setError(err.message); })
      .finally(() => { if (number === requestNumber.current) setLoading(false); });
    return () => controller.abort();
  }, [query, refresh]);

  async function exportCSV() {
    setExporting(true); setError('');
    try {
      const blob = await operationsRequest(`reports?${query}&format=csv`, { csv: true });
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = `KPD-${view}-${range.start}-${range.end}.csv`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { setError(err.message); } finally { setExporting(false); }
  }
  const snapshot = !['received', 'shipped'].includes(view);
  return <OperationsLayout active="reports">
    <header className="kpd-ops-heading"><div><p className="kpd-eyebrow">A CLEAR VIEW OF YOUR LAB</p><h1>Reports</h1><p>See what came in, what went out, and what’s still with you.</p></div><button onClick={() => setRefresh(x => x + 1)} disabled={loading}>Refresh</button></header>
    <section className="kpd-panel kpd-report-filters" aria-label="Report filters">
      <label>Period<select value={preset} onChange={event => { const value = event.target.value; setPreset(value); if (value !== 'custom') setRange(dateRange(value)); }}>
        <option value="today">Today</option><option value="week">This week</option><option value="month">This month</option><option value="last_month">Last month</option><option value="custom">Custom dates</option>
      </select></label>
      <label>From<input type="date" value={range.start} onChange={e => { setPreset('custom'); setRange({ ...range, start: e.target.value }); }} /></label>
      <label>Through<input type="date" value={range.end} onChange={e => { setPreset('custom'); setRange({ ...range, end: e.target.value }); }} /></label>
      <label>Customer<select value={customer} onChange={e => setCustomer(e.target.value)}><option value="">All customers</option>{filterOptions.customers.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Dentist<select value={doctor} onChange={e => setDoctor(e.target.value)}><option value="">All dentists</option>{filterOptions.doctors.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Product<select value={product} onChange={e => setProduct(e.target.value)}><option value="">All products</option>{filterOptions.products.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
      <p>Weeks start Monday. Dates use Florida time. In-house figures are a current snapshot and do not follow the date range.</p>
    </section>
    {error && <div className="kpd-notice kpd-error" role="alert">{error}</div>}
    {loading && <p role="status">Loading your reports…</p>}
    {data && <>
      <section className="kpd-metrics" aria-label="Report summaries">{views.map(([key, label, note], index) => <button key={key} className={`kpd-metric ${index < 3 ? 'kpd-major' : ''} ${view === key ? 'selected' : ''}`} aria-pressed={view === key} onClick={() => setView(key)}>
        <span className="kpd-metric-label">{label}</span><strong>{dollars(data.summary[key].value_cents)}</strong><span>{data.summary[key].cases} cases</span><small>{note}</small>
      </button>)}</section>
      <div className="kpd-value-note">Dollar amounts are current case values, not payments collected. Drafts and voided cases are excluded. Zero-dollar remakes remain in case counts.</div>
      <section className="kpd-panel">
        <div className="kpd-section-heading"><div><h2>{views.find(item => item[0] === view)[1]}</h2><p>{snapshot ? `Current snapshot · ${new Date(data.snapshot_at).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET` : `${range.start} through ${range.end}`}</p></div>
          <label>Break down by<select value={breakdown} onChange={e => setBreakdown(e.target.value)}><option value="product">Product</option><option value="customer">Customer</option><option value="doctor">Dentist</option><option value="status">Production stage / status</option></select></label></div>
        <div className="kpd-table-wrap"><table><thead><tr><th>{breakdown === 'status' ? 'Status' : breakdown === 'doctor' ? 'Dentist' : breakdown[0].toUpperCase() + breakdown.slice(1)}</th><th>Cases</th>{breakdown === 'product' && <th>Known units</th>}<th>Case value</th></tr></thead><tbody>
          {data.breakdowns[breakdown].map(item => <tr key={item.name}><td>{item.name}</td><td>{item.cases}</td>{breakdown === 'product' && <td>{item.units}{item.missing_quantities > 0 && <small> · {item.missing_quantities} cases need quantity review</small>}</td>}<td>{dollars(item.value_cents)}</td></tr>)}
          {!data.rows.length && <tr><td colSpan="4" className="kpd-empty">No cases match these filters.</td></tr>}
        </tbody></table></div>
      </section>
      <section className="kpd-panel">
        <div className="kpd-section-heading"><div><h2>Cases behind the numbers</h2><p>{data.rows.length} cases · {dollars(data.summary[view].value_cents)} in case value</p></div><button onClick={exportCSV} disabled={exporting || !data.rows.length}>{exporting ? 'Exporting…' : 'Export CSV'}</button></div>
        <div className="kpd-table-wrap"><table><thead><tr><th>Case</th><th>Dentist / patient</th><th>Product</th><th>Status</th><th>Received</th><th>Shipped</th><th>Quantity</th><th>Value</th></tr></thead><tbody>
          {data.rows.slice(page * 50, (page + 1) * 50).map(row => <tr key={row.id}><td><CaseLink id={row.id} /></td><td>{row.doctor}<small>{row.patient}</small></td><td>{row.type}<small>{row.product}</small></td><td>{row.held ? 'On hold' : row.status}</td><td>{row.received || 'Unknown'}{row.received_inferred ? '*' : ''}</td><td>{row.shipped || '—'}</td><td>{row.units === null ? 'Needs review' : `${row.units} ${row.unit_kind}${row.units === 1 ? '' : 's'}`}</td><td>{dollars(row.value_cents)}</td></tr>)}
          {!data.rows.length && <tr><td colSpan="8" className="kpd-empty">No cases to display.</td></tr>}
        </tbody></table></div>
        {data.rows.length > 50 && <div className="kpd-pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1} of {Math.ceil(data.rows.length / 50)}</span><button disabled={(page + 1) * 50 >= data.rows.length} onClick={() => setPage(page + 1)}>Next</button></div>}
      </section>
      <details className="kpd-panel kpd-report-notes"><summary>How these numbers are calculated</summary>
        <p>Received uses the recorded impressions-received date when present, otherwise the submission date. * Older cases may use the saved submission-date field when their notes lack that event. Shipped uses a recorded Shipped event, never a label purchase or billing date. Each case is counted once per report using its first recorded event.</p>
        <p>In-house includes Submitted through Ready to Ship. Holds, production, and ready-to-ship are mutually exclusive parts of that total. Case values may change when a case price is edited. Separate shipping charges, rush fees, and add-ons are not inferred.</p>
        <p>Tooth-based products count recorded restoration teeth. Arches are counted only when explicitly recorded. Unknown quantities and prices remain unknown; known-value totals exclude missing prices. ADW-linked cases use their separate fulfillment workflow and are excluded.</p>
      </details>
      {(data.quality.missing_received + data.quality.inferred_received + data.quality.missing_shipped + data.summary[view].missing_values + data.summary[view].missing_quantities > 0) && <aside className="kpd-notice" role="status">
        <strong>Some older records need review.</strong> {data.quality.missing_received} cases lack a received date; {data.quality.inferred_received} use the saved submission-date fallback; {data.quality.missing_shipped} completed cases lack a shipment date and are excluded from dated shipped totals. In this view: {data.summary[view].missing_values} missing prices and {data.summary[view].missing_quantities} unconfirmed quantities.
      </aside>}
    </>}
  </OperationsLayout>;
}
