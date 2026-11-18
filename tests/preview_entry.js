// Standalone development preview; not imported by the production application.
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import KPDReports from '../src/front/js/pages/KPDReports';
import KPDShipping from '../src/front/js/pages/KPDShipping';

ReactDOM.render(<BrowserRouter><div style={{position:'absolute',top:0,left:0,right:0,padding:'22px 35px',background:'#222429',color:'#ffb328',fontFamily:'Arial,sans-serif'}}><strong>KPD LABS</strong><span style={{display:'block',fontSize:12,color:'#deded8',marginTop:5}}>Development preview · sample cases · no real postage purchases</span></div><Routes>
  <Route path="/admin/:user_id/reports" element={<KPDReports />} />
  <Route path="/admin/:user_id/shipping" element={<KPDShipping />} />
  <Route path="*" element={<Navigate to="/admin/1/reports" replace />} />
</Routes></BrowserRouter>, document.getElementById('root'));
