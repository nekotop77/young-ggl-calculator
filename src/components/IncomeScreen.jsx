import React, { useRef, useEffect, useMemo } from 'react';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function IncomeScreen({ incomes, setIncomes, onNext, onBack, isEdit, onEditComplete }) {
  const salaryInputRef = useRef(null);

  useEffect(() => {
    if (salaryInputRef.current) {
      salaryInputRef.current.focus();
    }
  }, []);

  const handleIncomeChange = (id, value) => {
    const cleanValue = value.replace(/원/g, '').replace(/[^0-9]/g, '');
    let numericValue = cleanValue === '' ? 0 : Number(cleanValue);
    if (numericValue >= 100000000000) numericValue = 99999999999;
    setIncomes(prev => ({ ...prev, [id]: numericValue }));
  };

  const totalIncome = useMemo(() => {
    return Object.values(incomes).reduce((sum, val) => sum + val, 0);
  }, [incomes]);

  const isNextDisabled = totalIncome === 0;
  const hasInput = Object.values(incomes).some(value => value > 0);

  const incomeTypes = [
    { id: 'salary', label: '연봉', placeholder: '연봉을 적어주세요' },
    { id: 'bonus', label: '상여', placeholder: '상여금 적어주세요 (없으면 빈칸)' },
    { id: 'side', label: '부수입', placeholder: '부수입 적어주세요' },
    { id: 'other', label: '기타', placeholder: '기타 소득 적어주세요' },
  ];

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

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={onBack}><BackIcon /></button>
        <h1 className="screen-title">소득</h1>
        <button 
          className="reset-button" 
          onClick={() => setIncomes({ salary: 0, bonus: 0, side: 0, other: 0 })}
          style={{
            background: 'none',
            border: 'none',
            color: hasInput ? '#ddd' : '#666',
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
          <div className="label">총 소득</div>
          <div className="amount">{totalIncome > 0 ? `${formatNumber(totalIncome)}원` : '0원'}</div>
          <div className="korean-unit">{numberToKorean(totalIncome)}</div>
        </div>
        <div className="form-group">
          {incomeTypes.map(({ id, label, placeholder }) => (
            <div key={id} className="input-card">
              <div className="label">{label}</div>
              <div className="input-wrapper">
                <div className="input-auto-shrink">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={placeholder}
                    value={incomes[id] ? formatNumber(incomes[id]) : ''}
                    onChange={(e) => handleIncomeChange(id, e.target.value)}
                    ref={id === 'salary' ? salaryInputRef : null}
                  />
                </div>
              </div>
              <div className="korean-unit">{numberToKorean(incomes[id])}</div>
            </div>
          ))}
        </div>
      </main>
      <button
        className="bottom-button"
        disabled={isNextDisabled}
        onClick={isEdit ? onEditComplete : onNext}
      >
        {isEdit ? '수정완료' : '다음 →'}
      </button>
    </div>
  );
}

export default IncomeScreen;