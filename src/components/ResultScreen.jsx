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
  if (num === 0) return '0원';
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  let result = '';
  let remain = absNum;
  let lastUnit = '';
  // 억 단위
  if (remain >= 1e8) {
    const eok = Math.floor(remain / 1e8);
    result += `${eok}억`;
    remain = remain % 1e8;
    lastUnit = '억';
  }
  // 천만 단위 (만 단위가 100 이상)
  if (remain >= 1e7) {
    const chun = Math.floor(remain / 1e7);
    result += `${chun}천`;
    remain = remain % 1e7;
    lastUnit = '천';
  }
  // 만 단위
  if (remain >= 1e4) {
    const man = Math.floor(remain / 1e4);
    result += `${man}만`;
    remain = remain % 1e4;
    lastUnit = '만';
  }
  // 천 단위는 만 단위가 없을 때만 붙임
  if (remain >= 1e3 && result.indexOf('만') === -1) {
    const chun = Math.floor(remain / 1e3);
    result += `${chun}천`;
    remain = remain % 1e3;
    lastUnit = '천';
  }
  if (remain > 0) {
    result += `${remain.toLocaleString('ko-KR')}`;
    lastUnit = '';
  }
  // 단위 붙이기
  if (lastUnit === '천') {
    result += '만원';
  } else if (lastUnit === '만') {
    result += '원';
  } else if (lastUnit === '억') {
    result += '원';
  } else if (result) {
    result += '원';
  }
  return sign + result;
};

function ResultScreen({ assets, incomes, loan, onRestart, onEdit }) {
  // 합계 계산
  const totalAssets = Object.values(assets).reduce((sum, val) => sum + Number(val), 0);
  // 대출화면에서 계산된 최대 대출 가능 금액을 직접 사용 (천만원 단위로 내림)
  const totalLoan = loan.loanAmount ? Math.floor(loan.loanAmount / 10000000) * 10000000 : 0;
  // 집 가격대: 자산 + 대출 합계
  const housePrice = totalAssets + totalLoan;

  // 부대비용 계산
  const 취득세 = Math.round(housePrice * 0.01);
  const 복비 = Math.round(housePrice * 0.004);
  const 법무등기비 = 200000;
  const 부대비합계 = 취득세 + 복비 + 법무등기비;

  // 수정사항 감지: 자산/소득/대출 값이 0이 아니면 활성화
  const isRestartEnabled = useMemo(() => {
    return totalAssets > 0 || totalLoan > 0;
  }, [totalAssets, totalLoan]);

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
              <div className="korean-unit" style={{color:'#62BBFF',fontSize:'16px'}}>{numberToKorean(totalAssets)}</div>
            </div>
          </div>
          {/* 대출 카드 */}
          <div className="input-card" style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',maxWidth:'400px',padding:'1.1rem 1.2rem',boxSizing:'border-box'}}>
            <div>
              <div className="label" style={{color:'#aaa',marginBottom:'0.2em'}}>대출</div>
              <div style={{fontWeight:700,fontSize:'1.1rem',color:'#fff'}}>{formatNumber(totalLoan)}원</div>
              <div className="korean-unit" style={{color:'#62BBFF',fontSize:'16px'}}>{numberToKorean(totalLoan)}</div>
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
              <span>부대비용 합계</span>
              <span>{formatNumber(부대비합계)}원</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.2em',color:'#aaa',fontSize:'0.98em'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>취득세</span><span style={{textAlign:'right'}}>{formatNumber(취득세)}원</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>복비</span><span style={{textAlign:'right'}}>{formatNumber(복비)}원</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>법무 등기비</span><span style={{textAlign:'right'}}>{formatNumber(법무등기비)}원</span></div>
            </div>
          </div>
        </div>
      </main>
      <button
        className="bottom-button"
        disabled={!isRestartEnabled}
        onClick={onRestart}
      >
        다시 계산하기
      </button>
    </div>
  );
}

export default ResultScreen; 