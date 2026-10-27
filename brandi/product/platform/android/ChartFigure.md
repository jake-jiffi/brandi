# ChartFigure on Android

On Android, ChartFigure is a chart's frame: a heading that names it, the takeaway in one sentence, the chart, and the same numbers in a form TalkBack can read.

```yaml
component: ChartFigure
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
  - key: MAT-8
    url: https://m3.material.io/foundations/designing/color-contrast
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
  - key: AND-7
    url: https://developer.android.com/reference/android/app/UiModeManager
    marker: updated 2026-08-03
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no figure or chart component [MAT-4]. It is a heading, a line of text and a custom chart with semantics of its own [AND-2]. |
| Target and spacing | None of its own. The chart inside takes focus as one target of at least 48 × 48 dp [MAT-7]. |
| Type | The heading in the product's heading style and the takeaway as body text, in sp, scaled nonlinearly up to 200% [AND-5]. Roboto by default [MAT-16]. |
| Colour and theme | Charts sit on a surface, because the series colours are checked at 3:1 against it, as Material asks of graphics [MAT-8]. Series take the product's chart colours in fixed order. |
| States | None of its own. The chart inside carries loading, error and empty, and its plot takes Material's focused state [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | The heading takes `heading()` [AND-2]. The takeaway is the chart's description, read as its content description [AND-1]. The numbers the web build puts in a visually hidden table need an Android form, which is not confirmed. |
| Navigation placement | On a surface, in a Card or a dashboard column, by the product's rule. Material resizes content with its pane as breakpoints change [MAT-10]. |
| Keyboard, pointer, trackpad | None of its own. The chart inside takes focus, with Material's ring-like indicator [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | A heading that names the chart, the takeaway in one sentence, then the chart, then its numbers in text. Material sets nothing for figures [MAT-4]. |
| Platform owns | The person's contrast level, which a custom drawing reads for itself [AND-7]. Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Accessibility API: an Android form for the chart's numbers in place of the web build's hidden table. |
