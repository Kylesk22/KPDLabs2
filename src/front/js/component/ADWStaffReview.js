import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext, apiBase, csrf } from './AuthProvider';
import '../../styles/adwStaffReview.css';

export default function ADWStaffReview() {
  const auth = useContext(AuthContext);
  const [open, setOpen] = useState(false), [labs, setLabs] = useState([]);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false), [selected, setSelected] = useState(null);
  const [reason, setReason] = useState(''), [decision, setDecision] = useState('approved');
  const active = useRef(null), alive = useRef(true);
  useEffect(() => { alive.current = true; return () => {
    alive.current = false; if (active.current) active.current.abort();
  }; }, []);

  async function request(path, body) {
    const controller = new AbortController(); active.current = controller;
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${apiBase}/adw/staff/${path}`, {
        method: body ? 'POST' : 'GET', credentials: 'include', cache: 'no-store',
        signal: controller.signal,
        headers: body ? {'Content-Type':'application/json', 'X-CSRF-TOKEN':csrf()} : {},
        ...(body ? {body:JSON.stringify(body)} : {})
      });
      if (response.status === 401 || response.status === 422) {
        auth.logout('expired'); throw Error('Sign back in to continue.');
      }
      if (!(response.headers.get('content-type') || '').includes('application/json')) {
        throw Error('ADW staff review is not enabled yet. Existing KPD cases are unaffected.');
      }
      const data = await response.json();
      if (!response.ok) throw Error(data.error || data.message || 'Unable to complete the request.');
      return data;
    } finally { clearTimeout(timer); if (active.current === controller) active.current = null; }
  }

  const working = useRef(false);
  async function load() {
    if (working.current) return;
    working.current = true; setBusy(true); setMessage(''); setLoaded(false); setLabs([]); setSelected(null);
    try {
      const data = await request('labs/pending');
      if (!Array.isArray(data.labs)) throw Error('Unexpected response. Please try again.');
      if (alive.current) { setLabs(data.labs); setLoaded(true); }
    } catch (error) { if (alive.current) setMessage(error.name === 'AbortError' ? 'Connection timed out. Please retry.' : error.message); }
    finally { working.current = false; if (alive.current) setBusy(false); }
  }

  async function save(event) {
    event.preventDefault();
    if (working.current || !selected || !reason.trim()) return;
    working.current = true; setBusy(true); setMessage('');
    try {
      if (!await auth.verifyForSave()) throw Error('Sign back in before saving this review.');
      await request(`labs/${encodeURIComponent(selected.lab_id)}/review`, {
        decision, expected: 'pending', reason: reason.trim()
      });
      if (alive.current) {
        setLabs(items => items.filter(item => item.lab_id !== selected.lab_id));
        setSelected(null); setReason('');
        setMessage(decision === 'approved' ? 'Lab approved. Each order still needs file and production review.' : 'Lab blocked from further submissions.');
      }
    } catch (error) { if (alive.current) setMessage(error.name === 'AbortError' ? 'The result could not be confirmed. Refresh the list before retrying.' : `${error.message} Refresh the list before retrying.`); }
    finally { working.current = false; if (alive.current) setBusy(false); }
  }

  return <section className="adw-staff-panel" aria-label="ADW lab review">
    <button type="button" className="adw-staff-toggle" aria-expanded={open} aria-controls="adw-staff-content"
      onClick={() => { setOpen(!open); if (!open && !loaded) load(); }}>ADW lab review {open ? '−' : '+'}</button>
    {open && <div id="adw-staff-content">
      <p>Check new lab details before accepting their work for production. Lab approval alone does not release an order.</p>
      <button type="button" disabled={busy} onClick={load}>Refresh list</button>
      <p role="status" aria-live="polite">{busy ? 'Working…' : message}</p>
      {loaded && !labs.length && <p>No labs are awaiting review.</p>}
      {loaded && labs.length === 100 && <p>Showing the first 100 pending labs. Refresh after reviewing these.</p>}
      <div className="adw-lab-list">{labs.map(lab => <article key={lab.lab_id}>
        <h3>{lab.practice}</h3><dl>
          <dt>Contact</dt><dd>{lab.contact_name}</dd>
          <dt>Verified email</dt><dd>{lab.verified_email}</dd>
          <dt>Phone</dt><dd>{lab.phone}</dd>
        </dl>
        <button type="button" disabled={busy} onClick={() => {setSelected(lab);setReason('');setDecision('approved');setMessage('');}}>Review lab</button>
      </article>)}</div>
      {selected && <form onSubmit={save} className="adw-review-form">
        <h3>Review {selected.practice}</h3>
        <label>Decision<select value={decision} disabled={busy} onChange={e => setDecision(e.target.value)}>
          <option value="approved">Approve lab</option><option value="blocked">Block submissions</option>
        </select></label>
        <label>Review notes<textarea required maxLength={500} value={reason} disabled={busy}
          onChange={e => setReason(e.target.value)} placeholder="Record what you checked and the reason for your decision." /></label>
        <p>Your decision and notes are recorded with your staff account.</p>
        <button type="submit" disabled={busy || !reason.trim()}>Save review</button>
        <button type="button" disabled={busy} onClick={() => setSelected(null)}>Cancel</button>
      </form>}
    </div>}
  </section>;
}
