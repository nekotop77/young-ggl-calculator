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
        // 웹뷰에서 JavaScript로 backbutton 이벤트를 발생시킴
        WebView webView = bridge.getWebView();
        if (webView != null) {
            webView.evaluateJavascript(
                "document.dispatchEvent(new Event('backbutton'));",
                null
            );
        }
    }
}
