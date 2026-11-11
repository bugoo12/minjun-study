const fs = require('fs');
const path = require('path');
const vm = require('vm');
const base = path.join(__dirname, '..');

const sandbox = vm.createContext({ console, Math, Date, Intl, setTimeout, clearTimeout });
sandbox.window = sandbox;
sandbox.global = sandbox;
sandbox.self = sandbox;
const storage = {};
sandbox.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

function load(rel){ const code = fs.readFileSync(path.join(base, rel), 'utf8'); vm.runInContext(code, sandbox); }

load('js/dateutil.js');
load('js/storage.js');
load('js/math-generator.js');
load('js/math-grade.js');
load('js/english.js');

// load config/vocab
const mc = JSON.parse(fs.readFileSync(path.join(base, 'data', 'math-config.json'), 'utf8'));
const vocab = JSON.parse(fs.readFileSync(path.join(base, 'data', 'vocabulary.json'), 'utf8'));
sandbox.MathConfig = mc;
sandbox.VocabData = vocab;
sandbox.English.setVocab(vocab);

let passed = 0, failed = 0;
function assert(cond, msg){ if(cond){ passed++; } else { failed++; console.error('ASSERT FAIL:', msg); } }

// Date tests
const t = sandbox.DateUtil.todayKST();
assert(/^\d{4}-\d{2}-\d{2}$/.test(t), 'today format');
const idx = sandbox.DateUtil.dateToIndex(t);
assert(sandbox.DateUtil.indexToDate(idx) === t, 'roundtrip date');
assert(sandbox.DateUtil.addDays(t, 1) !== t, 'addDays');
assert(sandbox.DateUtil.daysBetween(t, sandbox.DateUtil.addDays(t,3)) === 3, 'daysBetween');

// Math generation determinism
const settings = JSON.parse(JSON.stringify(sandbox.Storage.get().settings));
const wmap = {}; (mc.units||[]).forEach(u=>{ wmap[u.id]=u.weight; });
settings._weights = wmap; settings._problemsPerDay = mc.problemsPerDay;
settings.units = {}; (mc.units||[]).forEach(u=>{ settings.units[u.id]=true; });
const d1 = '2025-03-15';
const p1 = sandbox.MathGen.generate(d1, settings);
const p2 = sandbox.MathGen.generate(d1, settings);
assert(p1.length === 20, '20 problems');
assert(JSON.stringify(p1) === JSON.stringify(p2), 'deterministic same date');
const p3 = sandbox.MathGen.generate('2025-03-16', settings);
assert(JSON.stringify(p1) !== JSON.stringify(p3), 'different date different set');

// Difficulty counts
const counts = {easy:0, normal:0, hard:0};
p1.forEach(p=> counts[p.difficulty]++);
assert(counts.easy === 8 && counts.normal === 8 && counts.hard === 4, 'difficulty counts 8/8/4');

// Groups
for(let g=1;g<=4;g++){ assert(p1.filter(p=>p.group===g).length===5, `group ${g} has 5`); }

// Unique ids
const ids = new Set(p1.map(p=>p.id));
assert(ids.size === 20, 'unique ids');

// Math grading
// fraction equivalent
const fracProb = { answer: { kind:'fraction', num:1, den:2, allowEquivalent:true } };
assert(sandbox.gradeMath(fracProb, {whole:'', num:'2', den:'4'}).correct === true, 'equivalent fraction');
assert(sandbox.gradeMath(fracProb, {whole:'', num:'1', den:'3'}).correct === false, 'wrong fraction');
// required denominator
const fracReq = { answer: { kind:'fraction', num:3, den:4, allowEquivalent:false, requiredDenominator:4 } };
assert(sandbox.gradeMath(fracReq, {whole:'', num:'6', den:'8'}).correct === false, 'required denom rejects equivalent');
assert(sandbox.gradeMath(fracReq, {whole:'', num:'3', den:'4'}).correct === true, 'required denom accepts');
// decimal
const decProb = { answer: { kind:'scaled', scale:100, value:123 } };
assert(sandbox.gradeMath(decProb, {value:'1.23'}).correct === true, 'decimal correct');
assert(sandbox.gradeMath(decProb, {value:'1.24'}).correct === false, 'decimal wrong');
// empty
assert(sandbox.gradeMath({answer:{kind:'int',value:5}}, {value:''}).correct === false, 'empty not correct');
// int
assert(sandbox.gradeMath({answer:{kind:'int',value:5}}, {value:'5'}).correct === true, 'int');

// spelling diff
const diff = sandbox.English.spellingDiff('apple', 'aple');
assert(Array.isArray(diff) && diff.length === 5, 'diff length');
// missing char detected
const hasMissing = diff.some(d=>d.status==='missing');
assert(hasMissing, 'missing detected');

// English assignment
const set = sandbox.English.ensureSet('2025-03-15');
assert(Array.isArray(set.newWordIds) && set.newWordIds.length <= 10, 'new words <=10');
assert(set.newWordIds.length === 10, '10 new words');
// no duplicate
assert(new Set(set.newWordIds).size === set.newWordIds.length, 'unique new words');

// validate all dates sample math generation
let bad = 0;
for(let i=0;i<30;i++){
  const d = sandbox.DateUtil.addDays('2025-01-01', i);
  const pp = sandbox.MathGen.generate(d, settings);
  if(pp.length !== 20){ bad++; console.error('bad count', d, pp.length); }
  // check each problem has answer
  pp.forEach(p=>{ if(!p.answer || !p.answer.kind){ bad++; console.error('bad answer', d, p.id); } });
  // check decimal scaled consistency
}
assert(bad === 0, '30 days generation valid');

// vocabulary validation
assert(vocab.words.length >= 300, 'vocab >=300');
const vIds = new Set(vocab.words.map(w=>w.id));
assert(vIds.size === vocab.words.length, 'unique vocab ids');

console.log(`\nTests finished: ${passed} passed, ${failed} failed`);
if(failed>0) process.exit(1);
