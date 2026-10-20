import React, {useContext, useState} from 'react';
import {AuthContext, apiBase, csrf} from './AuthProvider';

export default function ADWLabelActions({rates}) {
  const auth = useContext(AuthContext);
  const [chosen,setChosen] = useState(null), [confirmed,setConfirmed] = useState(false);
  const [requestId,setRequestId] = useState(() => {
    try {return sessionStorage.getItem('adw-label-request') || '';} catch (_) {return '';}
  }), [transaction,setTransaction] = useState('');
  const [busy,setBusy] = useState(false), [result,setResult] = useState(null), [message,setMessage] = useState('');
  async function act(action) {
    if (busy) return;
    const id = action === 'purchase' ? chosen?.quote_id : requestId.trim();
    if (!id || (action === 'purchase' && !confirmed)) return;
    setBusy(true); setRequestId(id); setResult(null); setMessage('');
    try {sessionStorage.setItem('adw-label-request',id);} catch (_) { /* Manual recovery remains available. */ }
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(),60000);
    try {
      const body = action === 'purchase' ? {amount_cents:chosen.amount_cents,confirmed:true} :
        action === 'reconcile' ? {transaction_id:transaction.trim()} : {};
      const response = await fetch(`${apiBase}/adw/staff/shipping/labels/${encodeURIComponent(id)}/${action}`, {
        method:'POST',credentials:'include',cache:'no-store',signal:controller.signal,
        headers:{'Content-Type':'application/json','X-CSRF-TOKEN':csrf()},body:JSON.stringify(body)
      });
      if (response.status === 401 || response.status === 422) auth.logout('expired');
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Could not confirm label status.');
      setResult(data);
    } catch (error) {
      setMessage(`${error.name === 'AbortError' ? 'Request timed out.' : error.message} Check this request before trying another label.`);
    } finally {
      clearTimeout(timer); setBusy(false); setChosen(null); setConfirmed(false);
    }
  }
  return <section aria-label="ADW label purchase">
    <h4>Label purchase</h4>
    <p>Review the delivery address and package above. A purchased label does not mark the case as shipped.</p>
    {rates.map(rate => <button type="button" key={rate.quote_id} disabled={busy}
      onClick={() => {setChosen(rate);setConfirmed(false);}}>
      Select {rate.carrier} {rate.service} — ${rate.amount} USD
    </button>)}
    {chosen && <div>
      <label><input type="checkbox" checked={confirmed} disabled={busy}
        onChange={event => setConfirmed(event.target.checked)} />
        I confirm this address and package, and authorize the ${chosen.amount} USD label purchase.
      </label>
      <button type="button" disabled={busy || !confirmed} onClick={() => act('purchase')}>
        Buy label — ${chosen.amount} USD
      </button>
    </div>}
    <h4>Check or recover a label request</h4>
    <p>Keep the request ID if an attempt is interrupted. Checking status and recovering a provider transaction never buys another label.</p>
    <label>Label request ID<input value={requestId} disabled={busy}
      onChange={event => {setRequestId(event.target.value);setResult(null);}} /></label>
    <button type="button" disabled={busy || !requestId.trim()} onClick={() => act('status')}>Check status</button>
    <label>Shippo transaction ID<input value={transaction} disabled={busy}
      onChange={event => setTransaction(event.target.value)} /></label>
    <button type="button" disabled={busy || !transaction.trim() || !requestId.trim()}
      onClick={() => act('reconcile')}>Recover existing label</button>
    <p role="status">{busy ? 'Checking label request…' : message}</p>
    {result && <div><p>Request: {result.id} — {result.state}</p>
      {result.state === 'purchased' && <p>Tracking: {result.tracking_number}.{' '}
        <a href={result.label_url} target="_blank" rel="noopener noreferrer">Open purchased label</a></p>}
      {['submitting','needs_reconciliation'].includes(result.state) &&
        <p>Do not buy another label. Confirm the transaction in Shippo and recover it here.</p>}
    </div>}
  </section>;
}
