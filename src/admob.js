import { AdMob } from '@capacitor-community/admob';

// AdMob 초기화
export const initializeAdMob = async () => {
  try {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
      initializeForTesting: true,
    });
    console.log('AdMob 초기화 성공');
  } catch (error) {
    console.error('AdMob 초기화 실패:', error);
  }
};

// Google 공식 테스트 광고 ID (Google에서 제공하는 데모 광고 단위)
export const BANNER_AD_ID = 'ca-app-pub-3940256099942544/6300978111'; // 고정 크기 배너 테스트 ID
export const INTERSTITIAL_AD_ID = 'ca-app-pub-3940256099942544/1033173712'; // 전면 광고 테스트 ID

// 배너 광고 표시
export const showBannerAd = async () => {
  try {
    // 모바일 환경에서만 실행
    if (typeof window !== 'undefined' && window.Capacitor) {
      await AdMob.showBanner({
        adId: BANNER_AD_ID,
        adSize: 'BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
      });
      console.log('배너 광고 표시 성공');
    }
  } catch (error) {
    console.error('배너 광고 표시 실패:', error);
  }
};

// 전면 광고 표시
export const showInterstitialAd = async () => {
  try {
    await AdMob.prepareInterstitial({
      adId: INTERSTITIAL_AD_ID,
    });
    await AdMob.showInterstitial();
  } catch (error) {
    console.error('전면 광고 표시 실패:', error);
  }
};

// 배너 광고 제거
export const removeBannerAd = async () => {
  try {
    // 모바일 환경에서만 실행
    if (typeof window !== 'undefined' && window.Capacitor) {
      await AdMob.removeBanner();
      console.log('배너 광고 제거 성공');
    }
  } catch (error) {
    console.error('배너 광고 제거 실패:', error);
  }
}; 