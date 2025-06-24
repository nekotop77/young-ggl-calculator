import React, { useMemo } from 'react';

const BackIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString('ko-KR');
};

const numberToKorean = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return null;
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (absNum < 1000) return num.toString() + '원';
  const toFixedDown = (val, digits) => {
    const factor = Math.pow(10, digits);
    return (Math.floor(val * factor) / factor).toFixed(digits).replace(/\.00$/, '');
  };
  if (absNum >= 1e8) {
    const val = absNum / 1e4;
    if (val >= 10000) {
      const eok = val / 10000;
      return sign + (eok % 1 === 0 ? eok.toFixed(0) : toFixedDown(eok, 2)) + '억원';
    } else {
      return sign + (val % 1 === 0 ? val.toFixed(0) : toFixedDown(val, 2)) + '만원';
    }
  } else if (absNum >= 1e4) {
    const val = absNum / 1e4;
    return sign + (val % 1 === 0 ? val.toFixed(0) : toFixedDown(val, 2)) + '만원';
  } else if (absNum >= 1e3) {
    const val = absNum / 1e3;
    return sign + (val % 1 === 0 ? val.toFixed(0) : toFixedDown(val, 2)) + '천원';
  }
  return num.toString() + '원';
};

function ResultScreen({ assets, incomes, loan, onRestart, onEdit }) {
  // 합계 계산
  const totalAssets = Object.values(assets).reduce((sum, val) => sum + Number(val), 0);
  const totalIncome = Object.values(incomes).reduce((sum, val) => sum + Number(val), 0);
  const totalLoan = loan.monthlyPayment > 0 ? loan.monthlyPayment * loan.years * 12 : 0;
  // 집 가격대: (자산+소득+대출) * 0.5 (LTV 50%)
  const housePrice = Math.round((totalAssets + totalIncome + totalLoan) * 0.5);

  // 부대비용 계산
  const 취득세 = Math.round(housePrice * 0.01);
  const 복비 = Math.round(housePrice * 0.004);
  const 법무등기비 = 200000;
  const 부대비합계 = 취득세 + 복비 + 법무등기비;

  // 수정사항 감지: 자산/소득/대출 값이 0이 아니면 활성화
  const isRestartEnabled = useMemo(() => {
    return totalAssets > 0 || totalIncome > 0 || totalLoan > 0;
  }, [totalAssets, totalIncome, totalLoan]);

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={() => onEdit('loan')}><BackIcon /></button>
        <h1 className="screen-title">결과</h1>
      </header>
      <main>
        <div style={{textAlign:'center', margin:'2.5rem 0 1.5rem'}}>
          <div style={{fontSize:'1.1rem', color:'#fff', marginBottom:'0.7rem', fontWeight:500}}>내가 살 수 있는 집 가격대는?</div>
          <div style={{fontSize:'2.1rem', color:'#62BBFF', fontWeight:700, letterSpacing:'-1px'}}>{formatNumber(housePrice)}원</div>
          <div style={{fontSize:'1.15rem', color:'#62BBFF', fontWeight:500, marginTop:'0.2em'}}>{numberToKorean(housePrice)}</div>
        </div>
        <div className="form-group" style={{gap:'1.1rem',margin:'2.2rem 0 1.5rem', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          {/* 자산 카드 */}
          <div className="input-card" style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',maxWidth:'400px',padding:'1.1rem 1.2rem',boxSizing:'border-box'}}>
            <div>
              <div className="label" style={{color:'#aaa',marginBottom:'0.2em'}}>자산</div>
              <div style={{fontWeight:700,fontSize:'1.1rem',color:'#fff'}}>{formatNumber(totalAssets)}원</div>
              <div className="korean-unit" style={{color:'#62BBFF'}}>{numberToKorean(totalAssets)}</div>
            </div>
          </div>
          {/* 소득 카드 */}
          <div className="input-card" style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',maxWidth:'400px',padding:'1.1rem 1.2rem',boxSizing:'border-box'}}>
            <div>
              <div className="label" style={{color:'#aaa',marginBottom:'0.2em'}}>소득</div>
              <div style={{fontWeight:700,fontSize:'1.1rem',color:'#fff'}}>{formatNumber(totalIncome)}원</div>
              <div className="korean-unit" style={{color:'#62BBFF'}}>{numberToKorean(totalIncome)}</div>
            </div>
          </div>
          {/* 대출 카드 */}
          <div className="input-card" style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',maxWidth:'400px',padding:'1.1rem 1.2rem',boxSizing:'border-box'}}>
            <div>
              <div className="label" style={{color:'#aaa',marginBottom:'0.2em'}}>대출</div>
              <div style={{fontWeight:700,fontSize:'1.1rem',color:'#fff'}}>{formatNumber(totalLoan)}원</div>
              <div className="korean-unit" style={{color:'#62BBFF'}}>{numberToKorean(totalLoan)}</div>
            </div>
          </div>
        </div>
        {/* 부대비용 안내 */}
        <div style={{background:'#11131c',borderRadius:'12px',padding:'1.1rem 1.2rem',margin:'2.2rem 0 0.5rem',color:'#fff',display:'flex',flexDirection:'row',alignItems:'flex-start',gap:'1.2rem',fontSize:'1rem', maxWidth:'400px', marginLeft:'auto', marginRight:'auto'}}>
          <div style={{minWidth:'120px',fontWeight:600,display:'flex',flexDirection:'column',alignItems:'flex-start',gap:'0.5em'}}>
            <span style={{fontSize:'1.2em'}}>🖐️ 잠깐!</span>
            <span style={{color:'#fff',fontWeight:500}}>부대비용도<br/>준비해야해요</span>
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:600,marginBottom:'0.3em'}}>
              <span>추가비용 합계</span>
              <span>{formatNumber(부대비합계)}원</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.2em',color:'#aaa',fontSize:'0.98em'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>취득세</span><span>{formatNumber(취득세)}원</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>복비</span><span>{formatNumber(복비)}원</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>법무 등기비</span><span>{formatNumber(법무등기비)}원</span></div>
            </div>
          </div>
        </div>
        <button className="bottom-button" style={{marginTop:'2.5rem',maxWidth:'400px',marginLeft:'auto',marginRight:'auto',display:'block'}} disabled={!isRestartEnabled} onClick={onRestart}>다시 계산하기</button>
      </main>
    </div>
  );
}

export default ResultScreen; 