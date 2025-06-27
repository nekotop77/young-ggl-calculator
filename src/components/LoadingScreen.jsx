import React from 'react';

function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #2D1B69 0%, #1A0E42 50%, #0F0624 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <div style={{
          fontSize: 'clamp(1.5rem, 6vw, 2rem)',
          fontWeight: 500,
          marginBottom: '0.5rem',
          letterSpacing: '-0.5px'
        }}>
          내집마련
        </div>
        <div style={{
          fontSize: 'clamp(1.5rem, 6vw, 2rem)',
          fontWeight: 500,
          marginBottom: '1rem',
          letterSpacing: '-0.5px'
        }}>
          얼마까지 가능할까?
        </div>
        <div style={{
          fontSize: 'clamp(2.5rem, 10vw, 3.5rem)',
          fontWeight: 700,
          letterSpacing: '-1px'
        }}>
          영끌 계산기
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen; 