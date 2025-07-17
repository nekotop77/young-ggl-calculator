import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import AssetScreen from './components/AssetScreen';
import IncomeScreen from './components/IncomeScreen';
import LoanScreen from './components/LoanScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';
import SettingScreen from './components/SettingScreen';
import SettingDetailScreen from './components/SettingDetailScreen';
import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";
import { App as CapApp } from '@capacitor/app';

function App() {
  const [step, setStep] = useState('home');
  const [assets, setAssets] = useState({ cash: 0, stocks: 0, severance: 0, insurance: 0 });
  const [incomes, setIncomes] = useState({ salary: 0, bonus: 0, side: 0, other: 0 });
  const [loan, setLoan] = useState({ loanType: '원리금균등', finance: '40', years: 0, rate: 0, loanAmount: 0, dsr: 0, dsrCalculated: false });

  // 화면 이동 핸들러
  const goToAsset = () => setStep('asset'); // A02
  const goToIncome = () => setStep('income'); // A03
  const goToLoan = () => setStep('loan'); // A04
  const goToLoading = () => setStep('A04-1'); // A04-1(로딩)
  const goToResult = () => setStep('result'); // A05
  const goToSetting = () => setStep('setting'); // A06
  const goToSettingPrivacy = () => setStep('setting-privacy'); // A06-1
  const goToSettingLicense = () => setStep('setting-license'); // A06-2
  const restart = () => {
    setAssets({ cash: 0, stocks: 0, severance: 0, insurance: 0 });
    setIncomes({ salary: 0, bonus: 0, side: 0, other: 0 });
    setLoan({ loanType: '원리금균등', finance: '40', years: 0, rate: 0, loanAmount: 0, dsr: 0, dsrCalculated: false });
    setStep('home');
  };
  const goToAssetBackToHome = () => setStep('home');

  // A04-1(로딩)에서 결과화면으로 자동 이동
  React.useEffect(() => {
    if (step === 'A04-1') {
      const timer = setTimeout(() => {
        setStep('result');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // 결과화면에서 뒤로가기 시 A04(대출, isEdit)로 이동
  React.useEffect(() => {
    if (step === 'result') {
      window.history.pushState({ page: 'result' }, '', '');
      const handlePopState = (e) => {
        setStep('loanFromResult');
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [step]);

  useEffect(() => {
    // step 값에 따라 screen_view 이벤트 기록
    let screenName = "";
    if (step === "home") screenName = "HomePage";
    else if (step === "asset") screenName = "AssetPage";
    else if (step === "income") screenName = "IncomePage";
    else if (step === "loan" || step === "loanFromResult") screenName = "LoanPage";
    else if (step === "A04-1") screenName = "LoadingPage";
    else if (step === "result") screenName = "ResultPage";
    else if (step === "setting") screenName = "SettingPage";
    else if (step === "setting-privacy") screenName = "SettingPrivacyPage";
    else if (step === "setting-license") screenName = "SettingLicensePage";
    if (screenName) {
      logEvent(analytics, "screen_view", { firebase_screen: screenName });
    }
  }, [step]);

  useEffect(() => {
    const handleBackButton = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
      // step별 내부 뒤로가기 분기
      if (step === 'setting-privacy' || step === 'setting-license') {
        setStep('setting');
      } else if (step === 'setting') {
        setStep('home');
      } else if (step === 'asset') {
        setStep('home');
      } else if (step === 'income') {
        setStep('asset');
      } else if (step === 'loan' || step === 'loanFromResult') {
        setStep('income');
      } else if (step === 'A04-1') {
        setStep('loan');
      } else if (step === 'result') {
        setStep('loanFromResult');
      } else {
        // 홈 등에서는 디폴트(앱 종료) 허용
        window.history.back();
      }
    };
    document.addEventListener('backbutton', handleBackButton, false);
    return () => {
      document.removeEventListener('backbutton', handleBackButton, false);
    };
  }, [step]);

  // 안드로이드 하드웨어 뒤로가기: step 상태에 따라 직접 분기 처리
  useEffect(() => {
    const backHandler = (event) => {
      if (event && event.preventDefault) event.preventDefault();
      // step별 내부 뒤로가기 분기
      if (step === 'setting-privacy' || step === 'setting-license') {
        setStep('setting');
      } else if (step === 'setting') {
        setStep('home');
      } else if (step === 'asset') {
        setStep('home');
      } else if (step === 'income') {
        setStep('asset');
      } else if (step === 'loan' || step === 'loanFromResult') {
        setStep('income');
      } else if (step === 'A04-1') {
        setStep('loan');
      } else if (step === 'result') {
        setStep('loanFromResult');
      } else {
        // 홈 등에서는 앱 종료(백그라운드로 내리기)
        CapApp.exitApp();
      }
    };
    const remove = CapApp.addListener('backButton', backHandler);
    return () => {
      remove && remove();
      CapApp.removeAllListeners && CapApp.removeAllListeners('backButton');
    };
  }, [step]);

  return (
    <>
      {step === 'home' && <HomeScreen onStart={goToAsset} onSetting={goToSetting} />}
      {step === 'setting' && <SettingScreen onBack={restart} onShowPrivacy={goToSettingPrivacy} onShowLicense={goToSettingLicense} />}
      {step === 'setting-privacy' && <SettingDetailScreen title="개인정보 처리방침" src="https://young-ggl-calculator.vercel.app/privacy.html" onBack={goToSetting} />}
      {step === 'setting-license' && <SettingDetailScreen title="오픈소스라이선스" src="https://young-ggl-calculator.vercel.app/license.html" onBack={goToSetting} />}
      {step === 'asset' && <AssetScreen assets={assets} setAssets={setAssets} onNext={goToIncome} onBack={goToAssetBackToHome} />}
      {step === 'income' && <IncomeScreen incomes={incomes} setIncomes={setIncomes} onNext={goToLoan} onBack={goToAsset} loan={loan} />}
      {(step === 'loan' || step === 'loanFromResult') && (
        <LoanScreen loan={loan} setLoan={setLoan} incomes={incomes} assets={assets} onBack={goToIncome} onNext={goToLoading} isEdit={step === 'loanFromResult'} onEditComplete={goToResult} />
      )}
      {step === 'A04-1' && <LoadingScreen />}
      {step === 'result' && <ResultScreen assets={assets} incomes={incomes} loan={loan} onRestart={restart} onEdit={(target) => {
        if (target === 'asset') setStep('asset');
        else if (target === 'income') setStep('income');
        else if (target === 'loan') setStep('loanFromResult');
      }} />}
    </>
  );
}

export default App;
