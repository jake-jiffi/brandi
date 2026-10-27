# AIAnswer on Android

On Android, AIAnswer is what the assistant made or is making: the question as a heading, its steps, the answer, its sources, its status and the person's next move.

```yaml
component: AIAnswer
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
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no component for an assistant's answer [MAT-4]. Build it from a heading, text, Source chips and Material buttons [MAT-4]. |
| Target and spacing | Actions, suggestions, Stop and Try again keep at least 48 × 48 dp [MAT-7] [AND-1]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The question shows in full, as the heading. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. The streaming caret stays visible at every contrast level, by the product's rule. |
| States | Thinking, streaming, Drafted, Answered, Stopped and Failed, by the product's rule. While it streams, the status, sources, suggestions and actions wait for the finished answer. Its buttons take hovered, focused and pressed states [MAT-9]. |
| Motion | Streaming text ends in a caret. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The question takes `heading()` [AND-2]. One polite status line speaks when the work starts and when it ends [AND-2]. Streaming text never sits in a live region, because live regions are not for content that changes often [AND-2]. Whether TalkBack repeats a live region's identical message, which the product needs for the same failure twice, is not confirmed. After Try again or Stop, focus moves to the steps line or the question. The Compose API for moving focus is not confirmed. |
| Navigation placement | In the Ask panel or under the AskBar, newest last, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | Its buttons take Tab, then Space or Enter [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | The assistant drafts and a person sends. "Drafted" offers Use this, Edit and Discard. "Answered" offers the actions it leads to. Only the newest answer's main action is primary. Every figure has a Source, and the caveat ends "The assistant can be wrong." Up to three suggestions as quiet buttons in Material's text button style [MAT-5]. No model names, prompts or raw tool calls on screen. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: whether TalkBack repeats a live region's identical message, and the Compose API for moving focus. |
