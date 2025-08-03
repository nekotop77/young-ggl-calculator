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

# AdMob 관련 규칙
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.common.** { *; }

# JavaScript 인터페이스 보존
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 소스 파일 정보 보존 (디버깅용)
-keepattributes SourceFile,LineNumberTable

# WebView 관련
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 추가 보존 규칙
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# Capacitor 플러그인 보존
-keep class com.getcapacitor.community.** { *; }

# 네이티브 메서드 보존
-keepclasseswithmembernames class * {
    native <methods>;
}

# 열거형 보존
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# 직렬화 관련 보존
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
