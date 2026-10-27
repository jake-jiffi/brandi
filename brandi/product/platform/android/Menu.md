# Menu on Android

On Android, Menu is a Material menu of actions on one thing, opened from an overflow button or any other trigger.

```yaml
component: Menu
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
| Native control | Material menus, which display a list of choices on a temporary surface [MAT-4]: Compose `DropdownMenu` with `DropdownMenuItem`. The expressive menus promoted in the 1.5.0 pre-releases add groups labelled with `MenuDefaults.DropdownMenuGroupLabel`, `CheckableDropdownMenuItem` for checked items, and cascading submenus through `DropdownMenuPopupPositionProviders` [AND-9]. |
| Target and spacing | Each item at least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's text styles for menu items are not confirmed. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. Destructive items are in the danger text colour, with the word carrying the meaning. |
| States | A menu takes no hover, press, drag or disabled state as a whole [MAT-9]. Disabled items stay visible and do nothing, and checked items show a check, by the product's rule. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Each item reads its label, and a checked item its state [AND-2]. The trigger names what the menu acts on, "More actions for [record]" [AND-1]. The semantics a Compose `DropdownMenu` gives its popup are not confirmed. |
| Navigation placement | Anchored to its trigger, flipping to stay on screen, by the product's rule. At compact widths Material uses a bottom sheet for supplementary selection, and a menu from medium up [MAT-10]. |
| Keyboard, pointer, trackpad | The product's map: focus moves to the first item. Up, Down, Home and End move. Enter chooses. An item's single-key shortcut runs it. Escape closes and returns focus to the trigger. Tab closes and moves on. The key map a Compose `DropdownMenu` supports is not confirmed. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. |
| Haptics | `LONG_PRESS`, from API 3, is for a long press that performs an action, and `CONTEXT_CLICK`, from API 23, for a context click [AND-4]. Either fits a menu opened that way. Whether Material menus play them is not confirmed. |
| Brand may change | Six items or fewer is best. Destructive items go last, after a separator, and open a confirmation. The item in hand takes the hover wash and a visible edge, with a ring from the keyboard. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Type: Material's text styles for menu items. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the semantics a Compose `DropdownMenu` gives its popup. Keyboard, pointer, trackpad: the key map a Compose `DropdownMenu` supports. Haptics: whether Material menus play a long-press or context-click haptic. |
