import React, { useEffect, useRef, useState } from 'react';
import { OperationsLayout, operationsRequest, dollars, CaseLink } from '../component/KPDOperations';

function Address({ address }) {
  return address ? <address>{address.name}{address.company && <><br />{address.company}</>}<br />{address.street1}<br />{address.city}, {address.state} {address.zip}</address> : null;
}
const statusLabels = { purchased: 'Label ready — not shipped', shipped: 'Shipped', purchasing: 'Purchase needs review', uncertain: 'Purchase needs review', failed: 'Label not created', not_purchased: 'Not purchased' };

export default function KPDShipping() {
  const [data, setData] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [group, setGroup] = useState(null), [boxes, setBoxes] = useState([]), [assignments, setAssignments] = useState({});
  const [quote, setQuote] = useState(null), [rates, setRates] = useState({}), [result, setResult] = useState(null);
  const [transactions, setTransactions] = useState({});
  const inFlight = useRef(false), mounted = useRef(true), nextBox = useRef(1);
  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; }; }, []);

  async function load() {
    try { const fresh = await operationsRequest('shipping'); if (mounted.current) setData(fresh); }
    catch (err) { if (mounted.current) setError(err.message); }
  }
  async function action(run) {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try { await run(); } catch (err) { if (mounted.current) setError(err.message); }
    finally { inFlight.current = false; if (mounted.current) setBusy(false); }
  }
  const caseIds = (box, packing = assignments) => Object.keys(packing).filter(id => packing[id] === box.key).map(Number);
  const chosenRates = quote ? quote.boxes.map(box => box.rates.find(rate => rate.id === rates[box.id])) : [];
  const priced = !!quote && chosenRates.every(Boolean);
  const total = chosenRates.reduce((sum, rate) => sum + (rate ? rate.amount_cents : 0), 0);
  const leftBehind = group ? group.cases.filter(c => !assignments[c.id]).length : 0;

  function invalidate() { setQuote(null); setRates({}); setResult(null); }
  async function getQuote(packingBoxes = boxes, packing = assignments) {
    invalidate();
    const fresh = await operationsRequest('shipping/groups/quotes', { method: 'POST', body: JSON.stringify({ boxes: packingBoxes.map(box => ({ cases: caseIds(box, packing), parcel: box.parcel })) }) });
    setQuote(fresh);
    setRates(Object.fromEntries(fresh.boxes.map(box => {
      const ground = box.rates.find(rate => rate.provider.toUpperCase() === 'UPS' && rate.token === 'ups_ground');
      return [box.id, ground ? ground.id : ''];
    })));
  }
  function prepare(item) {
    action(async () => {
      const first = { key: nextBox.current++, parcel: { ...data.default_parcel } };
      const packing = Object.fromEntries(item.cases.map(c => [c.id, first.key]));
      setGroup(item); setBoxes([first]); setAssignments(packing); setResult(null);
      await getQuote([first], packing);
    });
  }
  function addBox() {
    invalidate(); setBoxes(current => [...current, { key: nextBox.current++, parcel: { ...data.default_parcel } }]);
  }
  function buy() {
    if (inFlight.current || !priced) return;
    // One box opens immediately; multiple labels are listed individually to
    // avoid triggering browser popup blocking for a burst of new windows.
    const labelWindow = quote.boxes.length === 1 ? window.open('about:blank', '_blank') : null;
    if (labelWindow) { labelWindow.opener = null; labelWindow.document.title = 'Preparing KPD label'; labelWindow.document.body.textContent = 'Preparing your 4 x 6 shipping label.'; }
    action(async () => {
      try {
        const purchased = await operationsRequest(`shipping/groups/${quote.id}/buy`, { method: 'POST', body: JSON.stringify({
          boxes: quote.boxes.map((box, index) => ({ id: box.id, rate_id: chosenRates[index].id, amount_cents: chosenRates[index].amount_cents })), total_cents: total
        }) });
        setResult(purchased); setQuote(null); setGroup(null);
        if (labelWindow) { if (purchased.boxes[0].label_url) labelWindow.location.replace(purchased.boxes[0].label_url); else labelWindow.close(); }
        if (purchased.errors.length) setError(purchased.errors.map(e => `Box ${e.box_number}: ${e.message}`).join(' '));
        await load();
      } catch (err) {
        if (labelWindow) labelWindow.close();
        setQuote(null); setRates({}); setGroup(null); await load(); throw err;
      }
    });
  }
  function shipped(shipment, all = false) {
    action(async () => {
      await operationsRequest(all ? `shipping/groups/${shipment.group_id}/shipped` : `shipping/${shipment.id}/shipped`, { method: 'POST', body: '{}' });
      setResult(null); await load();
    });
  }
  function reconcile(shipment) {
    action(async () => {
      const recovered = await operationsRequest(`shipping/${shipment.id}/reconcile`, { method: 'POST', body: JSON.stringify({ transaction_id: transactions[shipment.id] || shipment.transaction_id || '' }) });
      setResult(null); await load();
      if (recovered.state === 'failed') setError('Shippo confirmed that this label was not created. These cases are back in the ready queue.');
    });
  }
  const labelLink = shipment => <a className="kpd-button" href={shipment.label_url} target="_blank" rel="noopener noreferrer">Open / reprint Box {shipment.box_number || 1} label</a>;
  const historyGroups = data ? Object.values(data.history.reduce((groups, item) => {
    const key = item.group_id || item.id; (groups[key] || (groups[key] = [])).push(item); return groups;
  }, {})).map(items => items.sort((a, b) => a.box_number - b.box_number)) : [];

  return <OperationsLayout active="shipping">
    <header className="kpd-ops-heading"><div><p className="kpd-eyebrow">FROM FINISHED CASE TO FRONT DOOR</p><h1>Shipping</h1><p>All ready cases selected. Add a box whenever you need one.</p></div><button disabled={busy} onClick={() => action(load)}>Refresh queue</button></header>
    {error && <div className="kpd-notice kpd-error" role="alert">{error}</div>}
    {!data && !error && <p role="status">Loading ready cases.</p>}
    {result && <section className="kpd-notice" role="status"><h2>{result.errors.length ? 'Review your boxes below' : 'Your labels are ready'}</h2><p>{result.boxes.filter(b => b.label_url).length} label(s) saved. Print each on 4 x 6 paper at actual size (100%).</p><div className="kpd-actions">{result.boxes.filter(b => b.label_url).map(b => <React.Fragment key={b.id}>{labelLink(b)}</React.Fragment>)}</div><small>Creating or printing labels does not mark the cases shipped. Confirm departure in shipment history.</small></section>}
    {group && <section className="kpd-panel kpd-shipment-review" aria-label="Review shipment">
      <div className="kpd-section-heading"><div><p className="kpd-eyebrow">REVIEW SHIPMENT</p><h2>{group.doctor}</h2></div><button disabled={busy} onClick={() => { setGroup(null); invalidate(); }}>Close</button></div>
      <div className="kpd-shipping-columns"><div><h3>Pack your cases</h3><p>Choose a box for each case, or leave it in the lab.</p>
        <div className="kpd-checklist">{group.cases.map(c => <label className="kpd-case-assignment" key={c.id}><span><strong>#{c.id} — {c.patient}</strong><small>{c.type} · {c.product}</small></span><select disabled={busy} aria-label={`Box for case ${c.id}`} value={assignments[c.id] || ''} onChange={e => { invalidate(); setAssignments({ ...assignments, [c.id]: Number(e.target.value) || null }); }}><option value="">Leave in lab</option>{boxes.map((box, index) => <option key={box.key} value={box.key}>Box {index + 1}</option>)}</select></label>)}</div>
        <p className="kpd-packing-summary">{group.cases.length - leftBehind} shipping · {leftBehind} staying in the lab</p>
      </div><div><h3>Deliver to</h3><Address address={group.address} /><p>Each box gets its own 4 x 6 label and tracking number. Cases keep the tracking for the box they are packed in.</p></div></div>
      <div className="kpd-section-heading kpd-box-heading"><h3>{boxes.length} {boxes.length === 1 ? 'box' : 'boxes'}</h3><button disabled={busy || boxes.length >= 20} onClick={addBox}>+ Add box</button></div>
      <div className="kpd-box-grid">{boxes.map((box, index) => {
        const ids = caseIds(box), boxQuote = quote && quote.boxes[index];
        return <article className="kpd-box" key={box.key}><div className="kpd-section-heading"><h3>Box {index + 1} · {ids.length} cases</h3>{boxes.length > 1 && !ids.length && <button disabled={busy} onClick={() => { invalidate(); setBoxes(boxes.filter(b => b.key !== box.key)); }}>Remove empty box</button>}</div>
          <p>{ids.length ? ids.map(id => `#${id}`).join(', ') : 'Choose this box beside the cases you are packing in it.'}</p>
          <details open={boxes.length > 1 ? true : undefined}><summary>Package size and weight</summary><div className="kpd-parcel">{['length', 'width', 'height', 'weight'].map(key => <label key={key}>{key[0].toUpperCase() + key.slice(1)} ({key === 'weight' ? 'lb' : 'in'})<input type="number" min="0.01" max="150" step="0.01" disabled={busy} value={box.parcel[key]} onChange={e => { invalidate(); setBoxes(boxes.map(b => b.key === box.key ? { ...b, parcel: { ...b.parcel, [key]: e.target.value } } : b)); }} /></label>)}</div></details>
          {boxQuote && <div className="kpd-box-rate">{!rates[boxQuote.id] && <p className="kpd-error-text">UPS Ground is unavailable. Choose another service or review the package and address.</p>}<label>Shipping service<select disabled={busy} value={rates[boxQuote.id] || ''} onChange={e => setRates({ ...rates, [boxQuote.id]: e.target.value })}><option value="">Choose a service</option>{boxQuote.rates.map(rate => <option key={rate.id} value={rate.id}>{rate.provider} {rate.service} — {dollars(rate.amount_cents)}</option>)}</select></label></div>}
        </article>;
      })}</div>
      {busy && <p role="status">Working on your shipment. Keep this page open.</p>}
      {quote ? <div className="kpd-rate-review"><p>{group.cases.length - leftBehind} cases in {boxes.length} {boxes.length === 1 ? 'box' : 'boxes'} · {leftBehind} staying in lab</p><div className="kpd-purchase-total"><span>Total postage</span><strong>{priced ? dollars(total) : 'Choose every service'}</strong></div><button className="kpd-primary" disabled={busy || !priced} onClick={buy}>{busy ? 'Processing…' : `Buy ${boxes.length === 1 ? 'label' : `${boxes.length} labels`}${priced ? ` — ${dollars(total)}` : ''}`}</button></div> : <button className="kpd-primary" disabled={busy || boxes.some(box => !caseIds(box).length)} onClick={() => action(() => getQuote())}>Review shipping {boxes.length === 1 ? 'price' : 'prices'}</button>}
    </section>}
    {data && <>
      <section className="kpd-panel"><div className="kpd-section-heading"><div><h2>Ready to ship</h2><p>{data.groups.length} dentist groups · {data.groups.reduce((sum, item) => sum + item.cases.length, 0)} cases awaiting a label</p></div><span className="kpd-tag">Default: UPS Ground</span></div>
        <div className="kpd-queue">{data.groups.map(item => <article key={item.key}><div><h3>{item.doctor}</h3><p>{item.cases.length} cases ready · {item.cases.map(c => `#${c.id}`).join(', ')}</p>{item.address && <small>{item.address.street1} · {item.address.city}, {item.address.state} {item.address.zip}</small>}{item.address_error && <p className="kpd-error-text">{item.address_error}</p>}</div><button className="kpd-primary" disabled={busy || !!item.address_error} onClick={() => prepare(item)}>Prepare shipment</button></article>)}</div>
        {!data.groups.length && <div className="kpd-empty">You're caught up. Cases appear here when they're ready to ship and off hold.</div>}
      </section>
      <section className="kpd-panel"><div className="kpd-section-heading"><div><h2>Shipment history</h2><p>Saved labels and boxes awaiting departure. Reprinting never purchases postage again.</p></div></div>
        {historyGroups.map(items => {
          const first = items[0], allReady = items.length === first.box_count && items.every(b => ['purchased', 'shipped'].includes(b.state)) && items.some(b => b.state === 'purchased');
          return <article className="kpd-shipment-history" key={first.group_id || first.id}><div className="kpd-section-heading"><div><h3>{first.doctor} · {first.box_count || 1} {(first.box_count || 1) === 1 ? 'box' : 'boxes'}</h3><p>{new Date(first.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</p></div>{first.group_id && first.box_count > 1 && allReady && <button className="kpd-primary" disabled={busy} onClick={() => shipped(first, true)}>Confirm all boxes shipped</button>}</div>
            {items.map(item => <div className="kpd-history-box" key={item.id}><div className="kpd-section-heading"><h3>Box {item.box_number || 1} · {item.cases.length} cases</h3><span className={`kpd-tag ${['uncertain', 'purchasing'].includes(item.state) ? 'kpd-tag-warning' : ''}`}>{statusLabels[item.state] || item.state}</span></div><p>{item.cases.map(id => `#${id}`).join(', ')}</p>
              {item.tracking_number && <p>Tracking: <strong>{item.tracking_number}</strong> · {item.selected_rate.provider} {item.selected_rate.service} · {dollars(item.selected_rate.amount_cents)}</p>}
              <div className="kpd-actions">{item.label_url && labelLink(item)}{item.state === 'purchased' && <button disabled={busy} onClick={() => shipped(item)}>Confirm Box {item.box_number || 1} has shipped</button>}</div>
              {['failed', 'not_purchased'].includes(item.state) && <p>These cases can be prepared again from the ready queue.</p>}
              {['uncertain', 'purchasing'].includes(item.state) && <div className="kpd-notice"><p>A label may already have been purchased. Check Shippo before taking another action. This box's reference is <strong>kpd:{item.id}</strong>.</p><label>Shippo transaction ID<input disabled={busy} value={transactions[item.id] || ''} onChange={e => setTransactions({ ...transactions, [item.id]: e.target.value })} /></label><button disabled={busy || !transactions[item.id]} onClick={() => reconcile(item)}>Retrieve existing purchase</button></div>}
            </div>)}
          </article>;
        })}
        {!data.history.length && <p className="kpd-empty">New purchases will appear here.</p>}
      </section>
      {!!data.legacy.length && <aside className="kpd-notice"><strong>Existing tracking needs review</strong><p>These ready cases already have tracking in their case notes. Check their existing labels in Shippo to avoid buying postage twice.</p><div className="kpd-actions">{data.legacy.map(c => <CaseLink key={c.id} id={c.id}>#{c.id} · {c.doctor}</CaseLink>)}</div></aside>}
    </>}
  </OperationsLayout>;
}
