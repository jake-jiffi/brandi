# Card on Android

On Android, Card is a Material card, one subject's content and actions in a container on the canvas.

```yaml
component: Card
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
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
  - key: MAT-10
    url: https://m3.material.io/foundations/layout/breakpoints/overview
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
| Native control | Material cards, which display content and actions about a single subject [MAT-4]: Compose `Card`, `ElevatedCard` or `OutlinedCard` [AND-9]. |
| Target and spacing | An interactive card keeps at least 48 × 48 dp, and the buttons inside keep their own targets with 8 dp or more between them [MAT-7]. |
| Type | The title takes a heading style and `heading()` [AND-2]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Cards take disabled, hovered, focused, pressed and dragged states, and can lift on press [MAT-9]. The same page also lists cards among components that do not take focus, a conflict recorded here [MAT-9]. `selected` is the product's. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. Cards can resize as breakpoints change [MAT-10]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Its title takes `Modifier.semantics { heading() }`, so TalkBack can jump between headings [AND-2]. With `href`, the title becomes the card's link while buttons inside stay their own nodes [AND-2]. A card's actions can also move into its custom actions [AND-2]. |
| Navigation placement | On the canvas, in a column or a grid, by the product's rule. Material resizes and repositions cards as breakpoints change [MAT-10]. |
| Keyboard, pointer, trackpad | An interactive card takes focus with Material's ring-like indicator [MAT-9]. Its buttons take Tab, then Space or Enter [MAT-6]. A cursor shows the hover state layer, one element at a time [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Never a card inside a card. The title says what the card shows, in sentence case, with no small uppercase label above it. One idea per card: a card that needs tabs is a page. `flat` inside a pane, `flush` for tables and lists, and `interactive` lifts on hover. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. The contrast level the person picks, delivered through the colour roles [MAT-18]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. |
