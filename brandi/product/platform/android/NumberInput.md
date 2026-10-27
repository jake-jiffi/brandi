# NumberInput on Android

On Android, NumberInput is a quantity or an amount in a text field, with step buttons either side.

```yaml
component: NumberInput
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
  - key: MAT-14
    url: https://m3.material.io/components/dialogs/overview
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None as a Material component [MAT-4]. A Material text field [MAT-4] with two icon buttons, Compose `IconButton` [AND-9]. |
| Target and spacing | Each step button keeps the 48 dp minimum of `IconButton` [AND-1], with 8 dp or more between them [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Tabular figures, by the product's rule. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | The field takes text field states and the buttons take button states [MAT-9]. At a limit the matching button is disabled and cannot take focus [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | The step buttons are `Role.Button`, named by what they change, "Increase quantity" [AND-1]. A prefix or suffix reads with the field [AND-9]. How TalkBack adjusts the value directly is not confirmed. |
| Navigation placement | In a Field, by the product's rule. Material moves a dialog that needs keyboard input to full screen at compact widths [MAT-14]. |
| Keyboard, pointer, trackpad | Up and Down step the value, by the product's rule. The Android key handling for it is not confirmed. A typed value is checked when the person leaves the field, never while they type. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. |
| Haptics | None from the product. `SEGMENT_TICK`, from API 34, marks steps through discrete choices [AND-4]. |
| Brand may change | The right numeric keyboard, a prefix or suffix read with the field, and step buttons named by what they change. Unproven: no review round has checked it. Material sets nothing for number input [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Accessibility API: how TalkBack adjusts the value directly. Keyboard, pointer, trackpad: the Android key handling for stepping. |
