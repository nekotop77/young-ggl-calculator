import { AdMob } from '@capacitor-community/admob';

// AdMob 초기화
export const initializeAdMob = async () => {
  try {
    // 모바일 환경에서만 실행
    if (typeof window !== 'undefined' && window.Capacitor) {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
        initializeForTesting: true, // 테스트 모드 활성화
      });
      console.log('AdMob 초기화 성공');
      return true;
    }
    return false;
  } catch (error) {
    console.error('AdMob 초기화 실패:', error);
    // 오류가 발생해도 앱이 종료되지 않도록 함
    return false;
  }
};

// Google 공식 테스트 광고 ID (Google에서 제공하는 데모 광고 단위)
// 항상 테스트 광고 ID를 사용하여 개발 중에는 실제 광고가 표시되지 않도록 함
export const BANNER_AD_ID = 'ca-app-pub-3940256099942544/6300978111'; // 고정 크기 배너 테스트 ID
export const INTERSTITIAL_AD_ID = 'ca-app-pub-3940256099942544/1033173712'; // 전면 광고 테스트 ID

// 실제 광고 ID는 릴리스 빌드에서만 사용하도록 주석 처리
// export const BANNER_AD_ID = '실제_배너_광고_ID를_여기에_입력'; 
// export const INTERSTITIAL_AD_ID = '실제_전면_광고_ID를_여기에_입력';

// 배너 광고 표시
export const showBannerAd = async () => {
  try {
    // 모바일 환경에서만 실행
    if (typeof window !== 'undefined' && window.Capacitor) {
      // 광고 표시 전에 초기화 상태 확인
      await AdMob.showBanner({
        adId: BANNER_AD_ID,
        adSize: 'BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
        // 테스트 모드 명시적 활성화
        isTesting: true
      });
      console.log('배너 광고 표시 성공');
      return true;
    }
    return false;
  } catch (error) {
    console.error('배너 광고 표시 실패:', error);
    // 오류가 발생해도 앱 실행에 영향을 주지 않음
    return false;
  }
};

// 전면 광고 표시
export const showInterstitialAd = async () => {
  try {
    // 모바일 환경에서만 실행
    if (typeof window !== 'undefined' && window.Capacitor) {
      await AdMob.prepareInterstitial({
        adId: INTERSTITIAL_AD_ID,
        // 테스트 모드 명시적 활성화
        isTesting: true
      });
      await AdMob.showInterstitial();
      console.log('전면 광고 표시 성공');
    }
  } catch (error) {
    console.error('전면 광고 표시 실패:', error);
    // 오류가 발생해도 앱 실행에 영향을 주지 않음
  }
};

// 배너 광고 제거
export const removeBannerAd = async () => {
  try {
    // 모바일 환경에서만 실행
    if (typeof window !== 'undefined' && window.Capacitor) {
      await AdMob.removeBanner();
      console.log('배너 광고 제거 성공');
      return true;
    }
    return false;
  } catch (error) {
    console.error('배너 광고 제거 실패:', error);
    // 오류가 발생해도 앱 실행에 영향을 주지 않음
    return false;
  }
};