// settings.js
(function(global){
  function populateUnits(container){
    const st = global.Storage.get();
    const cfg = global.MathConfig;
    container.innerHTML = '';
    (cfg.units||[]).forEach(u=>{
      const label = document.createElement('label');
      const checked = st.settings.units[u.id] !== false;
      label.innerHTML = `<input type="checkbox" data-unit="${u.id}" ${checked?'checked':''}/> ${u.name}`;
      container.appendChild(label);
    });
  }
  function populateVoiceSelect(select){
    const voices = global.Speech.englishVoices();
    const st = global.Storage.get();
    select.innerHTML = '';
    if(voices.length===0){
      const opt = document.createElement('option');
      opt.value = ''; opt.textContent = '음성 없음 (기본)';
      select.appendChild(opt);
      return;
    }
    voices.forEach(v=>{
      const opt = document.createElement('option');
      opt.value = v.name + '||' + v.lang;
      const female = global.Speech.isFemaleGoogle(v) ? ' (Google 여성 음성)' : '';
      opt.textContent = `${v.name} (${v.lang})${female}`;
      if(st.settings.voiceName===v.name && st.settings.voiceLang===v.lang) opt.selected = true;
      select.appendChild(opt);
    });
    // suggest if none selected
    if(!st.settings.voiceName){
      const sug = global.Speech.suggestVoice();
      if(sug){
        const val = sug.name+'||'+sug.lang;
        const opt = Array.from(select.options).find(o=>o.value===val);
        if(opt) opt.selected = true;
      }
    }
  }
  function applyVoiceSelection(select){
    const val = select.value;
    if(!val){ return; }
    const [name, lang] = val.split('||');
    global.Storage.update(d=>{ d.settings.voiceName=name; d.settings.voiceLang=lang; });
    global.Speech.setVoiceByName(name, lang);
  }
  function loadSettingsToUI(){
    const st = global.Storage.get();
    document.getElementById('set-easy').value = st.settings.difficulty.easy;
    document.getElementById('set-normal').value = st.settings.difficulty.normal;
    document.getElementById('set-hard').value = st.settings.difficulty.hard;
    document.getElementById('set-rate').value = st.settings.rate;
    document.getElementById('set-rate-val').textContent = st.settings.rate;
    document.getElementById('set-shadow').value = st.settings.shadowDelay;
    populateUnits(document.getElementById('settings-units'));
    populateVoiceSelect(document.getElementById('set-voice'));
    // apply selected voice
    if(st.settings.voiceName) global.Speech.setVoiceByName(st.settings.voiceName, st.settings.voiceLang);
    updateVoiceInfo();
  }
  function updateVoiceInfo(){
    const v = global.Speech.getSelected();
    const el = document.getElementById('voice-info');
    if(v){ el.textContent = `선택된 음성: ${v.name} (${v.lang})`; }
    else { el.textContent = '선택된 음성: 없음 (기본 음성 사용)'; }
  }
  function saveUnitSettings(){
    const st = global.Storage.get();
    const cbs = document.querySelectorAll('#settings-units input[type="checkbox"]');
    global.Storage.update(d=>{
      cbs.forEach(cb=>{ d.settings.units[cb.dataset.unit] = cb.checked; });
    });
  }
  function saveDifficulty(){
    global.Storage.update(d=>{
      d.settings.difficulty.easy = Number(document.getElementById('set-easy').value)||0;
      d.settings.difficulty.normal = Number(document.getElementById('set-normal').value)||0;
      d.settings.difficulty.hard = Number(document.getElementById('set-hard').value)||0;
    });
  }
  global.Settings = {
    populateUnits, populateVoiceSelect, applyVoiceSelection, loadSettingsToUI,
    saveUnitSettings, saveDifficulty, updateVoiceInfo
  };
})(window);
