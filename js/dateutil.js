// dateutil.js
(function(global){
  function parts(date){
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' });
    return fmt.format(date); // YYYY-MM-DD
  }
  function todayKST(){
    return parts(new Date());
  }
  function dateToIndex(dateStr){
    // days since 1970-01-01 in KST
    const [y,m,d] = dateStr.split('-').map(Number);
    // treat as KST midnight -> UTC-9
    const utc = Date.UTC(y, m-1, d, 0,0,0) - 9*3600*1000; // KST midnight in UTC ms? Actually KST = UTC+9, so KST midnight = UTC previous day 15:00
    // Simpler: use UTC date of KST day
    return Math.floor((Date.UTC(y,m-1,d) ) / 86400000);
  }
  function indexToDate(idx){
    const ms = idx * 86400000;
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth()+1).padStart(2,'0');
    const dd = String(d.getUTCDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  }
  function addDays(dateStr, n){
    return indexToDate(dateToIndex(dateStr)+n);
  }
  function daysBetween(a,b){ return dateToIndex(b)-dateToIndex(a); }
  global.DateUtil = { todayKST, dateToIndex, indexToDate, addDays, daysBetween };
})(window);
