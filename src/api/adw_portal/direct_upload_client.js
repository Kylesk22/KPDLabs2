/* Staged: not loaded by the live portal. No credentials or files in storage.
 * api must enforce authentication, ownership, CSRF and durable idempotency.
 * begin returns opaque reservation/file IDs; the browser never chooses keys.
 */
'use strict';
async function uploadDirect({files, reference, requestKey, api, transfer=fetch,
  progress=()=>{}, onReservation=()=>{}, signal, wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}) {
  const stopped=()=>{if(signal?.aborted)throw new Error('Upload cancelled');};
  async function retry(action) {
    for(let attempt=0;attempt<3;attempt++) {
      stopped();
      try{return await action();}
      catch(error) {
        if(signal?.aborted || error.permanent || attempt===2)throw error;
        await wait(500*2**attempt);
      }
    }
  }
  const reservation=await retry(()=>api('begin',{
    reference,request_key:requestKey,
    files:files.map(file=>({name:file.name,bytes:file.size}))
  }));
  // A lost final response can be replayed without transferring the files again.
  if(reservation.receipt)return reservation;
  if(!reservation.id || !Array.isArray(reservation.files) ||
     reservation.files.length!==files.length ||
     !Number.isSafeInteger(reservation.part_bytes) || reservation.part_bytes<1)
    throw new Error('Invalid upload reservation');
  onReservation(reservation.id);
  let done=0;
  const total=files.reduce((sum,file)=>sum+file.size,0);
  for(let index=0;index<files.length;index++) {
    const file=files[index], id=reservation.files[index].id;
    if(!id)throw new Error('Invalid file reservation');
    for(let offset=0,part=1;offset<file.size;offset+=reservation.part_bytes,part++) {
      const chunk=file.slice(offset,Math.min(file.size,offset+reservation.part_bytes));
      await retry(async()=>{
        // Refresh the short-lived URL for every attempt, including expired URLs.
        const signed=await api('part',{id:reservation.id,file:id,part});
        if(signed.complete===true)return;
        const url=new URL(signed.url);
        if(url.protocol!=='https:' || url.hostname!=='adw-case-files.nyc3.digitaloceanspaces.com' ||
           url.username || url.password || (url.port && url.port!=='443'))
          throw Object.assign(new Error('Unexpected upload destination'),{permanent:true});
        const response=await transfer(url.href,{method:'PUT',body:chunk,
          credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal});
        if(!response.ok)throw new Error('File transfer interrupted');
      });
      done+=chunk.size;progress({bytes:done,total});
    }
    progress({bytes:done,total,checking:true});
    await retry(()=>api('complete-file',{id:reservation.id,file:id}));
  }
  stopped();
  return retry(()=>api('finish',{id:reservation.id}));
}
if(typeof module!=='undefined')module.exports={uploadDirect};
