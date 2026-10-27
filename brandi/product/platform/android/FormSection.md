# FormSection on Android

On Android, FormSection is a titled group of related fields, with the title above the fields on narrow windows and beside them on wide ones.

```yaml
component: FormSection
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
  - key: MAT-10
    url: https://m3.material.io/foundations/layout/breakpoints/overview
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-18
    url: https://m3.material.io/styles/color/system/how-the-system-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: AND-1
    url: https://developer.android.com/guide/topics/ui/accessibility/apps
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-2
    url: https://developer.android.com/develop/ui/compose/accessibility/semantics
    marker: updated 2026-10-22
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
| Native control | None. Material 3 has no form section component [MAT-4]. The closest is a Material card, which displays content and actions about a single subject [MAT-4], with a heading. |
| Target and spacing | None of its own. Its fields keep their 48 dp targets [MAT-7]. |
| Type | The title takes a heading style and `heading()` [AND-2]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | None of its own. Its fields carry their states [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | Its title takes `Modifier.semantics { heading() }`, so TalkBack can jump between headings [AND-2]. The description follows it in the layout's top-down reading order [MAT-7]. |
| Navigation placement | A column of sections on a settings page beside a SideNav, by the product's rule. Material calls a settings view with low-density content a good use of two panes at medium widths, and recommends one pane at compact widths [MAT-10]. |
| Keyboard, pointer, trackpad | None of its own. Focus moves through its fields in reading order [MAT-7]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | One topic per section, with a description that says why the fields matter or who sees them ("Only finance can see this"). Split, with the title beside, or stacked, chosen by the section's own width. The web build's thresholds are CSS px and are not converted here. Each section saves on its own, and `headingLevel` keeps headings in order. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. The window size, which changes with multi-window modes and folding [MAT-10]. |
| Not confirmed | Nothing: the sources settle every field. |
