function ResultScreen({ onRestart }) {
  return (
    <>
      <button className="retry-button" onClick={onRestart}>
        다시하기
      </button>
      <div className="result-container">
        <h1 className="result-message">
          그래 너 돈<br />
          많네?<br />
          ㅋㅋㅋ
        </h1>
      </div>
    </>
  );
}

export default ResultScreen; 