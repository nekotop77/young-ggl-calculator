# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Capacitor 관련 규칙
-keep class com.getcapacitor.** { *; }
-keep class com.nekotop.younggglcalculator.** { *; }

# WebView 관련 규칙
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 네트워크 관련 규칙
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Firebase 관련 규칙
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# 디버깅을 위한 정보 보존
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
