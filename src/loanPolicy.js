// 주택구입 목적 주담대 규제 (25.10.15 대책 기준)
const EOK = 100000000;

// 수도권·규제지역 시가별 주담대 한도
const PRICE_TIERS = [
  { maxPrice: 15 * EOK, cap: 6 * EOK },
  { maxPrice: 25 * EOK, cap: 4 * EOK },
  { maxPrice: Infinity, cap: 2 * EOK }
];

const NO_CAP_TIERS = [{ maxPrice: Infinity, cap: Infinity }];

export const LTV_OPTIONS = [
  { value: '40', ratio: 0.4, tiers: PRICE_TIERS, description: '규제지역 LTV 40%' },
  { value: '70_first', ratio: 0.7, tiers: PRICE_TIERS, description: '규제지역 생애최초 LTV 70%' },
  { value: '70', ratio: 0.7, tiers: PRICE_TIERS, description: '비규제지역(수도권) LTV 70%' },
  { value: '70_local', ratio: 0.7, tiers: NO_CAP_TIERS, description: '비규제지역(지방) LTV 70%' }
];

// 자산과 대출을 합쳐 살 수 있는 가장 비싼 집을 구간별로 비교해 찾는다.
// 구간이 올라가면 한도가 줄어들어, 구간 상한가에 멈추는 쪽이 더 유리할 수 있다.
export function calcMaxPurchase({ assets, dsrMaxLoan, ltvRatio, tiers }) {
  const maxLoanByLtv = assets * (ltvRatio / (1 - ltvRatio));
  let best = { loan: 0, housePrice: assets, limitingFactor: 'DSR', cap: null, maxPrice: null };
  let minPrice = 0;

  for (const { maxPrice, cap } of tiers) {
    const loan = Math.min(dsrMaxLoan, maxLoanByLtv, cap);
    const uncappedPrice = assets + loan;
    const housePrice = Math.min(uncappedPrice, maxPrice);

    if (housePrice > minPrice && housePrice > best.housePrice) {
      let limitingFactor = 'DSR';
      if (uncappedPrice > maxPrice) limitingFactor = 'PRICE';
      else if (loan === cap && cap < dsrMaxLoan) limitingFactor = 'CAP';
      else if (loan === maxLoanByLtv && maxLoanByLtv < dsrMaxLoan) limitingFactor = 'LTV';

      best = { loan: housePrice - assets, housePrice, limitingFactor, cap, maxPrice };
    }
    minPrice = maxPrice;
  }

  return best;
}
