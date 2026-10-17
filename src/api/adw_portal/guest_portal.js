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
      if (!state.ok) throw new Error('Reload this page before continuing.');
      const {csrf} = await state.json();
      const multipart=values instanceof FormData;
      const response = await fetch(path, {method:'POST', headers:{...(multipart?{}:{'Content-Type':'application/json'}),'X-CSRF-Token':csrf,...headers}, body:multipart?values:JSON.stringify(values)});
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
    if (!files.length || files.length>12 || files.some(f=>!f.size || f.size>Number(uploadForm.dataset.fileBytes)) || files.reduce((n,f)=>n+f.size,0)>Number(uploadForm.dataset.caseBytes)) {
      status.textContent='Use up to 12 non-empty files within the size limits shown above.';return;
    }
    uploadKey=uploadKey||crypto.randomUUID();
    const data=new FormData();data.append('reference',document.getElementById('reference').value);
    files.forEach(file=>data.append('files',file));
    const result=await submit('/adw/upload',data,uploadForm,{'Idempotency-Key':uploadKey});
    if(result && result.receipt){receipt=result.receipt;uploadForm.hidden=true;checkoutForm.hidden=false;status.textContent='Files received. Receipt: '+receipt;}
  });
  checkoutForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const result=await submit('/adw/checkout',{receipt,service:document.getElementById('service').value},checkoutForm);
    if(result && result.url){
      const target=new URL(result.url);
      if(target.origin==='https://americandentalworks.com' && target.pathname.startsWith('/products/'))location.assign(target.href);
    }
  });
})();
