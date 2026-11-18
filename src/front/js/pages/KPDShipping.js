import React, { useEffect, useRef, useState } from 'react';
import { OperationsLayout, operationsRequest, dollars, CaseLink } from '../component/KPDOperations';

function Address({ address }) {
  return address ? <address>{address.name}{address.company && <><br />{address.company}</>}<br />{address.street1}<br />{address.city}, {address.state} {address.zip}</address> : null;
}

export default function KPDShipping() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [group, setGroup] = useState(null);
  const [selected, setSelected] = useState([]);
  const [parcel, setParcel] = useState({ length: '6', width: '4', height: '4', weight: '1' });
  const [quote, setQuote] = useState(null);
  const [rateId, setRateId] = useState('');
  const [result, setResult] = useState(null);
  const [transactions, setTransactions] = useState({});
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; }; }, []);

  async function load() {
    try { const fresh = await operationsRequest('shipping'); if (mounted.current) setData(fresh); }
    catch (err) { if (mounted.current) setError(err.message); }
  }
  async function action(run) {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try { await run(); } catch (err) { setError(err.message); }
    finally { inFlight.current = false; if (mounted.current) setBusy(false); }
  }
  async function getQuote(ids, dimensions) {
    setQuote(null); setRateId('');
    const fresh = await operationsRequest('shipping/quotes', { method: 'POST', body: JSON.stringify({ cases: ids, parcel: dimensions }) });
    setQuote(fresh);
    const ground = fresh.rates.find(rate => rate.provider.toUpperCase() === 'UPS' && rate.token === 'ups_ground');
    setRateId(ground ? ground.id : '');
  }
  function prepare(item) {
    action(async () => {
      const ids = item.cases.map(c => c.id), defaults = data.default_parcel;
      setGroup(item); setSelected(ids); setParcel(defaults); setResult(null);
      await getQuote(ids, defaults);
    });
  }
  function invalidate() { setQuote(null); setRateId(''); setResult(null); }
  function toggle(id) { invalidate(); setSelected(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]); }
  const rate = quote && quote.rates.find(item => item.id === rateId);

  function buy() {
    if (inFlight.current || !rate) return;
    // Open during the click gesture so a slow provider response does not trigger
    // popup blocking. No print success is inferred from opening the document.
    const labelWindow = window.open('about:blank', '_blank');
    if (labelWindow) { labelWindow.opener = null; labelWindow.document.title = 'Preparing KPD label'; labelWindow.document.body.textContent = 'Preparing your 4 × 6 shipping label…'; }
    action(async () => {
      try {
        const purchased = await operationsRequest(`shipping/${quote.id}/buy`, { method: 'POST', body: JSON.stringify({ rate_id: rate.id, amount_cents: rate.amount_cents }) });
        setResult(purchased); setQuote(null); setGroup(null);
        if (labelWindow) labelWindow.location.replace(purchased.label_url);
        await load();
      } catch (err) {
        if (labelWindow) labelWindow.close();
        // Never leave a stale Buy button after an ambiguous network outcome.
        setQuote(null); setRateId(''); await load(); throw err;
      }
    });
  }
  function shipped(shipment) {
    action(async () => {
      await operationsRequest(`shipping/${shipment.id}/shipped`, { method: 'POST', body: '{}' });
      setResult(null); await load();
    });
  }
  function reconcile(shipment) {
    action(async () => {
      const recovered = await operationsRequest(`shipping/${shipment.id}/reconcile`, { method: 'POST', body: JSON.stringify({ transaction_id: transactions[shipment.id] || shipment.transaction_id || '' }) });
      setResult(recovered.state === 'purchased' ? recovered : null); await load();
      if (recovered.state === 'failed') setError('Shippo confirmed that the label was not created. The cases are back in the ready queue; review the address and package before preparing a new shipment.');
    });
  }
  const labelLink = shipment => <a className="kpd-button" href={shipment.label_url} target="_blank" rel="noopener noreferrer">Open / reprint 4 × 6 label</a>;

  return <OperationsLayout active="shipping">
    <header className="kpd-ops-heading"><div><p className="kpd-eyebrow">FROM FINISHED CASE TO FRONT DOOR</p><h1>Shipping</h1><p>One dentist. One box. All ready cases selected.</p></div><button disabled={busy} onClick={() => action(load)}>Refresh queue</button></header>
    {error && <div className="kpd-notice kpd-error" role="alert">{error}</div>}
    {!data && !error && <p role="status">Loading ready cases…</p>}
    {result && <section className="kpd-notice kpd-success" role="status"><h2>Your label is ready</h2><p>Tracking: {result.tracking_number}. Use your thermal printer with 4 × 6 paper at actual size (100%).</p><div className="kpd-actions">{labelLink(result)}{result.state !== 'shipped' && <button disabled={busy} onClick={() => shipped(result)}>Confirm box has shipped</button>}</div><small>Creating or printing a label does not mark the cases shipped.</small></section>}
    {group && <section className="kpd-panel kpd-shipment-review" aria-label="Review shipment">
      <div className="kpd-section-heading"><div><p className="kpd-eyebrow">REVIEW SHIPMENT</p><h2>{group.doctor}</h2></div><button disabled={busy} onClick={() => { setGroup(null); setQuote(null); }}>Close</button></div>
      <div className="kpd-shipping-columns"><div><h3>Included cases · {selected.length}</h3><p>Uncheck any case staying in the lab.</p>
        <div className="kpd-checklist">{group.cases.map(c => <label key={c.id}><input type="checkbox" disabled={busy} checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /><span><strong>#{c.id} · {c.patient}</strong><small>{c.type} · {c.product}</small></span></label>)}</div>
      </div><div><h3>Deliver to</h3><Address address={group.address} /><details><summary>Package size and weight</summary><p>Defaults match your existing 6 × 4 × 4 inch, 1 lb package. Update them for this box.</p><div className="kpd-parcel">{['length', 'width', 'height', 'weight'].map(key => <label key={key}>{key[0].toUpperCase() + key.slice(1)} ({key === 'weight' ? 'lb' : 'in'})<input type="number" min="0.01" max="150" step="0.01" disabled={busy} value={parcel[key]} onChange={e => { invalidate(); setParcel({ ...parcel, [key]: e.target.value }); }} /></label>)}</div></details></div></div>
      {busy && <p role="status">Working on your shipment…</p>}
      {quote && <div className="kpd-rate-review">
        {!rateId && <div className="kpd-notice">UPS Ground is unavailable for this quote. Choose another service below, or review the package and address.</div>}
        <label>Shipping service<select disabled={busy} value={rateId} onChange={e => setRateId(e.target.value)}><option value="">Choose a service</option>{quote.rates.map(item => <option key={item.id} value={item.id}>{item.provider} {item.service} · {dollars(item.amount_cents)}</option>)}</select></label>
        <div className="kpd-purchase-total"><span>{selected.length} cases · 4 × 6 PDF label</span><strong>{rate ? dollars(rate.amount_cents) : '—'}</strong></div>
        <button className="kpd-primary" disabled={busy || !rate} onClick={buy}>{busy ? 'Processing…' : `Buy label${rate ? ` · ${dollars(rate.amount_cents)}` : ''} & open for printing`}</button>
      </div>}
      {!quote && <button className="kpd-primary" disabled={busy || !selected.length} onClick={() => action(() => getQuote(selected, parcel))}>Review shipping price</button>}
    </section>}
    {data && <>
      <section className="kpd-panel"><div className="kpd-section-heading"><div><h2>Ready to ship</h2><p>{data.groups.length} dentist groups · {data.groups.reduce((sum, item) => sum + item.cases.length, 0)} cases awaiting a label</p></div><span className="kpd-tag">Default: UPS Ground</span></div>
        <div className="kpd-queue">{data.groups.map(item => <article key={item.key}><div><h3>{item.doctor}</h3><p>{item.cases.length} cases ready · {item.cases.map(c => `#${c.id}`).join(', ')}</p>{item.address && <small>{item.address.street1} · {item.address.city}, {item.address.state} {item.address.zip}</small>}{item.address_error && <p className="kpd-error-text">{item.address_error}</p>}</div><button className="kpd-primary" disabled={busy || !!item.address_error} onClick={() => prepare(item)}>Prepare shipment</button></article>)}</div>
        {!data.groups.length && <div className="kpd-empty">You’re caught up. Cases appear here when they’re ready to ship and off hold.</div>}
      </section>
      <section className="kpd-panel"><div className="kpd-section-heading"><div><h2>Shipment history</h2><p>The 100 most recent label purchases, reprints, and boxes awaiting handoff.</p></div></div>
        {data.history.map(item => <article className="kpd-shipment-history" key={item.id}><div className="kpd-section-heading"><div><h3>{item.doctor}</h3><p>{new Date(item.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET · {item.cases.map(id => `#${id}`).join(', ')}</p></div><span className={`kpd-tag ${['uncertain', 'purchasing'].includes(item.state) ? 'kpd-tag-warning' : ''}`}>{({ purchased: 'Label ready · not shipped', shipped: 'Shipped', purchasing: 'Purchase needs review', uncertain: 'Purchase needs review', failed: 'Label not created' })[item.state]}</span></div>
          {item.tracking_number && <p>Tracking: <strong>{item.tracking_number}</strong> · {item.selected_rate.provider} {item.selected_rate.service} · {dollars(item.selected_rate.amount_cents)}</p>}
          <div className="kpd-actions">{item.label_url && labelLink(item)}{item.state === 'purchased' && <button disabled={busy} onClick={() => shipped(item)}>Confirm box has shipped</button>}</div>
          {['uncertain', 'purchasing'].includes(item.state) && <div className="kpd-notice"><p>A label may already have been purchased. Check Shippo before taking another action. This shipment’s reference is <strong>kpd:{item.id}</strong>.</p><label>Shippo transaction ID<input value={transactions[item.id] || ''} onChange={e => setTransactions({ ...transactions, [item.id]: e.target.value })} /></label><button disabled={busy || !transactions[item.id]} onClick={() => reconcile(item)}>Retrieve existing purchase</button></div>}
        </article>)}
        {!data.history.length && <p className="kpd-empty">New purchases will appear here. Reprinting never purchases postage again.</p>}
      </section>
      {!!data.legacy.length && <aside className="kpd-notice"><strong>Existing tracking needs review</strong><p>These ready cases already have tracking in their case notes. Check their existing labels in Shippo to avoid buying postage twice.</p><div className="kpd-actions">{data.legacy.map(c => <CaseLink key={c.id} id={c.id}>#{c.id} · {c.doctor}</CaseLink>)}</div></aside>}
    </>}
  </OperationsLayout>;
}
