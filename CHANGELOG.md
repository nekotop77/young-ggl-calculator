# 변경 내역 요약

1. **입력폼 UX 개선**
   - 자산, 소득, 대출 입력폼에서 onFocus 시 `scrollIntoView({block: 'center'})`로 항상 중앙에 오도록 스크롤 처리.
   - 모바일 키보드 대응을 위해 main 하단 여백(padding-bottom)을 충분히 확보(20rem → 10rem, 이후 동적으로 20rem/3rem).
   - 홈화면은 하단 여백이 없도록 CSS 오버라이드, 중첩된 .screen-container 제거로 스크롤 문제 해결.

2. **대출화면 개선**
   - 주담대 종류 기본값을 '원리금균등'으로 설정, loanTypeOptions 순서 확인 및 초기값(App.jsx) 수정.
   - DSR 계산 버튼 클릭 시 최상단으로 스크롤, 하단 여백도 키보드 없는 상태로 복귀하도록 수정.

3. **버전 및 빌드 관리**
   - versionCode, versionName, 설정화면 버전 표기(1.4.5 → 1.4.6 → 1.4.7 등) 변경.
   - 업로드 키(231217)로 서명된 APK/AAB 파일 빌드, 빌드/동기화 명령어 순차 실행.
   - git 커밋 및 태그(v1.4.6, v1.4.7)로 변경사항 관리 및 푸시.

4. **스테이터스바/헤더 겹침 문제**
   - 안드로이드 styles.xml에서 모든 테마의 statusBarColor를 #121213, windowTranslucentStatus를 false로 통일해 투명처리 완전 제거.
   - 헤더가 스테이터스바와 겹치지 않도록 수정.

5. **설정 > html(개인정보처리방침/오픈소스) 뒤로가기 이슈**
   - SettingDetailScreen에서 popstate, backbutton 이벤트에 preventDefault, stopImmediatePropagation 추가.
   - App.jsx에서 onBack prop이 goToSetting으로 정확히 연결되어 있음.
   - 갤럭시 네비게이션바 뒤로가기 시 앱이 백그라운드로 내려가는 현상 완전 해결은 아직 안 됨(설정 html 닫기 완전 해결 아님 명시).

6. **빌드/배포**
   - gradlew clean, npm run build, npx cap copy/sync android, assembleRelease, bundleRelease 등 빌드 명령어 반복 실행.
   - APK, AAB 파일 모두 업로드 키로 서명하여 빌드 완료.

7. **기타**
   - 모든 작업/수정/빌드/버전/UX 개선 요청에 대해 즉시 반영 및 안내.
   - 추가 문의, 상세 상황 요청, 원인 분석 및 코드/구조 설명 반복 제공.

---

**결론:**  
입력 UX, 대출화면, 버전/빌드, 스테이터스바, 설정화면 뒤로가기 등 다양한 개선 및 버그수정이 반복적으로 이루어졌으며, 모든 변경사항은 git 태그로 관리되고, APK/AAB 빌드까지 완료됨. 설정 html 닫기(뒤로가기) 이슈는 완전한 네이티브 제어까지는 미해결로 남아 있음. 