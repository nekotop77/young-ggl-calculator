import { useState } from 'react';

function InitialScreen({ onNext }) {
  const [cash, setCash] = useState('');
  const [severancePay, setSeverancePay] = useState('');

  const handleAmountChange = (e, setter) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue === '') {
      setter('');
    } else {
      setter(Number(numericValue).toLocaleString('ko-KR'));
    }
  };

  const isNextDisabled = cash === '' || severancePay === '';

  const handleNextClick = () => {
    const rawCash = Number(cash.replace(/[^0-9]/g, ''));
    const rawSeverancePay = Number(severancePay.replace(/[^0-9]/g, ''));
    
    onNext({
      cash: rawCash,
      severancePay: rawSeverancePay,
    });
  };

  return (
    <>
      <div className="app-container">
        <h1 className="title">너 지금 얼마있니?</h1>
        <div className="separator"></div>

        <div className="form-group">
          <label htmlFor="cash" className="form-label">현금</label>
          <div className="input-wrapper">
            <input
              id="cash"
              type="text"
              inputMode="numeric"
              value={cash}
              onChange={(e) => handleAmountChange(e, setCash)}
              className="form-input"
              placeholder="0"
            />
            {cash && <span className="currency-unit">원</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="severancePay" className="form-label">퇴직금</label>
          <div className="input-wrapper">
            <input
              id="severancePay"
              type="text"
              inputMode="numeric"
              value={severancePay}
              onChange={(e) => handleAmountChange(e, setSeverancePay)}
              className="form-input"
              placeholder="0"
            />
            {severancePay && <span className="currency-unit">원</span>}
          </div>
        </div>
      </div>

      <div className="bottom-button-container">
        <div className="bottom-button-wrapper">
          <button
            className="btn-primary"
            disabled={isNextDisabled}
            onClick={handleNextClick}
          >
            다음
          </button>
        </div>
      </div>
    </>
  );
}

export default InitialScreen; 