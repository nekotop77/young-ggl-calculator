import { forwardRef, useLayoutEffect, useRef } from 'react';

// 크롬 안드로이드는 <input>에 포커스가 가면 키보드 위에 자동완성 바(비밀번호·카드·주소)를 띄우고,
// autocomplete="off"도 무시한다. 입력칸을 contenteditable로 만들어 자동완성 대상에서 뺀다.

const countDigits = (text) => (text.match(/[0-9.]/g) || []).length;

function caretDigitOffset(el) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !el.contains(sel.anchorNode)) return null;
  const range = sel.getRangeAt(0).cloneRange();
  range.selectNodeContents(el);
  range.setEnd(sel.anchorNode, sel.anchorOffset);
  return countDigits(range.toString());
}

function placeCaret(el, digitOffset) {
  const sel = window.getSelection();
  if (!sel) return;
  const text = el.textContent;
  let pos = text.length;
  if (digitOffset !== null) {
    let seen = 0;
    pos = 0;
    while (pos < text.length && seen < digitOffset) {
      if (/[0-9.]/.test(text[pos])) seen++;
      pos++;
    }
  }
  const range = document.createRange();
  const node = el.firstChild;
  if (node) range.setStart(node, Math.min(pos, node.length));
  else range.setStart(el, 0);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

const NumericField = forwardRef(function NumericField(
  { value, onChange, placeholder, inputMode = 'numeric', onKeyDown, onFocus, ariaLabel },
  forwardedRef
) {
  const elRef = useRef(null);
  const valueRef = useRef(value);
  const caretRef = useRef(null);
  valueRef.current = value;

  const setRefs = (node) => {
    elRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const sync = () => {
    const el = elRef.current;
    if (!el) return;
    const next = valueRef.current ?? '';
    // 다 지우면 크롬이 <br>을 남겨 :empty 플레이스홀더가 안 보이므로 함께 비운다
    if (el.textContent !== next || (next === '' && el.childNodes.length > 0)) {
      el.textContent = next;
      if (document.activeElement === el) placeCaret(el, caretRef.current);
    }
  };

  useLayoutEffect(sync, [value]);

  const handleInput = (e) => {
    caretRef.current = caretDigitOffset(e.currentTarget);
    onChange(e.currentTarget.textContent);
    // 부모가 값을 거부하면(입력 한도 등) 다시 그려지지 않으므로 직접 되돌린다
    requestAnimationFrame(sync);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.preventDefault();
    onKeyDown?.(e);
  };

  return (
    <div
      ref={setRefs}
      className="numeric-field"
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      role="textbox"
      aria-label={ariaLabel || placeholder}
      inputMode={inputMode}
      enterKeyHint="next"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
    />
  );
});

export default NumericField;
