import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import AssetScreen from './components/AssetScreen';
import IncomeScreen from './components/IncomeScreen';
import LoanScreen from './components/LoanScreen';
import ResultScreen from './components/ResultScreen';
import LoadingScreen from './components/LoadingScreen';
import SplashScreen from './components/SplashScreen';

function App() {
  const [screen, setScreen] = useState('splash'); // 'splash', 'home', 'assets', 'income', 'loan', 'result', etc.
  
  // 스플래시 화면 타이머
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('home');
      }, 2000); // 2초 후 홈화면으로 이동
      
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // 자산 입력값
  const [assets, setAssets] = useState({
    cash: 0,
    stocks: 0,
    severance: 0,
    insurance: 0,
  });
  // 소득 입력값
  const [incomes, setIncomes] = useState({
    salary: 0,
    bonus: 0,
    side: 0,
    other: 0,
  });
  // 대출 입력값
  const [loan, setLoan] = useState({
    loanAmount: 0,
    monthlyPayment: 0,
    finance: '40',
    loanType: '원리금균등',
    years: 40,
    rate: 3.3,
    dsrCalculated: false,
  });

  const handleStart = () => {
    setScreen('assets');
  };

  const handleBackToHome = () => {
    setScreen('home');
  };
  
  const handleAssetsNext = () => {
    setScreen('income');
  };

  const handleIncomeNext = () => {
    setScreen('loan');
  };

  const handleLoanBack = () => {
    setScreen('income');
  };

  const handleLoanNext = () => {
    setScreen('loading');
    // 2초 후 결과 화면으로 이동
    setTimeout(() => {
      setScreen('result');
    }, 2000);
  };

  const handleLoanEditComplete = () => {
    setScreen('loading');
    // 2초 후 결과 화면으로 이동
    setTimeout(() => {
      setScreen('result');
    }, 2000);
  };

  const handleRestart = () => {
    setAssets({ cash: 0, stocks: 0, severance: 0, insurance: 0 });
    setIncomes({ salary: 0, bonus: 0, side: 0, other: 0 });
    setLoan({
      loanAmount: 0,
      monthlyPayment: 0,
      finance: '40',
      loanType: '원리금균등',
      years: 40,
      rate: 3.3,
      dsrCalculated: false,
    });
    setScreen('home');
  };

  // 현재 화면 상태에 따라 적절한 컴포넌트를 렌더링
  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen />;
      case 'assets':
        return <AssetScreen assets={assets} setAssets={setAssets} onNext={handleAssetsNext} onBack={handleBackToHome} isEdit={false} onEditComplete={() => setScreen('result')} />;
      case 'assets_edit':
        return <AssetScreen assets={assets} setAssets={setAssets} onNext={handleAssetsNext} onBack={handleBackToHome} isEdit={true} onEditComplete={() => setScreen('result')} />;
      case 'income':
        return <IncomeScreen incomes={incomes} setIncomes={setIncomes} onNext={handleIncomeNext} onBack={() => setScreen('assets')} isEdit={false} onEditComplete={() => setScreen('result')} loan={loan} />;
      case 'income_edit':
        return <IncomeScreen incomes={incomes} setIncomes={setIncomes} onNext={handleIncomeNext} onBack={() => setScreen('assets')} isEdit={true} onEditComplete={() => setScreen('result')} loan={loan} />;
      case 'loan':
        return <LoanScreen loan={loan} setLoan={setLoan} incomes={incomes} assets={assets} onBack={handleLoanBack} onNext={handleLoanNext} isEdit={false} onEditComplete={handleLoanEditComplete} />;
      case 'loan_edit':
        return <LoanScreen loan={loan} setLoan={setLoan} incomes={incomes} assets={assets} onBack={handleLoanBack} onNext={handleLoanNext} isEdit={true} onEditComplete={handleLoanEditComplete} />;
      case 'loading':
        return <LoadingScreen />;
      case 'result':
        return <ResultScreen assets={assets} incomes={incomes} loan={loan} onRestart={handleRestart} onEdit={type => setScreen(type + '_edit')} />;
      case 'home':
      default:
        return <HomeScreen onStart={handleStart} />;
    }
  };

  return (
    <>
      {renderScreen()}
    </>
  );
}

export default App;
