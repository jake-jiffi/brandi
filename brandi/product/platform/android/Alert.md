# Alert on Android

On Android, Alert is a message inside a page or card that says what happened, what it means and what to do, built from an icon, text and buttons because Material has no inline alert.

```yaml
component: Alert
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no inline alert component [MAT-4]. Material sends low-importance messages to snackbars and high-importance ones, which block until acted on, to dialogs [MAT-14]. An Alert sits between them, in the content. |
| Target and spacing | Its buttons and its dismiss button keep the 48 dp minimum [AND-1], with 8 dp or more between targets [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The title in the product's title style. |
| Colour and theme | The tone carries an icon and words as well as colour, by the product's rule. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. Graphics keep at least 3:1 against the background [MAT-8]. |
| States | Tones neutral, info, success, warning, danger and ai, and dismissed, by the product's rule. Its buttons take focused, hovered and pressed states [MAT-9]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Something that goes wrong while the person is there is announced through a live region: assertive only for time-sensitive news, polite for the rest [AND-2]. A warning already there on arrival is polite and should not speak on load. Whether a Compose live region speaks when it first appears is not confirmed. Buttons are `Role.Button`, and dismiss is named "Dismiss: [title]" [AND-1]. |
| Navigation placement | Inside the page or card it concerns, by the product's rule. Material keeps dialogs for blocking prompts and snackbars for short updates [MAT-14]. |
| Keyboard, pointer, trackpad | Its buttons take Tab, then Space or Enter [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. |
| Haptics | None from the product. `REJECT`, from API 30, signals a rejected or failed interaction [AND-4]. |
| Brand may change | State, then consequence, then the fix: "[Source] is not responding. Invoices below are from 9:42 am." Never "Something went wrong", and never blame the person. Actions are Buttons ("Try again"), and a link appears only when it goes somewhere. A partial outage leaves the rest of the screen working. Material sends low-importance messages to snackbars and blocking ones to dialogs [MAT-14]. The product's in-page alert sits between them. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: whether a Compose live region speaks when it first appears. |
