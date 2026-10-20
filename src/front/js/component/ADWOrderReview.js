import React, {useContext, useEffect, useRef, useState} from 'react';
import {AuthContext, apiBase, csrf} from './AuthProvider';

export default function ADWOrderReview() {
  const auth = useContext(AuthContext);
  const [orderId, setOrderId] = useState('');
  const [review, setReview] = useState(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const active = useRef(null), alive = useRef(true), working = useRef(false);
  useEffect(() => { alive.current = true; return () => {
    alive.current = false; active.current?.abort();
  }; }, []);

  async function send(id, action, body) {
    const controller = new AbortController(); active.current = controller;
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${apiBase}/adw/staff/orders/${encodeURIComponent(id)}/${action}`, {
        method: 'POST', credentials: 'include', cache: 'no-store',
        headers: {'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf()},
        body: JSON.stringify(body), signal: controller.signal
      });
      if (response.status === 401 || response.status === 422) {
        auth.logout('expired'); throw Error('Sign back in to continue.');
      }
      if (response.status === 404) throw Error('Order review has not been enabled yet.');
      if (!(response.headers.get('content-type') || '').includes('application/json')) {
        throw Error('Unable to confirm the result. Reload the order before retrying.');
      }
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Unable to complete this review.');
      return data;
    } finally {
      clearTimeout(timer);
      if (active.current === controller) active.current = null;
    }
  }

  async function run(accept) {
    if (working.current) return;
    if (accept && (!review || !checked)) return;
    working.current = true; setBusy(true); setMessage('');
    const previous = review;
    if (!accept) { setReview(null); setChecked(false); }
    try {
      if (accept && !await auth.verifyForSave()) throw Error('Sign back in before accepting work.');
      const data = await send(accept ? previous.order_id : orderId.trim(),
        accept ? 'accept' : 'review', accept ? {
          review_fingerprint: previous.review_fingerprint, files_reviewed: true
        } : {});
      if (!alive.current) return;
      if (accept) {
        if (!Array.isArray(data.case_ids) || !data.case_ids.length) throw Error('Reload the order to confirm its case status.');
        setReview(null); setChecked(false);
        setMessage(`KPD case${data.case_ids.length > 1 ? 's' : ''} ready: ${data.case_ids.join(', ')}. Refresh the KPD case list to view them.`);
      } else {
        if (!data.lab || !Array.isArray(data.lines) || !data.review_fingerprint) throw Error('Unexpected review response.');
        setReview(data);
      }
    } catch (error) {
      if (alive.current) {
        setReview(null); setChecked(false);
        setMessage(error.name === 'AbortError'
          ? 'The result could not be confirmed. Load the order again before retrying; existing cases will not be duplicated.'
          : error.message);
      }
    } finally {
      working.current = false; if (alive.current) setBusy(false);
    }
  }

  const approved = review?.lab.lab_review === 'approved' && !review?.lab.blocked;
  return <section className="adw-review-form" aria-label="ADW order review">
    <h3>Review an ADW order</h3>
    <p>Check the paid order and its files before creating KPD work. Shopify test orders cannot enter production.</p>
    <form onSubmit={event => { event.preventDefault(); run(false); }}>
      <label>Shopify order ID
        <input value={orderId} disabled={busy} required inputMode="numeric" pattern="[1-9][0-9]{0,31}"
          onChange={event => {setOrderId(event.target.value); setReview(null); setChecked(false);}} />
      </label>
      <p>Use the long number at the end of the order’s Shopify admin address, not its order number such as #1001.</p>
      <button disabled={busy} type="submit">Load order for review</button>
    </form>
    <p role="status" aria-live="polite">{busy ? 'Checking order…' : message}</p>
    {review && <>
      <h4>{review.lab.practice}</h4>
      <p>{review.lab.contact_name} · {review.lab.verified_email} · {review.lab.phone}</p>
      {!approved && <p>Approve this lab before accepting production work.</p>}
      {review.shipping ? <p>Ship to: {['name','company','address1','address2','city','provinceCode','zip','countryCodeV2']
        .map(key => review.shipping[key]).filter(Boolean).join(', ')}</p> : <p>Digital delivery; no shipping required.</p>}
      {review.lines.map(line => <article key={line.line_id}>
        <h4>{line.reference}</h4>
        <p>{line.sku} · {line.quantity} unit(s) · Teeth: {line.teeth.join(', ')} · Shade: {line.shade || 'Not applicable'}</p>
        <ul>{line.files.map(file => <li key={file.index}>
          <a href={`${apiBase}/adw/staff/orders/${review.order_id}/lines/${line.line_id}/files/${file.index}`}
            target="_blank" rel="noopener noreferrer">Download file {file.index + 1}</a>
          {' '}({(file.bytes / 1048576).toFixed(2)} MB)
        </li>)}</ul>
      </article>)}
      <label><input type="checkbox" checked={checked} disabled={busy || !approved}
        onChange={event => setChecked(event.target.checked)} />
        I reviewed these files, the requested work, and the delivery details and accept this order for production.
      </label>
      <button type="button" disabled={busy || !approved || !checked} onClick={() => run(true)}>Accept and create KPD cases</button>
      <p>Payment stays in Shopify. Acceptance records your staff account and starts the production schedule.</p>
    </>}
  </section>;
}
