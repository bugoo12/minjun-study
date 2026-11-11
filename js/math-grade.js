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
  global.gradeMath = gradeMath;
  global.gcd = gcd;
})(window);

