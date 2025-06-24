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
  const [dsrMsg, setDsrMsg] = useState('');

  useEffect(() => {
    if (loanAmountInputRef.current) {
      loanAmountInputRef.current.focus();
    }
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

  // 대출기간 개월수 계산
  const months = loan.years ? loan.years * 12 : 0;
  // 연소득 계산 (소득 입력값 합계)
  const totalIncome = Object.values(incomes).reduce((sum, val) => sum + Number(val), 0);
  // 총 대출금액 계산 (자산 입력값 합계)
  const totalLoanAmount = Object.values(assets).reduce((sum, val) => sum + Number(val), 0);

  // DSR 계산 (원리금균등만, 나머지는 안내)
  const calcMonthlyPayment = () => {
    if (!totalLoanAmount || !loan.rate || !loan.years) return 0;
    // 원리금균등 공식
    const principal = totalLoanAmount;
    const rate = loan.rate / 100 / 12;
    const n = loan.years * 12;
    if (rate === 0 || n === 0) return 0;
    const payment = principal * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
    return Math.round(payment);
  };

  const handleDsrCalc = () => {
    if (loan.loanType !== '원리금균등') {
      setDsrMsg('현재는 원리금균등분할상환만 지원합니다.');
      setDsrCalculated(false);
      setMonthlyPayment(0);
      setDsr(0);
      setLoan(prev => ({ ...prev, monthlyPayment: 0, dsrCalculated: false }));
      return;
    }
    const payment = calcMonthlyPayment();
    setMonthlyPayment(payment);
    // 연간 상환액
    const annualPayment = payment * 12;
    // 연소득
    const income = totalIncome;
    // DSR 계산
    const dsrValue = income > 0 ? (annualPayment / income) * 100 : 0;
    setDsr(dsrValue);
    setDsrMsg('');
    setDsrCalculated(true);
    setLoan(prev => ({ ...prev, monthlyPayment: payment, dsrCalculated: true }));
  };

  // DSR 계산 버튼 활성화 조건 (대출금액이 0이어도 작동)
  const isDsrReady = loan.years > 0 && loan.rate > 0 && totalIncome > 0;

  // 입력값이 바뀌면 DSR 계산 결과 초기화
  useEffect(() => {
    setDsrCalculated(false);
    setMonthlyPayment(0);
    setDsr(0);
    setDsrMsg('');
  }, [loan.loanType, loan.finance, loan.years, loan.rate, totalIncome]);

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={onBack}><BackIcon /></button>
        <h1 className="screen-title">대출</h1>
        <button 
          className="reset-button" 
          onClick={() => {
            setLoan({
              loanAmount: 0,
              monthlyPayment: 0,
              finance: '40',
              loanType: '원리금균등',
              years: 40,
              rate: 3.3,
              dsrCalculated: false,
            });
            setDsrCalculated(false);
            setMonthlyPayment(0);
            setDsr(0);
            setDsrMsg('');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: (loan.loanAmount > 0 || loan.years > 0 || loan.rate > 0) ? '#ddd' : '#666',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            marginLeft: 'auto'
          }}
        >
          초기화
        </button>
      </header>
      <main>
        <div className="total-display">
          <div className="label" style={{marginBottom: '0.25em'}}>
            소득 <span style={{color: '#62BBFF', fontWeight: 700}}>{numberToKorean(totalIncome)}</span> 기준 대출가능 금액
          </div>
          <div className="amount">{dsrCalculated ? `${formatNumber(totalLoanAmount)}원` : '0원'}</div>
          <div className="korean-unit">
            {dsrCalculated && (
              <>
                {numberToKorean(totalLoanAmount)}
                {monthlyPayment > 0 && (
                  <span style={{ color: '#aaa', fontSize: '1rem', marginLeft: '0.5rem' }}>
                    / 월 납입 {formatNumber(monthlyPayment)}원
                  </span>
                )}
              </>
            )}
          </div>
          {dsrMsg && (
            <div style={{ color: 'orange', fontWeight: 500, fontSize: '1rem', marginTop: '0.5rem' }}>{dsrMsg}</div>
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
            <div className="label">대출기간</div>
            <div className="input-wrapper">
              <div className="input-auto-shrink">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="대출 기간(년)"
                  value={loan.years ? loan.years : ''}
                  onChange={e => handleLoanChange('years', e.target.value)}
                />
              </div>
            </div>
            <div className="korean-unit">{loan.years > 0 ? `${months}개월` : ''}</div>
          </div>
          <div className="input-card">
            <div className="label">금리(%)</div>
            <div className="input-wrapper">
              <div className="input-auto-shrink">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="금리(%)"
                  value={loan.rate ? loan.rate : ''}
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
              opacity: isDsrReady ? 1 : 0.6
            }}
            disabled={!isDsrReady}
            onClick={handleDsrCalc}
          >
            DSR 계산
          </button>
          <button
            className="bottom-button"
            style={{ background: dsrCalculated ? '#3C4CFF' : '#23243a', color: dsrCalculated ? '#fff' : '#888' }}
            disabled={!dsrCalculated}
            onClick={isEdit ? onEditComplete : onNext}
          >
            {isEdit ? '수정완료' : '영끌 확인하기 →'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default LoanScreen;