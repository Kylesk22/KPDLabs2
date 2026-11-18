import React, { useEffect, useRef, useState } from 'react';
import { operationsRequest } from './KPDOperations';
import { printManufacturingLabels } from './manufacturingPrint';

export default function ManufacturingLabels() {
  const [data, setData] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false), [mode, setMode] = useState(null), [selected, setSelected] = useState([]);
  const [batch, setBatch] = useState(null), [confirmed, setConfirmed] = useState([]);
  const inFlight = useRef(false), alive = useRef(true);
  useEffect(() => { alive.current = true; load().catch(err => { if (alive.current) setError(err.message); }); return () => { alive.current = false; }; }, []);
  async function load() {
    const fresh = await operationsRequest('manufacturing-labels');
    if (alive.current) setData(fresh);
    return fresh;
  }
  async function action(run) {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(''); setMessage('');
    try { await run(); } catch (err) { if (alive.current) setError(err.message); }
    finally { inFlight.current = false; if (alive.current) setBusy(false); }
  }
  const available = data ? data.cases.filter(c => mode !== 'new' || c.reason !== 'printed') : [];
  const toggle = (id, setter) => setter(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
  function review(nextMode) {
    action(async () => {
      const fresh = await load(); setMode(nextMode);
      setSelected(nextMode === 'new' ? fresh.cases.filter(c => c.reason !== 'printed').slice(0,100).map(c => c.id) : []);
    });
  }
  function print() {
    if (inFlight.current || !selected.length || selected.length > 100) return;
    const target = window.open('about:blank', '_blank');
    if (!target) { setError('Allow pop-ups for KPD, then click Print selected labels again.'); return; }
    target.opener = null; target.document.body.textContent = 'Preparing your manufacturing labels…';
    action(async () => {
      try {
        const prepared = await operationsRequest('manufacturing-labels/prepare', {method:'POST',body:JSON.stringify({cases:selected,mode})});
        printManufacturingLabels(target, prepared.labels);
        setBatch(prepared); setConfirmed(prepared.labels.map(c => c.caseNumber)); setMode(null);
      } catch (err) { if(!target.closed) target.close(); throw err; }
    });
  }
  function recordExisting() {
    action(async () => {
      const prepared = await operationsRequest('manufacturing-labels/prepare',{method:'POST',body:JSON.stringify({cases:selected,mode:'existing'})});
      await operationsRequest('manufacturing-labels/confirm',{method:'POST',body:JSON.stringify({token:prepared.token,cases:selected})});
      setMode(null); await load(); setMessage('The selected labels are recorded as already printed.');
    });
  }
  function confirm() {
    action(async () => {
      await operationsRequest('manufacturing-labels/confirm',{method:'POST',body:JSON.stringify({token:batch.token,cases:confirmed})});
      setBatch(null); await load(); setMessage(`${confirmed.length} label(s) confirmed. Unconfirmed labels remain available to print.`);
    });
  }
  return <section className="kpd-panel kpd-manufacturing-labels" aria-label="Manufacturing labels">
    <div className="kpd-section-heading"><div><h2>Manufacturing labels</h2><p>{data ? `${data.pending} new or updated labels waiting · held cases excluded` : 'Loading manufacturing labels…'}</p></div><button disabled={busy} onClick={()=>action(load)}>Refresh labels</button></div>
    {error && <div className="kpd-notice kpd-error" role="alert">{error}</div>}
    {message && <div className="kpd-notice kpd-success" role="status">{message}</div>}
    {data && !batch && <div className="kpd-actions"><button className="kpd-primary" disabled={busy || !data.pending} onClick={()=>review('new')}>Print new labels ({data.pending})</button><button disabled={busy || !data.cases.length} onClick={()=>review('reprint')}>Reprint / already printed</button></div>}
    {mode && !batch && <div className="kpd-label-review">
      <div className="kpd-section-heading"><h3>{mode === 'new' ? 'Review new labels' : 'Select manufacturing cases'}</h3><button disabled={busy} onClick={()=>setMode(null)}>Close review</button></div>
      <p>Choose up to 100 cases. One case per 4 × 6 label, together in one print job. This list includes all eligible Manufacturing cases, regardless of the dashboard search.</p>
      <div className="kpd-actions"><button disabled={busy} onClick={()=>setSelected(available.slice(0,100).map(c=>c.id))}>Select {available.length > 100 ? 'first 100' : 'all'}</button><button disabled={busy} onClick={()=>setSelected([])}>Clear selection</button><span>{selected.length} selected</span></div>
      <div className="kpd-label-checklist">{available.map(c=><label key={c.id}><input type="checkbox" disabled={busy} checked={selected.includes(c.id)} onChange={()=>toggle(c.id,setSelected)} /><span><strong>#{c.id} · {c.patient}</strong><small>{c.doctor} · {c.type} · {c.product}</small><small>{c.reason === 'new' ? 'No print confirmation recorded' : c.reason === 'changed' ? 'Case details changed — new label needed' : `Printed ${new Date(c.printed_at).toLocaleString('en-US',{timeZone:'America/New_York'})} ET`}</small></span></label>)}</div>
      <div className="kpd-actions"><button className="kpd-primary" disabled={busy || !selected.length || selected.length>100} onClick={print}>Print selected labels ({selected.length})</button>{mode === 'reprint' && <button disabled={busy || !selected.length || selected.length>100} onClick={recordExisting}>These labels are already printed</button>}</div>
      {mode === 'reprint' && <p>Use “already printed” only when the current labels are physically printed, including labels printed before this feature was added.</p>}
    </div>}
    {batch && <div className="kpd-notice kpd-label-confirmation"><h3>Did the labels print successfully?</h3><p>Uncheck any that failed or did not print. If you cancelled printing, leave them unconfirmed.</p>
      <div className="kpd-label-checklist">{batch.labels.map(c=><label key={c.caseNumber}><input type="checkbox" disabled={busy} checked={confirmed.includes(c.caseNumber)} onChange={()=>toggle(c.caseNumber,setConfirmed)} /><span><strong>#{c.caseNumber} · {c.patientName}</strong><small>{c.doctorFirst}</small></span></label>)}</div>
      <div className="kpd-actions"><button className="kpd-primary" disabled={busy || !confirmed.length} onClick={confirm}>Confirm {confirmed.length} labels printed</button><button disabled={busy} onClick={()=>{setBatch(null);setConfirmed([]);action(load);}}>Leave unconfirmed</button></div>
    </div>}
    <small>Print confirmations are shared across staff. Individual case Print buttons do not record confirmation here; use “already printed” when needed.</small>
  </section>;
}
