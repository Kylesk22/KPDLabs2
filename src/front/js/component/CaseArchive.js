import React, {useEffect, useState} from 'react';
import {CaseLink, operationsRequest} from './KPDOperations';

export default function CaseArchive({scope, initialSearch = '', onScopeChange}) {
    const [filters, setFilters] = useState({q: initialSearch, start: '', end: '', sort: 'case', direction: 'desc', page: 1});
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);
    function change(key, value) { setLoading(true); setData(null); setFilters(old => ({...old, [key]: value, page: 1})); }
    useEffect(() => {
        let current = true;
        const controller = new AbortController();
        setLoading(true); setData(null); setError('');
        const timer = setTimeout(async () => {
            try {
                const result = await operationsRequest(`archive?${new URLSearchParams({...filters, scope})}`, {signal: controller.signal});
                if (current) setData(result);
            } catch (exception) {
                if (current && exception.name !== 'AbortError') setError(exception.message);
            } finally { if (current) setLoading(false); }
        }, 300);
        return () => { current = false; clearTimeout(timer); controller.abort(); };
    }, [filters, scope, refresh]);
    function changeScope(value) {
        setFilters(old => ({...old, page: 1}));
        onScopeChange(value);
    }
    function go(page) { setLoading(true); setData(null); setFilters(old => ({...old, page})); }
    return <section className="kpd-panel" aria-label="Case archive">
        <div className="kpd-section-heading">
            <div><h2>{scope === 'closed' ? 'Closed / Archive' : 'Search all cases'}</h2><p>Find a case, then open it for the full prescription, history, and scans.</p></div>
            <button type="button" className="kpd-button" disabled={loading} onClick={() => setRefresh(value => value + 1)}>Refresh</button>
        </div>
        <div className="kpd-report-filters">
            <label>Search<input type="search" maxLength={200} placeholder="Case #, patient, dentist, or scanner ID" value={filters.q} onChange={event => change('q', event.target.value)} /></label>
            <label>Search in<select value={scope} onChange={event => changeScope(event.target.value)}><option value="closed">Closed cases</option><option value="all">All cases, including Closed</option></select></label>
            <label>Sort by<select value={filters.sort} onChange={event => change('sort', event.target.value)}><option value="case">Case number</option><option value="patient">Patient</option><option value="doctor">Dentist</option><option value="date">Case date</option><option value="product">Product</option><option value="status">Status</option></select></label>
            <label>Case date from<input type="date" value={filters.start} onChange={event => change('start', event.target.value)} /></label>
            <label>Through<input type="date" value={filters.end} onChange={event => change('end', event.target.value)} /></label>
            <label>Order<select value={filters.direction} onChange={event => change('direction', event.target.value)}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
        </div>
        <p className="kpd-report-notes">Dates use the saved case date, not the date closed. Leave dates blank to search every year. A number searches the exact case number.</p>
        {loading && <p role="status">Searching cases…</p>}
        {error && <div className="kpd-notice" role="alert">{error} <button type="button" className="kpd-button" onClick={() => setRefresh(value => value + 1)}>Retry</button></div>}
        {!loading && data && <>
            <p role="status">{data.total === 0 ? 'No matching cases. Try another name, case number, or date range.' : `${data.total.toLocaleString()} matching cases · Showing ${(data.page - 1) * data.page_size + 1}–${Math.min(data.page * data.page_size, data.total)}`}</p>
            {data.cases.length > 0 && <div className="kpd-table-wrap"><table>
                <thead><tr><th>Case #</th><th>Patient</th><th>Dentist / customer</th><th>Product</th><th>Case date</th><th>Status</th><th>Scanner ID</th></tr></thead>
                <tbody>{data.cases.map(item => <tr key={item.id}>
                    <td><CaseLink id={item.id} /></td><td><CaseLink id={item.id}>{item.patient || 'Unnamed patient'}</CaseLink></td>
                    <td>{item.doctor || 'Unknown dentist'}{item.customer && item.customer !== item.doctor && <div><small>{item.customer}</small></div>}</td>
                    <td>{item.product || item.type || '—'}</td><td>{item.case_date || '—'}</td><td>{item.status || '—'}</td><td>{item.scanner_id || '—'}</td>
                </tr>)}</tbody>
            </table></div>}
            <div className="kpd-pagination">
                <button type="button" className="kpd-button" disabled={data.page <= 1} onClick={() => go(data.page - 1)}>Previous</button>
                <span>Page {data.page} of {data.pages}</span>
                <button type="button" className="kpd-button" disabled={data.page >= data.pages} onClick={() => go(data.page + 1)}>Next</button>
            </div>
        </>}
    </section>;
}
