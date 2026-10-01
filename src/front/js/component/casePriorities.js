const active = new Set(['submitted','scanning','design','manufacturing','pre-finish','finish','ready to ship']);
export const isProductionCase = c => active.has(String(c.status || '').toLowerCase());
export const isHeld = c => Boolean(c.hold) && !['false','0','none','null'].includes(String(c.hold).trim().toLowerCase());
export function dueDay(value) {
  const match = String(value || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s|$)/);
  if (!match) return null;
  const [,m,d,y] = match.map(Number), date = new Date(Date.UTC(y,m-1,d));
  return date.getUTCFullYear()===y && date.getUTCMonth()===m-1 && date.getUTCDate()===d ? date.getTime()/86400000 : null;
}
export function todayInFlorida(now = new Date()) {
  return dueDay(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'2-digit',day:'2-digit',year:'numeric'}).format(now));
}
export function dueLabel(c, today) {
  if (!isProductionCase(c) || isHeld(c)) return '';
  const day=dueDay(c['due date']);
  if(day===null) return 'Due date needed';
  const gap=day-today;
  if(gap<0) return `Overdue ${-gap} ${gap===-1?'day':'days'}`;
  if(gap===0) return 'Due today';
  if(gap===1) return 'Due tomorrow';
  return '';
}
export function matchesPriority(c, filter, today) {
  if(filter==='all') return true;
  if(!isProductionCase(c)) return false;
  if(filter==='hold') return isHeld(c);
  if(filter==='rush') return c.production==='Rush';
  if(isHeld(c)) return false;
  const day=dueDay(c['due date']);
  return day!==null && (filter==='overdue'?day<today:filter==='today'?day===today:false);
}
