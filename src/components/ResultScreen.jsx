import React, { useState, useMemo } from 'react';

const BackIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DropdownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);



const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString('ko-KR');
};

// 한글 단위 표시 (만원 단위) - A02/A03과 동일한 형식
const numberToKoreanDisplay = (num) => {
  if (typeof num !== 'number' || isNaN(num) || num === 0) return '0원';
  const manWon = Math.floor(num / 10000);
  
  // 조 단위 (1조 = 1,000,000만원)
  if (manWon >= 100000000) {
    const jo = Math.floor(manWon / 100000000);
    const remainEok = Math.floor((manWon % 100000000) / 10000);
    const remainMan = manWon % 10000;
    let result = `${jo.toLocaleString('ko-KR')}조`;
    if (remainEok > 0) {
      result += `${remainEok.toLocaleString('ko-KR')}억`;
    }
    if (remainMan > 0) {
      result += `${remainMan.toLocaleString('ko-KR')}만`;
    }
    return result + '원';
  }
  // 억 단위
  else if (manWon >= 10000) {
    const eok = Math.floor(manWon / 10000);
    const remainMan = manWon % 10000;
    if (remainMan === 0) {
      return `${eok.toLocaleString('ko-KR')}억원`;
    } else {
      return `${eok.toLocaleString('ko-KR')}억${remainMan.toLocaleString('ko-KR')}만원`;
    }
  } else {
    return `${manWon.toLocaleString('ko-KR')}만원`;
  }
};

const numberToKorean = (num) => {
  if (typeof num !== 'number' || isNaN(num) || num === 0) return '0원';
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  let result = '';
  let remain = absNum;
  let lastUnit = '';
  
  // 조 단위 (1조 = 1,000,000만원)
  if (remain >= 1e12) {
    const jo = Math.floor(remain / 1e12);
    result += `${jo.toLocaleString('ko-KR')}조`;
    remain = remain % 1e12;
    lastUnit = '조';
  }
  // 억 단위
  if (remain >= 1e8) {
    const eok = Math.floor(remain / 1e8);
    result += `${eok.toLocaleString('ko-KR')}억`;
    remain = remain % 1e8;
    lastUnit = '억';
  }
  // 천만 단위 (만 단위가 100 이상)
  if (remain >= 1e7) {
    const chun = Math.floor(remain / 1e7);
    result += `${chun.toLocaleString('ko-KR')}천`;
    remain = remain % 1e7;
    lastUnit = '천';
  }
  // 만 단위
  if (remain >= 1e4) {
    const man = Math.floor(remain / 1e4);
    result += `${man.toLocaleString('ko-KR')}만`;
    remain = remain % 1e4;
    lastUnit = '만';
  }
  // 천 단위는 만 단위가 없을 때만 붙임
  if (remain >= 1e3 && result.indexOf('만') === -1) {
    const chun = Math.floor(remain / 1e3);
    result += `${chun.toLocaleString('ko-KR')}천`;
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
  } else if (lastUnit === '조') {
    result += '원';
  } else if (result) {
    result += '원';
  }
  return sign + result;
};

