import React, {useContext, useEffect, useRef, useState} from 'react';
import {AuthContext, apiBase} from './AuthProvider';

export default function ADWWaitingOrders({onSelect, disabled}) {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState([]), [cursor, setCursor] = useState(null);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const request = useRef(null);
  async function load(after = null) {
    if (request.current) return;
    const controller = new AbortController(); request.current = controller;
    const timer = setTimeout(() => controller.abort(), 15000);
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`${apiBase}/adw/staff/orders/waiting${after ? `?after=${encodeURIComponent(after)}` : ''}`,
        {credentials:'include', cache:'no-store', signal:controller.signal});
      if (response.status === 401 || response.status === 422) {
        auth.logout('expired'); throw Error('Sign back in to view waiting orders.');
      }
      if (!response.ok) throw Error('Unable to load waiting orders. Please refresh the list.');
      const data = await response.json();
      if (!Array.isArray(data.orders)) throw Error('Unable to read waiting orders.');
      if (controller.signal.aborted) return;
      setOrders(previous => after ? [...previous, ...data.orders.filter(row =>
        !previous.some(old => old.order_id === row.order_id))] : data.orders);
      setCursor(data.next_cursor);
    } catch (error) {
      if (request.current === controller) setMessage(controller.signal.aborted
        ? 'Loading timed out. Please refresh the list.' : error.message);
    } finally {
      clearTimeout(timer);
      if (request.current === controller) { request.current = null; setBusy(false); }
    }
  }
  useEffect(() => { load(); return () => {
    const pending = request.current; request.current = null; pending?.abort();
  }; }, []);
  return <div aria-label="Waiting ADW orders">
    <h4>Waiting ADW orders</h4>
    <p>Paid-order notices received from Shopify. Select an order, then load it below to verify payment and review its files.</p>
    <button type="button" disabled={busy || disabled} onClick={() => load()}>Refresh waiting orders</button>
    {message && <p role="alert">{message}</p>}
    {!busy && !message && !orders.length && <p>No orders waiting for review.</p>}
    {busy && <p role="status">Loading waiting orders…</p>}
    <ul>{orders.map(order => <li key={order.order_id}>
      <button type="button" disabled={disabled} onClick={() => onSelect(order.order_id)}>
        Select Shopify order {order.order_id}
      </button>
      {order.status === 'needs_review' && ' (verification needs attention)'}
    </li>)}</ul>
    {cursor && <button type="button" disabled={busy || disabled} onClick={() => load(cursor)}>Show more orders</button>}
  </div>;
}
