import MoneyScreen from './MoneyScreen';

const ASSET_FIELDS = [
  { id: 'cash', label: '현금', placeholder: '금액을 적어주세요' },
  { id: 'stocks', label: '주식', placeholder: '금액 적어주세요' },
  { id: 'severance', label: '퇴직금', placeholder: '중간정산 가능한 금액 적어주세요' },
  { id: 'insurance', label: '보험', placeholder: '담보대출 가능 금액 적어주세요' },
];

function AssetScreen({ assets, setAssets, onNext, onBack, isEdit, onEditComplete }) {
  return (
    <MoneyScreen
      title="자산"
      fields={ASSET_FIELDS}
      values={assets}
      setValues={setAssets}
      onNext={onNext}
      onBack={onBack}
      isEdit={isEdit}
      onEditComplete={onEditComplete}
    />
  );
}

export default AssetScreen;
