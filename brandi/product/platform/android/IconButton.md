# IconButton on Android

On Android, IconButton is a Material icon button, an icon-only action whose content description is its name.

```yaml
component: IconButton
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
| Native control | Material icon buttons [MAT-4]: Compose `IconButton`, `FilledIconButton`, `FilledTonalIconButton` or `OutlinedIconButton` [AND-9], with the label on the `Icon` inside as its `contentDescription` [AND-1]. |
| Target and spacing | Compose `IconButton` enforces the 48 dp minimum [AND-1]. Extra small and small icon buttons need a target of 48 × 48 dp or larger [MAT-5]. The target can reach past the visible shape: a 24 dp icon sits inside a 48 dp target [MAT-7]. 8 dp or more between targets [MAT-7]. |
| Type | None visible. The label lives in the content description and the tooltip, whose text scales with the font size setting [AND-5]. |
| Colour and theme | The icon takes the role of its style. Graphics keep at least 3:1 against the background [MAT-8]. One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. |
| States | Material gives icon buttons hovered, focused, pressed and disabled states [MAT-9]. System state layers: 8% for hover, 10% for focus and press, 16% for drag [MAT-5]. Disabled components cannot be focused, dragged or pressed [MAT-9], and need not meet contrast [MAT-8]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | `Role.Button` [AND-1]. The name is the icon's `contentDescription`, such as "Share" [AND-1], and names what it acts on: "More actions for [record]". The description says the purpose, never the control type: "Submit", not "Submit button" [AND-1]. Each repeated item gets a description of its own, such as each row of a list [AND-1]. |
| Navigation placement | App bars, toolbars and list rows. Material's toolbars hold frequently used actions for the page [MAT-4], and a list item's trailing slot can hold an icon button [MAT-20]. |
| Keyboard, pointer, trackpad | Material counts icon buttons among its buttons [MAT-4], which take Tab to focus and Space or Enter to activate [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. A cursor shows the hover state layer, one element at a time [MAT-9]. The tooltip is `PlainTooltip` in a `TooltipBox` [AND-9]. How it opens by touch is not confirmed. |
| Haptics | Android names click feedback for a button press as a haptic use, and no haptic beats a buzzy one [AND-3]. Whether Material icon buttons play a haptic by default is not confirmed. |
| Brand may change | Only for actions people know by their icon: more, close, refresh, copy, previous, next. Anything less obvious is a text Button. The label is required and doubles as the tooltip. The product's ghost default maps onto Material's styles: standard, filled, tonal or outlined [AND-9]. The product draws its one focus ring in its `focus` colour, where Material uses `secondary` [MAT-5]. |
| Platform owns | The 48 dp touch target, which Compose Material components enforce [AND-1]. State layer opacities [MAT-5]. The press ripple [MAT-9]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: how the tooltip opens by touch. Haptics: whether Material icon buttons play a haptic by default. |
