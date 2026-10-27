# Switch on Android

On Android, Switch is a Material switch in Compose, for a setting that applies at once with no Save.

```yaml
component: Switch
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
  - key: MAT-20
    url: https://m3.material.io/components/lists/specs
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
| Native control | Material switch, which toggles an item on and off [MAT-4]: Compose `Switch` [AND-9]. |
| Target and spacing | Touch target at least 48 × 48 dp, pointer target at least 44 × 44 dp, and 8 dp or more between targets [MAT-7]. The switch and its label can form one toggleable node [AND-2]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The label's text style comes from the product's ramp. Material's is not confirmed. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Graphics keep at least 3:1 against the background [MAT-8]. The off track stays visible at 3:1, by the product's rule. |
| States | On, off and disabled. Switches take hovered and disabled states, and selection controls a focused state [MAT-9]. Disabled components cannot be focused, dragged or pressed [MAT-9], and need not meet contrast [MAT-8]. |
| Motion | Small components such as switches use the fast spatial spring, and the handle's colour change uses the fast effects spring [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | `Role.Switch` [AND-1]. TalkBack announces the state, the role and the action: "On. Switch. Double tap to toggle" [AND-2]. The state description defaults to "On" and can be made more specific, such as "Enabled" [AND-2]. The label names the setting. |
| Navigation placement | On a settings page the product puts the switch before its label. Material's list slots take a switch at the leading or the trailing end, and its list configurations show it trailing [MAT-20]. |
| Keyboard, pointer, trackpad | Keyboard focus shows Material's ring-like focus indicator [MAT-9]. A cursor shows the hover state layer, one element at a time [MAT-9]. The key that toggles a switch is not confirmed. |
| Haptics | `TOGGLE_ON` and `TOGGLE_OFF`, from API 34, are for toggling a switch [AND-4]. A toggle deserves a lighter haptic than refreshing a page or submitting a form [AND-3]. Whether a Material `Switch` plays them by default is not confirmed. |
| Brand may change | The label names the setting, never "On" or "Off". A setting that needs a confirmation or a save is a Checkbox in a form. The switch before its label on settings pages fits Material's leading list slot [MAT-20]. A 44 px hit area on touch in the web build, not converted here. Material asks 48 × 48 dp [MAT-7]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. The 48 dp touch target [MAT-7]. The person's touch feedback setting [AND-4]. |
| Not confirmed | Type: Material's text style for the label. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: the key that toggles a switch. Haptics: whether a Material `Switch` plays a toggle haptic by default. |
