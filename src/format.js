// 금액 표시 규칙. 모든 화면이 이 파일 하나를 쓴다.
// 금액은 앱 전체에서 '원' 단위 숫자로 들고 다니고, 화면에는 만원 단위까지만 보여준다.

const MAN = 10000;

// 원 → "3억5,000만원" (만원 미만은 버림). 0이나 숫자가 아니면 "0원".
export function formatWon(won) {
  if (typeof won !== 'number' || isNaN(won) || won === 0) return '0원';
  const manWon = Math.floor(won / MAN);
  const fmt = (n) => n.toLocaleString('ko-KR');

  if (manWon >= 100000000) {
    const jo = Math.floor(manWon / 100000000);
    const eok = Math.floor((manWon % 100000000) / MAN);
    const man = manWon % MAN;
    return `${fmt(jo)}조${eok > 0 ? `${fmt(eok)}억` : ''}${man > 0 ? `${fmt(man)}만` : ''}원`;
  }
  if (manWon >= MAN) {
    const eok = Math.floor(manWon / MAN);
    const man = manWon % MAN;
    return man === 0 ? `${fmt(eok)}억원` : `${fmt(eok)}억${fmt(man)}만원`;
  }
  return `${fmt(manWon)}만원`;
}

// 원 → 입력칸에 보일 만원 단위 숫자 "35,000". 0이면 빈칸.
export function toManWonText(won) {
  if (!won) return '';
  return Math.floor(won / MAN).toLocaleString('ko-KR');
}

// 입력칸 글자(만원 단위) → 원. 숫자만 남긴다.
export function fromManWonText(text) {
  const digits = text.replace(/[^0-9]/g, '');
  return digits === '' ? 0 : Number(digits) * MAN;
}

// 만원 미만을 버린 금액 (월 납입 표시용)
export const floorToManWon = (won) => Math.trunc(won / MAN) * MAN;

// { cash: 1, stocks: 2 } → 3
export const sumValues = (obj) => Object.values(obj).reduce((total, v) => total + Number(v), 0);
