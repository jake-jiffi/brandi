# AppShell on Android

On Android, AppShell is the app's frame: Material adaptive navigation, a navigation bar on compact windows and a rail from medium up, around the main content.

```yaml
component: AppShell
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
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
  - key: MAT-11
    url: https://m3.material.io/components/navigation-bar/overview
    marker: Expressive update May 2025
    read: 2026-10-27
  - key: MAT-12
    url: https://m3.material.io/components/navigation-rail/overview
    marker: Expressive update May 2025
    read: 2026-10-27
  - key: MAT-13
    url: https://m3.material.io/components/navigation-drawer/overview
    marker: Expressive update May 2025
    read: 2026-10-27
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-18
    url: https://m3.material.io/styles/color/system/how-the-system-works
    marker: snapshot 2026-10-13_06-10-19
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
| Native control | Compose `NavigationSuiteScaffold` from the Material 3 Adaptive library switches between a bottom navigation bar on phones and an edge-anchored navigation rail on large screens [AND-8] [AND-9]. Material: a navigation bar at compact and medium widths, a navigation rail from medium up, and the expanded rail in place of the drawer [MAT-11] [MAT-12] [MAT-13]. |
| Target and spacing | Navigation items keep at least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. `NavigationBarItem` and `NavigationRailItem` draw the active label in `secondary` since Compose Material 3 1.4.0 [AND-9]. |
| States | Full rail, rail as icons, drawer and one column, chosen by the shell's own width, by the product's rule. Navigation bars, rails and drawers take no hover, focus or disabled state as a whole [MAT-9]. |
| Motion | Collapsed and expanded rails transition into each other [MAT-12]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | An Android equivalent of the product's "Skip to content" link is not confirmed. The main content starts with a heading TalkBack can jump to [AND-2]. The drawer's content takes focus when it opens, the dismissed drawer leaves the focus order, and Escape closes it, since the 1.5.0 pre-releases [AND-9]. |
| Navigation placement | A navigation bar for 3 to 5 destinations at compact and medium widths, and a navigation rail for 3 to 7 from medium up [MAT-11] [MAT-12]. Breakpoints: compact under 600 dp, medium 600 to 839, expanded 840 to 1199, large 1200 to 1599, extra-large from 1600 [MAT-10]. Apps targeting API 37 must handle any window size on large screens [AND-8]. |
| Keyboard, pointer, trackpad | The product's drawer holds focus, makes the page behind it inert, closes with Escape and the scrim, and returns focus to the menu button. Compose's drawer closes with Escape [AND-9]. `Scaffold`'s keyboard navigation order was fixed in the 1.5.0 pre-releases [AND-9]. Compose 1.11 adds trackpad and mouse support, with native focus rings [AND-8]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | The full rail from 1280, icons with tooltips from 1024, a drawer under 1024 and one column under 640, by the shell's own width in CSS px, not converted here. Material switches at window breakpoints in dp [MAT-10]. In the narrowest layout the PageHeader's primary moves to a bar at the foot. The product's drawer departs from Material, whose expanded rail replaced the drawer [MAT-13]. |
| Platform owns | Apps targeting API 37 cannot opt out of resizing and orientation changes on large screens [AND-8]. The window size, which changes with multi-window modes and folding [MAT-10]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: an Android equivalent of the product's skip link. |
