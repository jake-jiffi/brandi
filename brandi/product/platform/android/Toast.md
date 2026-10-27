# Toast on Android

On Android, Toast is a Material snackbar, a brief confirmation at the bottom of the screen after an action, with Undo when the action can be reversed.

```yaml
component: Toast
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
| Native control | Material snackbar, which shows short updates about app processes at the bottom of the screen [MAT-4]: Compose `Snackbar`, which `Scaffold` positions with the right insets [AND-9]. Material keeps snackbars for low-importance messages that can disappear by themselves [MAT-14]. |
| Target and spacing | Undo and the close button keep at least 48 × 48 dp [MAT-7] [AND-1]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. One sentence, past tense, with a full stop. |
| Colour and theme | The product's `surface-inverse`, with the tone carrying an icon as well as colour. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Shown, paused while hovered or focused, and gone, by the product's rule. The snackbar's action and dismiss buttons have a correct focus order, and dismiss shows a tooltip, since the 1.5.0 pre-releases [AND-9]. The Compose snackbar's own durations, and how they map to the product's 5 and 8 seconds, are not confirmed. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | An alert-like pop-up such as a snackbar takes a polite live region [AND-2]. A Compose snackbar no longer announces itself again on dismiss when TalkBack is on [AND-9]. Undo is `Role.Button` [AND-1]. |
| Navigation placement | At the bottom of the screen, above the phone action bar and never wider than the screen, by the product's rule, where Material puts snackbars [MAT-4]. `Scaffold` keeps them clear of the screen's edges when the app draws edge to edge [AND-9]. |
| Keyboard, pointer, trackpad | Undo and close take Tab, then Space or Enter [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. The toast pauses while it has focus, by the product's rule. |
| Haptics | None from the product. `CONFIRM`, from API 30, signals a successful completion [AND-4]. |
| Brand may change | One sentence, past tense, with a full stop: "3 invoices sent." It goes after 5 seconds, or 8 with Undo, and pauses while hovered or focused. Errors that need action are Alerts, never toasts. Material also keeps snackbars for low-importance messages [MAT-14]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Inset handling at the screen's edges [AND-9]. |
| Not confirmed | States: the Compose snackbar's own durations, and how they map to the product's 5 and 8 seconds. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. |
