import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
export const FormLeaveContext = createContext({mark:()=>{},clear:()=>{},leave:action=>action()});
export const useFormLeave = () => useContext(FormLeaveContext);
export function FormLeaveProvider({children, navigationHistory}) {
  const dirty=useRef(false), pending=useRef(null), unblock=useRef(null);
  const [open,setOpen]=useState(false);
  const clear=()=>{dirty.current=false;if(unblock.current){unblock.current();unblock.current=null;}};
  const leave=action=>{if(!dirty.current){action();return;}if(!pending.current)pending.current=action;setOpen(true);};
  const mark=()=>{
    dirty.current=true;
    if(navigationHistory && !unblock.current){
      unblock.current=navigationHistory.block(transaction=>leave(()=>transaction.retry()));
    }
  };
  useEffect(()=>()=>{if(unblock.current)unblock.current();},[]);
  useEffect(()=>{
    const unload=e=>{if(dirty.current){e.preventDefault();e.returnValue='';}};
    const link=e=>{
      const a=e.target.closest && e.target.closest('a[href]');
      if(!dirty.current || !a || a.target==='_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button!==0)return;
      const href=a.getAttribute('href');
      if(!href || href.startsWith('#'))return;
      e.preventDefault();e.stopPropagation();
      leave(()=>window.location.assign(a.href));
    };
    window.addEventListener('beforeunload',unload);
    document.addEventListener('click',link,true);
    return ()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',link,true);};
  },[]);
  return <FormLeaveContext.Provider value={{mark,clear,leave}}>
    {children}
    {open && <div role="dialog" aria-modal="true" aria-labelledby="leave-heading" style={{position:'fixed',inset:0,zIndex:11000,background:'#142538ee',display:'grid',placeItems:'center'}}>
      <div style={{background:'white',color:'#142538',padding:28,maxWidth:440,margin:20,borderRadius:8}}>
        <h2 id="leave-heading">Leave this form?</h2>
        <p>This form hasn't been submitted. Leaving this page will discard your entries.</p>
        <button autoFocus onClick={()=>{pending.current=null;setOpen(false);}}>Stay on form</button>{' '}
        <button onClick={()=>{const action=pending.current;pending.current=null;clear();setOpen(false);if(action)action();}}>Leave page</button>
      </div>
    </div>}
  </FormLeaveContext.Provider>;
}
