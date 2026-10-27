# Logo on Android

On Android, the logo is the brand's master artwork drawn as a vector image, because Material has no logo component.

```yaml
component: Logo
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-7
    url: https://m3.material.io/foundations/designing/structure
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-12
    url: https://m3.material.io/components/navigation-rail/overview
    marker: Expressive update May 2025
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
| Native control | None. Material 3 has no logo component [MAT-4]. The closest pattern is a vector image with a content description [AND-1]. |
| Target and spacing | None. The logo is not a control. A lockup that links carries the target. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | None. The logo is artwork, never set in type, with no text for the font size setting to scale [AND-5]. |
| Colour and theme | Only the brand's approved renditions, one for light and one for dark, by the product's rule. Colour inversion still reverses it with everything else on screen, and colour correction can shift it [AND-10]. |
| States | None. Material's states show the interaction status of interactive components [MAT-9], and this is not one. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | The content description is the brand name [AND-1]. When a parent link already names it, it takes `contentDescription = null` so TalkBack does not read the name twice [AND-1]. |
| Navigation placement | In the rail lockup and on sign-in, never in page headers, by the product's rule. Material's navigation rail holds 3 to 7 destinations and an optional FAB [MAT-12]. A logo slot on it is not confirmed. |
| Keyboard, pointer, trackpad | None. The logo never takes focus by itself. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | All of it comes from the brand's logo system: renditions, height, clear space and minimum size, with tightly cropped artwork so the clear space never shrinks the mark. Never stretched, rotated, recoloured outside its renditions or given effects. Material sets nothing for a logo [MAT-4]. |
| Platform owns | Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. |
| Not confirmed | Navigation placement: a logo slot on Material's navigation rail. |
