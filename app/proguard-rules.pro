# CALCOS LP AUTO
# Reglas de protección para la versión release.

-keep class com.calcoslp.auto.** { *; }

-keepattributes *Annotation*

-dontwarn androidx.**
-dontwarn android.webkit.**
