# Icon on Android

On Android, an icon is a vector drawn with Compose's `Icon`, labelled when it means something on its own and hidden when it only decorates.

```yaml
component: Icon
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
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
| Native control | Compose `Icon`, with a `contentDescription` that says its purpose [AND-1]. Material now recommends Material Symbols, downloaded as vector drawables, and has stopped publishing the Material Icons library [AND-9]. |
| Target and spacing | None. An icon is not a control. An icon that acts sits in an `IconButton`, which enforces the 48 dp minimum [AND-1]. The target can reach past the visible shape: a 24 dp icon sits inside a 48 dp target [MAT-7]. |
| Type | None. An icon carries no text for the font size setting to scale [AND-5]. |
| Colour and theme | Drawn in the colour of the text beside it, with status icons in their status text colour, by the product's rule. That text's role carries the icon through light, dark and the contrast levels [MAT-18]. Graphics keep at least 3:1 against the background [MAT-8]. |
| States | None. An icon has no state of its own. The control holding it draws the state [MAT-9]. |
| Motion | None. Icons do not animate. Remove animations changes nothing [AND-10]. |
| Accessibility API | TalkBack reads the `contentDescription` when the icon carries meaning alone, such as "Share" [AND-1]. A purely decorative element is hidden with `hideFromAccessibility`, and an icon inside a labelled element takes `contentDescription = null` [AND-1]. An icon inside a `Button` merges into the button's node [AND-2]. |
| Navigation placement | Inside the control or the line it belongs to. Material's standard icon is 24 dp inside a 48 dp target [MAT-7]. |
| Keyboard, pointer, trackpad | None. Its control takes focus, not the icon, since Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | One icon set, by name, never emoji and never a second library. That departs from Material's recommendation of Material Symbols [AND-9]. Sizes follow the product's scale of 12 to 24. The product writes these sizes in CSS px for the web build, and they are not converted here. A lone icon always comes with a label and a tooltip, which IconButton supplies. |
| Platform owns | Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Nothing: the sources settle every field. |
