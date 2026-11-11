// tests/validate-data.js
const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..');

function fail(msg){ console.error('FAIL:', msg); process.exitCode = 1; }
function ok(msg){ console.log('OK:', msg); }

// vocabulary
const vocab = JSON.parse(fs.readFileSync(path.join(base,'data','vocabulary.json'),'utf8'));
const words = vocab.words || [];
console.log('vocab count:', words.length);
if(words.length < 300) fail('vocabulary words < 300');
const ids = new Set();
const wordSet = new Set();
words.forEach((w,i)=>{
  if(!w.id) fail(`missing id at ${i}`);
  if(ids.has(w.id)) fail(`duplicate id ${w.id}`);
  ids.add(w.id);
  if(!w.word || !w.meaning) fail(`missing word/meaning ${w.id}`);
  if(!w.pos) fail(`missing pos ${w.id}`);
  if(!w.example || !w.exampleMeaning) fail(`missing example ${w.id}`);
  if(typeof w.difficulty !== 'string' && typeof w.difficulty !== 'number') fail(`bad difficulty ${w.id}`);
  const lw = w.word.toLowerCase();
  if(wordSet.has(lw)) fail(`duplicate word ${w.word}`);
  wordSet.add(lw);
});
// category check
const cats = new Set(words.map(w=>w.category));
console.log('categories:', [...cats].join(', '));
ok('vocabulary validation done');

// math config
const mc = JSON.parse(fs.readFileSync(path.join(base,'data','math-config.json'),'utf8'));
if(!Array.isArray(mc.units)) fail('units missing');
if(mc.problemsPerDay !== 20) fail('problemsPerDay != 20');
const totalDiff = (mc.difficulty.easy||0)+(mc.difficulty.normal||0)+(mc.difficulty.hard||0);
if(totalDiff !== 20) fail('difficulty counts sum != 20');
ok('math-config validation done');

if(process.exitCode) process.exit(process.exitCode);
