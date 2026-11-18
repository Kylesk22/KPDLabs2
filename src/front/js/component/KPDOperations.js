import React from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../styles/kpdOperations.css';

export const dollars = cents => cents === null || cents === undefined ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

export async function operationsRequest(path, options = {}) {
  const csrf = document.cookie.split('; ').find(value => value.startsWith('csrf_access_token='));
  const response = await fetch(`${process.env.BACKEND_URL}/admin/operations/${path}`, {
    ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-TOKEN': csrf.slice('csrf_access_token='.length) } : {}), ...options.headers }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(response.status === 401 ? 'Your session expired. Sign in again to continue.' : body.message || 'Unable to load this information. Please try again.');
  }
  return options.csv ? response.blob() : response.json();
}

export function OperationsLayout({ active, children }) {
  const { user_id } = useParams();
  return <main className="kpd-operations">
    <div className="kpd-ops-shell">
      <div className="kpd-ops-brand"><span>KPD</span> LAB OPERATIONS</div>
      <nav className="kpd-ops-nav" aria-label="Lab operations">
        <Link to={`/admin/${user_id}`} aria-current={active === 'cases' ? 'page' : undefined}>Cases</Link>
        <Link to={`/admin/${user_id}/shipping`} aria-current={active === 'shipping' ? 'page' : undefined}>Shipping</Link>
        <Link to={`/admin/${user_id}/reports`} aria-current={active === 'reports' ? 'page' : undefined}>Reports</Link>
      </nav>
      {children}
    </div>
  </main>;
}

export function CaseLink({ id, children }) {
  const { user_id } = useParams();
  return <Link to={`/admin/${user_id}/${id}`}>{children || `#${id}`}</Link>;
}
