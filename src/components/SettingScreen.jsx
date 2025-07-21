import React from 'react';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function SettingScreen({ onBack, onShowPrivacy, onShowLicense }) {
  return (
    <div className="screen-container">
      <header className="screen-header">
        <button className="back-button" onClick={onBack} style={{marginLeft:'-8px'}}>
          <BackIcon />
        </button>
        <h1 className="screen-title">설정</h1>
      </header>
      <main style={{padding:'0 0.5rem'}}>
        <ul style={{listStyle:'none',padding:0,margin:0}}>
          <li style={{borderBottom:'1px solid #222',padding:'1rem 0',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
            <button onClick={onShowPrivacy} style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',color:'inherit',textDecoration:'none',background:'none',border:'none',padding:0,cursor:'pointer'}}>
              개인정보 처리방침
              <span className="material-icons" style={{fontSize:'18px',color:'#888'}}>arrow_forward_ios</span>
            </button>
          </li>
          <li style={{borderBottom:'1px solid #222',padding:'1rem 0',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
            <button onClick={onShowLicense} style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',color:'inherit',textDecoration:'none',background:'none',border:'none',padding:0,cursor:'pointer'}}>
              오픈소스라이선스
              <span className="material-icons" style={{fontSize:'18px',color:'#888'}}>arrow_forward_ios</span>
            </button>
          </li>
        </ul>
        <div style={{color:'#888',fontSize:'0.95rem'}}>
          <div style={{fontWeight:400,marginBottom:'0.2rem'}}>Version</div>
          <div style={{fontWeight:400}}>1.8.0</div>
        </div>
      </main>
    </div>
  );
}

export default SettingScreen; 