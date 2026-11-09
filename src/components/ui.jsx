// 화면 공통 부품. 생김새는 index.css의 같은 이름 클래스가 정하고, 규칙은 design.md에 있다.
import { useEffect, useState } from 'react';

const Chevron = ({ direction = 'left', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={direction === 'left' ? 'M15 19L8 12L15 5' : 'M9 5L16 12L9 19'}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

export const ChevronRight = () => <Chevron direction="right" size={18} />;

// 입력칸에 포커스가 있는 동안 true. 키보드가 하단 버튼을 가리지 않도록 아래 여백을 늘릴 때 쓴다.
export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    const hide = () => setOpen(false);
    window.addEventListener('focusin', show);
    window.addEventListener('focusout', hide);
    return () => {
      window.removeEventListener('focusin', show);
      window.removeEventListener('focusout', hide);
    };
  }, []);
  return [open, setOpen];
}

// 모든 입력 화면의 뼈대: 상단(뒤로·제목·보조 동작) / 본문 / 하단 고정 버튼
export function Screen({ title, onBack, action, footer, keyboardOpen = false, children }) {
  return (
    <div className="screen">
      {(title || onBack) && (
        <header className="screen-header">
          {onBack && (
            <button className="icon-button back-button" onClick={onBack} aria-label="뒤로">
              <Chevron />
            </button>
          )}
          <h1 className="screen-title">{title}</h1>
          {action}
        </header>
      )}
      <main className={keyboardOpen ? 'screen-body keyboard-open' : 'screen-body'}>{children}</main>
      {footer && <div className="screen-footer">{footer}</div>}
    </div>
  );
}

// 화면 맨 위의 큰 금액. aside는 같은 줄 오른쪽에 붙는 작은 값(월 납입 등).
export function Amount({ value, aside, accent = false }) {
  return (
    <div className="amount">
      <span className={accent ? 'amount-value amount-accent' : 'amount-value'}>{value}</span>
      {aside && <span className="amount-aside">{aside}</span>}
    </div>
  );
}

// 라벨 + 입력(또는 선택) + 아래 보조 값 한 칸
export function Field({ label, below, children }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      {children}
      {below !== undefined && <div className="field-below">{below}</div>}
    </div>
  );
}

// pill: 결과 화면 맨 위처럼 화면 전체 조건을 바꾸는 선택 (알약 모양)
export function Select({ value, onChange, options, pill = false }) {
  return (
    <div className={pill ? 'select-wrap select-wrap-pill' : 'select-wrap'}>
      <select className={pill ? 'select select-pill' : 'select'} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export const Badge = ({ children }) => <span className="badge">{children}</span>;
