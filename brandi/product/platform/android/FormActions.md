# FormActions on Android

On Android, FormActions is the row that ends a form: Cancel, then the one primary, at the trailing edge above a divider.

```yaml
component: FormActions
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
  - key: MAT-6
    url: https://m3.material.io/components/buttons/accessibility
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
  - key: MAT-14
    url: https://m3.material.io/components/dialogs/overview
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
  - key: AND-1
    url: https://developer.android.com/guide/topics/ui/accessibility/apps
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-4
    url: https://developer.android.com/reference/android/view/HapticFeedbackConstants
    marker: updated 2026-08-03
    read: 2026-10-27
  - key: AND-5
    url: https://developer.android.com/about/versions/14/features
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-9
    url: https://developer.android.com/jetpack/androidx/releases/compose-material3
    marker: updated 2026-10-21
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A row of Material buttons [MAT-4] above a Material divider, Compose `HorizontalDivider`, the renamed `Divider` [AND-9]. |
| Target and spacing | Each button keeps the 48 dp minimum [AND-1], with 8 dp or more between targets [MAT-7]. |
| Type | Button labels in label large, 14 on 20 [MAT-5] [MAT-16]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | Buttons in their own styles [MAT-5]. The divider is a thin line that groups content [MAT-4]. |
| States | Each button keeps its own states [MAT-5]. Disabled components cannot be focused, dragged or pressed [MAT-9], and need not meet contrast [MAT-8]. |
| Motion | None of its own. Its buttons move on Material's fast springs [MAT-17]. |
| Accessibility API | Each button is its own node with `Role.Button`, named by its label [AND-1]. |
| Navigation placement | The end of the form, at the trailing edge with the primary last, mirrored for right-to-left languages, as Material places dialog actions [MAT-14]. On phones inside AppShell, the page's primary moves to the bar at the foot, by the product's rule. |
| Keyboard, pointer, trackpad | Tab moves through the buttons, and Space or Enter activates [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. |
| Haptics | `CONFIRM` and `REJECT` report the outcome of a save, from API 30 [AND-4]. Whether Material buttons play a haptic by default is not confirmed. |
| Brand may change | Cancel, then the one primary, right-aligned, or `start` for narrow forms. A destructive action sits apart on the left as a `danger` button. The primary names the result ("Save billing"), never "Submit". Material's full-screen dialogs likewise ask for a clear confirmation such as Send or Create rather than Done, OK or Close [MAT-14]. |
| Platform owns | The 48 dp touch target, which Compose Material components enforce [AND-1]. Right-to-left mirroring [MAT-14]. |
| Not confirmed | Haptics: whether Material buttons play a haptic by default. |
