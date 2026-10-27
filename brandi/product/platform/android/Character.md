# Character on Android

On Android, the brand character is a decorative image that marks a state, hidden from TalkBack, with a loop that stops when animations are off.

```yaml
component: Character
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
  - key: MAT-17
    url: https://m3.material.io/styles/motion/overview/how-it-works
    marker: snapshot 2026-10-13_06-10-19
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no illustration component [MAT-4]. The closest pattern is a decorative image hidden from accessibility services [AND-1]. |
| Target and spacing | None. The character is never pressable. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | None. It carries no text for the font size setting to scale [AND-5]. |
| Colour and theme | Never recoloured, by the product's rule. Colour inversion reverses it with everything else on screen [AND-10]. |
| States | None. Its poses mark product states (welcome, working, done, all caught up, needs a person, nothing found, help), not interaction states. Material's states are for interactive components [MAT-9]. |
| Motion | A gentle loop for working and calm, which is the product's own. Material's springs [MAT-17] do not cover loops. The loop stops under reduced motion. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Hidden from TalkBack with `hideFromAccessibility` [AND-1]. The words beside it carry the meaning. |
| Navigation placement | One per screen, inside an empty, loading, done, error, welcome or help moment, and never in tables, forms or a busy dashboard, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | None. It never takes focus. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | All of it: poses, size, the flat rendition and the loop. Never recoloured, flipped, rotated, cropped or squashed, never two renditions on one screen, and never on a form error. Material sets nothing for illustration [MAT-4]. |
| Platform owns | Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. Battery Saver turning animators off [AND-6]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. |
