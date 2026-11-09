import MoneyScreen from './MoneyScreen';

const INCOME_FIELDS = [
  { id: 'salary', label: '연봉', placeholder: '연봉을 적어주세요' },
  { id: 'bonus', label: '상여', placeholder: '상여금 적어주세요' },
  { id: 'side', label: '부수입', placeholder: '부수입 적어주세요' },
  { id: 'other', label: '기타', placeholder: '기타 소득 적어주세요' },
];

function IncomeScreen({ incomes, setIncomes, onNext, onBack, isEdit, onEditComplete }) {
  return (
    <MoneyScreen
      title="소득"
      fields={INCOME_FIELDS}
      values={incomes}
      setValues={setIncomes}
      onNext={onNext}
      onBack={onBack}
      isEdit={isEdit}
      onEditComplete={onEditComplete}
    />
  );
}

export default IncomeScreen;
