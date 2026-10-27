# ProductLockup on Android

On Android, the product lockup is the mark and the product's name built from a vector image and a text label, merged into one link when it has one.

```yaml
component: ProductLockup
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
  - key: MAT-12
    url: https://m3.material.io/components/navigation-rail/overview
    marker: Expressive update May 2025
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no lockup component [MAT-4]. Build it from a vector image and a `Text`, merged into one node with `Modifier.semantics(mergeDescendants = true)` [AND-2]. |
| Target and spacing | With a link, one target for the whole lockup: at least 48 × 48 dp on touch and 44 × 44 dp for a pointer [MAT-7]. A custom clickable sets that size itself [AND-1]. |
| Type | The name in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The font size setting scales the name and not the mark [AND-5] [AND-10], so at large sizes the name can outgrow the mark, which the product's ellipsis rule absorbs. Roboto is the default plain typeface [MAT-16]. |
| Colour and theme | The mark in its light or dark rendition, and the name in a text role. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | With a link: focused, hovered and pressed, with a ripple on press [MAT-9]. Without one: no states. |
| Motion | None beyond the press ripple [MAT-9]. |
| Accessibility API | With a link, the lockup is one node named "[Brand] [product]" [AND-1] [AND-2]. Its type comes from the Role property [AND-1]. The role Android gives a link is not confirmed. Without a link, the mark's description and the name read together. |
| Navigation placement | One per screen: the top of the rail, sign-in and product emails, by the product's rule. Material's rail holds destinations and an optional FAB [MAT-12]. A lockup slot on it is not confirmed. |
| Keyboard, pointer, trackpad | With a link it takes focus and Material's ring-like indicator [MAT-9]. The key that activates a link on Android is not confirmed. A cursor shows the hover state layer, one element at a time [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | The name as people say it, never larger than the mark, cut with an ellipsis rather than widening the rail. Inline with a hairline, or stacked. How the name is set is a brand-to-product decision. Material sets nothing for a lockup [MAT-4]. |
| Platform owns | The font size setting, which scales the name and not the mark [AND-5] [AND-10]. Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. |
| Not confirmed | Accessibility API: the role Android gives a link. Navigation placement: a lockup slot on Material's navigation rail. Keyboard, pointer, trackpad: the key that activates a link. |
