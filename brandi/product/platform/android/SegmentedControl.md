# SegmentedControl on Android

On Android, SegmentedControl is a Material single-choice segmented button row that switches between two to five views of the same content.

```yaml
component: SegmentedControl
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
  - key: MAT-17
    url: https://m3.material.io/styles/motion/overview/how-it-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-18
    url: https://m3.material.io/styles/color/system/how-the-system-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-21
    url: https://m3.material.io/components/lists/accessibility
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
| Native control | Material segmented buttons, which help people select options, switch views or sort elements [MAT-4]: Compose `SingleChoiceSegmentedButtonRow` with a `SegmentedButton` per option [AND-9]. |
| Target and spacing | Touch target at least 48 × 48 dp, pointer target at least 44 × 44 dp, and 8 dp or more between targets [MAT-7]. A custom element sets its own minimum. `Modifier.minimumInteractiveComponentSize` reserves at least 48 dp when an element would measure smaller [AND-1] [AND-9]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's text style for segmented buttons is not confirmed. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Selection shows with more than colour, such as a check, as Material asks of selectable lists [MAT-21]. Material's colour roles for a selected segment are not confirmed. |
| States | Material gives segmented buttons hovered, focused, pressed and disabled states [MAT-9]. System state layers: 8% for hover, 10% for focus and press, 16% for drag [MAT-5]. |
| Motion | The product slides the selection to the chosen option, a spatial spring in Material's terms, with the colour on an effects spring [MAT-17]. Under reduced motion the slide becomes a fade. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Each option is a node with its label, its type set through the Role property [AND-1] and its state through `stateDescription` [AND-2]. In Compose, Material's single-select list items take role Radio button with a checked state [MAT-21], which matches the product's radio group. The role `SegmentedButton` sets is not confirmed. |
| Navigation placement | One row above the content it switches, by the product's rule. Material describes segmented buttons as switching views [MAT-4]. |
| Keyboard, pointer, trackpad | The product's map: Tab enters at the selected option, and arrows, Home and End move the selection and the focus together. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. The key map Material gives segmented buttons is not confirmed. A cursor shows the hover state layer, one element at a time [MAT-9]. |
| Haptics | `SEGMENT_TICK`, from API 34, is for switching between a series of choices [AND-4]. Whether Material's segmented buttons play it is not confirmed. |
| Brand may change | Two to five views of the same content: Day, Week and Month, or List and Board. The view changes at once. Not for moving between pages (Tabs) or for settings (RadioGroup). Options are 40 px on touch in the web build, not converted here. Material asks 48 × 48 dp [MAT-7]. The pill is the product's pressable shape. The product draws its one focus ring in its `focus` colour, where Material uses `secondary` [MAT-5]. |
| Platform owns | The 48 dp touch target [MAT-7]. State layer opacities [MAT-5]. The press ripple [MAT-9]. |
| Not confirmed | Type: Material's text style for segmented buttons. Colour and theme: Material's colour roles for a selected segment. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the role `SegmentedButton` sets. Keyboard, pointer, trackpad: the key map Material gives segmented buttons. Haptics: whether Material's segmented buttons play `SEGMENT_TICK`. |
