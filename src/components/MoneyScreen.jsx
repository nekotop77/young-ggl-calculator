// 금액 여러 개를 만원 단위로 받아 합계를 보여주는 화면 (자산, 소득이 같이 쓴다)
import { useEffect, useRef } from 'react';
import NumericField from './NumericField';
import { Screen, Amount, Field, useKeyboardOpen } from './ui';
import { formatWon, toManWonText, fromManWonText, sumValues } from '../format';

const MAX_WON = 100000000000000; // 이 금액 이상은 입력을 막는다

function MoneyScreen({ title, fields, values, setValues, onNext, onBack, isEdit, onEditComplete }) {
  const firstInputRef = useRef(null);
  const nextButtonRef = useRef(null);
  const [keyboardOpen, setKeyboardOpen] = useKeyboardOpen();

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const total = sumValues(values);
  const hasInput = Object.values(values).some((v) => v > 0);
  const lastId = fields[fields.length - 1].id;

  const handleChange = (id, text) => {
    const won = fromManWonText(text);
    if (won >= MAX_WON) return;
    setValues((prev) => ({ ...prev, [id]: won }));
  };

  // 마지막 칸에서 엔터를 누르면 다음 버튼으로 넘어간다
  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter' && id === lastId) nextButtonRef.current?.focus();
  };

  const reset = () => setValues(Object.fromEntries(fields.map(({ id }) => [id, 0])));

  const handleNext = (e) => {
    setKeyboardOpen(false);
    if (isEdit && onEditComplete) onEditComplete(e);
    else onNext?.(e);
  };

  const handleBack = (e) => {
    setKeyboardOpen(false);
    onBack?.(e);
  };

  return (
    <Screen
      title={title}
      onBack={handleBack}
      keyboardOpen={keyboardOpen}
      action={
        <button className="text-button" onClick={reset} disabled={!hasInput}>
          초기화
        </button>
      }
      footer={
        <button ref={nextButtonRef} className="button button-primary" disabled={total === 0} onClick={handleNext}>
          {isEdit ? '수정완료' : '다음'}
        </button>
      }
    >
      <Amount value={formatWon(total)} />
      <div className="field-list">
        {fields.map(({ id, label, placeholder }, idx) => (
          <Field key={id} label={label} below={values[id] > 0 ? formatWon(values[id]) : ''}>
            <NumericField
              ref={idx === 0 ? firstInputRef : null}
              placeholder={placeholder}
              value={toManWonText(values[id])}
              onChange={(text) => handleChange(id, text)}
              onKeyDown={(e) => handleKeyDown(e, id)}
            />
          </Field>
        ))}
      </div>
    </Screen>
  );
}

export default MoneyScreen;
