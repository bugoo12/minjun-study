// calendar.js
(function(global){
  function monthName(y,m){ return `${y}년 ${m}월`; }
  function daysInMonth(y,m){ return new Date(y, m, 0).getDate(); }
  function firstDay(y,m){ return new Date(y, m-1, 1).getDay(); } // 0 Sun

  function statusForDate(date){
    const st = global.Storage.get();
    const ms = st.mathSets[date];
    const es = st.engSets[date];
    const mathDone = !!(ms && ms.completed);
    const engDone = !!(es && es.completed);
    const mathProgress = ms ? countMathDone(ms) : 0;
    const engProgress = es ? (global.English? global.English.progressSummary(date).practiced : 0) : 0;
    if(mathDone && engDone) return 'done';
    if(mathProgress>0 || engProgress>0) return 'partial';
    return 'none';
  }
  function countMathDone(ms){
    if(!ms || !ms.answers) return 0;
    return Object.keys(ms.answers).filter(id=> ms.answers[id] && ms.answers[id].completed).length;
  }

  function render(container, year, month, onSelect){
    container.innerHTML = '';
    const head = document.createElement('div');
    head.className='cal-head-row';
    // weekday headers
    const weekdays = ['일','월','화','수','목','금','토'];
    weekdays.forEach(w=>{
      const c=document.createElement('div'); c.className='cal-head'; c.textContent=w; container.appendChild(c);
    });
    const first = firstDay(year,month);
    const dim = daysInMonth(year,month);
    // empty cells
    for(let i=0;i<first;i++){
      const c=document.createElement('div'); c.className='cal-cell empty'; container.appendChild(c);
    }
    const today = global.DateUtil.todayKST();
    for(let d=1; d<=dim; d++){
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cell = document.createElement('div');
      cell.className='cal-cell';
      const st = statusForDate(dateStr);
      if(st==='done') cell.classList.add('done');
      if(st==='partial') cell.classList.add('partial');
      if(dateStr===today) cell.classList.add('today');
      cell.innerHTML = `<div>${d}</div><div class="status">${st==='done'?'완료':(st==='partial'?'진행':'')}</div>`;
      cell.addEventListener('click', ()=>{ if(onSelect) onSelect(dateStr); });
      container.appendChild(cell);
    }
  }

  global.Calendar = { render, statusForDate };
})(window);
