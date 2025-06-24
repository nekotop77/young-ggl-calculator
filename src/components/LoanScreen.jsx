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
  { value: '체증식', label: '체증식분할상환' },
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

  // 대출화면 첫 진입 시 대출기간, 금리 입력필드 초기화
  useEffect(() => {
    setLoan(prev => ({ ...prev, years: 0, rate: 0 }));
    // eslint-disable-next-line
  }, []);

  const handleLoanChange = (id, value) => {
    if (id === 'loanType' || id === 'finance') {
      setLoan(prev => ({ ...prev, [id]: value }));
      return;
    }
    const cleanValue = value.replace(/원/g, '').replace(/[^0-9.]/g, '');
    let numericValue = cleanValue === '' ? 0 : Number(cleanValue);
    if (id === 'rate') {
      console.log('금리 입력값:', value, '| cleanValue:', cleanValue, '| numericValue:', numericValue);
      if (numericValue > 99.99) numericValue = 99.99;
    }
    if (id !== 'rate' && numericValue >= 100000000000) numericValue = 99999999999;
    setLoan(prev => ({ ...prev, [id]: numericValue }));
  };

  const formatNumber = (num) => {
    if (!num) return '';
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

  // 대출기간 개월수 계산
  const months = loan.years ? loan.years * 12 : 0;
  // 연소득 계산 (소득 입력값 합계)
  const totalIncome = Object.values(incomes).reduce((sum, val) => sum + Number(val), 0);
  // 총 대출금액 계산 (자산 입력값 합계)
  const totalLoanAmount = Object.values(assets).reduce((sum, val) => sum + Number(val), 0);

  // DSR 한도 내 최대 월상환액 계산
  const dsrLimit = loan.finance === '50' ? 0.5 : 0.4; // 50% or 40%
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
        // P = 월상환액 / (1/n + r)
        return Math.floor(maxMonthlyPayment / (1 / n + rate));
      }
      case '체증식': {
        // 단순화: 원금균등과 동일하게 처리
        return Math.floor(maxMonthlyPayment / (1 / n + rate));
      }
      case '만기일시': {
        // P = 월상환액 / r
        return Math.floor(maxMonthlyPayment / rate);
      }
      default:
        return 0;
    }
  };

  const maxLoanAmount = calcMaxLoanAmount();

  const handleDsrCalc = () => {
    // 월상환액은 maxMonthlyPayment, 대출금액은 maxLoanAmount
    setMonthlyPayment(Math.round(maxMonthlyPayment));
    // 연간 상환액
    const annualPayment = maxMonthlyPayment * 12;
    // 연소득
    const income = totalIncome;
    // DSR 계산 공식
    const dsrValue = income > 0 ? (annualPayment / income) * 100 : 0;
    setDsr(dsrValue);
    setDsrCalculated(true);
    setLoan(prev => ({ ...prev, monthlyPayment: Math.round(maxMonthlyPayment), loanAmount: maxLoanAmount, dsrCalculated: true }));
  };

  // DSR 계산 버튼 활성화 조건 (대출금액이 0이어도 작동)
  const isDsrReady = loan.years > 0 && loan.rate > 0 && totalIncome > 0;

  // 입력값이 바뀌면 DSR 계산 결과 초기화
  useEffect(() => {
    setDsrCalculated(false);
    setMonthlyPayment(0);
    setDsr(0);
  }, [loan.loanType, loan.finance, loan.years, loan.rate, totalIncome]);

  // 계산 완료 후 대출 가능 금액은 천만원 단위로 내림
  const displayLoanAmount = dsrCalculated ? (maxLoanAmount >= 10000000 ? Math.floor(maxLoanAmount / 10000000) * 10000000 : maxLoanAmount) : 0;

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={onBack}><BackIcon /></button>
        <h1 className="screen-title">대출</h1>
      </header>
      <main>
        <div className="total-display">
          <div className="label" style={{marginBottom: '0.25em'}}>
            소득 <span style={{color: '#62BBFF', fontWeight: 700}}>{numberToKorean(totalIncome)}</span> 기준
          </div>
          <div className="amount">{dsrCalculated ? `${formatNumber(displayLoanAmount)}원` : '0원'}</div>
          <div className="korean-unit" style={{fontSize:'16px'}}>
            {dsrCalculated && (
              <>
                {numberToKorean(displayLoanAmount)}
                {monthlyPayment > 0 && (
                  <span style={{ color: '#aaa', fontSize: '1rem', marginLeft: '0.5rem' }}>
                    / 월 납입 {numberToKorean(monthlyPayment)}
                  </span>
                )}
              </>
            )}
          </div>
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
            <div className="label">대출기간</div>
            <div className="input-wrapper loan-period">
              <div className="input-auto-shrink">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="대출 기간(년)"
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
                  placeholder="금리(%)"
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
          <button
            className="bottom-button"
            disabled={!dsrCalculated}
            onClick={isEdit ? onEditComplete : onNext}
          >
            영끌 확인하기 →
          </button>
        </div>
      </main>
    </div>
  );
}

export default LoanScreen;