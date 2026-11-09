import { useState, useMemo, useEffect } from 'react';
import { analytics } from "../firebase";
import { logEvent } from "firebase/analytics";
import { LTV_OPTIONS, calcMaxPurchase } from "../loanPolicy";
import { Screen, Amount, Badge, Select } from './ui';
import { formatWon, floorToManWon, sumValues } from '../format';

const LTV_SELECT_OPTIONS = LTV_OPTIONS.map(({ value, description }) => ({ value, label: description }));

function ResultScreen({ assets, incomes, loan, caseType, onRestart, onEdit }) {
  const [selectedLtv, setSelectedLtv] = useState('40'); // 기본값 규제지역 LTV 40%

  // 합계 계산
  const totalAssets = sumValues(assets);
  const totalIncome = sumValues(incomes);
  const totalLoan = loan.loanAmount || 0;
  
  const currentLtv = LTV_OPTIONS.find(opt => opt.value === selectedLtv);
  
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
    
    // DSR, LTV, 시가별 대출 한도 중 가장 제한적인 조건 적용
    const { loan: actualLoan, housePrice: actualHousePrice, limitingFactor, cap: loanCap, maxPrice: tierMaxPrice } = calcMaxPurchase({
      assets: totalAssets,
      dsrMaxLoan: dsrBasedMaxLoan,
      ltvRatio,
      tiers: currentLtv.tiers
    });
    
    // 실제 LTV 비율 계산
    const actualLtvRatio = actualHousePrice > 0 ? (actualLoan / actualHousePrice) * 100 : 0;
    
    // 제한 조건 확인
    const isLtvLimited = limitingFactor === 'LTV';
    const isDsrLimited = limitingFactor === 'DSR';
    
    return {
      dsrBasedMaxLoan,
      loanCap,
      tierMaxPrice,
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
  
  // 금융기관별 DSR 한도 (뱃지 표기용)
  const dsrLimit = loan.finance === '50' ? 50 : 40;

  const handleRestart = () => {
    logEvent(analytics, "retry_result");
    if (onRestart) onRestart();
  };

  // 결과 데이터를 서버로 전송 및 배너 광고 표시
  useEffect(() => {
    const sendResultToServer = () => {
      const resultData = {
        caseType: caseType,
        assets: assets,
        incomes: incomes,
        loan: loan,
        calculations: {
          actualLoan: calculations.actualLoan,
          actualHousePrice: calculations.actualHousePrice,
          actualLtvRatio: calculations.actualLtvRatio,
          limitingFactor: calculations.limitingFactor,
          selectedLtv: selectedLtv
        },
        timestamp: new Date().toISOString()
      };
      
      // Firebase Analytics로 결과 전송
      logEvent(analytics, "calculation_result", {
        case_type: caseType,
        actual_loan: Math.floor(calculations.actualLoan),
        actual_house_price: Math.floor(calculations.actualHousePrice),
        limiting_factor: calculations.limitingFactor,
        selected_ltv: selectedLtv,
        total_assets: totalAssets,
        total_income: totalIncome
      });
      
      console.log('Result sent to server:', resultData);
    };
    
    // 계산이 완료되면 서버로 전송
    if (calculations.actualLoan > 0) {
      sendResultToServer();
    }
  }, [caseType, assets, incomes, loan, calculations, selectedLtv, totalAssets, totalIncome]);

  const handleBack = () => {
    logEvent(analytics, "back_from_result");
    if (onEdit) onEdit('loan');
  };

  const { isLtvLimited, limitingFactor } = calculations;
  const paymentLabel = loan.loanType === '원금균등' ? '첫달' : '월 납입';

  return (
    <Screen
      title="결과"
      onBack={handleBack}
      footer={<button className="button button-primary" onClick={handleRestart}>다시 하기</button>}
    >
      <Select pill value={selectedLtv} onChange={setSelectedLtv} options={LTV_SELECT_OPTIONS} />

      <Amount value={formatWon(calculations.actualHousePrice)} accent />

      <dl className="rows">
        <div className="row">
          <dt>자산</dt>
          <dd className="row-value">{formatWon(totalAssets)}</dd>
        </div>
        <div className="row">
          <dt>대출 <Badge>DSR {Math.min(Math.round(actualDsr * 10) / 10, dsrLimit)}%</Badge></dt>
          <dd>
            <div className="row-value">{formatWon(Math.floor(calculations.actualLoan))}</div>
            {calculations.actualLoan > 0 && actualMonthlyPayment > 0 && (
              <div className="row-aside">{paymentLabel} {formatWon(floorToManWon(actualMonthlyPayment))}</div>
            )}
          </dd>
          <dd className="row-meta">
            소득 {formatWon(totalIncome)} / {loan.loanType} / {loan.years}년 / {loan.rate}%
          </dd>
        </div>
      </dl>

      {isLtvLimited && (
        <div className="notice">
          <p>자산을 늘리면 DSR을 더 쓸 수 있어요</p>
          <p>소득 대비 대출 최대치는 <strong>{formatWon(loan.loanAmount)}</strong>입니다</p>
        </div>
      )}
      {(limitingFactor === 'CAP' || limitingFactor === 'PRICE') && (
        <div className="notice">
          <p>
            {limitingFactor === 'CAP'
              ? <>DSR이 남았지만 이 가격대 주택은 대출 <strong>최대 {formatWon(calculations.loanCap)}</strong>으로 제한됩니다</>
              : <>시가 <strong>{formatWon(calculations.tierMaxPrice)}</strong>을 넘으면 대출 한도가 줄어 이 가격이 최대입니다</>}
          </p>
        </div>
      )}

      <div className="fine-print">
        {selectedLtv !== '70_local' && (
          <p>25.10.16부터 수도권·규제지역 주담대는 시가 15억 이하 6억, 15억 초과~25억 이하 4억, 25억 초과 2억으로 제한됩니다.</p>
        )}
        <p>이 결과는 입력값을 기준으로 한 참고용 계산이며, 이 앱은 대출을 제공하거나 중개하지 않습니다. 실제 대출 가능 여부와 한도는 금융기관 심사에 따라 달라집니다.</p>
      </div>
    </Screen>
  );
}

export default ResultScreen; 