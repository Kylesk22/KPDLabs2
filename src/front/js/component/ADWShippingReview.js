import React, {useContext, useEffect, useRef, useState} from 'react';
import {AuthContext, apiBase, csrf} from './AuthProvider';
import ADWLabelActions from './ADWLabelActions';

export default function ADWShippingReview() {
  const auth = useContext(AuthContext);
  const [ids,setIds] = useState(''), [parcel,setParcel] = useState({length:'6',width:'4',height:'4',weight:'1'});
  const [preview,setPreview] = useState(null), [message,setMessage] = useState(''), [busy,setBusy] = useState(false);
  const [labelTools,setLabelTools] = useState(() => {
    try {return Boolean(sessionStorage.getItem('adw-label-request'));} catch (_) {return false;}
  });
  const alive = useRef(true), active = useRef(null), working = useRef(false);
  useEffect(() => { alive.current = true; return () => {alive.current = false; active.current?.abort();}; }, []);
  function changeParcel(key,value) {setParcel(current => ({...current,[key]:value})); setPreview(null);}
  async function load(rates) {
    if (working.current) return;
    const tokens = ids.trim().split(/[\s,]+/);
    const selected = tokens.map(Number);
    if (!ids.trim() || tokens.some(value => !/^[1-9][0-9]*$/.test(value)) ||
        selected.some(value => !Number.isSafeInteger(value)) || new Set(selected).size !== selected.length ||
        selected.length > 100) { setMessage('Enter up to 100 different KPD case numbers, separated by commas.'); return; }
    working.current = true; setBusy(true); setPreview(null); setMessage('');
    const controller = new AbortController(); active.current = controller;
    const timer = setTimeout(() => controller.abort(),60000);
    try {
      const response = await fetch(`${apiBase}/adw/staff/shipping/${rates ? 'rates' : 'preview'}`,{
        method:'POST',credentials:'include',cache:'no-store',signal:controller.signal,
        headers:{'Content-Type':'application/json','X-CSRF-TOKEN':csrf()},
        body:JSON.stringify(rates ? {case_ids:selected,parcel} : {case_ids:selected})
      });
      if (response.status === 401 || response.status === 422) {auth.logout('expired'); throw Error('Sign back in to continue.');}
      if (!(response.headers.get('content-type') || '').includes('application/json')) throw Error('Shipping review is unavailable.');
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Unable to check shipping.');
      if (!data.sender || !data.destination) throw Error('Unexpected shipping response.');
      if (alive.current) {
        setPreview(data);
        if (data.rates?.some(rate => rate.quote_id)) setLabelTools(true);
      }
    } catch (error) {
      if (alive.current) setMessage(error.name === 'AbortError' ? 'The rate check timed out. No label was purchased.' : error.message);
    } finally {
      clearTimeout(timer); active.current = null; working.current = false; if (alive.current) setBusy(false);
    }
  }
  const address = value => ['name','company','address1','address2','city','provinceCode','zip','countryCodeV2']
    .map(key => value[key]).filter(Boolean).join(', ');
  return <section className="adw-review-form" aria-label="ADW shipping review">
    <h3>Prepare ADW shipping</h3>
    <p>Use KPD case numbers. Combined cases must belong to the same lab and delivery address.</p>
    <label>KPD case numbers<input value={ids} disabled={busy} placeholder="Example: 4312, 4313"
      onChange={event => {setIds(event.target.value); setPreview(null);}} /></label>
    <fieldset disabled={busy}><legend>Package measurements</legend>
      {['length','width','height','weight'].map(key => <label key={key}>
        {key[0].toUpperCase()+key.slice(1)} ({key === 'weight' ? 'lb' : 'in'})
        <input type="number" min="0.01" step="0.01" max={key === 'weight' ? '150' : '108'}
          value={parcel[key]} onChange={event => changeParcel(key,event.target.value)} />
      </label>)}
    </fieldset>
    <button type="button" disabled={busy} onClick={() => load(false)}>Check delivery address</button>
    <button type="button" disabled={busy} onClick={() => load(true)}>Get shipping rates</button>
    <p>Rates require cases marked Ready to Ship. Checking rates does not purchase a label.</p>
    <p role="status" aria-live="polite">{busy ? 'Checking shipping…' : message}</p>
    {preview && <>
      <p><strong>From:</strong> {address(preview.sender)}</p>
      <p><strong>To:</strong> {address(preview.destination)}</p>
      {preview.rates && <table><caption>Shipping estimates — no label purchased</caption>
        <thead><tr><th>Carrier</th><th>Service</th><th>Price</th></tr></thead>
        <tbody>{preview.rates.map((rate,index) => <tr key={index}><td>{rate.carrier}</td><td>{rate.service}</td>
          <td>${rate.amount} {rate.currency}</td></tr>)}</tbody></table>}
    </>}
    {labelTools && <ADWLabelActions rates={preview?.rates?.filter(rate => rate.quote_id) || []} />}
  </section>;
}
