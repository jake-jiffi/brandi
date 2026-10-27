# ProductLockup on macOS

ProductLockup is the mark with the product's name on macOS, at the top of the sidebar and in the sign-in window.

```yaml
component: ProductLockup
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-3
    url: https://developer.apple.com/design/human-interface-guidelines/typography
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The registry names no lockup control. It is an image and a text label, placed as content, and Apple asks that branding defer to that content [APL-8]. |
| Target and spacing | With `href` it is one link, and the link meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Otherwise it is not a target. |
| Type | The product's own setting of the name. A custom font must stay legible at every size and support Bold Text [APL-8] [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The logo's approved renditions, with the light and dark versions paired in one asset [APL-5]. Name text in `labelColor` or a dynamic brand colour [APL-4]. A system colour on the name adapts to Increase Contrast [APL-4]. The accent never touches the lockup. |
| States | None, unless it is a link. Over a link the pointer becomes the pointing hand, `pointingHand` [APL-17]. |
| Motion | None. The lockup does not move. |
| Accessibility API | VoiceOver. As one link it is named "[Brand] [product]" [APL-19]. The image inside is hidden so the name is read once [APL-19]. |
| Navigation placement | The top of the sidebar, one per window, clear of the bottom edge a moved window can hide [APL-10]. Never the window title, which never carries the app's name [APL-11]. |
| Keyboard, pointer, trackpad | As a link it takes Full Keyboard Access focus [APL-16]. Primary click opens it [APL-17]. |
| Haptics | None [APL-18]. |
| Brand may change | The name's setting, the inline or stacked layout, and an ellipsis for long names. Apple asks that branding defer to content and that the logo appear only where it gives context [APL-8]. |
| Platform owns | The pointing-hand pointer over a link [APL-17]. Dark Mode switching between renditions [APL-5]. |
| Not confirmed | Lockup use in a title bar or an About window: not covered by the registry. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
