import { useRef, useEffect, useState } from 'react';
import NumericField from './NumericField';
import { Screen, Amount, Field, Select, Badge, useKeyboardOpen } from './ui';
import { formatWon, floorToManWon } from '../format';

const financeOptions = [
  { value: '40', label: '제1금융기관 40%' },
  { value: '50', label: '제2금융기관 50%' },
];

const loanTypeOptions = [
  { value: '원리금균등', label: '원리금균등분할상환' },
  { value: '원금균등', label: '원금균등분할상환' }
];

function LoanScreen({ loan, setLoan, incomes, assets, onBack, onNext, isEdit, onEditComplete }) {
  const loanAmountInputRef = useRef(null);
  const yearsInputRef = useRef(null);
  const rateInputRef = useRef(null);
  const dsrButtonRef = useRef(null);
  const [dsrCalculated, setDsrCalculated] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [dsr, setDsr] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useKeyboardOpen();
  const [stressDsr, setStressDsr] = useState(null);
  const [stressLimit, setStressLimit] = useState(null);
  const [stressMonthly, setStressMonthly] = useState(null);

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

  useEffect(() => {
    // loanType이 없으면 기본값을 '원리금균등'으로 설정
    if (!loan.loanType) {
      setLoan(prev => ({ ...prev, loanType: '원리금균등' }));
    }
  }, []);

  const handleLoanChange = (id, value) => {
    if (id === 'loanType') {
      setLoan(prev => ({
        ...prev,
        loanType: value,
        loanAmount: 0,
        monthlyPayment: 0,
        firstMonthPayment: 0,
        dsr: 0,
        dsrCalculated: false
      }));
      setDsrCalculated(false);
      setMonthlyPayment(0);
      setDsr(0);
      return;
    }
    if (id === 'finance') {
      setLoan(prev => ({
        ...prev,
        [id]: value,
        loanAmount: 0,
        monthlyPayment: 0,
        firstMonthPayment: 0,
        dsr: 0,
        dsrCalculated: false
      }));
      setDsrCalculated(false);
      setMonthlyPayment(0);
      setDsr(0);
      return;
    }
    const cleanValue = value.replace(/원/g, '').replace(/[^0-9.]/g, '');
    let numericValue = cleanValue === '' ? 0 : Number(cleanValue);
    if (id !== 'rate' && numericValue >= 100000000000) numericValue = 99999999999;
    setLoan(prev => ({ ...prev, [id]: numericValue }));
  };

  // 금리는 "3." 처럼 입력 중인 소수점을 지키려고 문자열로 따로 들고 있는다
  const [rateText, setRateText] = useState(isEdit && loan.rate ? String(loan.rate) : '');
  const handleRateText = (text) => {
    let t = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const dot = t.indexOf('.');
    if (dot !== -1) t = t.slice(0, dot + 1) + t.slice(dot + 1).replace(/\./g, '');
    setRateText(t);
    handleLoanChange('rate', t);
  };

  // 대출기간 개월수 계산
  const months = loan.years ? loan.years * 12 : 0;
  // 연소득 계산 (소득 입력값 합계)
  const totalIncome = Object.values(incomes).reduce((sum, val) => sum + Number(val), 0);
  // 총 대출금액 계산 (자산 입력값 합계)
  const totalLoanAmount = Object.values(assets).reduce((sum, val) => sum + Number(val), 0);

  // 월 납입 계산 함수 (상환방식별)
  const calculateMonthlyPayment = (principal, annualRate, years, loanType) => {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;
    
    switch (loanType) {
      case '원리금균등': {
        // 원리금균등 월납입 계산 공식
        // PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        const numerator = monthlyRate * factor;
        const denominator = factor - 1;
        
        if (denominator === 0) return 0;
        const result = principal * (numerator / denominator);

        return result;
      }
      case '원금균등': {
        // 원금균등상환: DSR 40% 한도에 맞춰 대출 한도 계산 (이진탐색, 평균 월납입 기준)
        const maxAnnualPayment = totalIncome * dsrLimit;
        let low = 0;
        let high = totalIncome * 20;
        let result = 0;
        while (high - low > 10000) {
          const mid = Math.floor((low + high) / 2);
          const monthlyPrincipal = mid / months;
          const averageInterest = mid * loan.rate * (months + 1) / (2 * months);
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
      case '만기일시': {
        // 만기일시상환: 실제 금융권 계산기와 최대한 동일하게
        // DSR 한도 39.99% 적용
        const stressFactor = 1.825;
        const annualRate = loan.rate / 100;
        const dsrLimitReal = 0.3999; // 39.99%
        const maxAnnualPayment = totalIncome * dsrLimitReal;
        if (annualRate === 0) return 0;
        // 만원 단위 내림
        return Math.floor(maxAnnualPayment / (annualRate * stressFactor) / 10000) * 10000;
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
        // 월이자율
        const r = loan.rate / 100 / 12;
        const n = loan.years * 12;
        if (r === 0 || n === 0) return Math.floor(maxMonthlyPayment * n);
        const factor = Math.pow(1 + r, n);
        // 대출한도 역산 공식
        return Math.floor(maxMonthlyPayment * (factor - 1) / (r * factor));
      }
      case '원금균등': {
        // 원금균등 역산 공식
        // 월 평균 납입 = P/n + P*r*(n+1)/(2*n))
        // P = 월 평균 납입 / (1/n + r*(n+1)/(2*n))
        const principalCoeff = 1 / n;
        const interestCoeff = rate * (n + 1) / (2 * n);
        const totalCoeff = principalCoeff + interestCoeff;
        const result = Math.floor(maxMonthlyPayment / totalCoeff);
        
        return result;
      }
      case '만기일시': {
        // 만기일시상환: 스트레스 DSR 적용
        // 대출한도 = (연소득 × DSR한도) / (연이율 × 스트레스가중치)
        const stressFactor = 1.825;
        const annualRate = loan.rate / 100;
        if (annualRate === 0) return 0;
        return Math.floor(maxAnnualPayment / (annualRate * stressFactor));
      }
      default:
        return 0;
    }
  };

  const maxLoanAmount = calcMaxLoanAmount();

  // 스트레스 DSR 계산 함수
  const calcStressDSR = () => {
    const stressYears = 5;
    const stressRate = Math.max(Number(loan.rate) + 1, 4); // 입력금리+1%, 최소4%
    const stressLimitRatio = loan.finance === '50' ? 0.5 : 0.4;
    const income = Object.values(incomes).reduce((sum, val) => sum + Number(val), 0);
    if (!income || !stressRate) return {dsr: 0, limit: 0, monthly: 0};
    // 스트레스DSR 한도
    const limit = income * stressLimitRatio;
    // 월상환액(원리금균등, 5년, 스트레스금리)
    const principal = loan.loanAmount;
    const r = stressRate / 100 / 12;
    const n = stressYears * 12;
    let monthly = 0;
    if (principal > 0 && r > 0 && n > 0) {
      const factor = Math.pow(1 + r, n);
      monthly = principal * (r * factor) / (factor - 1);
    }
    const annual = monthly * 12;
    const dsr = income > 0 ? Math.round((annual / income) * 10000) / 100 : 0;
    return { dsr, limit, monthly };
  };

  const handleDsrCalc = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setKeyboardOpen(false);
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
      // 평균 월납입(DSR 산정용)
      actualLoanAmount = Math.floor(maxLoanAmount / 10000) * 10000;
      const monthlyPrincipal = actualLoanAmount / months;
      const monthlyRate = loan.rate / 100 / 12;
      const averageInterest = actualLoanAmount * monthlyRate * (months + 1) / (2 * months);
      const averageMonthlyPayment = monthlyPrincipal + averageInterest;
      // 첫달 월납입(표시용)
      const firstMonthInterest = actualLoanAmount * monthlyRate;
      const firstMonthPayment = monthlyPrincipal + firstMonthInterest;
      actualMonthlyPayment = averageMonthlyPayment;
      annualPayment = averageMonthlyPayment * 12;
      dsrValue = income > 0 ? (annualPayment / income) * 100 : 0;
      dsrValue = Math.round(dsrValue * 100) / 100;
      setMonthlyPayment(averageMonthlyPayment);
      setDsr(dsrValue);
      setDsrCalculated(true);
      setLoan(prev => ({ ...prev, monthlyPayment: averageMonthlyPayment, firstMonthPayment, loanAmount: actualLoanAmount, dsr: dsrValue, dsrCalculated: true }));
      return;
    } else if (loan.loanType === '만기일시') {
      // 만기일시상환: 실제 금융권 계산기와 최대한 동일하게
      const stressFactor = 1.825;
      const annualRate = loan.rate / 100;
      const dsrLimitReal = 0.3999; // 39.99%
      const maxAnnualPayment = income * dsrLimitReal;
      // 만원 단위 내림
      actualLoanAmount = Math.floor(maxAnnualPayment / (annualRate * stressFactor) / 10000) * 10000;
      actualMonthlyPayment = Math.floor(actualLoanAmount * (loan.rate / 100 / 12));
      annualPayment = actualLoanAmount * (loan.rate / 100) * stressFactor;
      dsrValue = income > 0 ? Math.floor((annualPayment / income) * 10000) / 100 : 0;
      setMonthlyPayment(actualMonthlyPayment);
      setDsr(dsrValue);
      setDsrCalculated(true);
      setLoan(prev => ({ ...prev, monthlyPayment: actualMonthlyPayment, loanAmount: actualLoanAmount, dsr: dsrValue, dsrCalculated: true }));
      return;
    } else {
      // 원리금균등: DSR 40% 딱 맞는 값으로 계산
      actualLoanAmount = Math.floor(maxLoanAmount / 10000) * 10000; // 만원 단위 반올림
      actualMonthlyPayment = calculateMonthlyPayment(actualLoanAmount, loan.rate, loan.years, loan.loanType);
      annualPayment = actualMonthlyPayment * 12;
      dsrValue = income > 0 ? (annualPayment / income) * 100 : 0;
      
      // 최종 DSR 반올림
      dsrValue = Math.round(dsrValue * 100) / 100;
    }

    setMonthlyPayment(actualMonthlyPayment);
    setDsr(dsrValue);
    setDsrCalculated(true);
    setLoan(prev => ({ ...prev, monthlyPayment: actualMonthlyPayment, loanAmount: actualLoanAmount, dsr: dsrValue, dsrCalculated: true }));

    // 스트레스 DSR 계산 추가
    const stress = calcStressDSR();
    setStressDsr(stress.dsr);
    setStressLimit(stress.limit);
    setStressMonthly(stress.monthly);
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

  const handleKeyPress = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleNext = (e) => {
    setKeyboardOpen(false);
    if (isEdit && onEditComplete) onEditComplete(e);
    else if (onNext) onNext(e);
  };

  const handleBack = (e) => {
    setKeyboardOpen(false);
    if (onBack) onBack(e);
  };

  const showDsr = (dsrCalculated && dsr > 0) || (isEdit && loan.dsrCalculated && loan.dsr > 0);
  const isFirstMonthType = loan.loanType === '원금균등';
  const showPayment = dsrCalculated && (isFirstMonthType
    ? loan.firstMonthPayment > 0
    : (monthlyPayment > 0 || loan.monthlyPayment > 0));
  const paymentText = isFirstMonthType
    ? `첫달 ${formatWon(floorToManWon(loan.firstMonthPayment))}`
    : `월 납입 ${formatWon(floorToManWon(monthlyPayment || loan.monthlyPayment))}`;

  return (
    <Screen
      title="대출"
      onBack={handleBack}
      keyboardOpen={keyboardOpen}
      footer={
        <button className="button button-primary" disabled={!dsrCalculated} onClick={handleNext}>
          결과 보기
        </button>
      }
    >
      <Amount
        value={formatWon(dsrCalculated && loan.loanAmount > 0 ? loan.loanAmount : 0)}
        aside={showPayment ? paymentText : null}
      />
      {showDsr && <div className="amount-badges"><Badge>DSR {dsr || loan.dsr}%</Badge></div>}
      <div className="field-list">
        <Field label="금융기관">
          <Select value={loan.finance} onChange={(v) => handleLoanChange('finance', v)} options={financeOptions} />
        </Field>
        <Field label="주담대 종류">
          <Select value={loan.loanType || '원리금균등'} onChange={(v) => handleLoanChange('loanType', v)} options={loanTypeOptions} />
        </Field>
        <Field label="대출기간(년)" below={loan.years > 0 ? `${months}개월` : ''}>
          <NumericField
            ref={yearsInputRef}
            placeholder="대출기간 입력하세요"
            value={loan.years === 0 ? '' : String(loan.years)}
            onChange={(text) => handleLoanChange('years', text.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => handleKeyPress(e, rateInputRef)}
          />
        </Field>
        <Field label="금리(%)">
          <NumericField
            ref={rateInputRef}
            inputMode="decimal"
            placeholder="금리를 입력하세요"
            value={rateText}
            onChange={handleRateText}
            onKeyDown={(e) => handleKeyPress(e, dsrButtonRef)}
          />
        </Field>
      </div>
      <button ref={dsrButtonRef} className="button button-secondary" disabled={!isDsrReady} onClick={handleDsrCalc}>
        DSR 계산
      </button>
    </Screen>
  );
}

export default LoanScreen;