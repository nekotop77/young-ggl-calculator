import React, { useState, useMemo } from 'react';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// 대출규제 클래스: 수도권 대출 최대 6억 제한
class LoanRegulation {
  static MAX_LOAN_AMOUNT = 600000000;
  static applyMaxLimit(amount) {
    return Math.min(amount, LoanRegulation.MAX_LOAN_AMOUNT);
  }
}

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
      
      // 금융기관별 DSR 한도 적용
      const dsrLimit = loan.finance === '50' ? 0.5 : 0.4; // 제2금융기관 50%, 제1금융기관 40%
      const income = totalIncome;
      const annualRate = loan.rate;
      const years = loan.years;
      const loanType = loan.loanType;
      
      const monthlyRate = annualRate / 100 / 12;
      const totalMonths = years * 12;
      
      // 대출 종류별로 DSR 40% 한도에 맞는 대출 금액 계산
      switch (loanType) {
        case '원리금균등': {
          // 원리금균등: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
          // P = PMT * [(1+r)^n - 1] / [r(1+r)^n]
          const maxAnnualPayment = income * dsrLimit;
          const maxMonthlyPayment = maxAnnualPayment / 12;
          const r = annualRate / 100 / 12;
          const n = years * 12;
          if (r === 0 || n === 0) return maxMonthlyPayment * n;
          const factor = Math.pow(1 + r, n);
          return maxMonthlyPayment * (factor - 1) / (r * factor);
        }
        case '원금균등': {
          // 원금균등: 연간 평균 상환액 기준으로 역산
          const maxAnnualPayment = income * dsrLimit;
          
          // 이진 탐색으로 최대 대출 금액 찾기
          let low = 0;
          let high = income * 20; // 적당한 상한선
          let result = 0;
          
          while (high - low > 10000) { // 만원 단위까지
            const mid = Math.floor((low + high) / 2);
            const monthlyPrincipal = mid / totalMonths;
            const firstMonthInterest = mid * monthlyRate;
            const lastMonthInterest = monthlyPrincipal * monthlyRate;
            const averageInterest = (firstMonthInterest + lastMonthInterest) / 2;
            const averageMonthlyPayment = monthlyPrincipal + averageInterest;
            const annualPayment = averageMonthlyPayment * 12;
            
            if (annualPayment <= maxAnnualPayment) {
              result = mid;
              low = mid;
            } else {
              high = mid;
            }
          }
          return result;
        }
        case '체증식': {
          // 체증식: 원리금균등과 동일
          const maxAnnualPayment = income * dsrLimit;
          const maxMonthlyPayment = maxAnnualPayment / 12;
          
          if (monthlyRate === 0) {
            return maxMonthlyPayment * totalMonths;
          }
          
          const factor = Math.pow(1 + monthlyRate, totalMonths);
          return maxMonthlyPayment * (factor - 1) / (monthlyRate * factor);
        }
        case '만기일시': {
          // 만기일시상환: 스트레스 DSR 적용
          // 대출한도 = (연소득 × DSR한도) / (연이율 × 스트레스가중치)
          const stressFactor = 1.825;
          const r = annualRate / 100;
          const maxAnnualPayment = income * dsrLimit;
          if (r === 0) return 0;
          return maxAnnualPayment / (r * stressFactor);
        }
        default: {
          // 기본값: 원리금균등
          const maxAnnualPayment = income * dsrLimit;
          const maxMonthlyPayment = maxAnnualPayment / 12;
          
          if (monthlyRate === 0) {
            return maxMonthlyPayment * totalMonths;
          }
          
          const factor = Math.pow(1 + monthlyRate, totalMonths);
          return maxMonthlyPayment * (factor - 1) / (monthlyRate * factor);
        }
      }
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
    const principal = calculations.actualLoan;
    const annualRate = loan.rate;
    const years = loan.years;
    const loanType = loan.loanType;
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;
    let actualMonthlyPayment;
    if (loanType === '원금균등') {
      // 첫달 월납입 기준
      const monthlyPrincipal = principal / totalMonths;
      const firstMonthInterest = principal * monthlyRate;
      actualMonthlyPayment = monthlyPrincipal + firstMonthInterest;
      return totalIncome > 0 ? (actualMonthlyPayment * 12 / totalIncome) * 100 : 0;
    }
    // 이하 기존 코드 유지
    switch (loanType) {
      case '원리금균등': {
        if (monthlyRate === 0) {
          actualMonthlyPayment = principal / totalMonths;
        } else {
          const factor = Math.pow(1 + monthlyRate, totalMonths);
          actualMonthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
        }
        break;
      }
      case '체증식': {
        if (monthlyRate === 0) {
          actualMonthlyPayment = principal / totalMonths;
        } else {
          const factor = Math.pow(1 + monthlyRate, totalMonths);
          actualMonthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
        }
        break;
      }
      case '만기일시': {
        const stressFactor = 1.825;
        actualMonthlyPayment = (principal * monthlyRate * stressFactor);
        break;
      }
      default: {
        if (monthlyRate === 0) {
          actualMonthlyPayment = principal / totalMonths;
        } else {
          const factor = Math.pow(1 + monthlyRate, totalMonths);
          actualMonthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
        }
        break;
      }
    }
    const monthlyIncome = totalIncome / 12;
    return monthlyIncome > 0 ? (actualMonthlyPayment / monthlyIncome) * 100 : 0;
  }, [totalIncome, loan, calculations.actualLoan]);

  const actualMonthlyPayment = useMemo(() => {
    if (!loan.years || !loan.rate || !calculations.actualLoan) return 0;
    const principal = calculations.actualLoan;
    const annualRate = loan.rate;
    const years = loan.years;
    const loanType = loan.loanType;
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;
    if (loanType === '원금균등') {
      // 첫달 월납입 기준
      const monthlyPrincipal = principal / totalMonths;
      const firstMonthInterest = principal * monthlyRate;
      return monthlyPrincipal + firstMonthInterest;
    }
    switch (loanType) {
      case '원리금균등': {
        if (monthlyRate === 0) {
          return principal / totalMonths;
        } else {
          const factor = Math.pow(1 + monthlyRate, totalMonths);
          return principal * (monthlyRate * factor) / (factor - 1);
        }
      }
      case '체증식': {
        if (monthlyRate === 0) {
          return principal / totalMonths;
        } else {
          const factor = Math.pow(1 + monthlyRate, totalMonths);
          return principal * (monthlyRate * factor) / (factor - 1);
        }
      }
      case '만기일시': {
        return principal * monthlyRate;
      }
      default: {
        if (monthlyRate === 0) {
          return principal / totalMonths;
        } else {
          const factor = Math.pow(1 + monthlyRate, totalMonths);
          return principal * (monthlyRate * factor) / (factor - 1);
        }
      }
    }
  }, [loan, calculations.actualLoan]);
  
  const dsr = loan.dsr || 0;
  const monthlyPayment = loan.monthlyPayment || 0;

  // 대출금액 규제 적용
  const regulatedLoanAmount = LoanRegulation.applyMaxLimit(loan.loanAmount || 0);

  // DSR % 계산 (총대출액의 DSR 비율, 40% 초과 시 40%로 제한)
  const dsrPercent = totalIncome > 0 ? Math.min(Math.round((regulatedLoanAmount / totalIncome) * 1000 / loan.years) / 10, 40) : 0;

  // 금융기관별 DSR 한도 (뱃지 표기용)
  const dsrLimit = loan.finance === '50' ? 50 : 40;

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={() => onEdit('loan')} style={{marginLeft: '-8px'}}><BackIcon /></button>
        <h1 className="screen-title">영끌 계산 완료</h1>
      </header>
      <main>
        {/* 드롭다운 */}
        <div style={{ 
          textAlign: 'left',
          marginBottom: '1.5rem',
          marginTop: '10px'
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
              textAlign: 'left'
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
        <div style={{textAlign:'left', marginBottom:'2rem'}}>
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
                <div style={{color: '#FFA500', fontSize: '14px', marginBottom: '0.3rem'}}>
                  소득을 늘리면 더 비싼 집을 살 수 있어요
                </div>
                <div style={{color: '#FFA500', fontSize: '14px'}}>
                  자산으로 살 수 있는 최대치는 <strong>{numberToKoreanDisplay(calculations.maxHousePriceByLtv)}</strong> 입니다
                </div>
              </div>
            )}
          </div>

          {/* 대출 카드 */}
          <div className="input-card">
            {/* 1. 타이틀+DSR뱃지 */}
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'0.5rem'}}>
              <span className="input-card-title" style={{fontWeight:700,fontSize:'1.1rem',color:'#fff'}}>대출</span>
              <span style={{
                background: 'rgb(51, 66, 96)',
                color: 'rgb(126, 207, 255)',
                fontWeight: 500,
                fontSize: '0.95rem',
                borderRadius: '12px',
                padding: '3px 10px',
                display: 'inline-block',
              }}>
                DSR {Math.min(Math.round(actualDsr * 10) / 10, dsrLimit)}%
              </span>
            </div>
            {/* 2. 소득/상환방식/기간/금리 */}
            <div style={{fontSize:'1rem',color:'#fff',marginBottom:'0.7rem',fontWeight:400}}>
              소득 {numberToKoreanDisplay(totalIncome)} / {loan.loanType} / {loan.years}년 / {loan.rate}%
            </div>
            {/* 3. 대출금액+월납입 */}
            <div style={{display:'flex',alignItems:'baseline',gap:'10px',marginBottom:'0.3rem'}}>
              <div style={{fontSize:'1.1rem',fontWeight:700,color:'#fff',letterSpacing:'-1px'}}>
                {numberToKoreanDisplay(Math.floor(loan.loanAmount || 0))}
              </div>
              {(loan.loanAmount > 0 && (loan.loanType === '원금균등' ? loan.firstMonthPayment : loan.monthlyPayment) > 0) && (
                <div style={{fontSize:'1.1rem',color:'#A1A2B0',fontWeight:500,whiteSpace:'nowrap',marginLeft:'2px'}}>
                  {loan.loanType === '원금균등'
                    ? `첫달 ${numberToKoreanDisplay(Math.trunc((loan.firstMonthPayment || 0) / 10000) * 10000)}`
                    : `월 납입 ${numberToKoreanDisplay(Math.trunc((loan.monthlyPayment || 0) / 10000) * 10000)}`}
                </div>
              )}
            </div>
            {/* 4. 하단 안내문구(기존 스타일 유지) */}
            {calculations.isLtvLimited && (
              <div style={{
                marginTop: '0.8rem',
                padding: '0.8rem',
                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 165, 0, 0.3)'
              }}>
                <div style={{color: '#FFA500', fontSize: '14px', marginBottom: '0.3rem'}}>
                  자산을 늘리면 DSR을 더 쓸 수 있어요
                </div>
                <div style={{color: '#FFA500', fontSize: '14px'}}>
                  소득 대비 대출 최대치는 <strong>{numberToKoreanDisplay(loan.loanAmount)}</strong>입니다
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* DSR 안내문구 */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#A1A2B0',
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }}>
            25.06.28부터 수도권 대출 최대 6억으로 제한됩니다.
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