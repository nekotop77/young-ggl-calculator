import { useState } from 'react';
import InitialScreen from './components/InitialScreen';
import ResultScreen from './components/ResultScreen';

function App() {
  const [screen, setScreen] = useState('initial'); // 'initial' 또는 'result'
  const [amounts, setAmounts] = useState({ cash: 0, severancePay: 0 });

  const handleRestart = () => {
    setScreen('initial');
  };

  const handleShowResult = (data) => {
    setAmounts(data);
    setScreen('result');
  };

  if (screen === 'result') {
    return <ResultScreen onRestart={handleRestart} />;
  }

  return <InitialScreen onNext={handleShowResult} />;
}

export default App;
