// Portable UI review harness. Production pages are reused unchanged. This file
// simulates API responses for sample data only and never contacts a server.
import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter, Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import KPDReports from '../src/front/js/pages/KPDReports';
import KPDShipping from '../src/front/js/pages/KPDShipping';
import { OperationsLayout } from '../src/front/js/component/KPDOperations';

const fixture = window.KPD_PREVIEW_FIXTURE;
const pdfBytes = Uint8Array.from(atob(fixture.label_url.split(',')[1]), character => character.charCodeAt(0));
fixture.label_url = URL.createObjectURL(new Blob([pdfBytes], {type:'application/pdf'}));
let rows = fixture.report.rows;
const quotes = {}, history = [];
let serial = 0;
const copy = value => JSON.parse(JSON.stringify(value));
const totals = list => ({ cases: list.length, value_cents: list.reduce((n,r)=>n+(r.value_cents||0),0), units:list.reduce((n,r)=>n+(r.units||0),0), missing_values:list.filter(r=>r.value_cents===null).length, missing_quantities:list.filter(r=>r.units===null).length });
function report(query) {
  const start=query.get('start'), end=query.get('end'), view=query.get('view')||'received';
  const selected=rows.filter(r=>(!query.get('customer')||String(r.customer_id)===query.get('customer'))&&(!query.get('doctor')||r.doctor===query.get('doctor'))&&(!query.get('product')||r.product===query.get('product')));
  const groups={received:selected.filter(r=>r.received>=start&&r.received<=end),shipped:selected.filter(r=>r.shipped&&r.shipped>=start&&r.shipped<=end),in_house:selected.filter(r=>r.in_house),production:selected.filter(r=>r.in_house&&!r.held&&r.status!=='Ready to Ship'),held:selected.filter(r=>r.held),ready:selected.filter(r=>r.in_house&&!r.held&&r.status==='Ready to Ship')};
  const details=groups[view], breakdowns={};
  for(const key of ['customer','doctor','product','status']) {
    const buckets={}; for(const row of details) { const label=key==='product'?`${row.type} / ${row.product} (${row.unit_kind})`:row[key]; (buckets[label]||(buckets[label]=[])).push(row); }
    breakdowns[key]=Object.keys(buckets).sort().map(name=>({name,...totals(buckets[name])}));
  }
  return {...fixture.report,start,end,view,rows:details,summary:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,totals(v)])),breakdowns,snapshot_at:new Date().toISOString(),quality:{missing_received:0,inferred_received:0,missing_shipped:0}};
}
window.fetch = async (raw, options={}) => {
  const url=new URL(raw,'https://offline-preview.invalid');
  if(!url.pathname.startsWith('/api/admin/operations/')) throw new Error('Offline sample preview only.');
  const path=url.pathname.slice('/api/admin/operations/'.length), body=options.body?JSON.parse(options.body):{};
  let data;
  if(path==='reports') {
    data=report(url.searchParams);
    if(url.searchParams.get('format')==='csv') {
      const csv=['Case,Dentist,Product,Status,Value',...data.rows.map(r=>[r.id,r.doctor,r.product,r.status,(r.value_cents/100).toFixed(2)].join(','))].join('\r\n');
      return {ok:true,blob:async()=>new Blob([csv],{type:'text/csv'})};
    }
  } else if(path==='shipping') {
    const claimed=new Set(history.flatMap(item=>item.cases));
    data={...fixture.queue,groups:fixture.queue.groups.map(g=>({...g,cases:g.cases.filter(c=>!claimed.has(c.id))})).filter(g=>g.cases.length),history};
  } else if(path==='shipping/quotes') {
    const group=fixture.queue.groups.find(g=>g.cases.some(c=>body.cases.includes(c.id)));
    const id=`DEMO-${++serial}`;
    data={id,state:'quoted',doctor:group.doctor,customer_id:group.customer_id,cases:body.cases,address:group.address,parcel:body.parcel,created_at:new Date().toISOString(),rates:fixture.rates}; quotes[id]=data;
  } else if(path.endsWith('/buy')) {
    const id=path.split('/')[1], q=quotes[id];
    data={...q,state:'purchased',selected_rate:q.rates.find(r=>r.id===body.rate_id),tracking_number:'DEMO-NOT-FOR-SHIPPING',label_url:fixture.label_url};
    history.unshift(data);
  } else if(path.endsWith('/shipped')) {
    data=history.find(item=>item.id===path.split('/')[1]); data.state='shipped'; data.shipped_at=new Date().toISOString();
    rows=rows.map(row=>data.cases.includes(row.id)?{...row,status:'Shipped',in_house:false,held:false,shipped:fixture.today}:row);
  } else throw new Error('This action is not available in the sample preview.');
  return {ok:true,status:200,json:async()=>copy(data)};
};
function SampleCase() {
  const {case_id}=useParams(), row=rows.find(r=>String(r.id)===case_id);
  return <OperationsLayout><h1>Sample case #{case_id}</h1><div className="kpd-panel"><p>This preview uses invented patients. The live case detail page is unchanged.</p>{row&&<><h2>{row.patient}</h2><p>{row.doctor} · {row.product} · {row.status}</p></>}<Link to="/admin/1/reports">Back to Reports</Link></div></OperationsLayout>;
}
ReactDOM.render(<MemoryRouter initialEntries={['/admin/1/reports']}><div style={{position:'absolute',top:0,left:0,right:0,padding:'22px 35px',background:'#222429',color:'#ffb328',fontFamily:'Arial,sans-serif'}}><strong>KPD LABS</strong><span style={{display:'block',fontSize:12,color:'#deded8',marginTop:5}}>Offline development preview · sample cases · purchases are simulated</span></div><Routes>
  <Route path="/admin/:user_id/reports" element={<KPDReports />} />
  <Route path="/admin/:user_id/shipping" element={<KPDShipping />} />
  <Route path="/admin/:user_id/:case_id" element={<SampleCase />} />
  <Route path="*" element={<Navigate to="/admin/1/reports" replace />} />
</Routes></MemoryRouter>,document.getElementById('root'));
