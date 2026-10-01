import { FormLeaveProvider } from "./FormLeaveGuard";
import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
export const AuthContext = createContext();
export const apiBase = (process.env.BACKEND_URL || "/api").replace(/\/$/, "");
export function csrf() {
  const item = document.cookie.split("; ").find(x => x.startsWith("csrf_access_token="));
  return item ? decodeURIComponent(item.substring(item.indexOf("=") + 1)) : "";
}
export function AuthProvider({ children, navigationHistory }) {
  const [user, setUser] = useState(null), [logoutReason, setLogoutReason] = useState(null), [warning, setWarning] = useState(false);
  const state = useRef({deadline:0, identity:null, account:null, lastActivity:Date.now(), renewed:0, limit:1800000, locked:false, generation:0, controller:null});
  const logout = useCallback((reason="expired") => {
    const s=state.current; s.generation++; if(s.controller) s.controller.abort(); s.controller=null;
    s.locked=true; setLogoutReason(reason); setWarning(false);
  }, []);
  const check = useCallback(async (renew=false, expectedIdentity=null) => {
    const s=state.current;
    if(s.controller) s.controller.abort();
    const controller=new AbortController(), generation=++s.generation;
    s.controller=controller;
    const timeout=setTimeout(()=>controller.abort(),10000);
    const activityAt=s.lastActivity;
    try {
      const response=await fetch(`${apiBase}/session/${renew?'continue':'status'}`, {
        method:renew?'POST':'GET',credentials:'include',cache:'no-store',signal:controller.signal,
        headers:renew?{'X-CSRF-TOKEN':csrf(),'Content-Type':'application/json'}:{},
        ...(renew?{body:JSON.stringify({idle_seconds:Math.max(0,(Date.now()-activityAt)/1000)})}:{})
      });
      if(generation!==s.generation) return false;
      if(response.status===401 || response.status===422){logout('expired');return false;}
      if(!response.ok || !(response.headers.get('content-type')||'').includes('application/json')) throw Error('Unavailable');
      const data=await response.json();
      if(generation!==s.generation) return false;
      const route=window.location.pathname.match(/^\/(account|admin)\/(\d+)/);
      const storedId=sessionStorage.getItem('id');
      const expectedId=route?route[2]:storedId;
      if(!data.identity || !data.user_id || !Number.isFinite(data.expires_at) || !Number.isFinite(data.server_time) || !Number.isFinite(data.idle_seconds)) throw Error('Invalid response');
      if((storedId && String(data.user_id)!==storedId) || (expectedId && String(data.user_id)!==expectedId) || ((expectedIdentity||s.identity) && data.identity!==(expectedIdentity||s.identity)) || (route && route[1]==='admin' && data.role!=='Admin')) {logout('different-user');return false;}
      const remaining=(data.expires_at-data.server_time)*1000;
      if(remaining<=0){logout('expired');return false;}
      s.limit=data.idle_seconds*1000;
      if(expectedIdentity) s.lastActivity=Date.now();
      if(!s.identity) s.renewed=s.lastActivity;
      s.identity=data.identity; s.account=String(data.user_id); s.deadline=Date.now()+remaining;
      if(renew) s.renewed=activityAt;
      if(!storedId)sessionStorage.setItem('id',String(data.user_id));
      s.locked=false;setUser(data.identity);setLogoutReason(null);setWarning(false);return true;
    } catch(e) {if(generation===s.generation) logout('offline');return false;}
    finally {clearTimeout(timeout);if(generation===s.generation)s.controller=null;}
  },[logout]);
  const verifyForSave=useCallback(()=>{
    const s=state.current;
    if(s.locked)return Promise.resolve(false);
    if(Date.now()-s.lastActivity>=s.limit || !s.deadline || Date.now()>=s.deadline){logout('expired');return Promise.resolve(false);}
    return check(false);
  },[check,logout]);
  const stayActive=useCallback(()=>{state.current.lastActivity=Date.now();return check(true);},[check]);
  const signOut=useCallback(async()=>{
    logout('checking');
    try {
      const response=await fetch(`${apiBase}/session/logout`,{method:'POST',credentials:'include',headers:{'X-KPD-Logout':'1'},signal:AbortSignal.timeout(10000)});
      if(!response.ok) throw Error('Logout failed');
      ['id','firstName','lastName','email'].forEach(key=>sessionStorage.removeItem(key));
      window.location.assign('/');
    } catch(e){logout('offline');}
  },[logout]);
  useEffect(()=>{
    let lastCheck=0;
    const activity=e=>{
      const s=state.current, now=Date.now();
      if(!e.isTrusted || s.locked)return;
      if(s.deadline && (now>=s.deadline || now-s.lastActivity>=s.limit)){logout('expired');return;}
      s.lastActivity=now;
      // Report activity near expiry immediately instead of waiting for the heartbeat.
      if(s.deadline && s.deadline-now<=60000 && !s.controller)check(true);
    };
    const tick=()=>{
      if(!sessionStorage.getItem('id') && !/^\/(account|admin)\/\d+/.test(window.location.pathname))return;
      const s=state.current, now=Date.now();
      if(s.locked)return;
      if((s.deadline && now>=s.deadline) || now-s.lastActivity>=s.limit){logout('expired');return;}
      setWarning(s.deadline>0 && Math.min(s.deadline,s.lastActivity+s.limit)-now<=Math.min(120000,s.limit/10));
      if(!s.controller && document.visibilityState==='visible' && now-lastCheck>=30000){lastCheck=now;check(!!s.deadline && s.lastActivity>s.renewed);}
    };
    const resume=()=>{
      if(document.visibilityState!=='visible'||!sessionStorage.getItem('id'))return;
      const s=state.current;
      if(s.locked)return;
      if(Date.now()-s.lastActivity>=s.limit || (s.deadline && Date.now()>=s.deadline)){logout('expired');return;}
      logout('checking');check(false);
    };
    const events=['pointerdown','keydown','scroll','touchstart'];
    events.forEach(n=>window.addEventListener(n,activity,true));
    document.addEventListener('visibilitychange',resume);window.addEventListener('focus',resume);
    const timer=setInterval(tick,1000);
    if(sessionStorage.getItem('id') || /^\/(account|admin)\/\d+/.test(window.location.pathname)){logout('checking');check(false);}
    return ()=>{clearInterval(timer);events.forEach(n=>window.removeEventListener(n,activity,true));document.removeEventListener('visibilitychange',resume);window.removeEventListener('focus',resume);state.current.generation++;if(state.current.controller)state.current.controller.abort();};
  },[check,logout]);
  return <AuthContext.Provider value={{user,setUser,logout,logoutReason,warning,check,verifyForSave,stayActive,signOut,identity:state.current.identity,account:state.current.account}}><FormLeaveProvider navigationHistory={navigationHistory}>{children}</FormLeaveProvider></AuthContext.Provider>;
}
export function SessionContent({children}) {
  const {logoutReason,account}=React.useContext(AuthContext);
  const route=window.location.pathname.match(/^\/(account|admin)\/(\d+)/);
  if((route || sessionStorage.getItem('id')) && !account)return null;
  if(route && account!==route[2])return <p>Open the account you signed in with.</p>;
  return <div inert={logoutReason?'':undefined} aria-hidden={logoutReason?'true':undefined} style={logoutReason?{visibility:'hidden',pointerEvents:'none'}:undefined}>{children}</div>;
}
