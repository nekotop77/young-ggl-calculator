import { useState, useMemo, useRef, useEffect } from 'react';

const formatNumber = (num) => {
  if (!num) return '';
  return num.toLocaleString('ko-KR');
};

const numberToKorean = (num) => {
  if (!num || num === 0) return '';
  const eok = Math.floor(num / 100000000);
  const cheonman = Math.floor((num % 100000000) / 10000000);
  const baekman = Math.floor((num % 10000000) / 1000000);
  const shipman = Math.floor((num % 1000000) / 100000);
  const man = Math.floor((num % 100000) / 10000);
  let result = '';
  if (eok > 0) result += `${eok}억`;
  else if (cheonman > 0) result += `${cheonman}천만`;
  else if (baekman > 0) result += `${baekman}백만`;
  else if (shipman > 0) result += `${shipman}십만`;
  else if (man > 0) result += `${man}만`;
  else return '';
  result += '원';
  return result.trim();
};

function IncomeScreen({ onNext, onBack }) {
  const [income, setIncome] = useState({
    job: 0,
    etc: 0,
  });
  const jobInputRef = useRef(null);
  useEffect(() => {
    if (jobInputRef.current) jobInputRef.current.focus();
  }, []);

  const handleIncomeChange = (id, value) => {
    const cleanValue = value.replace(/원/g, '').replace(/[^0-9]/g, '');
    let numericValue = cleanValue === '' ? 0 : Number(cleanValue);
    if (numericValue >= 100000000000) numericValue = 99999999999;
    setIncome(prev => ({ ...prev, [id]: numericValue }));
  };

  const totalIncome = useMemo(() => income.job + income.etc, [income]);
  const isNextDisabled = totalIncome === 0;

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="screen-title">소득</h1>
      </header>
      <main>
        <div className="total-display">
          <div className="label">총 소득</div>
          <div className="amount">{totalIncome > 0 ? `${formatNumber(totalIncome)}원` : '0원'}</div>
          <div className="korean-unit">{numberToKorean(totalIncome)}</div>
        </div>
        <div className="form-group">
          <div className="input-card">
            <div className="label">직장인 연 소득</div>
            <div className="input-wrapper">
              <div className="input-auto-shrink">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="금액 적어주세요"
                  value={income.job ? `${formatNumber(income.job)}원` : ''}
                  onChange={(e) => handleIncomeChange('job', e.target.value)}
                  ref={jobInputRef}
                />
              </div>
            </div>
            <div className="korean-unit">{income.job ? numberToKorean(income.job) : ''}</div>
          </div>
          <div className="input-card">
            <div className="label">기타 연 소득</div>
            <div className="input-wrapper">
              <div className="input-auto-shrink">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="금액 적어주세요 (없으면 빈칸)"
                  value={income.etc ? `${formatNumber(income.etc)}원` : ''}
                  onChange={(e) => handleIncomeChange('etc', e.target.value)}
                />
              </div>
            </div>
            <div className="korean-unit">{numberToKorean(income.etc)}</div>
          </div>
        </div>
      </main>
      <button
        className="bottom-button"
        disabled={isNextDisabled}
        onClick={onNext}
        style={{ backgroundColor: isNextDisabled ? undefined : '#3C4CFF' }}
      >
        다음 →
      </button>
    </div>
  );
}

export default IncomeScreen; 