import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingScreen = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/result');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="screen-container" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center'
    }}>
      {/* 점 3개 애니메이션 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          animation: 'loadingBlink 1.5s infinite',
          animationDelay: '0s'
        }}></div>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          animation: 'loadingBlink 1.5s infinite',
          animationDelay: '0.5s'
        }}></div>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          animation: 'loadingBlink 1.5s infinite',
          animationDelay: '1s'
        }}></div>
      </div>

      {/* 로딩 텍스트 */}
      <div style={{
        fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
        fontWeight: '700',
        color: '#fff',
        lineHeight: '1.4',
        marginBottom: '1rem'
      }}>
        잠시 기다려주세요
      </div>
      <div style={{
        fontSize: 'clamp(1rem, 3vw, 1.125rem)',
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: '1.5'
      }}>
        살 수있는 집 담보 비율에 맞게<br />
        대출을 다시 계산하고 있어요
      </div>


    </div>
  );
};

export default LoadingScreen; 