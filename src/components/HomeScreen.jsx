import logo from '../assets/logo.svg';

function HomeScreen({ onStart, onSetting }) {
  return (
    <div className="screen-container">
      <div style={{position:'absolute',right:'16px',zIndex:2,display:'flex',gap:'8px'}}>
        <button onClick={onSetting} style={{background:'none',border:'none',padding:0,cursor:'pointer'}}>
          <span className="material-icons" style={{fontSize:'24px',color:'#fff'}}>settings</span>
        </button>
      </div>
      <div className="content-container">
        <h1 className="main-title">
          내집마련
          <br />
          얼마까지 가능할까?
          <br />
          <img 
            src={logo} 
            alt="영끌 내집" 
            style={{
              height: '2.5rem',
              width: 'auto',
              marginTop: '0.5rem',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))'
            }}
          />
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
      <div className="fixed-bottom-container">
        <button className="bottom-button" onClick={onStart}>
          시작하기
        </button>
      </div>
    </div>
  );
}

export default HomeScreen; 