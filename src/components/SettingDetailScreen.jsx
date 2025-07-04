import React from 'react';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function SettingDetailScreen({ title, src, onBack }) {
  return (
    <div className="screen-container" style={{padding:0,background:'#101124',height:'100vh',width:'100vw',maxWidth:'100vw'}}>
      <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:1000,background:'#101124',display:'flex',flexDirection:'column'}}>
        <header className="screen-header" style={{
          display:'flex',
          alignItems:'center',
          height:'56px',
          padding:'2.25rem 0.5rem 0 0.5rem',
          background:'#101124',
          zIndex:2
        }}>
          <button className="back-button" onClick={onBack} style={{marginLeft:'8px',background:'none',border:'none',padding:0,cursor:'pointer'}} aria-label="뒤로가기">
            <BackIcon />
          </button>
          <h1 className="screen-title" style={{fontSize:'1.2rem',fontWeight:700,marginLeft:'8px'}}>{title}</h1>
        </header>
        <iframe
          src={src}
          title={title}
          style={{flex:1,width:'100vw',height:'calc(100vh - 56px)',border:'none',background:'#fff',zIndex:1}}
        />
      </div>
    </div>
  );
}

export default SettingDetailScreen; 