function ResultScreen({ assets, incomes, loan, onRestart, onEdit }) {
  const [selectedLtv, setSelectedLtv] = useState('50'); // 기본값 LTV 50%

  // 합계 계산
  const totalAssets = Object.values(assets).reduce((sum, val) => sum + Number(val), 0);
  const totalIncome = Object.values(incomes).reduce((sum, val) => sum + Number(val), 0);
  const totalLoan = loan.loanAmount || 0;
  
  // LTV 옵션
  const ltvOptions = [
    { value: '50', label: 'LTV 50%', ratio: 0.5, description: '규제지역 LTV 50%' },
    { value: '70', label: 'LTV 70%', ratio: 0.7, description: '비규제지역 LTV 70%' }
  ];

  const currentLtv = ltvOptions.find(opt => opt.value === selectedLtv);
  
  // 현재 선택된 LTV에 따른 계산
  const calculations = useMemo(() => {
    const ltvRatio = currentLtv.ratio;
    
    // DSR 기준으로 계산된 최대 대출 가능 금액 (DSR 40% 기준)
    const dsrBasedMaxLoan = (() => {
      if (!totalIncome || !loan.years || !loan.rate) return 0;
      
      const monthlyIncome = totalIncome / 12;
      const maxMonthlyPayment = monthlyIncome * 0.4; // DSR 40%
      
      // 원리금균등 방식으로 최대 대출 가능 금액 역산
      const monthlyRate = loan.rate / 100 / 12;
      const totalMonths = loan.years * 12;
      
      if (monthlyRate === 0) {
        return maxMonthlyPayment * totalMonths;
      }
      
      // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
      // P = PMT * [(1+r)^n - 1] / [r(1+r)^n]
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      return maxMonthlyPayment * (factor - 1) / (monthlyRate * factor);
    })();
    
    // LTV 기준으로 계산된 최대 집값과 대출 가능 금액
    // 집값 = 자산 / (1 - LTV) (자산이 자기자본이라고 가정)
    const maxHousePriceByLtv = totalAssets / (1 - ltvRatio);
    const maxLoanByLtv = totalAssets * (ltvRatio / (1 - ltvRatio));
    
    // DSR vs LTV 중 더 제한적인 조건 적용
    let actualLoan, actualHousePrice, limitingFactor;
    
    if (dsrBasedMaxLoan <= maxLoanByLtv) {
      // DSR이 제한 요소인 경우
      actualLoan = dsrBasedMaxLoan;
      actualHousePrice = totalAssets + actualLoan;
      limitingFactor = 'DSR';
    } else {
      // LTV가 제한 요소인 경우
      actualLoan = maxLoanByLtv;
      actualHousePrice = maxHousePriceByLtv;
      limitingFactor = 'LTV';
    }
    
    // 실제 LTV 비율 계산
    const actualLtvRatio = actualHousePrice > 0 ? (actualLoan / actualHousePrice) * 100 : 0;
    
    // 제한 조건 확인
    const isLtvLimited = limitingFactor === 'LTV';
    const isDsrLimited = limitingFactor === 'DSR';
    
    return {
      dsrBasedMaxLoan,
      maxHousePriceByLtv,
      maxLoanByLtv,
      actualLoan,
      actualHousePrice,
      actualLtvRatio,
      isLtvLimited,
      isDsrLimited,
      limitingFactor
    };
  }, [totalAssets, totalIncome, totalLoan, currentLtv, loan]);

  // DSR 정보 - 실제 대출 금액에 따른 DSR 계산
  const actualDsr = useMemo(() => {
    if (!totalIncome || !loan.years || !loan.rate || !calculations.actualLoan) return 0;
    
    const monthlyRate = loan.rate / 100 / 12;
    const totalMonths = loan.years * 12;
    
    let actualMonthlyPayment;
    if (monthlyRate === 0) {
      actualMonthlyPayment = calculations.actualLoan / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      actualMonthlyPayment = calculations.actualLoan * (monthlyRate * factor) / (factor - 1);
    }
    
    const monthlyIncome = totalIncome / 12;
    return monthlyIncome > 0 ? (actualMonthlyPayment / monthlyIncome) * 100 : 0;
  }, [totalIncome, loan, calculations.actualLoan]);

  const actualMonthlyPayment = useMemo(() => {
    if (!loan.years || !loan.rate || !calculations.actualLoan) return 0;
    
    const monthlyRate = loan.rate / 100 / 12;
    const totalMonths = loan.years * 12;
    
    if (monthlyRate === 0) {
      return calculations.actualLoan / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      return calculations.actualLoan * (monthlyRate * factor) / (factor - 1);
    }
  }, [loan, calculations.actualLoan]);
  
  const dsr = loan.dsr || 0;
  const monthlyPayment = loan.monthlyPayment || 0;

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={() => onEdit('loan')}><BackIcon /></button>
        <h1 className="screen-title">내가 살 수 있는 집 가격은?</h1>
      </header>
      <main>
        {/* 드롭다운 */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{ 
            position: 'relative', 
            display: 'inline-block',
            minWidth: 'auto'
          }}>
          <select
            value={selectedLtv}
            onChange={(e) => setSelectedLtv(e.target.value)}
            style={{ 
              width: 'auto',
              minWidth: '200px',
              padding: '0.5rem 2rem 0.5rem 1rem', 
              borderRadius: '20px', 
              fontSize: '0.9rem',
              fontWeight: '600',
              background: '#23243a', 
              color: '#fff', 
              border: 'none', 
              appearance: 'none',
              paddingRight: '2rem',
              textAlign: 'center'
            }}
          >
            {ltvOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.description}</option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}>
            <DropdownIcon />
          </div>
          </div>
        </div>

        {/* 집 가격 표시 */}
        <div style={{textAlign:'center', marginBottom:'2rem'}}>
          <div style={{
            fontSize:'2.2rem', 
            color:'#62BBFF', 
            fontWeight:700, 
            letterSpacing:'-1px',
            marginBottom: '0.5rem'
          }}>
            {numberToKoreanDisplay(calculations.actualHousePrice)}
          </div>
        </div>

        <div className="form-group">
          {/* 자산 카드 */}
          <div className="input-card">
            <div className="label">자산</div>
            <div style={{fontWeight:700,fontSize:'1.1rem',color:'#fff'}}>
              {numberToKoreanDisplay(totalAssets)}
            </div>
            
            {/* LTV가 최대치에 못 미칠 때만 안내 메시지 표시 */}
            {calculations.isDsrLimited && Math.round(calculations.actualLtvRatio) < (currentLtv.ratio * 100) && (
              <div style={{
                marginTop: '0.8rem',
                padding: '0.8rem',
                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 165, 0, 0.3)'
              }}>
                <div style={{color: '#FFA500', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.3rem'}}>
                  소득 비율때문에 LTV가 남아요!
                </div>
                <div style={{color: '#FFA500', fontSize: '0.85rem'}}>
                  자산으로 살수있는 최대치는 <strong>{numberToKoreanDisplay(calculations.maxHousePriceByLtv)}</strong>입니다
                </div>
              </div>
            )}
          </div>

          {/* 대출 카드 */}
          <div className="input-card">
            <div className="label">대출</div>
            
            <div style={{fontSize:'1rem', color:'#fff', marginBottom:'0.3rem'}}>
              {loan.finance === '40' ? '제1금융기관' : '제2금융기관'} / {loan.loanType} / {loan.years}년 / {loan.rate}%
            </div>
            
            <div style={{fontWeight:700,fontSize:'1.1rem',color:'#fff', marginBottom:'0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <span>{numberToKoreanDisplay(calculations.actualLoan)}</span>
              <span style={{
                backgroundColor: 'rgba(98, 187, 255, 0.15)',
                color: '#62BBFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.5rem',
                borderRadius: '12px',
                whiteSpace: 'nowrap'
              }}>
                DSR {actualDsr.toFixed(1)}%
              </span>
            </div>

            {/* LTV 제한으로 인해 DSR이 남는 경우 안내 메시지 표시 */}
            {calculations.isLtvLimited && (
              <div style={{
                marginTop: '0.8rem',
                padding: '0.8rem',
                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 165, 0, 0.3)'
              }}>
                <div style={{color: '#FFA500', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.3rem'}}>
                  자산 비율때문에 DSR이 남아요!
                </div>
                <div style={{color: '#FFA500', fontSize: '0.85rem'}}>
                  대출 최대치 <strong>{numberToKoreanDisplay(calculations.dsrBasedMaxLoan)}</strong>입니다
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      
      <div className="fixed-bottom-container">
        <button
          className="bottom-button"
          onClick={onRestart}
        >
          처음부터 다시하기
        </button>
      </div>
    </div>
  );
}

export default ResultScreen; 