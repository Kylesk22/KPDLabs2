/* No tokens, registration data or files are persisted in browser storage. */
(() => {
  const status = document.getElementById('status');
  const emailForm = document.getElementById('email-form');
  const detailsForm = document.getElementById('details-form');
  const confirmForm = document.getElementById('confirm-form');
  const uploadForm = document.getElementById('upload-form');
  const checkoutForm = document.getElementById('checkout-form');
  let receipt = '', uploadKey = '';
  let proof = location.hash.slice(1);
  history.replaceState(null, '', location.pathname);
  if (proof) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(proof)) {
      proof = ''; status.textContent = 'This link is invalid. Request a new verification email.';
    } else { emailForm.hidden = true; confirmForm.hidden = false; }
  }
  async function submit(path, values, form, headers={}) {
    const button = form.querySelector('button'); button.disabled = true;
    status.textContent = 'Please wait…';
    try {
      const state = await fetch('/adw/verification/state', {cache:'no-store'});
      if (!state.ok) {
        status.textContent = state.status === 403
          ? 'Your verification session expired. Reload this page and request a new email link.'
          : 'The service is temporarily unavailable. Please try again shortly.';
        return null;
      }
      const {csrf} = await state.json();
      const multipart=values instanceof FormData;
      const response = await fetch(path, {method:'POST', headers:{...(multipart?{}:{'Content-Type':'application/json'}),'X-CSRF-Token':csrf,...headers}, body:multipart?values:JSON.stringify(values)});
      if (!(response.headers.get('content-type') || '').includes('application/json')) {
        status.textContent = response.status === 413 ? 'These files exceed the upload limit.'
          : 'The service could not complete this request. Please try again shortly.';
        return null;
      }
      const result = await response.json();
      status.textContent = result.message || 'Please try again.';
      return response.ok ? result : null;
    } catch (error) { status.textContent = 'Connection interrupted. Please try again.'; return false; }
    finally { button.disabled = false; }
  }
  emailForm.addEventListener('submit', async event => {
    event.preventDefault();
    await submit('/adw/verification/start', {email:document.getElementById('email').value}, emailForm);
  });
  confirmForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const result=await submit('/adw/verification/details',{proof},confirmForm);
    if(!result)return;
    if(result.registration_required){confirmForm.hidden=true;detailsForm.hidden=false;status.textContent='Add your lab details to continue.';return;}
    if(await submit('/adw/verification/finish',{proof},confirmForm)){
      proof='';confirmForm.hidden=true;uploadForm.hidden=false;
    }
  });
  detailsForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (await submit('/adw/verification/finish', {proof,registration:{practice:document.getElementById('practice').value,contact_name:document.getElementById('contact').value,phone:document.getElementById('phone').value}}, detailsForm)) {
      proof = ''; detailsForm.hidden = true; uploadForm.hidden = false;
    }
  });
  uploadForm.addEventListener('input',()=>{ uploadKey=''; });
  uploadForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const files=Array.from(document.getElementById('files').files);
    const mb=bytes=>(bytes/(1024*1024)).toFixed(1)+' MB';
    if (!files.length) {status.textContent='Choose at least one file first.';return;}
    if (files.length>12) {status.textContent='Choose no more than 12 files per case.';return;}
    const empty=files.find(f=>!f.size);
    if(empty){status.textContent=empty.name+' is empty. Choose a non-empty file.';return;}
    const oversized=files.find(f=>f.size>Number(uploadForm.dataset.fileBytes));
    if(oversized){status.textContent=oversized.name+' is '+mb(oversized.size)+'. The current per-file limit is '+mb(Number(uploadForm.dataset.fileBytes))+'.';return;}
    if(files.reduce((n,f)=>n+f.size,0)>Number(uploadForm.dataset.caseBytes)){status.textContent='The combined files exceed the current case limit of '+mb(Number(uploadForm.dataset.caseBytes))+'.';return;}
    uploadKey=uploadKey||crypto.randomUUID();
    const data=new FormData();data.append('reference',document.getElementById('reference').value);
    files.forEach(file=>data.append('files',file));
    const result=await submit('/adw/upload',data,uploadForm,{'Idempotency-Key':uploadKey});
    if(result && result.receipt){
      receipt=result.receipt;uploadForm.hidden=true;
      const ordering=checkoutForm.dataset.enabled==='true';
      checkoutForm.hidden=!ordering;
      status.textContent='Files received. Receipt: '+receipt+(ordering?'':'\nUpload complete. Ordering is not available yet. No paid order has been created.');
    }
  });
  checkoutForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(checkoutForm.dataset.enabled!=='true'){status.textContent='Ordering is not available yet. No paid order has been created.';return;}
    const result=await submit('/adw/checkout',{receipt,service:document.getElementById('service').value},checkoutForm);
    if(result && result.url){
      const target=new URL(result.url);
      if(target.origin==='https://americandentalworks.com' && target.pathname.startsWith('/products/'))location.assign(target.href);
    }
  });
})();
