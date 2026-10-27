# FilterChip on Android

On Android, FilterChip is a Material filter chip that toggles a filter over what is already on screen.

```yaml
component: FilterChip
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
| Native control | Material chips, which help people enter information, make selections, filter content or trigger actions [MAT-4]: Compose `FilterChip` or `ElevatedFilterChip`, with shape-morphing overloads in the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | Touch target at least 48 × 48 dp, pointer target at least 44 × 44 dp, and 8 dp or more between targets [MAT-7]. A custom element sets its own minimum. `Modifier.minimumInteractiveComponentSize` reserves at least 48 dp when an element would measure smaller [AND-1] [AND-9]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's text style for chips is not confirmed. |
| Colour and theme | Selected colours come through `SelectableChipColors`, whose parameters became public in the 1.5.0 pre-releases [AND-9]. One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Chips take hovered, focused, pressed, dragged and disabled states, and a selected filter chip can show hover or focus at the same time [MAT-9]. System state layers: 8% for hover, 10% for focus and press, 16% for drag [MAT-5]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | A toggleable node: TalkBack reads the label, the count and a checked or unchecked state, which `stateDescription` can rename [AND-2]. An attention count is read as words, "12 need you". The role Material's `FilterChip` sets is not confirmed. |
| Navigation placement | One row above the list or table it filters, by the product's rule. Material describes chips as filtering content [MAT-4]. |
| Keyboard, pointer, trackpad | Keyboard focus shows Material's ring-like focus indicator [MAT-9]. A cursor shows the hover state layer, one element at a time [MAT-9]. The keys that toggle a chip are not confirmed. |
| Haptics | `TOGGLE_ON` and `TOGGLE_OFF`, from API 34, mark a switch or button toggled on or off [AND-4]. Whether Material chips play them is not confirmed. |
| Brand may change | Pressed takes `selected-strong` and a check. Only "needs you" counts take the highlight, and the count is how many items match if the chip is applied. Chips are 40 px on touch in the web build, not converted here. Material asks 48 × 48 dp [MAT-7]. The pill is the product's pressable shape. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | The 48 dp touch target [MAT-7]. State layer opacities [MAT-5]. The press ripple [MAT-9]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Type: Material's text style for chips. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the role `FilterChip` sets. Keyboard, pointer, trackpad: the keys that toggle a chip. Haptics: whether Material chips play `TOGGLE_ON` and `TOGGLE_OFF`. |
