import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation
} from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import AssetScreen from './components/AssetScreen';
import IncomeScreen from './components/IncomeScreen';
import LoanScreen from './components/LoanScreen';
import ResultScreen from './components/ResultScreen';
import LoadingScreen from './components/LoadingScreen';
import SettingScreen from './components/SettingScreen';

function AppRoutes() {
  const [assets, setAssets] = useState({ cash: 0, stocks: 0, severance: 0, insurance: 0 });
  const [incomes, setIncomes] = useState({ salary: 0, bonus: 0, side: 0, other: 0 });
  const [loan, setLoan] = useState({
    loanAmount: 0,
    monthlyPayment: 0,
    finance: '40',
    loanType: '원리금균등',
    years: 40,
    rate: 3.3,
    dsrCalculated: false,
  });
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<HomeScreen onStart={() => navigate('/assets')} onSetting={() => navigate('/setting')} />} />
      <Route path="/assets" element={<AssetScreen assets={assets} setAssets={setAssets} onNext={() => navigate('/income')} onBack={() => navigate('/')} isEdit={false} onEditComplete={() => navigate('/result')} />} />
      <Route path="/assets_edit" element={<AssetScreen assets={assets} setAssets={setAssets} onNext={() => navigate('/income')} onBack={() => navigate('/')} isEdit={true} onEditComplete={() => navigate('/result')} />} />
      <Route path="/income" element={<IncomeScreen incomes={incomes} setIncomes={setIncomes} onNext={() => navigate('/loan')} onBack={() => navigate('/assets')} isEdit={false} onEditComplete={() => navigate('/result')} loan={loan} />} />
      <Route path="/income_edit" element={<IncomeScreen incomes={incomes} setIncomes={setIncomes} onNext={() => navigate('/loan')} onBack={() => navigate('/assets')} isEdit={true} onEditComplete={() => navigate('/result')} loan={loan} />} />
      <Route path="/loan" element={<LoanScreen loan={loan} setLoan={setLoan} incomes={incomes} assets={assets} onBack={() => navigate('/income')} onNext={() => navigate('/loading')} isEdit={false} onEditComplete={() => navigate('/result')} />} />
      <Route path="/loan_edit" element={<LoanScreen loan={loan} setLoan={setLoan} incomes={incomes} assets={assets} onBack={() => navigate('/income')} onNext={() => navigate('/loading')} isEdit={true} onEditComplete={() => navigate('/result')} />} />
      <Route path="/loading" element={<LoadingScreen />} />
      <Route path="/result" element={<ResultScreen assets={assets} incomes={incomes} loan={loan} onRestart={() => {
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
        navigate('/');
      }} onEdit={type => navigate(`/${type}_edit`)} />} />
      <Route path="/setting" element={<SettingScreen onBack={() => navigate('/')} />} />
      <Route path="*" element={<HomeScreen onStart={() => navigate('/assets')} onSetting={() => navigate('/setting')} />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
