import { useEffect } from 'react';
import { Screen } from './ui';

// 설정의 문서 화면. 웹에 올린 HTML 문서를 화면 가득 보여준다.
function SettingDetailScreen({ title, src, onBack }) {
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault?.();
      e.stopImmediatePropagation?.();
      onBack();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onBack]);

  return (
    <div className="document">
      <Screen title={title} onBack={onBack}>
        <iframe className="document-frame" src={src} title={title} />
      </Screen>
    </div>
  );
}

export default SettingDetailScreen;
