// math-generator.js
(function(global){
  function mulberry32(seed){
    let a = seed >>> 0;
    return function(){
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h,16777619); } return h>>>0; }

  function randInt(rng, min, max){ return min + Math.floor(rng()*(max-min+1)); }
  function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }
  function shuffle(rng, arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function allocCounts(weights, total){
    const entries = Object.entries(weights);
    const sum = entries.reduce((s,[,w])=>s+w,0);
    let counts = {};
    let allocated=0;
    entries.forEach(([k,w])=>{ counts[k]=Math.floor(w/sum*total); allocated+=counts[k]; });
    // distribute remainder by largest fractional
    const rem = total-allocated;
    const frac = entries.map(([k,w])=>({k, f:(w/sum*total)-counts[k]})).sort((a,b)=>b.f-a.f);
    for(let i=0;i<rem;i++) counts[frac[i%frac.length].k]++;
    return counts;
  }

  const UNITS_META = {
    fraction: {name:'분수의 덧셈과 뺄셈'},
    triangle: {name:'삼각형'},
    decimal: {name:'소수의 덧셈과 뺄셈'},
    quadrilateral: {name:'사각형'},
    linegraph: {name:'꺾은선그래프'},
    polygon: {name:'다각형'}
  };

  // SVG helpers
  function svgWrap(inner, w=260, h=180){
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
  }
  function text(x,y,s,size=14,anchor='middle'){ return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="#1f2a44">${s}</text>`; }
  function line(x1,y1,x2,y2,stroke='#1f2a44',sw=2){ return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"/>`; }
  function circle(x,y,r,fill='#4f8cff'){ return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`; }
  function rect(x,y,w,h,fill='none',stroke='#1f2a44'){ return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`; }
  function polygon(points, fill='none', stroke='#1f2a44'){ return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`; }
  function rightAngle(x,y,size=10,dir='br'){ // square at corner
    // dir indicates quadrant of square relative to corner
    let dx=size, dy=size;
    if(dir==='br'){ return `<path d="M ${x} ${y-size} L ${x+size} ${y-size} L ${x+size} ${y}" fill="none" stroke="#1f2a44" stroke-width="1.5"/>`; }
    if(dir==='bl'){ return `<path d="M ${x} ${y-size} L ${x-size} ${y-size} L ${x-size} ${y}" fill="none" stroke="#1f2a44" stroke-width="1.5"/>`; }
    if(dir==='tr'){ return `<path d="M ${x} ${y+size} L ${x+size} ${y+size} L ${x+size} ${y}" fill="none" stroke="#1f2a44" stroke-width="1.5"/>`; }
    return `<path d="M ${x} ${y+size} L ${x-size} ${y+size} L ${x-size} ${y}" fill="none" stroke="#1f2a44" stroke-width="1.5"/>`;
  }
  function tickMark(x1,y1,x2,y2){ // midpoint perpendicular tick
    const mx=(x1+x2)/2, my=(y1+y2)/2;
    const dx=x2-x1, dy=y2-y1;
    const len=Math.hypot(dx,dy);
    const nx=-dy/len*6, ny=dx/len*6;
    return `<line x1="${mx-nx}" y1="${my-ny}" x2="${mx+nx}" y2="${my+ny}" stroke="#1f2a44" stroke-width="2"/>`;
  }

  // Fraction helpers
  function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; }
  function fracStr(n,d){ const g=gcd(n,d); n/=g; d/=g; if(d<0){n=-n;d=-d;} if(d===1) return String(n); return `${n}/${d}`; }

  // Generators return problem object (without id/group assigned later? we'll include)
  function genFraction(rng, diff){
    const types = ['calc','blank','word'];
    const type = pick(rng, types);
    if(type==='calc'){
      const dens = [2,3,4,5,6,8];
      let d1=pick(rng,dens), d2=d1;
      if(diff==='easy'){ d2=d1; }
      const n1=randInt(rng,1,d1-1), n2=randInt(rng,1,d2-1);
      const op = rng()<0.5?'+':'-';
      // ensure positive for subtraction
      let a=n1, b=d1, c=n2, d=d2;
      if(op==='-' && (a/b < c/d)){ [a,c]=[c,a]; [b,d]=[d,b]; }
      const resNum = op==='+'? a*d + c*b : a*d - c*b;
      const resDen = b*d;
      const prompt = `계산하세요: ${a}/${b} ${op} ${c}/${d} = ?`;
      return {
        unit:'fraction', difficulty:diff, type:'calc',
        prompt,
        figure:null,
        answer:{kind:'fraction', num:resNum, den:resDen, allowEquivalent:true},
        solution: `${a}/${b} ${op} ${c}/${d} = ${fracStr(resNum,resDen)}`
      };
    }
    if(type==='blank'){
      // a/b + x = c/d
      const dens=[3,4,5,6];
      const d=pick(rng,dens);
      const addN=randInt(rng,1,d-1);
      const resN=randInt(rng,addN+1,d*2);
      const missN = resN - addN;
      const prompt = `빈칸에 알맞은 분수를 쓰세요: ${addN}/${d} + □ = ${resN}/${d}`;
      return {
        unit:'fraction', difficulty:diff, type:'blank',
        prompt,
        figure:null,
        answer:{kind:'fraction', num:missN, den:d, allowEquivalent:false, requiredDenominator:d},
        solution: `□ = ${missN}/${d}`
      };
    }
    // word
    const who = pick(rng,['민준이','지우','서연']);
    const total = pick(rng,[1,2]);
    const part = pick(rng,[2,3,4]);
    // total/part? 
    const a = randInt(rng,1,part-1);
    const b = part;
    const prompt = `문장제: ${who}가 피자 한 판의 ${a}/${b}만큼 먹었습니다. 남은 양은 전체에서 얼마인가요? (분수로 쓰세요)`;
    // answer 1 - a/b
    const resNum = b - a;
    return {
      unit:'fraction', difficulty:diff, type:'word',
      prompt,
      figure:null,
      answer:{kind:'fraction', num:resNum, den:b, allowEquivalent:true},
      solution: `1 - ${a}/${b} = ${resNum}/${b}`
    };
  }

  function genDecimal(rng, diff){
    const places = diff==='easy'?1 : (diff==='hard'?2 : (rng()<0.5?1:2));
    const scale = Math.pow(10,places);
    const a = randInt(rng, 10, 99* (diff==='hard'?10:1)) ;
    // generate decimals
    const max = diff==='easy'? 50 : (diff==='hard'? 200 : 100);
    const x = randInt(rng, 5, max);
    const y = randInt(rng, 5, max);
    let op = rng()<0.5?'+':'-';
    if(op==='-' && x<y){ /* swap */ }
    const A = Math.max(x,y), B = Math.min(x,y);
    const num1 = op==='-'? A : x;
    const num2 = op==='-'? B : y;
    const resScaled = op==='+'? x+y : A-B;
    const fmt = (n)=> (n/scale).toFixed(places);
    const prompt = `계산하세요: ${fmt(num1)} ${op} ${fmt(num2)} = ?`;
    return {
      unit:'decimal', difficulty:diff, type:'calc',
      prompt,
      figure:null,
      answer:{kind:'scaled', scale:scale, value:resScaled},
      solution: `${fmt(num1)} ${op} ${fmt(num2)} = ${fmt(resScaled)}`
    };
  }

  function triFigure(type, sides, angles, rightCorner){
    // type: right/equilateral/isosceles/scalene
    const W=260,H=180;
    let pts;
    if(type==='right'){
      pts=[[40,150],[40,50],[160,150]];
    } else if(type==='equilateral'){
      pts=[[130,30],[40,150],[220,150]];
    } else if(type==='isosceles'){
      pts=[[130,30],[50,150],[210,150]];
    } else {
      pts=[[60,40],[30,150],[220,140]];
    }
    let inner = '';
    inner += polygon(pts.map(p=>p.join(',')).join(' '));
    if(sides){
      for(let i=0;i<pts.length;i++){
        const a=pts[i], b=pts[(i+1)%pts.length];
        const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
        inner += text(mx, my-6, String(sides[i])+'cm', 13);
      }
    }
    if(rightCorner!=null){
      inner += rightAngle(pts[rightCorner][0], pts[rightCorner][1], 12, 'tr');
    }
    if(type==='equilateral' || type==='isosceles'){
      // equal side ticks on first two sides
      inner += tickMark(pts[0][0],pts[0][1],pts[1][0],pts[1][1]);
      inner += tickMark(pts[0][0],pts[0][1],pts[2][0],pts[2][1]);
    }
    // angle labels
    if(angles){
      for(let i=0;i<pts.length;i++){
        inner += text(pts[i][0]+ (i===1?-18: (i===2?18:0)), pts[i][1]+ (i===0?-8:18), angles[i]+'°', 12);
      }
    }
    return svgWrap(inner);
  }

  function genTriangle(rng, diff){
    const base=pick(rng,[40,50,60,70,80]);
    const top=180-base*2;
    const height=80*Math.tan(base*Math.PI/180);
    const scale=Math.min(1,110/height);
    const x1=130-80*scale,x2=130+80*scale,y=150-height*scale;
    let inner=polygon(`130,${y} ${x1},150 ${x2},150`);
    inner+=tickMark(130,y,x1,150)+tickMark(130,y,x2,150);
    inner+=text(x1+16,140,base+'°',12);
    inner+=text(x2-16,140,'?',12);
    return {unit:'triangle',difficulty:diff,type:'figure',
      prompt:'표시한 두 변의 길이가 같은 삼각형입니다. ? 각은 몇 도입니까?',
      figure:svgWrap(inner),answer:{kind:'int',value:base},
      solution:`이등변삼각형은 두 밑각의 크기가 같으므로 ${base}°입니다.`};
  }

  function quadFigure(type, w, h){
    const W=260,H=180;
    let inner='';
    if(type==='square'){
      inner += rect(60,40,100,100);
      inner += text(110,30,'4cm',12);
      // right angle marks at all corners
      inner += rightAngle(60,40,8,'tr');
      inner += rightAngle(160,40,8,'tl');
      inner += rightAngle(160,140,8,'bl');
      inner += rightAngle(60,140,8,'br');
      // equal ticks
      inner += tickMark(60,40,160,40);
      inner += tickMark(160,40,160,140);
    } else if(type==='rectangle'){
      inner += rect(50,50,140,80);
      inner += text(120,42,'7cm',12);
      inner += text(200,95,'4cm',12);
      inner += rightAngle(50,50,8,'tr');
      inner += rightAngle(190,50,8,'tl');
      inner += rightAngle(190,130,8,'bl');
      inner += rightAngle(50,130,8,'br');
    } else if(type==='rhombus'){
      inner += polygon('130,30 210,90 130,150 50,90');
      inner += tickMark(130,30,210,90);
      inner += tickMark(210,90,130,150);
      inner += tickMark(130,150,50,90);
      inner += tickMark(50,90,130,30);
    } else if(type==='parallelogram'){
      inner += polygon('70,40 210,40 180,140 40,140');
    } else if(type==='trapezoid'){
      inner += polygon('80,40 180,40 210,140 50,140');
    }
    return svgWrap(inner);
  }

  function genQuadrilateral(rng, diff){
    const item=pick(rng,[
      ['square','네 변의 길이가 같고 네 각이 모두 직각인 사각형은?','정사각형'],
      ['rectangle','네 각이 모두 직각이고, 이 그림에서는 이웃한 두 변의 길이가 다른 사각형은?','직사각형'],
      ['rhombus','네 변의 길이가 모두 같고 이 그림에서는 직각이 없는 사각형은?','마름모'],
      ['parallelogram','마주 보는 두 쌍의 변이 각각 평행한 사각형을 무엇이라고 하나요?','평행사변형'],
      ['trapezoid','마주 보는 한 쌍의 변이 평행한 사각형을 무엇이라고 하나요?','사다리꼴']
    ]);
    return {unit:'quadrilateral',difficulty:diff,type:'figure',prompt:item[1],
      figure:quadFigure(item[0]),options:['정사각형','직사각형','마름모','평행사변형','사다리꼴'],
      answer:{kind:'choice',value:item[2]},solution:`조건을 만족하는 사각형의 이름은 ${item[2]}입니다.`};
  }

  function lineGraphFigure(title, xLabel, yLabel, unit, data){
    // data: [{label, value}]
    const W=300,H=200;
    const margin=40;
    const plotW=W-margin*1.5, plotH=H-margin*1.5;
    const maxY=Math.max(...data.map(d=>d.value));
    const stepY = Math.ceil(maxY/5) || 1;
    const yMax = stepY*5;
    let inner='';
    // title
    inner += text(W/2, 18, title, 14);
    // axes
    inner += line(margin, H-margin, W-margin/2, H-margin); // x
    inner += line(margin, margin/2, margin, H-margin); // y
    inner += text(W/2, H-5, xLabel, 12);
    inner += text(12, margin/2-5, yLabel, 12);
    // y ticks
    for(let i=0;i<=5;i++){
      const y = H-margin - (i/5)*plotH;
      const val = Math.round(i/5*yMax);
      inner += line(margin-4, y, margin, y);
      inner += text(margin-8, y+4, String(val)+unit, 10, 'end');
    }
    // x labels
    const slot = plotW/(data.length-1||1);
    data.forEach((d,i)=>{
      const x = margin + i*slot;
      inner += text(x, H-margin+14, d.label, 10);
    });
    // points & line
    const pts = data.map((d,i)=>({x: margin + i*slot, y: H-margin - (d.value/yMax)*plotH}));
    for(let i=0;i<pts.length-1;i++){
      inner += line(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y, '#4f8cff', 2);
    }
    pts.forEach((p,i)=>{
      inner += circle(p.x, p.y, 4, '#d94b4b');
      inner += text(p.x, p.y-8, String(data[i].value), 10);
    });
    return svgWrap(inner, W, H);
  }

  function genLineGraph(rng, diff){
    const days = ['월','화','수','목','금'];
    const values = shuffle(rng, Array.from({length:26},(_,i)=>i+5));
    const data = days.map((l,i)=>({label:l, value:values[i]}));
    const fig = lineGraphFigure('주간 연필 판매량', '요일', '판매량', '개', data);
    const askType = pick(rng, ['value','max','sum']);
    if(askType==='value'){
      const idx = randInt(rng,0,data.length-1);
      return {
        unit:'linegraph', difficulty:diff, type:'figure',
        prompt: `${days[idx]}요일에 판매한 연필은 몇 개입니까?`,
        figure: fig,
        answer:{kind:'int', value:data[idx].value},
        solution: `그래프에서 ${days[idx]}요일 점의 값은 ${data[idx].value}입니다.`
      };
    }
    if(askType==='max'){
      let maxI=0; data.forEach((d,i)=>{ if(d.value>data[maxI].value) maxI=i; });
      return {
        unit:'linegraph', difficulty:diff, type:'figure',
        prompt: '가장 많이 판매한 요일은 언제입니까? (요일로 쓰세요)',
        figure: fig,
        options: days.map(d=>d+'요일'),
        answer:{kind:'choice', value: days[maxI]+'요일'},
        solution: `${days[maxI]}요일에 ${data[maxI].value}개로 가장 많습니다.`
      };
    }
    // sum first 3
    const sum = data[0].value+data[1].value+data[2].value;
    return {
      unit:'linegraph', difficulty:diff, type:'calc',
      prompt: '월요일부터 수요일까지 판매한 연필의 총 개수는 몇 개입니까?',
      figure: fig,
      answer:{kind:'int', value:sum},
      solution: `${data[0].value}+${data[1].value}+${data[2].value} = ${sum}`
    };
  }

  function polygonFigure(name, n){
    const W=260,H=200; const cx=130, cy=100, r=70;
    let pts=[];
    for(let i=0;i<n;i++){
      const ang = -Math.PI/2 + (2*Math.PI*i)/n;
      pts.push([cx+r*Math.cos(ang), cy+r*Math.sin(ang)]);
    }
    let inner = polygon(pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' '), 'none');
    inner += text(cx, 24, name, 14);
    return svgWrap(inner);
  }
  function genPolygon(rng, diff){
    const n=randInt(rng,5,8), names={5:'오각형',6:'육각형',7:'칠각형',8:'팔각형'};
    const fig=polygonFigure('',n);
    if(diff==='easy') return {unit:'polygon',difficulty:diff,type:'figure',prompt:'그림의 다각형 이름은 무엇인가요?',figure:fig,options:Object.values(names),answer:{kind:'choice',value:names[n]},solution:`변이 ${n}개이므로 ${names[n]}입니다.`};
    return {unit:'polygon',difficulty:diff,type:'figure',prompt:'그림의 한 꼭짓점에서 그을 수 있는 대각선은 몇 개인가요?',figure:fig,answer:{kind:'int',value:n-3},solution:`꼭짓점 ${n}개 중 자기 자신과 이웃한 두 꼭짓점을 제외하면 ${n-3}개입니다. 그림에 직접 선을 그어 확인해 보세요.`};
  }

  const GEN = {
    fraction: genFraction,
    triangle: genTriangle,
    decimal: genDecimal,
    quadrilateral: genQuadrilateral,
    linegraph: genLineGraph,
    polygon: genPolygon
  };

  function generate(dateStr, settings){
    const dateIndex = global.DateUtil.dateToIndex(dateStr);
    const seed = (dateIndex*1000003 + hashStr(JSON.stringify(settings))) >>> 0;
    const rng = mulberry32(seed);
    const enabledUnits = Object.keys(settings.units||{}).filter(u=>settings.units[u]);
    const weights = {};
    // read weights from config? passed in settings? We'll accept config via settings._weights or default
    const wmap = settings._weights || {fraction:4,triangle:3,decimal:4,quadrilateral:3,linegraph:3,polygon:3};
    enabledUnits.forEach(u=>{ weights[u]=wmap[u]||1; });
    if(enabledUnits.length===0){ enabledUnits.push('fraction'); weights.fraction=1; }
    const total = settings._problemsPerDay || 20;
    const counts = allocCounts(weights, total);
    // build unit list
    let unitList=[];
    Object.entries(counts).forEach(([u,c])=>{ for(let i=0;i<c;i++) unitList.push(u); });
    unitList = shuffle(rng, unitList);
    // difficulty list
    const diffCfg = settings.difficulty || {easy:8,normal:8,hard:4};
    let diffList=[];
    for(let i=0;i<(diffCfg.easy||0);i++) diffList.push('easy');
    for(let i=0;i<(diffCfg.normal||0);i++) diffList.push('normal');
    for(let i=0;i<(diffCfg.hard||0);i++) diffList.push('hard');
    // pad/truncate to total
    while(diffList.length < total) diffList.push('normal');
    diffList = diffList.slice(0,total);
    diffList = shuffle(rng, diffList);

    const problems=[];
    for(let i=0;i<total;i++){
      const unit = unitList[i];
      const diff = diffList[i];
      const p = GEN[unit](rng, diff);
      p.id = `m-${dateStr}-${String(i+1).padStart(2,'0')}`;
      p.group = Math.floor(i/5)+1;
      p.index = i;
      problems.push(p);
    }
    return problems;
  }

  global.MathGen = { generate, gcd, fracStr, mulberry32 };
})(window);

