# Tooltip on Android

On Android, Tooltip is a Material plain tooltip, a short label on hover or keyboard focus that never holds anything essential.

```yaml
component: Tooltip
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
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-17
    url: https://m3.material.io/styles/motion/overview/how-it-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-18
    url: https://m3.material.io/styles/color/system/how-the-system-works
    marker: snapshot 2026-10-13_06-10-19
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
  - key: AND-6
    url: https://developer.android.com/reference/android/animation/ValueAnimator
    marker: updated 2026-08-03
    read: 2026-10-27
  - key: AND-9
    url: https://developer.android.com/jetpack/androidx/releases/compose-material3
    marker: updated 2026-10-21
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Material tooltips, which display brief labels or messages [MAT-4]: Compose `PlainTooltip` in a `TooltipBox`, placed above, below, left or right of its anchor, with an optional caret [AND-9]. |
| Target and spacing | None of its own. Its anchor keeps at least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. One short sentence at most, by the product's rule. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Hidden or shown. Material's tooltips take no disabled state [MAT-9]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The anchor's own label carries the meaning, since a tooltip is never the only home for it. TalkBack reads the anchor's content description [AND-1]. How TalkBack reaches a Compose tooltip is not confirmed. |
| Navigation placement | Beside its anchor and inside the window: Compose clamps tooltips to the window bounds since the 1.5.0 pre-releases [AND-9]. |
| Keyboard, pointer, trackpad | Shown when its anchor takes keyboard focus, and closed by Escape, by the product's rule. How a Compose tooltip opens by touch, and whether Escape dismisses it, is not confirmed. A cursor shows the hover state layer, one element at a time [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Never interactive and never the only home for essential information. A definition people need on touch is a Toggletip. Placement top, bottom or right, and the anchor must be focusable. Material's rich tooltip [AND-9] is not used for this component. |
| Platform owns | Clamping to the window bounds [AND-9]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: how TalkBack reaches a Compose tooltip. Keyboard, pointer, trackpad: how a Compose tooltip opens by touch, and whether Escape dismisses it. |
