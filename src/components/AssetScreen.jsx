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

const assetTypes = [
  { id: 'cash', label: '현금', placeholder: '금액을 적어주세요' },
  { id: 'stocks', label: '주식', placeholder: '금액 적어주세요' },
  { id: 'severance', label: '퇴직금', placeholder: '중간정산 가능한 금액 적어주세요' },
  { id: 'insurance', label: '보험', placeholder: '담보대출 가능 금액 적어주세요' },
];

function AssetScreen({ assets, setAssets, onNext, onBack, isEdit, onEditComplete }) {
  const cashInputRef = useRef(null);
  const ctaButtonRef = useRef(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (cashInputRef.current) {
      cashInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleFocusIn = () => setKeyboardOpen(true);
    const handleFocusOut = () => setKeyboardOpen(false);
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const handleKeyPress = (e, isLastField = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isLastField && ctaButtonRef.current) {
        ctaButtonRef.current.focus();
      }
    }
  };

  const handleAssetChange = (id, value) => {
    // "원" 제거 후 숫자만 추출
    const cleanValue = value.replace(/원/g, '').replace(/[^0-9]/g, '');
    let numericValue = cleanValue === '' ? 0 : Number(cleanValue) * 10000; // 10,000원 단위로 저장
    if (numericValue >= 100000000000000) return; // 1조 제한 (입력 차단)
    setAssets(prev => ({ ...prev, [id]: numericValue }));
  };

  const totalAssets = useMemo(() => {
    return Object.values(assets).reduce((sum, val) => sum + val, 0);
  }, [assets]);

  const isNextDisabled = totalAssets === 0;
  const hasInput = Object.values(assets).some(value => value > 0);

  // 입력용 표시 값 (만원 단위) - 콤마 포함
  const getDisplayValue = (value) => {
    if (!value || value === 0) return '';
    const manWon = Math.floor(value / 10000);
    return manWon.toLocaleString('ko-KR');
  };

  // 한글 단위 표시 (만원 단위)
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

  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={onBack} style={{marginLeft: '-8px'}}><BackIcon /></button>
        <h1 className="screen-title">자산</h1>
        <button 
          className="reset-button" 
          onClick={() => setAssets({ cash: 0, stocks: 0, severance: 0, insurance: 0 })}
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
      
      <main style={{ paddingBottom: keyboardOpen ? '20rem' : '3rem' }}>
        <div className="total-display" style={{textAlign:'left', marginBottom:'2rem', marginTop:'12px'}}>
          <div className="label" style={{
            fontSize: 'clamp(0.875rem, 3vw, 1rem)',
            color: '#A1A2B0',
            fontWeight: 500,
            marginBottom: '0.5rem'
          }}>총 자산</div>
          <div className="amount" style={{
            fontSize: 'clamp(2rem, 8vw, 2.2rem)',
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '-1px',
            marginBottom: '0.5rem'
          }}>{numberToKoreanDisplay(totalAssets) || '0원'}</div>
        </div>

        <div className="form-group">
          {assetTypes.map(({ id, label, placeholder }, idx) => (
            <div key={id} className="input-card">
              <div className="label">{label}</div>
              <div className="input-wrapper asset-input">
                <div className="input-auto-shrink">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={placeholder}
                    value={getDisplayValue(assets[id])}
                    onChange={(e) => handleAssetChange(id, e.target.value)}
                    ref={id === 'cash' ? cashInputRef : null}
                    onKeyDown={(e) => handleKeyPress(e, id === 'insurance')}
                    onFocus={e => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
                      }, 150);
                    }}
                  />
                </div>
              </div>
              <div className="korean-unit">{numberToKoreanDisplay(assets[id])}</div>
              {idx === assetTypes.length - 1 && (
                null
              )}
            </div>
          ))}
        </div>
      </main>

      <div className="fixed-bottom-container">
        <button
          ref={ctaButtonRef}
          className="bottom-button"
          disabled={isNextDisabled}
          onClick={e => { window.scrollTo(0,0); (isEdit ? onEditComplete : onNext)(e); }}
        >
          {isEdit ? '수정완료' : '다음 →'}
        </button>
      </div>
    </div>
  );
}

export default AssetScreen; 