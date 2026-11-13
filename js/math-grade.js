// math-grade.js
(function(global){
  function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; }
  function gradeMath(problem, input){
    const a = problem.answer;
    if(a.kind==='int'){
      if(String(input.value).trim()==='') return {correct:false,message:'답을 입력해 주세요.'};
      const v = Number(input.value);
      if(!Number.isFinite(v)) return {correct:false, message:'숫자를 입력해 주세요.'};
      return {correct: v===a.value, message: v===a.value? '정답입니다.' : `정답은 ${a.value}입니다.` };
    }
    if(a.kind==='scaled'){
      const raw = String(input.value).trim();
      if(raw==='') return {correct:false, message:'답을 입력해 주세요.'};
      const n = Number(raw);
      if(!Number.isFinite(n)) return {correct:false, message:'숫자로 입력해 주세요.'};
      const scaled = Math.round(n*a.scale);
      const correct = Math.abs(n*a.scale-a.value)<1e-8;
      const decimals = Math.round(Math.log10(a.scale));
      return {correct, message: correct? '정답입니다.' : `정답은 ${(a.value/a.scale).toFixed(decimals)}입니다.` };
    }
    if(a.kind==='fraction'){
      const whole = input.whole===''?0:Number(input.whole);
      const num = input.num===''?0:Number(input.num);
      const den = Number(input.den);
      if(input.den==='' || (input.num==='' && input.whole==='')) return {correct:false, message:'분자와 분모를 입력해 주세요.'};
      if(!Number.isFinite(whole)||!Number.isFinite(num)||!Number.isFinite(den)) return {correct:false, message:'숫자로 입력해 주세요.'};
      if(den===0) return {correct:false, message:'분모는 0이 될 수 없어요.'};
      const totalNum = whole*den + (whole>=0? num : -num);
      const lhs = totalNum * a.den;
      const rhs = a.num * den;
      if(lhs !== rhs) return {correct:false, message:`정답은 ${a.num}/${a.den}입니다.`};
      if(a.requiredDenominator && den !== a.requiredDenominator){
        return {correct:false, message:`${a.requiredDenominator}분모로 나타내 주세요. (정답: ${a.num}/${a.den})`};
      }
      if(!a.allowEquivalent){
        const g1 = gcd(totalNum, den);
        const g2 = gcd(a.num, a.den);
        if(totalNum/g1 !== a.num/g2 || den/g1 !== a.den/g2){
          return {correct:false, message:`정답은 ${a.num}/${a.den}입니다.`};
        }
      }
      return {correct:true, message:'정답입니다.'};
    }
    if(a.kind==='choice'){
      const v = String(input.value).trim();
      if(v==='') return {correct:false, message:'보기를 선택해 주세요.'};
      return {correct: v===a.value, message: v===a.value? '정답입니다.' : `정답은 ${a.value}입니다.` };
    }
    return {correct:false, message:'채점할 수 없습니다.'};
  }
  function explainMath(p, input={}){
    const a=p.answer, steps=[];
    const expected=a.kind==='fraction'?`${a.num}/${a.den}`:a.kind==='scaled'?(a.value/a.scale).toFixed(Math.round(Math.log10(a.scale))):String(a.value);
    const entered=a.kind==='fraction'?`${input.whole||0}과 ${input.num||0}/${input.den||'□'}`:String(input.value??'빈칸');
    steps.push(`내가 쓴 답은 ${entered}, 이 문제의 정답은 ${expected}예요. 아래 과정을 함께 확인해 봐요.`);
    const fractions=[...p.prompt.matchAll(/(\d+)\/(\d+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
    if(p.unit==='fraction' && fractions.length){
      const [n,d]=fractions[0];
      steps.push(`분모 ${d}은 전체를 똑같이 ${d}조각으로 나누었다는 뜻이에요. 조각의 크기가 같으므로 분모는 그대로 두고 분자만 계산해요.`);
      if(p.type==='blank'){
        const end=fractions[1][0];steps.push(`처음 ${n}조각에 몇 조각을 더하면 ${end}조각이 될까요? 빈칸은 전체 결과에서 처음 양을 빼서 찾아요.`);steps.push(`${end} - ${n} = ${end-n}이므로 □ = ${end-n}/${d}예요. ${n}/${d} + ${end-n}/${d} = ${end}/${d}인지 확인해요.`);
      }else if(p.type==='word'){
        steps.push(`피자 한 판은 ${d}/${d}예요. 먹은 ${n}조각을 빼면 ${d} - ${n} = ${d-n}조각이 남아요.`);steps.push(`따라서 남은 양은 ${d-n}/${d}예요. 먹은 양과 남은 양을 더하면 한 판이 되어야 해요.`);
      }else if(fractions.length===2){
        const m=fractions[1][0],op=p.prompt.includes(' - ')?'-':'+';steps.push(`${n} ${op} ${m} = ${op==='+'?n+m:n-m}이므로 답은 ${op==='+'?n+m:n-m}/${d}예요. 같은 크기의 분수로 써도 괜찮아요.`);
      }
      if(Number(input.den)!==d) steps.push(`쓴 분모가 ${d}과 달라요. 분모까지 더하거나 빼지는 않았는지 확인해 봐요. 약분해서 썼다면 분수의 크기가 같은지 확인해요.`);
    }else if(p.unit==='decimal'){
      const m=p.prompt.match(/([\d.]+) ([+-]) ([\d.]+)/);
      steps.push('소수점끼리 세로로 맞추고, 같은 자리끼리 계산해요. 빈 소수 자리는 0을 붙여 맞출 수 있어요.');
      if(m){const places=Math.round(Math.log10(a.scale));const x=Math.round(Number(m[1])*a.scale),y=Math.round(Number(m[3])*a.scale);steps.push(`두 수를 각각 ${a.scale}배 하면 ${x}와 ${y}가 돼요. ${x} ${m[2]} ${y} = ${a.value}예요.`);steps.push(`계산한 값을 다시 ${a.scale}으로 나누면 ${expected}예요. 소수점 아래 ${places}자리까지 맞춰 확인해요.`);}
      steps.push('덧셈은 받아올림, 뺄셈은 받아내림을 확인해요. 마지막에 소수점을 빠뜨리지 않았는지도 살펴봐요.');
    }else if(p.unit==='triangle'){
      steps.push('변 위에 같은 표시가 있으면 두 변의 길이가 같다는 뜻이에요. 이 삼각형은 이등변삼각형이에요.');steps.push(`길이가 같은 두 변의 맞은편 각도 서로 같아요. 그림의 밑각 하나가 ${a.value}°이므로 ?가 있는 다른 밑각도 ${a.value}°예요.`);steps.push('물음표가 꼭대기 각인지 밑각인지 먼저 살펴봐요. 그림이 기울어져 보여도 같은 변 표시를 기준으로 판단해요.');
    }else if(p.unit==='quadrilateral'){
      const rules={'정사각형':'네 변의 길이가 같고 네 각이 모두 직각','직사각형':'네 각이 모두 직각','마름모':'네 변의 길이가 모두 같음','평행사변형':'마주 보는 두 쌍의 변이 각각 평행','사다리꼴':'마주 보는 한 쌍의 변이 평행'};
      steps.push('평행한 변은 길게 늘여도 만나지 않아요. 직각은 종이 모서리처럼 90°인 각이에요.');
      if(rules[input.value]) steps.push(`네가 고른 ${input.value}의 기준은 ‘${rules[input.value]}’이에요. 문제에 적힌 조건을 모두 설명하는 이름인지 비교해 봐요.`);
      steps.push(`이 문제는 ‘${p.prompt}’라는 조건을 주었어요. ${a.value}의 기준인 ‘${rules[a.value]}’와 맞으므로 답은 ${a.value}예요.`);steps.push('사각형의 이름은 서로 겹칠 수도 있어요. 모양만 보고 고르지 말고 문제에서 묻는 성질과 변의 길이, 직각 표시를 함께 확인해요.');
    }else if(p.unit==='linegraph'){
      steps.push('가로축은 요일, 세로축은 연필의 개수예요. 선의 길이가 아니라 점의 높이와 점 옆의 숫자를 읽어요.');
      if(p.prompt.includes('총')) steps.push('월·화·수요일의 점에 적힌 값을 하나씩 읽고 세 값을 더해요. 목·금요일은 더하지 않아요.');
      else if(p.answer.kind==='choice') steps.push('다섯 점 중 가장 높은 점을 찾은 뒤, 그 점에서 아래로 내려가 요일을 읽어요.');
      else steps.push('문제에서 묻는 요일을 가로축에서 찾고 위로 올라가 점의 값을 읽어요. 옆 요일의 점과 헷갈리지 않도록 확인해요.');
      steps.push(p.solution);steps.push('답이 개수를 묻는지, 요일을 묻는지도 마지막에 확인해요.');
    }else if(p.unit==='polygon'){
      if(a.kind==='choice'){steps.push('시작할 꼭짓점 하나를 정해요. 테두리를 한 방향으로 따라가며 변을 하나씩 세어요. 시작한 변을 두 번 세지 않아요.');steps.push(p.solution);steps.push('변과 꼭짓점의 수는 같아요. 꼭짓점도 세어서 답을 확인해요.');}
      else {const n=a.value+3;steps.push(`이 도형의 꼭짓점은 ${n}개예요. 한 꼭짓점을 출발점으로 정해요.`);steps.push('자기 자신에게는 선을 그을 수 없어요. 양옆의 두 꼭짓점으로 이은 선은 테두리인 변이므로 대각선에서 빼요.');steps.push(`${n}개에서 자기 자신 1개와 이웃 2개를 빼면 ${n} - 1 - 2 = ${a.value}개예요. 이것은 한 꼭짓점에서 그은 개수이며, 도형 전체의 대각선 수와는 달라요.`);}
    }else steps.push(p.solution);
    return steps;
  }
  global.explainMath = explainMath;

  global.gradeMath = gradeMath;
  global.gcd = gcd;
})(window);


