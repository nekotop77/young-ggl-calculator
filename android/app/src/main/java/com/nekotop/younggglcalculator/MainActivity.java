package com.nekotop.younggglcalculator;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public void onBackPressed() {
        // 웹뷰에서 현재 화면 상태를 확인
        WebView webView = bridge.getWebView();
        if (webView != null) {
            webView.evaluateJavascript(
                "(function() { return window.currentStep || 'home'; })();",
                result -> {
                    // 결과에서 따옴표 제거
                    String step = result != null ? result.replace("\"", "") : "home";
                    
                    if ("home".equals(step)) {
                        // 홈 화면일 때는 직접 백그라운드로 이동
                        moveTaskToBack(true);
                    } else {
                        // 다른 화면일 때는 JavaScript 이벤트 발생
                        webView.evaluateJavascript(
                            "document.dispatchEvent(new Event('backbutton'));",
                            null
                        );
                    }
                }
            );
        } else {
            // 웹뷰가 없으면 기본적으로 백그라운드로 이동
            moveTaskToBack(true);
        }
    }
    
    // 앱을 백그라운드로 내리는 메서드
    public void moveToBackground() {
        moveTaskToBack(true);
    }
}
