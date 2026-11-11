// english.js
(function(global){
  let VOCAB = null;
  function setVocab(v){ VOCAB=v; }
  function words(){ return (VOCAB && VOCAB.words) ? VOCAB.words : []; }
  function wordById(id){ return words().find(w=>w.id===id); }
  function sortedWords(){ return words().slice().sort((a,b)=> (a.difficulty||1)-(b.difficulty||1) || a.id.localeCompare(b.id)); }

  function today(){ return global.DateUtil.todayKST(); }

  function ensureSet(date){
    const st = global.Storage.get();
    if(st.engSets[date]) return st.engSets[date];
    const newSel = selectNewWords(date);
    const reviewIds = newSel.ids.length ? getDueReviews(date, newSel.ids) : getDueReviews(date, []);
    const set = {
      date,
      contentVersion: global.Storage.CONTENT_VERSION,
      newWordIds: newSel.ids,
      reviewWordIds: reviewIds,
      reviewMode: newSel.reviewMode,
      progress: {},
      currentIndex: 0,
      completed: false,
      startedAt: new Date().toISOString()
    };
    [...newSel.ids, ...reviewIds].forEach(id=>{ set.progress[id] = { stage:0, practiced:false, noHintCorrect:false, attempts:0, hintUsed:false, fullSubmitted:false }; });
    global.Storage.update(d=>{ d.engSets[date]=set; });
    return set;
  }

  function selectNewWords(date){
    const st = global.Storage.get();
    const learned = st.vocabProgress.learned || {};
    const unlearned = sortedWords().filter(w=>!learned[w.id]);
    if(unlearned.length===0){
      // 전체 단어 복습 모드: 앞에서 10개씩 순환
      const idx = (global.DateUtil.dateToIndex(date) * 10) % Math.max(1, sortedWords().length);
      const slice = sortedWords().slice(idx, idx+10);
      const ids = (slice.length>=10? slice : sortedWords().slice(0,10)).map(w=>w.id);
      return { ids, reviewMode: true };
    }
    return { ids: unlearned.slice(0,10).map(w=>w.id), reviewMode:false };
  }
  function getDueReviews(date, exclude){
    const st = global.Storage.get();
    const vp = (st.vocabProgress && st.vocabProgress.review) || {};
    const ex = new Set(exclude);
    const due = [];
    Object.keys(vp).forEach(id=>{
      if(ex.has(id)) return;
      const info = vp[id];
      if(info && Array.isArray(info.due) && info.due.includes(date)) due.push(id);
    });
    return due;
  }

  function markPracticed(wordId, date, noHint){
    global.Storage.update(d=>{
      const vp = d.vocabProgress;
      vp.learned = vp.learned || {};
      if(!vp.learned[wordId]) vp.learned[wordId] = date;
      vp.review = vp.review || {};
      if(!vp.review[wordId]){
        // schedule +1,+3,+7
        vp.review[wordId] = { due: [global.DateUtil.addDays(date,1), global.DateUtil.addDays(date,3), global.DateUtil.addDays(date,7)], wrongCount:0 };
      }
    });
    // update set progress
    global.Storage.update(d=>{
      const set = d.engSets[date];
      if(set && set.progress[wordId]){
        set.progress[wordId].practiced = true;
        if(noHint) set.progress[wordId].noHintCorrect = true;
      }
    });
  }

  function markWrong(wordId, date){
    global.Storage.update(d=>{
      const vp = d.vocabProgress;
      vp.review = vp.review || {};
      if(!vp.review[wordId]) vp.review[wordId] = { due:[], wrongCount:0 };
      const info = vp.review[wordId];
      info.wrongCount = (info.wrongCount||0)+1;
      const tomorrow = global.DateUtil.addDays(date,1);
      if(!info.due.includes(tomorrow)) info.due.push(tomorrow);
      // eng wrong counter
      d.reviewEngWrong = d.reviewEngWrong || {};
      d.reviewEngWrong[wordId] = (d.reviewEngWrong[wordId]||0)+1;
    });
  }

  function markHint(wordId, date){
    global.Storage.update(d=>{
      const set = d.engSets[date];
      if(set && set.progress[wordId]) set.progress[wordId].hintUsed = true;
    });
  }

  function recordFullAttempt(wordId, date, correct, hintUsed, noHintCorrect){
    global.Storage.update(d=>{
      const set = d.engSets[date];
      if(set && set.progress[wordId]){
        const p = set.progress[wordId];
        p.attempts = (p.attempts||0)+1;
        p.fullSubmitted = true;
        p.practiced = true;
        if(correct){
          p.noHintCorrect = p.noHintCorrect || (noHintCorrect && !hintUsed);
        }
        if(hintUsed) p.hintUsed = true;
      }
    });
    if(correct){
      markPracticed(wordId, date, noHintCorrect && !hintUsed);
    } else {
      markWrong(wordId, date);
    }
  }

  function fillPattern(word){
    // hide ~40% of letters, not all; keep first? hide random internal
    const chars = word.split('');
    const hideCount = Math.max(1, Math.floor(chars.length*0.4));
    const indices = [];
    for(let i=1;i<chars.length;i++) indices.push(i);
    // shuffle
    for(let i=indices.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [indices[i],indices[j]]=[indices[j],indices[i]]; }
    const hide = new Set(indices.slice(0,hideCount));
    return chars.map((c,i)=> hide.has(i) ? {hidden:true, char:c} : {hidden:false, char:c});
  }

  function spellingDiff(answer, input){
    const a = answer.toLowerCase().trim();
    const b = input.toLowerCase().trim();
    // returns array of {char, status:'ok'|'wrong'|'missing'|'extra'}
    const res = [];
    const max = Math.max(a.length, b.length);
    for(let i=0;i<max;i++){
      if(i < a.length && i < b.length){
        if(a[i]===b[i]) res.push({char:b[i], status:'ok'});
        else res.push({char:b[i], status:'wrong', expected:a[i]});
      } else if(i < a.length){
        res.push({char:'_', status:'missing', expected:a[i]});
      } else {
        res.push({char:b[i], status:'extra'});
      }
    }
    return res;
  }

  function progressSummary(date){
    const set = ensureSet(date);
    const ids = [...set.newWordIds, ...set.reviewWordIds];
    let practiced=0;
    ids.forEach(id=>{ if(set.progress[id] && set.progress[id].practiced) practiced++; });
    return { total: ids.length, practiced };
  }

  global.English = {
    setVocab, words, wordById, sortedWords, ensureSet, selectNewWords,
    markPracticed, markWrong, markHint, recordFullAttempt, fillPattern,
    spellingDiff, progressSummary, VOCAB: ()=>VOCAB
  };
})(window);
