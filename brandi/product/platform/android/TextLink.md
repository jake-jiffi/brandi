# TextLink on Android

On Android, a text link is underlined text that navigates, built in Compose because Material has no link component.

```yaml
component: TextLink
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
  - key: AND-8
    url: https://developer.android.com/about/versions/17
    marker: page 2026-07-01, post 2026-06-16
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
| Native control | None. Material 3 has no link component [MAT-4]. The closest Material control is the text button style, a `primary` label with no container [MAT-5]. How to build a link inside running text is not confirmed. |
| Target and spacing | At least 48 × 48 dp on touch and 44 × 44 dp for a pointer, with 8 dp between targets [MAT-7]. A custom element sets its own minimum. `Modifier.minimumInteractiveComponentSize` reserves at least 48 dp when an element would measure smaller [AND-1] [AND-9]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The link keeps the size of the text around it. |
| Colour and theme | The product's `link` colour, underlined, so colour is never the only cue. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Focused, hovered and pressed [MAT-9]. |
| Motion | None. A link does not animate. Remove animations changes nothing [AND-10]. |
| Accessibility API | TalkBack reads the link text as its name [AND-1]. The text says where it goes and stays unique on the screen [AND-1]. The role Android gives a link is not confirmed. |
| Navigation placement | Inside running text or on a line of its own, in the content area. An action is a button, which Material treats as a separate component [MAT-4]. |
| Keyboard, pointer, trackpad | It takes focus with Material's ring-like indicator [MAT-9]. The key that activates a link on Android is not confirmed. A cursor shows the hover state layer, one element at a time [MAT-9]. Compose 1.11 adds trackpad and mouse support, with native focus rings [AND-8]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Underlined, in the `link` colour, with text that names the destination and is unique on the page, never "here" or "more". Links navigate and buttons act, so "Try again" is a Button. The product sizes link targets to 24 CSS px everywhere, which is not converted here. Material asks 48 × 48 dp on touch [MAT-7]. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Native control: how to build a link inside running text. Accessibility API: the role Android gives a link. Keyboard, pointer, trackpad: the key that activates a link. |
