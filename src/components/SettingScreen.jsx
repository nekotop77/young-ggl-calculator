import { Screen, ChevronRight } from './ui';

const APP_VERSION = '3.4';

function SettingScreen({ onBack, onShowPrivacy, onShowLicense }) {
  const links = [
    { label: '개인정보 처리방침', onClick: onShowPrivacy },
    { label: '오픈소스라이선스', onClick: onShowLicense },
  ];
  return (
    <Screen title="설정" onBack={onBack}>
      <ul className="list">
        {links.map(({ label, onClick }) => (
          <li key={label}>
            <button className="list-row" onClick={onClick}>
              {label}
              <ChevronRight />
            </button>
          </li>
        ))}
        <li className="list-row list-row-static">
          버전
          <span>{APP_VERSION}</span>
        </li>
      </ul>
    </Screen>
  );
}

export default SettingScreen;
