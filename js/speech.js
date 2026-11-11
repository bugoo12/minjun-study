// speech.js
(function(global){
  const synth = window.speechSynthesis || null;
  let voices = [];
  let selectedVoice = null;
  let repeatTimer = null;
  let currentUtterance = null;

  function loadVoices(){
    if(!synth) return [];
    voices = synth.getVoices() || [];
    const settings=global.Storage.get().settings;
    if(!selectedVoice) selectedVoice=voices.find(v=>v.name===settings.voiceName && v.lang===settings.voiceLang)||suggestVoice();
    return voices;
  }
  function isFemaleGoogle(v){
    const n = (v.name||'').toLowerCase();
    if(!n.includes('google')) return false;
    // explicit female markers
    if(n.includes('female')) return true;
    if(n.includes('woman')) return true;
    // known google female voices
    if(n.includes('google uk english female')) return true;
    if(n.includes('google us english female')) return true; // some platforms
    return false;
  }
  function englishVoices(){
    return voices.filter(v=> (v.lang||'').toLowerCase().startsWith('en'));
  }
  function suggestVoice(){
    const ev = englishVoices();
    // prefer google female
    const gf = ev.find(isFemaleGoogle);
    if(gf) return gf;
    // otherwise first english
    return ev.length? ev[0] : null;
  }
  function setVoiceByName(name, lang){
    const v = voices.find(x=>x.name===name && (!lang || x.lang===lang));
    if(v){ selectedVoice=v; return v; }
    return null;
  }
  function getSelected(){ return selectedVoice; }
  function cancel(){
    if(repeatTimer){ clearTimeout(repeatTimer); repeatTimer=null; }
    if(synth){ try { synth.cancel(); } catch(e){} }
    currentUtterance=null;
  }
  function speak(text, opts){
    opts = opts||{};
    if(!synth){ throw new Error('이 브라우저는 음성 재생을 지원하지 않습니다.'); }
    cancel();
    return new Promise((resolve,reject)=>{
      const u = new SpeechSynthesisUtterance(text);
      u.lang = (selectedVoice && selectedVoice.lang) || 'en-US';
      if(selectedVoice) u.voice = selectedVoice;
      u.rate = opts.rate || (global.Storage? (global.Storage.get().settings.rate||1.0) : 1.0);
      if(opts.slow) u.rate = Math.max(0.5, u.rate*0.6);
      u.onend = ()=>{ currentUtterance=null; resolve(); };
      u.onerror = (e)=>{ currentUtterance=null; reject(e); };
      currentUtterance = u;
      try { synth.speak(u); } catch(e){ reject(e); }
    });
  }
  async function speakRepeat(text, times, opts){
    times = times||1;
    for(let i=0;i<times;i++){
      if(opts && opts.stopFlag && opts.stopFlag()){ return; }
      await speak(text, opts);
      if(i < times-1){
        await new Promise(res=>{ repeatTimer=setTimeout(res, 600); });
      }
    }
  }
  function playAudio(url){
    return new Promise((resolve,reject)=>{
      const audio = new Audio(url);
      audio.onended = ()=>resolve();
      audio.onerror = (e)=>reject(e);
      audio.play().catch(reject);
    });
  }
  function shadow(text, delaySec){
    // play -> wait delay -> play again
    cancel();
    const delay = (delaySec||3)*1000;
    speak(text, {}).then(()=>{
      repeatTimer = setTimeout(()=>{ speak(text, {}).catch(()=>{}); }, delay);
    }).catch(()=>{});
  }
  // voiceschanged
  if(synth){
    loadVoices();
    synth.onvoiceschanged = ()=>{ loadVoices(); try { if(window.currentView==='settings') window.Settings.populateVoiceSelect(document.getElementById('set-voice')); } catch(e){} };
    // also delayed loads
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1500);
  }
  global.Speech = {
    synth, loadVoices, englishVoices, isFemaleGoogle, suggestVoice,
    setVoiceByName, getSelected, cancel, speak, speakRepeat, shadow, playAudio
  };
})(window);

