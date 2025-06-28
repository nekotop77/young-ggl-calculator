function HomeScreen({ onStart, onSetting }) {
  return (
    <div className="home-screen">
      <div className="screen-container">
        <div style={{position:'absolute',top:'16px',right:'16px',zIndex:2}}>
          <button onClick={onSetting} style={{background:'none',border:'none',padding:0,cursor:'pointer'}} aria-label="설정">
            <span className="material-icons" style={{fontSize:'24px',color:'#fff'}}>settings</span>
          </button>
        </div>
        <div className="content-container">
          <h1 className="main-title">
            내집마련
            <br />
            얼마까지 가능할까?
            <br />
            <strong>영끌 계산기</strong>
          </h1>
          <div className="selection-container">
            <div className="selection-card">
              <div className="icon">🏡</div>
              <div className="label">최소 ?억</div>
            </div>
            <div className="selection-card">
              <div className="icon">🏡</div>
              <div className="label">최대 ?억</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed-bottom-container">
        <button className="bottom-button" onClick={onStart}>
          시작하기
        </button>
      </div>
    </div>
  );
}

export default HomeScreen; 