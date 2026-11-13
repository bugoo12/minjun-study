// storage.js
(function(global){
  const KEY = 'minjun-study:v1';
  const CONTENT_VERSION = '2026-11-11';

  function defaultSettings(){
    return {
      units: { fraction:true, triangle:true, decimal:true, quadrilateral:true, linegraph:true, polygon:true },
      difficulty: { easy:4, normal:4, hard:2 },
      voiceName: null,
      voiceLang: null,
      rate: 1.0,
      shadowDelay: 3
    };
  }
  function defaultData(){
    return {
      version: 1,
      contentVersion: CONTENT_VERSION,
      settings: defaultSettings(),
      mathSets: {},
      engSets: {},
      vocabProgress: { learned: {}, review: {} }, // learned: wordId -> first date; review: wordId -> {due:[dates], wrongCount}
      reviewMath: [],
      reviewEngWrong: {},
      meta: {}
    };
  }
  let cache = null;
  function load(){
    if(cache) return cache;
    try {
      const raw = localStorage.getItem(KEY);
      if(!raw){ cache = defaultData(); return cache; }
      const parsed = JSON.parse(raw);
      // merge defaults
      const d = defaultData();
      cache = Object.assign(d, parsed);
      cache.settings = Object.assign(d.settings, parsed.settings||{});
      cache.settings.units = Object.assign(d.settings.units, (parsed.settings||{}).units||{});
      cache.settings.difficulty = Object.assign(d.settings.difficulty, (parsed.settings||{}).difficulty||{});
      cache.mathSets = parsed.mathSets || {};
      cache.engSets = parsed.engSets || {};
      cache.vocabProgress = parsed.vocabProgress || d.vocabProgress;
      cache.vocabProgress.learned = cache.vocabProgress.learned || {};
      cache.vocabProgress.review = cache.vocabProgress.review || {};
      cache.reviewMath = parsed.reviewMath || [];
      cache.reviewEngWrong = parsed.reviewEngWrong || {};
      return cache;
    } catch(e){
      console.error('storage load error', e);
      cache = defaultData();
      return cache;
    }
  }
  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(cache)); }
    catch(e){ console.error('storage save error', e); }
  }
  function get(){ return load(); }
  function update(fn){ const d=load(); fn(d); save(); return d; }
  function reset(){ cache = defaultData(); save(); }
  function exportJSON(){
    return JSON.stringify(load(), null, 2);
  }
  function importJSON(text){
    const parsed = JSON.parse(text);
    if(!parsed || typeof parsed !== 'object') throw new Error('잘못된 JSON입니다.');
    // basic validation
    if(!parsed.settings) throw new Error('settings가 없습니다.');
    cache = parsed;
    // ensure defaults
    const d = defaultData();
    cache = Object.assign(d, cache);
    cache.settings = Object.assign(d.settings, cache.settings||{});
    cache.settings.units = Object.assign(d.settings.units, (cache.settings||{}).units||{});
    cache.settings.difficulty = Object.assign(d.settings.difficulty, (cache.settings||{}).difficulty||{});
    cache.mathSets = cache.mathSets || {};
    cache.engSets = cache.engSets || {};
    cache.vocabProgress = cache.vocabProgress || d.vocabProgress;
    cache.vocabProgress.learned = cache.vocabProgress.learned || {};
    cache.vocabProgress.review = cache.vocabProgress.review || {};
    cache.reviewMath = cache.reviewMath || [];
    cache.reviewEngWrong = cache.reviewEngWrong || {};
    save();
    return cache;
  }
  global.Storage = { load, get, update, save, reset, exportJSON, importJSON, KEY, CONTENT_VERSION };
})(window);

