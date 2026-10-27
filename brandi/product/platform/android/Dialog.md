# Dialog on Android

On Android, Dialog is a Material basic dialog for a focused decision or a short form, the heaviest feedback the product has.

```yaml
component: Dialog
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-5
    url: https://m3.material.io/components/buttons/specs
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-6
    url: https://m3.material.io/components/buttons/accessibility
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
| Native control | Material dialogs, basic or full-screen [MAT-14]: Compose `AlertDialog`, or `BasicAlertDialog`, which left experimental status in the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | Buttons keep the 48 dp minimum [AND-1], with 8 dp between them [MAT-14]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The headline is a brief statement or question, never an apology, an alarm or "Are you sure?" [MAT-14]. |
| Colour and theme | Colour roles `surface container high`, `secondary`, `on surface`, `on surface variant`, `primary` and `scrim`, with 28 dp corners [MAT-14]. One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. |
| States | Open or closed. A dialog takes no hover, focus, press, drag or disabled state as a whole [MAT-9]. A confirming action can stay disabled until a choice is made. A dismissive action is never disabled [MAT-14]. |
| Motion | Dialogs use an enter and exit transition [MAT-14]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | A window-like component takes `paneTitle` semantics, as Material 3 does for its own components [AND-2]. The dialog keeps focus until it is dismissed or acted on [MAT-14]. Buttons are `Role.Button`, with labels that name the action [AND-1]. |
| Navigation placement | Centred by default at medium widths. On larger screens it can be placed anywhere, keeping 56 dp from the edges [MAT-14]. 280 to 560 dp wide, with 24 dp padding [MAT-14]. Full-screen dialogs are for compact widths only [MAT-14]. Buttons at the trailing edge, the confirming action nearest it, mirrored for right-to-left languages [MAT-14]. |
| Keyboard, pointer, trackpad | Buttons take Tab, then Space or Enter [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. The product's Escape, close button and scrim cancel and return focus to the opener. How Escape and the system back action reach a Compose dialog is not confirmed. |
| Haptics | `CONFIRM` and `REJECT`, from API 30, report the outcome [AND-4]. Whether a Material dialog plays one by default is not confirmed. |
| Brand may change | A confirmation is a question with the thing and the count ("Delete 3 draft invoices?"), and the primary repeats the verb with the count ("Delete 3 invoices"). Destructive confirms use `danger-solid`. Up to five fields. Longer edits take a Sheet or a page. Never a dialog on a dialog, where Material lets a basic dialog sit over a full-screen one to confirm discarding changes [MAT-14]. On phones the product's dialog rises from the bottom with full-width buttons, where Material uses a basic dialog, or a full-screen one at compact widths [MAT-14]. Material's limit of two actions [MAT-14] holds. |
| Platform owns | Holding focus while open [MAT-14]. How TalkBack merges nodes and phrases them [AND-2]. The 48 dp touch target, which Compose Material components enforce [AND-1]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: how Escape and the system back action reach a Compose dialog. Haptics: whether a Material dialog plays a haptic by default. |
