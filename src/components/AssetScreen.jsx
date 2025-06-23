import { useState, useMemo, useEffect, useRef } from 'react';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

const assetTypes = [
  { id: 'cash', label: '현금', placeholder: '금액을 적어주세요' },
  { id: 'stocks', label: '주식', placeholder: '금액 적어주세요 (없으면 빈칸)' },
  { id: 'severance', label: '퇴직금', placeholder: '중간정산 가능한 금액 적어주세요' },
  { id: 'insurance', label: '보험', placeholder: '담보대출 가능 금액 적어주세요' },
];

function AssetScreen({ onNext, onBack }) {
  const [assets, setAssets] = useState({
    cash: 0,
    stocks: 0,
    severance: 0,
    insurance: 0,
  });

  const cashInputRef = useRef(null);

  useEffect(() => {
    if (cashInputRef.current) {
      cashInputRef.current.focus();
    }
  }, []);

  const handleAssetChange = (id, value) => {
    // "원" 문자를 제거하고 숫자만 추출
    const cleanValue = value.replace(/원/g, '').replace(/[^0-9]/g, '');
    let numericValue = cleanValue === '' ? 0 : Number(cleanValue);
    if (numericValue >= 100000000000) numericValue = 99999999999;
    setAssets(prev => ({ ...prev, [id]: numericValue }));
  };

  const totalAssets = useMemo(() => {
    return Object.values(assets).reduce((sum, val) => sum + val, 0);
  }, [assets]);

  const isNextDisabled = totalAssets === 0;

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={onBack}><BackIcon /></button>
        <h1 className="screen-title">자산</h1>
        <button 
          className="reset-button" 
          onClick={() => setAssets({ cash: 0, stocks: 0, severance: 0, insurance: 0 })}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
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
          <div className="label">총 자산</div>
          <div className="amount">{totalAssets > 0 ? `${formatNumber(totalAssets)}원` : '0원'}</div>
          <div className="korean-unit">{numberToKorean(totalAssets)}</div>
        </div>

        <div className="form-group">
          {assetTypes.map(({ id, label, placeholder }) => (
            <div key={id} className="input-card">
              <div className="label">{label}</div>
              <div className="input-wrapper">
                <div className="input-auto-shrink">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={placeholder}
                    value={assets[id] ? `${formatNumber(assets[id])}원` : ''}
                    onChange={(e) => handleAssetChange(id, e.target.value)}
                    ref={id === 'cash' ? cashInputRef : null}
                  />
                </div>
              </div>
              <div className="korean-unit">{numberToKorean(assets[id])}</div>
            </div>
          ))}
        </div>
      </main>

      <button
        className="bottom-button"
        disabled={isNextDisabled}
        onClick={onNext}
      >
        다음 →
      </button>
    </div>
  );
}

export default AssetScreen; 