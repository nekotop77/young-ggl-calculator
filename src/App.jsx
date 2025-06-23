import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import AssetScreen from './components/AssetScreen';
import IncomeScreen from './components/IncomeScreen';

function App() {
  const [screen, setScreen] = useState('home'); // 'home', 'assets', 'income', etc.

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
    // TODO: A04 대출화면으로 이동
    console.log('대출 화면으로 이동');
  };

  // 현재 화면 상태에 따라 적절한 컴포넌트를 렌더링
  const renderScreen = () => {
    switch (screen) {
      case 'assets':
        return <AssetScreen onNext={handleAssetsNext} onBack={handleBackToHome} />;
      case 'income':
        return <IncomeScreen onNext={handleIncomeNext} onBack={() => setScreen('assets')} />;
      case 'home':
      default:
        return <HomeScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="mobile-frame">
      {renderScreen()}
    </div>
  );
}

export default App;
