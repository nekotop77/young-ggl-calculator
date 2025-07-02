import React from 'react';

function SplashScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0D0E1C',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        backgroundColor: 'rgba(60, 76, 255, 0.2)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        top: '-100px',
        right: '10%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '250px',
        height: '250px',
        backgroundColor: 'rgba(197, 37, 251, 0.2)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        bottom: '-80px',
        left: '10%',
        zIndex: 0
      }} />
      
      <div style={{
        textAlign: 'center',
        color: '#ffffff',
        position: 'relative',
        zIndex: 1
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
          영끌 내집
        </div>
      </div>
    </div>
  );
}

export default SplashScreen; 