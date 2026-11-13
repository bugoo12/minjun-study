// app.js
(function(){
  const global = window;

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  global.escapeHtml = escapeHtml;

  let currentView = 'home';
  let calYear, calMonth;

  async function init(){
    // load data
    try {
      const res = await fetch('data/math-config.json');
      global.MathConfig = await res.json();
    } catch(e){ console.error(e); global.MathConfig = { units:[], problemsPerDay:20 }; }
    try {
      const res = await fetch('data/vocabulary.json');
      const v = await res.json();
      global.VocabData = v;
      global.English.setVocab(v);
    } catch(e){ console.error(e); global.VocabData = {words:[]}; global.English.setVocab(global.VocabData); }

    try {
      const res=await fetch('data/daily-plan.json',{cache:'no-store'});
      if(res.ok) global.DailyPlan=await res.json();
    } catch(e) { /* Date-based local lessons work even offline. */ }

    // settings units defaults from config
    const st = global.Storage.get();
    if(global.MathConfig.units){
      global.MathConfig.units.forEach(u=>{
        if(st.settings.units[u.id] === undefined) st.settings.units[u.id] = u.enabledByDefault !== false;
      });
      global.Storage.save();
    }

    // calendar init
    const t = global.DateUtil.todayKST();
    const [y,m] = t.split('-');
    calYear = Number(y); calMonth = Number(m);

    bindNav();
    bindHome();
    bindCalendar();
    bindSettings();

    // voices
    setTimeout(()=>{ try { global.Speech.loadVoices(); } catch(e){} }, 300);
    setTimeout(()=>{ try { global.Speech.loadVoices(); } catch(e){} }, 1500);

    showView('home');
    renderHome();
    let activeDate = t;
    function checkDay(){
      const next = global.DateUtil.todayKST();
      if(next === activeDate) return;
      activeDate = next;
      global.Speech.cancel();
      document.getElementById('eng-detail').classList.add('hidden');
      showView('home');
      document.getElementById('home-status').textContent = '새 날짜의 공부가 준비됐어요. 어제 기록은 학습 달력에 보관돼요.';
    }
    setInterval(checkDay, 1000);
    document.addEventListener('visibilitychange', checkDay);
    window.addEventListener('focus', checkDay);
  }

  function showView(name){
    global.currentView = name;
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view-'+name).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b=>{
      b.classList.toggle('active', b.dataset.view===name);
      if(b.dataset.view===name) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
    });
    currentView = name;
    // cancel speech on nav
    try { global.Speech.cancel(); } catch(e){}
    if(name==='home') renderHome();
    if(name==='math') renderMath();
    if(name==='english') renderEnglish();
    if(name==='review') renderReview();
    if(name==='calendar') renderCalendarView();
    if(name==='settings'){ global.Settings.loadSettingsToUI(); }
  }

  function bindNav(){
    document.querySelectorAll('.nav-btn').forEach(b=>{
      b.addEventListener('click', ()=> showView(b.dataset.view));
    });
  }

  // ---------- Home ----------
  function renderHome(){
    const date = global.DateUtil.todayKST();
    document.getElementById('home-date').textContent = date;
    const plan=global.DailyPlan;
    document.getElementById('daily-note').textContent=plan && plan.date===date ? plan.message : '5문제씩 천천히 풀고 잠깐 쉬어 가요. 영어는 가리고 직접 써 봐요.';
    const ms = ensureMathSet(date);
    const es = global.English.ensureSet(date);
    const mathDone = Object.values(ms.answers).filter(a=>a.completed).length;
    const engSum = global.English.progressSummary(date);
    document.getElementById('home-math-progress').textContent = `${mathDone} / ${ms.problems.length}`;
    document.getElementById('home-math-bar').style.width = (mathDone/ms.problems.length*100)+'%';
    document.getElementById('home-eng-progress').textContent = `${engSum.practiced} / ${engSum.total}`;
    document.getElementById('home-eng-bar').style.width = (engSum.total? engSum.practiced/engSum.total*100 : 0)+'%';
    // review count
    const st = global.Storage.get();
    const reviewMathCount = (st.reviewMath||[]).length;
    const reviewEngCount = Object.keys(st.reviewEngWrong||{}).length;
    document.getElementById('home-review-count').textContent = reviewMathCount + reviewEngCount;
    // streak
    document.getElementById('home-streak').textContent = computeStreak();
    // status
    const prevIncomplete = findPreviousIncomplete(date);
    const statusEl = document.getElementById('home-status');
    if(prevIncomplete){
      statusEl.textContent = `${prevIncomplete} 학습이 아직 끝나지 않았어요. 이어서 공부할 수 있어요.`;
    } else {
      statusEl.textContent = '오늘도 차근차근 공부해 봐요!';
    }
  }
  function computeStreak(){
    const st = global.Storage.get();
    const today = global.DateUtil.todayKST();
    let streak=0;
    let d = today;
    while(true){
      const ms = st.mathSets[d];
      const es = st.engSets[d];
      const mathDone = ms && ms.completed;
      const engDone = es && es.completed;
      if(mathDone || engDone){ streak++; d = global.DateUtil.addDays(d,-1); }
      else break;
      if(streak>365) break;
    }
    return streak;
  }
  function findPreviousIncomplete(today){
    const st = global.Storage.get();
    const prev = global.DateUtil.addDays(today,-1);
    const ms = st.mathSets[prev];
    const es = st.engSets[prev];
    if((ms && !ms.completed) || (es && !es.completed)) return prev;
    return null;
  }
  function bindHome(){
    document.getElementById('home-continue').addEventListener('click', ()=>{
      // go to first incomplete
      const date = global.DateUtil.todayKST();
      const ms = global.Storage.get().mathSets[date];
      // if math incomplete go math else english
      if(ms && !ms.completed) showView('math');
      else showView('english');
    });
  }

  // ---------- Math ----------
  function unitName(id){
    const u = (global.MathConfig.units||[]).find(x=>x.id===id);
    return u? u.name : id;
  }
  function diffLabel(d){ return d==='easy'?'쉬움': d==='hard'?'도전':'보통'; }

  function ensureMathSet(date){
    const st = global.Storage.get();
    if(st.mathSets[date]){
      return st.mathSets[date];
    }
    const settings = JSON.parse(JSON.stringify(st.settings));
    const cfg = global.MathConfig;
    const wmap = {};
    (cfg.units||[]).forEach(u=>{ wmap[u.id]=u.weight; });
    const unitIds=(cfg.units||[]).map(u=>u.id);
    const planned=global.DailyPlan;
    const focus=(planned && planned.date===date && unitIds.includes(planned.focusUnit)) ? planned.focusUnit : unitIds[global.DateUtil.dateToIndex(date)%unitIds.length];
    if(focus) wmap[focus]=8;
    settings._weights = wmap;
    settings._problemsPerDay = cfg.problemsPerDay || 20;
    // enabled units respect settings.units
    const problems = global.MathGen.generate(date, settings);
    const set = { date, contentVersion: global.Storage.CONTENT_VERSION, problems, answers:{}, currentIndex:0, completed:false };
    problems.forEach(p=>{ set.answers[p.id] = { firstCorrect:null, attempts:0, hintUsed:false, completed:false, lastAnswer:null }; });
    global.Storage.update(d=>{ d.mathSets[date]=set; });
    return set;
  }

  function renderMath(){
    const date = global.DateUtil.todayKST();
    const set = ensureMathSet(date);
    document.getElementById('math-meta').textContent = `${date} · ${set.problems.length}문제 · 4묶음`;
    updateMathProgress(set);
    const groupsEl = document.getElementById('math-groups');
    groupsEl.innerHTML = '';
    for(let g=1; g<=4; g++){
      const groupProblems = set.problems.filter(p=>p.group===g);
      const div = document.createElement('div');
      div.className = 'group';
      div.innerHTML = `<h3>${g}묶음 (${(g-1)*5+1}~${g*5}번)</h3>`;
      groupProblems.forEach((p, idx)=>{
        const num = (g-1)*5 + idx + 1;
        const ans = set.answers[p.id];
        const card = document.createElement('div');
        card.className = 'problem';
        card.id = 'prob-'+p.id;
        card.innerHTML = buildMathProblemHTML(p, num, ans);
        div.appendChild(card);
        bindMathProblem(card, p, set);
        if(ans.completed){ showSavedMathResult(p, ans); }
      });
      groupsEl.appendChild(div);
    }
    document.getElementById('math-detail').classList.add('hidden');
  }

  function buildMathProblemHTML(p, num, ans){
    let html = `<div class="problem-num">${num}번 · ${unitName(p.unit)} · ${diffLabel(p.difficulty)}</div>`;
    html += `<div class="prompt">${escapeHtml(p.prompt)}</div>`;
    if(p.figure) html += `<div class="figure">${p.figure}</div>`;
    if(p.options){
      html += `<div class="answer-row">`;
      p.options.forEach(opt=>{
        const checked = ans.lastAnswer && ans.lastAnswer.value===opt ? 'checked' : '';
        html += `<label><input type="radio" name="ans-${p.id}" value="${escapeHtml(opt)}" ${checked}/> ${escapeHtml(opt)}</label>`;
      });
      html += `</div>`;
    } else if(p.answer.kind==='fraction'){
      const la = ans.lastAnswer || {};
      html += `<div class="answer-row">
        <input type="number" class="whole" placeholder="정수" value="${escapeHtml(la.whole||'')}" />
        <div class="frac-input">
          <input type="number" class="num" placeholder="분자" value="${escapeHtml(la.num||'')}" />
          <div class="frac-line"></div>
          <input type="number" class="den" placeholder="분모" value="${escapeHtml(la.den||'')}" />
        </div>
      </div>`;
    } else {
      const la = ans.lastAnswer || {};
      html += `<div class="answer-row"><input type="text" class="ans-text" value="${escapeHtml(la.value||'')}" inputmode="decimal" /></div>`;
    }
    html += `<div class="btn-row">
      <button class="primary-btn check-btn" data-id="${p.id}">정답 확인</button>
    </div>`;
    html += `<div class="result-slot" id="result-${p.id}"></div>`;
    return html;
  }

  function bindMathProblem(card, p, set){
    const btn = card.querySelector('.check-btn');
    btn.addEventListener('click', ()=> checkMathProblem(p, card, set));
    // retry button added dynamically
  }

  function checkMathProblem(p, card, set){
    const ans = set.answers[p.id];
    let input;
    if(p.options){
      const sel = card.querySelector(`input[name="ans-${p.id}"]:checked`);
      input = { value: sel ? sel.value : '' };
      if(input.value===''){ alert('보기를 선택해 주세요.'); return; }
    } else if(p.answer.kind==='fraction'){
      input = {
        whole: card.querySelector('.whole').value.trim(),
        num: card.querySelector('.num').value.trim(),
        den: card.querySelector('.den').value.trim()
      };
      if(input.num==='' && input.den==='' && input.whole===''){ alert('답을 입력해 주세요.'); return; }
    } else {
      input = { value: card.querySelector('.ans-text').value.trim() };
      if(input.value===''){ alert('답을 입력해 주세요.'); return; }
    }
    const res = global.gradeMath(p, input);
    const firstTime = ans.attempts === 0 && !ans.completed;
    if(firstTime) ans.firstCorrect = res.correct;
    ans.attempts += 1;
    ans.completed = true;
    ans.lastAnswer = input;
    ans.lastCorrect = res.correct;
    if(!res.correct){
      addMathReview(p.id, set.date);
    }
    global.Storage.update(d=>{ d.mathSets[set.date]=set; });
    showMathResult(p, ans, res);
    // add retry button if wrong
    if(!res.correct && !card.querySelector('.retry-btn')){
      const btnRow = card.querySelector('.btn-row');
      const b = document.createElement('button');
      b.className='secondary-btn retry-btn'; b.textContent='다시 풀기';
      b.addEventListener('click', ()=>{ card.querySelector('.result-slot').innerHTML=''; });
      btnRow.appendChild(b);
    }
    updateMathProgress(set);
    renderHome();
  }

  function showSavedMathResult(p, ans){
    const slot = document.getElementById('result-'+p.id);
    if(!slot) return;
    const cls = ans.lastCorrect ? 'correct' : 'wrong';
    const icon = ans.lastCorrect ? '✅ 정답' : '❌ 다시 확인';
    slot.innerHTML = `<div class="result ${cls}"><span class="icon">${icon}</span> 이전에 푼 문제입니다.<br><strong>풀이:</strong> ${escapeHtml(p.solution)}</div>`;
  }
  function showMathResult(p, ans, res){
    const slot = document.getElementById('result-'+p.id);
    if(!slot) return;
    if(!res){
      // reconstruct? just skip
      return;
    }
    const cls = res.correct ? 'correct' : 'wrong';
    const icon = res.correct ? '✅ 정답' : '❌ 다시 확인';
    slot.innerHTML = `<div class="result ${cls}"><span class="icon">${icon}</span> ${escapeHtml(res.message||'')}<br><strong>풀이:</strong> ${escapeHtml(p.solution)}</div>`;
  }

  // gradeMath provided by math-grade.js

  function addMathReview(problemId, date){
    global.Storage.update(d=>{
      d.reviewMath = d.reviewMath || [];
      if(!d.reviewMath.find(x=>x.date===date && x.problemId===problemId)){
        d.reviewMath.push({date, problemId});
      }
    });
  }

  function updateMathProgress(set){
    const done = Object.values(set.answers).filter(a=>a.completed).length;
    const total = set.problems.length;
    const pct = total? Math.round(done/total*100) : 0;
    document.getElementById('math-progress-bar').style.width = pct+'%';
    document.getElementById('math-progress-text').textContent = `${done} / ${total}`;
    // completed flag
    if(done === total && total>0){
      global.Storage.update(d=>{ if(d.mathSets[set.date]) d.mathSets[set.date].completed = true; });
      set.completed = true;
    }
  }

  // ---------- English ----------
  function renderEnglish(){
    const date = global.DateUtil.todayKST();
    const set = global.English.ensureSet(date);
    document.getElementById('eng-list').classList.remove('hidden');
    document.getElementById('eng-meta').textContent = `${date} · 새 단어 ${set.newWordIds.length}개 · 복습 ${set.reviewWordIds.length}개${set.reviewMode?' (전체 단어 복습)':''}`;
    const sum = global.English.progressSummary(date);
    document.getElementById('eng-progress-bar').style.width = (sum.total? sum.practiced/sum.total*100 : 0)+'%';
    document.getElementById('eng-progress-text').textContent = `${sum.practiced} / ${sum.total}`;
    // list
    const listEl = document.getElementById('eng-list');
    listEl.innerHTML = '';
    const allIds = [...set.newWordIds, ...set.reviewWordIds];
    allIds.forEach(id=>{
      const w = global.English.wordById(id);
      if(!w) return;
      const p = set.progress[id];
      const card = document.createElement('div');
      card.className = 'word-card';
      const isNew = !set.reviewMode && set.newWordIds.includes(id);
      card.innerHTML = `
        <div class="word-row">
          <div>
            <span class="word-title">${escapeHtml(w.word)}</span>
            <span class="pill">${isNew?'새 단어':'복습'}</span>
            <span class="pill">${w.meaning}</span>
          </div>
          <div>${p && p.practiced ? '✅ 연습 완료' : '⬜ 미완료'}</div>
        </div>
        <div class="meta-text">${escapeHtml(w.example)} (${escapeHtml(w.exampleMeaning)})</div>
        <div class="btn-row">
          <button class="primary-btn open-eng" data-id="${id}">학습 시작</button>
        </div>
      `;
      listEl.appendChild(card);
    });
    document.getElementById('eng-detail').classList.add('hidden');
    // bind
    listEl.querySelectorAll('.open-eng').forEach(b=>{
      b.addEventListener('click', ()=> openEngWord(b.dataset.id, date));
    });
  }

  let currentEngWord = null;
  let currentEngStep = 0;
  let currentHintUsed = false;
  let currentFillPattern = null;

  function openEngWord(wordId, date){
    try { global.Speech.cancel(); } catch(e){}
    currentEngWord = wordId;
    currentEngStep = 1;
    const set = global.English.ensureSet(date);
    currentHintUsed = !!(set.progress[wordId] && set.progress[wordId].hintUsed);
    renderEngStep(date);
  }

  function renderEngStep(date){
    const w = global.English.wordById(currentEngWord);
    const set = global.English.ensureSet(date);
    const detail = document.getElementById('eng-detail');
    detail.classList.remove('hidden');
    document.getElementById('eng-list').classList.add('hidden');
    const testing=currentEngStep===2 || currentEngStep===3;
    let html = `<h3>${testing?'기억해서 써 보기':escapeHtml(w.word)} <span class="pill">${escapeHtml(w.pos)}</span></h3>`;
    html += `<p><strong>뜻:</strong> ${escapeHtml(w.meaning)}</p>`;
    if(w.icon) html += `<div style="font-size:44px;margin:8px 0;">${escapeHtml(w.icon)}</div>`;
    html += audioButtons(w, testing);
    html += `<p class="meta-text">쓰기 ${currentEngStep===1?1:2} / 2</p>`;

    if(currentEngStep===0){
      html += `<p>단어·뜻·그림을 보고 발음을 들어 보세요.</p>`;
      html += `<div class="btn-row"><button id="eng-next" class="primary-btn">다음</button></div>`;
    } else if(currentEngStep===1){
      html += `<p>발음을 듣고 따라 말한 뒤, 위 단어를 보고 한 번 써 보세요. (발음 자동 평가 없음)</p><label>보고 쓰기 <input id="copy-spell" class="spell-input" autocomplete="off" spellcheck="false" autocapitalize="none" /></label><p id="copy-result" role="status"></p>`;
      html += `<div class="btn-row"><button id="eng-shadow" class="primary-btn">따라 말하기 시작</button> <button id="eng-next" class="secondary-btn">다음</button></div>`;
    } else if(currentEngStep===2){
      currentFillPattern = global.English.fillPattern(w.word);
      html += `<p>빠진 철자를 채우세요.</p>`;
      let fillHtml = '';
      currentFillPattern.forEach((item,i)=>{
        if(item.hidden){
          fillHtml += `<input class="fill-char" data-idx="${i}" maxlength="1" style="width:42px;display:inline-block;margin:0 2px;text-align:center;font-size:20px;padding:6px;border:2px solid #d9e2f3;border-radius:8px;" />`;
        } else {
          fillHtml += `<span style="font-size:20px;margin:0 2px;color:#2e9e5b;font-weight:700;">${escapeHtml(item.char)}</span>`;
        }
      });
      html += `<div style="margin:10px 0;">${fillHtml}</div>`;
      html += `<div class="btn-row"><button id="fill-check" class="primary-btn">확인</button> <button id="eng-next" class="secondary-btn" disabled>다음</button></div>`;
      html += `<div id="fill-result" class="result-slot"></div>`;
    } else if(currentEngStep===3){
      html += `<p>단어 전체를 직접 써 보세요. (뜻이나 음성을 힌트로 사용할 수 있어요)</p>`;
      html += `<div class="btn-row"><button id="hint-btn" class="secondary-btn">힌트 보기</button></div>`;
      html += `<input id="full-spell" class="spell-input" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" />`;
      html += `<div id="hint-area" class="meta-text"></div>`;
      html += `<div class="btn-row"><button id="full-submit" class="primary-btn">정답 확인</button></div>`;
      html += `<div id="full-result" class="result-slot"></div>`;
    } else if(currentEngStep===4){
      html += `<p>결과를 확인하고, 틀렸다면 다시 도전해 보세요.</p>`;
      html += `<div id="retry-area"></div>`;
      html += `<div class="btn-row"><button id="eng-next" class="primary-btn">다음 단어로</button></div>`;
    } else {
      html += `<p>이 단어 연습을 마쳤어요!</p>`;
      html += `<div class="btn-row"><button id="eng-finish" class="primary-btn">목록으로</button></div>`;
    }

    detail.innerHTML = html;
    bindEngDetailEvents(w, date);
    detail.scrollIntoView({behavior:"smooth",block:"start"});
    const field=detail.querySelector("input"); if(field) field.focus({preventScroll:true});
  }

  function audioButtons(w, testing=false){
    return `<div class="btn-row">
      <button class="audio-btn" data-action="word">🔊 단어 듣기</button>
      ${testing?'':'<button class="audio-btn" data-action="example">🔊 예문 듣기</button>'}
      <button class="audio-btn" data-action="slow">🐢 느리게</button>
      <button class="audio-btn" data-action="repeat">🔁 3회 반복</button>
      <button class="audio-btn" data-action="shadow">🎤 따라 말하기</button>
    </div>
    ${testing?'':`<p class="meta-text">예문: ${escapeHtml(w.example)} (${escapeHtml(w.exampleMeaning)})</p>`}`;
  }

  function playWordAudio(w, mode){
    const rate = global.Storage.get().settings.rate || 1.0;
    const delay = global.Storage.get().settings.shadowDelay || 3;
    global.Speech.cancel();
    if(w.audioUrl){
      global.Speech.playAudio(w.audioUrl).catch(()=>{ fallbackSpeak(w, mode, rate, delay); });
      return;
    }
    try { fallbackSpeak(w, mode, rate, delay); }
    catch(e){ alert('음성을 재생할 수 없습니다.'); }
  }
  function fallbackSpeak(w, mode, rate, delay){
    if(mode==='word') global.Speech.speak(w.word, {rate}).catch(()=>{});
    else if(mode==='example') global.Speech.speak(w.example, {rate}).catch(()=>{});
    else if(mode==='slow') global.Speech.speak(w.word, {rate, slow:true}).catch(()=>{});
    else if(mode==='repeat') global.Speech.speakRepeat(w.word, 3, {rate}).catch(()=>{});
    else if(mode==='shadow') global.Speech.shadow(w.word, delay);
  }

  function bindEngDetailEvents(w, date){
    const detail = document.getElementById('eng-detail');
    // audio buttons
    detail.querySelectorAll('.audio-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const action = btn.dataset.action;
        playWordAudio(w, action);
      });
    });
    const nextBtn = detail.querySelector('#eng-next');
    if(nextBtn && currentEngStep!==4) nextBtn.addEventListener('click', ()=>{
      if(currentEngStep===1 && detail.querySelector('#copy-spell').value.trim().toLowerCase()!==w.word.toLowerCase()){
        detail.querySelector('#copy-result').textContent='위 단어를 보고 철자를 천천히 써 보세요.'; return;
      }
      currentEngStep = 3;
      renderEngStep(date);
    });
    const shadowBtn = detail.querySelector('#eng-shadow');
    if(shadowBtn) shadowBtn.addEventListener('click', ()=>{
      playWordAudio(w, 'shadow');
    });
    const fillCheck = detail.querySelector('#fill-check');
    if(fillCheck) fillCheck.addEventListener('click', ()=>{
      const inputs = detail.querySelectorAll('.fill-char');
      let ok = true;
      inputs.forEach(inp=>{
        const idx = Number(inp.dataset.idx);
        const expected = currentFillPattern[idx].char.toLowerCase();
        if(inp.value.trim().toLowerCase() !== expected){ ok = false; inp.style.borderColor = '#d94b4b'; }
        else inp.style.borderColor = '#2e9e5b';
      });
      const slot = detail.querySelector('#fill-result');
      if(ok){
        slot.innerHTML = `<div class="result correct"><span class="icon">✅ 정답</span> 빠진 철자를 모두 맞혔어요!</div>`;
        nextBtn.disabled=false;
      } else {
        slot.innerHTML = `<div class="result wrong"><span class="icon">❌ 다시 확인</span> 이 부분을 다시 볼까요?</div>`;
      }
    });
    const hintBtn = detail.querySelector('#hint-btn');
    if(hintBtn) hintBtn.addEventListener('click', ()=>{
      currentHintUsed = true;
      global.English.markHint(currentEngWord, date);
      const hintArea = detail.querySelector('#hint-area');
      hintArea.textContent = `힌트: 첫 글자는 "${w.word.charAt(0)}" 이고, 글자 수는 ${w.word.length}개입니다.`;
    });
    const fullSubmit = detail.querySelector('#full-submit');
    if(fullSubmit) fullSubmit.addEventListener('click', ()=>{
      const inputEl = detail.querySelector('#full-spell');
      const val = inputEl.value.trim();
      const slot = detail.querySelector('#full-result');
      if(val===''){ slot.innerHTML = `<div class="result wrong"><span class="icon">⚠️</span> 단어를 입력해 주세요.</div>`; return; }
      const correct = val.toLowerCase() === w.word.toLowerCase();
      const diff = global.English.spellingDiff(w.word, val);
      let diffHtml = '<div class="diff-display">';
      diff.forEach(d=>{
        if(d.status==='ok') diffHtml += `<span class="ok">${escapeHtml(d.char)}</span>`;
        else if(d.status==='wrong') diffHtml += `<span class="bad">${escapeHtml(d.char)}</span>`;
        else if(d.status==='missing') diffHtml += `<span class="bad">_</span>`;
        else diffHtml += `<span class="bad">${escapeHtml(d.char)}</span>`;
      });
      diffHtml += '</div>';
      const noHint = !currentHintUsed;
      global.English.recordFullAttempt(currentEngWord, date, correct, currentHintUsed, noHint);
      if(correct){
        slot.innerHTML = `<div class="result correct"><span class="icon">✅ 정답</span> 철자를 정확히 썼어요!${currentHintUsed?' (힌트 사용)':''}</div>${diffHtml}`;
        // Advance automatically after the second writing exercise.
        fullSubmit.disabled = true;
        const completedWord = currentEngWord;
        setTimeout(()=>{
          if(currentView!=='english' || currentEngWord!==completedWord || global.DateUtil.todayKST()!==date) return;
          const nextSet=global.English.ensureSet(date);
          const ids=[...nextSet.newWordIds,...nextSet.reviewWordIds];
          const nextId=ids.find(id=>id!==completedWord && !nextSet.progress[id].practiced);
          if(nextId) openEngWord(nextId,date);
          else renderEnglish();
        }, 800);
      } else {
        currentHintUsed=true;
        global.English.markHint(currentEngWord,date);
        slot.innerHTML = `<div class="result wrong"><span class="icon">❌ 이 부분을 다시 볼까요?</span> 정답을 보고 기억한 뒤 다시 써 보세요: <strong>${escapeHtml(w.word)}</strong></div>${diffHtml}
        <div class="btn-row"><button id="retry-spell" class="secondary-btn">다시 도전</button></div>`;
        const retryBtn = detail.querySelector('#retry-spell');
        if(retryBtn) retryBtn.addEventListener('click', ()=>{
          detail.querySelector('#full-result').innerHTML = '';
          inputEl.value = '';
          inputEl.focus();
        });
      }
      const sum=global.English.progressSummary(date);
      document.getElementById('eng-progress-text').textContent=`${sum.practiced} / ${sum.total}`;
      document.getElementById('eng-progress-bar').style.width=(sum.practiced/sum.total*100)+'%';
    });
    const finishBtn = detail.querySelector('#eng-finish');
    if(finishBtn) finishBtn.addEventListener('click', ()=>{ document.getElementById('eng-detail').classList.add('hidden'); renderEnglish(); });
    const nextWordBtn = detail.querySelector('#eng-next');
    // if step4, next word
    if(currentEngStep===4 && nextBtn){
      nextBtn.onclick = ()=>{
        // find next unpracticed
        const set2 = global.English.ensureSet(date);
        const ids = [...set2.newWordIds, ...set2.reviewWordIds];
        const nextId = ids.find(id=> !set2.progress[id].practiced && id!==currentEngWord);
        if(nextId){ openEngWord(nextId, date); }
        else { document.getElementById('eng-detail').classList.add('hidden'); renderEnglish(); }
      };
    }
  }

  // ---------- Review ----------
  function renderReview(){
    const date = global.DateUtil.todayKST();
    const st = global.Storage.get();
    const mathEl = document.getElementById('review-math');
    const engEl = document.getElementById('review-eng');
    // math unit first-attempt stats
    let statsHtml = '<h3>수학 단원별 첫 시도 정답률</h3><ul>';
    const unitStats = {};
    Object.keys(st.mathSets||{}).forEach(date=>{
      const ms = st.mathSets[date];
      if(!ms) return;
      ms.problems.forEach(p=>{
        const a = ms.answers[p.id];
        if(!a || a.firstCorrect===null) return;
        if(!unitStats[p.unit]) unitStats[p.unit] = {total:0, correct:0};
        unitStats[p.unit].total++;
        if(a.firstCorrect) unitStats[p.unit].correct++;
      });
    });
    Object.keys(unitStats).forEach(u=>{
      const s = unitStats[u];
      const pct = s.total? Math.round(s.correct/s.total*100) : 0;
      statsHtml += `<li>${escapeHtml(unitName(u))}: ${s.correct}/${s.total} (${pct}%)</li>`;
    });
    if(Object.keys(unitStats).length===0) statsHtml += '<li>아직 기록이 없어요.</li>';
    statsHtml += '</ul>';
    // math wrong problems
    const wrongMath = st.reviewMath || [];
    let html = statsHtml + `<h3>수학 오답 (${wrongMath.length})</h3>`;
    if(wrongMath.length===0) html += `<p>오답이 없어요! 👍</p>`;
    else {
      wrongMath.slice(-20).reverse().forEach(item=>{
        const set = st.mathSets[item.date];
        const prob = set ? set.problems.find(p=>p.id===item.problemId) : null;
        if(prob){
          html += `<div class="problem"><div class="prompt">${escapeHtml(prob.prompt)}</div><div class="meta-text">정답: ${escapeHtml(answerText(prob))} · ${escapeHtml(prob.solution)}</div></div>`;
        }
      });
    }
    mathEl.innerHTML = html;
    // eng wrong words
    const wrongEng = st.reviewEngWrong || {};
    const sorted = Object.entries(wrongEng).sort((a,b)=>b[1]-a[1]);
    let ehtml = `<h3>자주 틀리는 영어 단어 (${sorted.length})</h3>`;
    if(sorted.length===0) ehtml += `<p>틀린 단어가 없어요! 👍</p>`;
    else {
      sorted.slice(0,20).forEach(([id,count])=>{
        const w = global.English.wordById(id);
        if(w) ehtml += `<div class="word-card"><strong>${escapeHtml(w.word)}</strong> ${escapeHtml(w.meaning)} <span class="pill">${count}회</span></div>`;
      });
    }
    engEl.innerHTML = ehtml;
    document.getElementById('review-meta').textContent = `누적 오답 기준`;
  }

  function answerText(p){
    const a=p.answer;
    if(a.kind==='int') return String(a.value);
    if(a.kind==='scaled') return (a.value/a.scale).toFixed(Math.round(Math.log10(a.scale)));
    if(a.kind==='fraction') return `${a.num}/${a.den}`;
    if(a.kind==='choice') return a.value;
    return '';
  }

  // ---------- Calendar ----------
  function renderCalendarView(){
    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';
    global.Calendar.render(grid, calYear, calMonth, (dateStr)=>{
      showCalDetail(dateStr);
    });
    document.getElementById('cal-title').textContent = `${calYear}년 ${calMonth}월`;
    document.getElementById('cal-detail').innerHTML = '';
  }
  function showCalDetail(dateStr){
    const st = global.Storage.get();
    const ms = st.mathSets[dateStr];
    const es = st.engSets[dateStr];
    const el = document.getElementById('cal-detail');
    let html = `<h3>${dateStr}</h3>`;
    if(ms){
      const done = Object.values(ms.answers).filter(a=>a.completed).length;
      html += `<p>수학: ${done}/${ms.problems.length} ${ms.completed?'✅':''}</p>`;
    } else html += `<p>수학: 기록 없음</p>`;
    if(es){
      const sum = global.English.progressSummary? (es? Object.values(es.progress).filter(p=>p.practiced).length : 0) : 0;
      html += `<p>영어: ${sum}/${Object.keys(es.progress).length} ${es.completed?'✅':''}</p>`;
    } else html += `<p>영어: 기록 없음</p>`;
    el.innerHTML = html;
  }
  function bindCalendar(){
    document.getElementById('cal-prev').addEventListener('click', ()=>{
      calMonth--; if(calMonth<1){ calMonth=12; calYear--; } renderCalendarView();
    });
    document.getElementById('cal-next').addEventListener('click', ()=>{
      calMonth++; if(calMonth>12){ calMonth=1; calYear++; } renderCalendarView();
    });
  }

  // ---------- Settings ----------
  function bindSettings(){
    document.getElementById('set-easy').addEventListener('change', global.Settings.saveDifficulty);
    document.getElementById('set-normal').addEventListener('change', global.Settings.saveDifficulty);
    document.getElementById('set-hard').addEventListener('change', global.Settings.saveDifficulty);
    document.getElementById('set-rate').addEventListener('input', (e)=>{
      document.getElementById('set-rate-val').textContent = e.target.value;
      global.Storage.update(d=>{ d.settings.rate = Number(e.target.value); });
    });
    document.getElementById('set-shadow').addEventListener('change', (e)=>{
      global.Storage.update(d=>{ d.settings.shadowDelay = Number(e.target.value); });
    });
    document.getElementById('settings-units').addEventListener('change', (e)=>{
      global.Settings.saveUnitSettings();
    });
    document.getElementById('set-voice').addEventListener('change', (e)=>{
      global.Settings.applyVoiceSelection(e.target);
      global.Settings.updateVoiceInfo();
    });
    document.getElementById('voice-preview').addEventListener('click', ()=>{
      const v = global.Speech.getSelected();
      const text = 'Hello, Minjun! This is your study voice.';
      global.Speech.cancel();
      if(v) global.Speech.speak(text, {rate: global.Storage.get().settings.rate||1.0}).catch(()=>{});
      else alert('선택된 음성이 없습니다.');
    });
    document.getElementById('export-json').addEventListener('click', ()=>{
      const blob = new Blob([global.Storage.exportJSON()], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'minjun-study-backup.json';
      a.click();
      URL.revokeObjectURL(url);
    });
    document.getElementById('import-json').addEventListener('click', ()=>{
      const file = document.getElementById('import-file').files[0];
      if(!file){ alert('파일을 선택해 주세요.'); return; }
      const reader = new FileReader();
      reader.onload = (e)=>{
        try {
          global.Storage.importJSON(e.target.result);
          alert('가져오기 완료!');
          global.Settings.loadSettingsToUI();
          renderHome();
        } catch(err){
          alert('가져오기 실패: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
    document.getElementById('reset-data').addEventListener('click', ()=>{
      if(!confirm('모든 학습 기록을 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) return;
      global.Storage.reset();
      alert('기록이 초기화되었습니다.');
      renderHome();
    });
  }

  // ---------- Print ----------
  function bindMathPrint(){
    document.getElementById('math-print').addEventListener('click', ()=> printMath(false));
    document.getElementById('math-print-ans').addEventListener('click', ()=> printMath(true));
  }
  function printMath(withAnswers){
    const date = global.DateUtil.todayKST();
    const set = ensureMathSet(date);
    const target = document.getElementById(withAnswers? 'print-math-ans' : 'print-math');
    document.querySelectorAll('.print-area').forEach(e=>{ e.classList.remove('active-print'); e.innerHTML=''; });
    let html = `<div class="print-page"><div class="print-title">민준이 수학 학습지</div><div class="print-sub">${date} · 20문제</div>`;
    set.problems.forEach((p,i)=>{
      html += `<div class="print-problem no-break"><strong>${i+1}.</strong> ${escapeHtml(p.prompt)}`;
      if(p.figure) html += `<div class="print-figure">${p.figure}</div>`;
      html += `<div class="answer-line"></div></div>`;
    });
    html += `</div>`;
    if(withAnswers){
      html += `<div class="print-page"><div class="print-title">수학 정답지</div>`;
      set.problems.forEach((p,i)=>{
        html += `<div class="print-problem no-break"><strong>${i+1}.</strong> ${escapeHtml(answerText(p))} <span class="meta-text">(${escapeHtml(p.solution)})</span></div>`;
      });
      html += `</div>`;
    }
    target.innerHTML = html;
    target.classList.add('active-print');
    document.body.classList.add('print-mode');
    window.print();
    setTimeout(()=>{ document.body.classList.remove('print-mode'); document.querySelectorAll('.print-area').forEach(e=>e.classList.remove('active-print')); }, 1000);
  }
  function bindEngPrint(){
    document.getElementById('eng-print').addEventListener('click', ()=> printEng(false));
    document.getElementById('eng-print-ans').addEventListener('click', ()=> printEng(true));
  }
  function printEng(withAnswers){
    const date = global.DateUtil.todayKST();
    const set = global.English.ensureSet(date);
    const target = document.getElementById(withAnswers? 'print-eng-ans' : 'print-eng');
    document.querySelectorAll('.print-area').forEach(e=>{ e.classList.remove('active-print'); e.innerHTML=''; });
    let html = `<div class="print-page"><div class="print-title">민준이 영어 연습지</div><div class="print-sub">${date} · ${Object.keys(set.progress).length}단어</div>`;
    Object.keys(set.progress).forEach((id,i)=>{
      const w = global.English.wordById(id);
      if(!w) return;
      html += `<div class="print-problem no-break">
        <strong>${i+1}. ${escapeHtml(w.word)}</strong> - ${escapeHtml(w.meaning)}
        <div class="meta-text">${escapeHtml(w.example)}</div>
        <div>따라 쓰기: <span class="write-box" style="display:inline-block;width:60%;"></span></div>
        <div>가리고 쓰기: <span class="write-box" style="display:inline-block;width:60%;"></span></div>
      </div>`;
    });
    html += `</div>`;
    if(withAnswers){
      html += `<div class="print-page"><div class="print-title">영어 정답지</div>`;
      Object.keys(set.progress).forEach((id,i)=>{
        const w = global.English.wordById(id);
        if(!w) return;
        html += `<div class="print-problem no-break"><strong>${i+1}.</strong> ${escapeHtml(w.word)}</div>`;
      });
      html += `</div>`;
    }
    target.innerHTML = html;
    target.classList.add('active-print');
    document.body.classList.add('print-mode');
    window.print();
    setTimeout(()=>{ document.body.classList.remove('print-mode'); document.querySelectorAll('.print-area').forEach(e=>e.classList.remove('active-print')); }, 1000);
  }

  // bind print after DOM
  setTimeout(()=>{ bindMathPrint(); bindEngPrint(); }, 0);

  // expose
  global.renderHome = renderHome;
  global.ensureMathSet = ensureMathSet;

  init();
})();

