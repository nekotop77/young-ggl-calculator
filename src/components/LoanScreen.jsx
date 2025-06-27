import React, { useRef, useEffect, useState } from 'react';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const financeOptions = [
  { value: '40', label: '제1금융기관 40%' },
  { value: '50', label: '제2금융기관 50%' },
];

const loanTypeOptions = [
  { value: '원금균등', label: '원금균등분할상환' },
  { value: '원리금균등', label: '원리금균등분할상환' },
  { value: '만기일시', label: '만기일시상환' },
];

function LoanScreen({ loan, setLoan, incomes, assets, onBack, onNext, isEdit, onEditComplete }) {
  const loanAmountInputRef = useRef(null);
  const [dsrCalculated, setDsrCalculated] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [dsr, setDsr] = useState(0);

  useEffect(() => {
    if (loanAmountInputRef.current) {
      loanAmountInputRef.current.focus();
    }
  }, []);

  // 대출화면 첫 진입 시 대출기간, 금리 입력필드 초기화 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (!isEdit) {
      setLoan(prev => ({ ...prev, years: 0, rate: 0 }));
    } else {
      // 편집 모드일 때 기존 DSR 계산 결과 복원
      if (loan.dsrCalculated) {
        setDsrCalculated(true);
        setMonthlyPayment(loan.monthlyPayment || 0);
        setDsr(loan.dsr || 0);
      }
    }
    // eslint-disable-next-line
  }, [isEdit]);

  const handleLoanChange = (id, value) => {
    if (id === 'loanType' || id === 'finance') {
      setLoan(prev => ({ ...prev, [id]: value }));
      return;
    }
    const cleanValue = value.replace(/원/g, '').replace(/[^0-9.]/g, '');
    let numericValue = cleanValue === '' ? 0 : Number(cleanValue);
    if (id !== 'rate' && numericValue >= 100000000000) numericValue = 99999999999;
    setLoan(prev => ({ ...prev, [id]: numericValue }));
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toLocaleString('ko-KR');
  };

  const numberToKorean = (num) => {
    if (typeof num !== 'number' || isNaN(num) || num === 0) return null;
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    let result = '';
    let remain = absNum;
    let lastUnit = '';
    
    // 조 단위 (1조 = 1,000,000만원)
    if (remain >= 1e12) {
      const jo = Math.floor(remain / 1e12);
      result += `${jo}조`;
      remain = remain % 1e12;
      lastUnit = '조';
    }
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
    } else if (lastUnit === '조') {
      result += '원';
    } else if (result) {
      result += '원';
    }
    return sign + result;
  };

  // 한글 단위 표시 (만원 단위) - 소득 입력 화면과 동일
  const numberToKoreanDisplay = (num) => {
    if (typeof num !== 'number' || isNaN(num) || num === 0) return null;
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

  // 대출기간 개월수 계산
  const months = loan.years ? loan.years * 12 : 0;
  // 연소득 계산 (소득 입력값 합계)
  const totalIncome = Object.values(incomes).reduce((sum, val) => sum + Number(val), 0);
  // 총 대출금액 계산 (자산 입력값 합계)
  const totalLoanAmount = Object.values(assets).reduce((sum, val) => sum + Number(val), 0);

  // 원금균등 연간 평균 상환액 계산
  const calculateAnnualAveragePayment = (principal, annualRate, years) => {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;
    const monthlyPrincipal = principal / totalMonths;
    
    // 첫 달과 마지막 달의 이자 계산
    const firstMonthInterest = principal * monthlyRate;
    const lastMonthInterest = monthlyPrincipal * monthlyRate;
    
    // 연간 평균 상환액 = (월 원금 + 평균 이자) × 12
    const averageInterest = (firstMonthInterest + lastMonthInterest) / 2;
    const averageMonthlyPayment = monthlyPrincipal + averageInterest;
    return averageMonthlyPayment * 12;
  };

  // 원금균등 평균 월납입 계산
  const calculateAverageMonthlyPayment = (principal, annualRate, years) => {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;
    const monthlyPrincipal = principal / totalMonths;
    
    // 첫 달과 마지막 달의 이자 계산
    const firstMonthInterest = principal * monthlyRate;
    const lastMonthInterest = monthlyPrincipal * monthlyRate;
    
    // 평균 월납입 = 월 원금 + 평균 이자
    const averageInterest = (firstMonthInterest + lastMonthInterest) / 2;
    return monthlyPrincipal + averageInterest;
  };

  // 월 납입 계산 함수 (상환방식별)
  const calculateMonthlyPayment = (principal, annualRate, years, loanType) => {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;
    
    console.log(`calculateMonthlyPayment 호출:`, {
      principal,
      annualRate,
      years,
      loanType,
      monthlyRate,
      totalMonths
    });
    
    switch (loanType) {
      case '원리금균등': {
        // 원리금균등 월납입 계산 공식
        // PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        const numerator = monthlyRate * factor;
        const denominator = factor - 1;
        
        console.log(`원리금균등 계산:`, {
          factor,
          numerator,
          denominator
        });
        
        if (denominator === 0) return 0;
        const result = principal * (numerator / denominator);
        console.log(`원리금균등 월납입 결과:`, result);
        return result;
      }
      case '원금균등': {
        // 원금균등 월납입 계산 공식
        // 평균 월납입 = 월 원금 + 평균 이자
        const monthlyPrincipal = principal / totalMonths;
        const firstMonthInterest = principal * monthlyRate;
        const lastMonthInterest = monthlyPrincipal * monthlyRate;
        const averageInterest = (firstMonthInterest + lastMonthInterest) / 2;
        return monthlyPrincipal + averageInterest;
      }
      case '만기일시': {
        // 만기일시 월납입 계산 공식
        // 월 납입 = 월 이자만
        return principal * monthlyRate;
      }
      default:
        return 0;
    }
  };

  // DSR 한도 내 최대 월상환액 계산
  const dsrLimit = loan.finance === '50' ? 0.5 : 0.4; // 제2금융기관 50%, 제1금융기관 40%
  const maxAnnualPayment = totalIncome * dsrLimit;
  const maxMonthlyPayment = maxAnnualPayment / 12;

  // 상환방식별 최대 대출 가능 금액 역산
  const calcMaxLoanAmount = () => {
    const rate = loan.rate / 100 / 12;
    const n = loan.years * 12;
    if (rate === 0 || n === 0) return Math.floor(maxMonthlyPayment * n);
    switch (loan.loanType) {
      case '원리금균등': {
        // P = 월상환액 × [(1+r)^n - 1] / [r × (1+r)^n]
        const numerator = Math.pow(1 + rate, n) - 1;
        const denominator = rate * Math.pow(1 + rate, n);
        return Math.floor(maxMonthlyPayment * (numerator / denominator));
      }
      case '원금균등': {
        // 원금균등 역산 공식 (연간 평균 상환액 기준)
        // 연간 평균 상환액 = (P/n + P*r*(1+1/n)/2) × 12
        // P = 연간 상환액 / (12/n + 6*r*(1+1/n))
        const annualPayment = maxMonthlyPayment * 12;
        const avgInterestRate = rate * (1 + 1/n) / 2;
        return Math.floor(annualPayment / (12 / n + 12 * avgInterestRate));
      }
      case '만기일시': {
        // 만기일시상환: 스트레스 DSR 적용
        // 연간 상환액 = P × 연이율 × 스트레스 가중치
        // P = 연간 상환액 / (연이율 × 스트레스 가중치)
        const stressFactor = 1.825;
        const annualRate = loan.rate / 100;
        const maxAnnualPayment = maxMonthlyPayment * 12;
        return Math.floor(maxAnnualPayment / (annualRate * stressFactor));
      }
      default:
        return 0;
    }
  };

  const maxLoanAmount = calcMaxLoanAmount();

  const handleDsrCalc = () => {
    // 스트레스 가중치 (토스 계산기 기준)
    const stressFactor = 1.825;
    // 금융기관별 DSR 한도 적용
    const dsrLimit = loan.finance === '50' ? 0.5 : 0.4; // 제2금융기관 50%, 제1금융기관 40%
    const income = totalIncome;
    let actualLoanAmount;
    let actualMonthlyPayment;
    let annualPayment;
    let dsrValue;

    if (loan.loanType === '원금균등') {
      // 원금균등: DSR 40% 딱 맞는 값으로 계산
      actualLoanAmount = Math.floor(maxLoanAmount / 10000) * 10000; // 만원 단위 반올림
      actualMonthlyPayment = calculateMonthlyPayment(actualLoanAmount, loan.rate, loan.years, loan.loanType);
      annualPayment = calculateAnnualAveragePayment(actualLoanAmount, loan.rate, loan.years);
      dsrValue = income > 0 ? (annualPayment / income) * 100 : 0;
      
      // 최종 DSR 반올림
      dsrValue = Math.round(dsrValue * 100) / 100;
    } else if (loan.loanType === '만기일시') {
      // 만기일시상환: DSR 40% 딱 맞는 값으로 계산 (스트레스 적용)
      const stressFactor = 1.825;
      actualLoanAmount = Math.floor(maxLoanAmount / 10000) * 10000; // 만원 단위 반올림
      actualMonthlyPayment = calculateMonthlyPayment(actualLoanAmount, loan.rate, loan.years, loan.loanType);
      annualPayment = actualLoanAmount * (loan.rate / 100) * stressFactor;
      dsrValue = income > 0 ? (annualPayment / income) * 100 : 0;
      
      // 최종 DSR 반올림
      dsrValue = Math.round(dsrValue * 100) / 100;
    } else {
      // 원리금균등: DSR 40% 딱 맞는 값으로 계산
      actualLoanAmount = Math.floor(maxLoanAmount / 10000) * 10000; // 만원 단위 반올림
      actualMonthlyPayment = calculateMonthlyPayment(actualLoanAmount, loan.rate, loan.years, loan.loanType);
      annualPayment = actualMonthlyPayment * 12;
      dsrValue = income > 0 ? (annualPayment / income) * 100 : 0;
      
      // 최종 DSR 반올림
      dsrValue = Math.round(dsrValue * 100) / 100;
    }

    // 디버깅 로그
    console.log('=== DSR 계산 결과 ===');
    console.log('대출 종류:', loan.loanType);
    console.log('금융기관:', loan.finance);
    console.log('대출 가능 금액:', actualLoanAmount);
    console.log('연이율:', loan.rate);
    console.log('대출기간:', loan.years);
    console.log('총 소득:', totalIncome);
    console.log('DSR 한도:', dsrLimit);
    console.log('계산된 월 납입:', actualMonthlyPayment);
    console.log('연간 상환액:', annualPayment);
    console.log('DSR:', dsrValue);
    console.log('=====================');

    setMonthlyPayment(actualMonthlyPayment);
    setDsr(dsrValue);
    setDsrCalculated(true);
    setLoan(prev => ({ ...prev, monthlyPayment: actualMonthlyPayment, loanAmount: actualLoanAmount, dsr: dsrValue, dsrCalculated: true }));
  };

  // DSR 계산 버튼 활성화 조건 (대출금액이 0이어도 작동)
  const isDsrReady = loan.years > 0 && loan.rate > 0 && totalIncome > 0;

  // 입력값이 바뀌면 DSR 계산 결과 초기화 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (!isEdit) {
      setDsrCalculated(false);
      setMonthlyPayment(0);
      setDsr(0);
    }
  }, [loan.loanType, loan.finance, loan.years, loan.rate, totalIncome, isEdit]);

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={onBack}><BackIcon /></button>
        <h1 className="screen-title">대출</h1>
      </header>
      <main>
        <div className="total-display">
          <div className="label" style={{marginBottom: '0.5rem'}}>
            소득 <span style={{color: '#ffffff', fontWeight: 700}}>{numberToKoreanDisplay(totalIncome)}</span> 기준
          </div>
          <div className="amount" style={{fontSize:'2.1rem', letterSpacing:'-1px', marginBottom: '0.3rem'}}>
            {(dsrCalculated || (isEdit && loan.dsrCalculated && loan.loanAmount)) ? 
              numberToKoreanDisplay(loan.loanAmount) : '0원'}
          </div>
          {((dsrCalculated && monthlyPayment > 0) || (isEdit && loan.dsrCalculated && loan.monthlyPayment > 0)) && (
            <div style={{ 
              fontSize: '14px', 
              color: '#A1A2B0', 
              fontWeight: 500,
              marginBottom: '0.3rem'
            }}>
              월납입 {numberToKoreanDisplay(monthlyPayment || loan.monthlyPayment)}
            </div>
          )}
          {((dsrCalculated && dsr > 0) || (isEdit && loan.dsrCalculated && loan.dsr > 0)) && (
            <div style={{ 
              fontSize: '14px', 
              color: '#62BBFF', 
              fontWeight: 500,
              padding: '4px 12px',
              backgroundColor: 'rgba(98, 187, 255, 0.15)',
              borderRadius: '8px',
              display: 'inline-block',
              marginTop: '2px',
            }}>
              DSR {dsr || loan.dsr}%
            </div>
          )}
        </div>
        <div className="form-group">
          <div className="input-card">
            <div className="label">금융기관</div>
            <div className="input-wrapper">
              <select
                value={loan.finance}
                onChange={e => handleLoanChange('finance', e.target.value)}
                style={{ width: '100%', padding: '0.9em', borderRadius: '8px', fontSize: '1em', background: '#23243a', color: '#fff', border: 'none', appearance: 'none' }}
              >
                {financeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="input-card">
            <div className="label">주담대 종류</div>
            <div className="input-wrapper">
              <select
                value={loan.loanType}
                onChange={e => handleLoanChange('loanType', e.target.value)}
                style={{ width: '100%', padding: '0.9em', borderRadius: '8px', fontSize: '1em', background: '#23243a', color: '#fff', border: 'none', appearance: 'none' }}
              >
                {loanTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="input-card">
            <div className="label">대출기간(년)</div>
            <div className="input-wrapper loan-period">
              <div className="input-auto-shrink">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="대출기간 입력하세요"
                  value={loan.years === 0 ? '' : loan.years}
                  onChange={e => handleLoanChange('years', e.target.value)}
                />
              </div>
            </div>
            <div className="korean-unit">{loan.years > 0 ? `${months}개월` : ''}</div>
          </div>
          <div className="input-card">
            <div className="label">금리(%)</div>
            <div className="input-wrapper loan-rate">
              <div className="input-auto-shrink">
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="금리를 입력하세요"
                  value={loan.rate === 0 ? '' : loan.rate}
                  onFocus={e => { if (e.target.value === '0') e.target.value = ''; }}
                  onChange={e => handleLoanChange('rate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
          <button
            className="bottom-button"
            style={{ 
              background: isDsrReady ? '#23243a' : '#2A2D44',
              color: isDsrReady ? '#fff' : '#888',
              border: '1px solid #fff',
              cursor: isDsrReady ? 'pointer' : 'not-allowed',
              opacity: isDsrReady ? 1 : 0.6,
              borderRadius: 8
            }}
            disabled={!isDsrReady}
            onClick={handleDsrCalc}
          >
            DSR 계산
          </button>
        </div>
      </main>

      <div className="fixed-bottom-container">
        <button
          className="bottom-button"
          disabled={!dsrCalculated}
          onClick={isEdit ? onEditComplete : onNext}
        >
          영끌 확인하기 →
        </button>
      </div>
    </div>
  );
}

export default LoanScreen;