function HomeScreen({ onStart }) {
  return (
    <div className="screen-container">
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

      <button className="bottom-button" onClick={onStart}>
        시작하기
      </button>
    </div>
  );
}

export default HomeScreen; 