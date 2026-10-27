# AIProposal on Android

On Android, AIProposal is the card where the assistant asks before it acts, and nothing happens until a person presses the button.

```yaml
component: AIProposal
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no component for it [MAT-4]. Build it on a Material card with Material buttons [MAT-4]. |
| Target and spacing | Its buttons keep the 48 dp minimum [AND-1], with 8 dp or more between them [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The title is a question with the thing and the count: "Send reminders for 2 invoices?" |
| Colour and theme | While it waits, the assistant's colour runs round the card as well as the Needs you badge, so colour is not the only cue, by the product's rule. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Asking, working, done, failed and dismissed, shown as Needs you, In progress, Done, Failed and Not done, by the product's rule. Its buttons keep their own states [MAT-5]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The card is a region named by its heading, which takes `heading()` [AND-2]. The outcome is announced politely and takes focus [AND-2]. The Compose API for moving focus is not confirmed. Not now, Edit and Try again carry the question in their descriptions, so TalkBack knows what they act on [AND-1]. |
| Navigation placement | In the Ask panel or where the assistant answered, one proposal waiting at a time, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | Buttons in reading order, Not now, Edit, then the action, as Material puts the confirming action last in dialogs [MAT-14]. They take Tab, then Space or Enter [MAT-6]. |
| Haptics | None from the product. `CONFIRM` and `REJECT`, from API 30, signal success and failure [AND-4]. |
| Brand may change | Used whenever the assistant would send, pay, approve, change another system or delete. Its action is the only primary on screen while it waits. It lists every record it will touch, five at most, with "and 12 more" in the note. Try again after a failure is a secondary button. Material sets nothing for it [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. The 48 dp touch target, which Compose Material components enforce [AND-1]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the Compose API for moving focus. |
