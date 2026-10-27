# Breadcrumbs on Android

On Android, Breadcrumbs shows where a record sits for pages two or more levels deep, built from text buttons because Material has no breadcrumb component.

```yaml
component: Breadcrumbs
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-5
    url: https://m3.material.io/components/buttons/specs
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-7
    url: https://m3.material.io/foundations/designing/structure
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: AND-1
    url: https://developer.android.com/guide/topics/ui/accessibility/apps
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-3
    url: https://developer.android.com/develop/ui/views/haptics/haptics-principles
    marker: updated 2026-10-26
    read: 2026-10-27
  - key: AND-5
    url: https://developer.android.com/about/versions/14/features
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no breadcrumb component [MAT-4]. The closest pattern is a row of text buttons [MAT-5]. |
| Target and spacing | Each crumb at least 48 × 48 dp on touch [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Long names are cut at 28 characters, by the product's rule. |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | The last item is the current page and not a link, by the product's rule. Each link takes focused, hovered and pressed states [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | Each crumb reads its name [AND-1], and the current page is marked as current. The Android semantics for marking it are not confirmed. A name cut short needs a route to the full text that works without a cursor, since hover needs one [MAT-9]. |
| Navigation placement | Above the page title, by the product's rule. Material's app bar sits at the top of the screen [MAT-4]. |
| Keyboard, pointer, trackpad | Keyboard focus shows Material's ring-like focus indicator [MAT-9]. The key that activates a link on Android is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | From two levels deep. The last item is the current page. Names cut at 28 characters with the full name reachable. The product's 24 px link targets in the web build are not converted here. Material asks 48 × 48 dp on touch [MAT-7]. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Accessibility API: the semantics for marking the current page. Keyboard, pointer, trackpad: the key that activates a link. |
