# SignInFields on the web

The sign-in fields are a password with show and hide and a one-time code, built on text inputs with their input purposes set.

```yaml
component: SignInFields
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-3
    url: https://www.w3.org/WAI/ARIA/apg/patterns/button/
    marker: undated
    read: 2026-10-27
  - key: WEB-7
    url: https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
    marker: undated
    read: 2026-10-27
  - key: WEB-8
    url: https://www.w3.org/TR/wai-aria-1.2/
    marker: Recommendation 2023-06-06, 1.3 Working Draft 2026-06-04
    read: 2026-10-27
  - key: WEB-9
    url: https://www.w3.org/TR/mediaqueries-5/
    marker: Working Draft 2026-02-19
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Text inputs, the related concept of `textbox` [WEB-8], with `autocomplete` set to `current-password` or `new-password`, input purposes WCAG lists (1.3.5) [WEB-1]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. The show and hide button too. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1 (1.4.3) and a 3:1 border (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Password hidden or shown, and a code empty, part filled or complete, plus invalid and disabled. As a toggle, show and hide carries `aria-pressed` [WEB-3]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Each field is named by its label (3.3.2) [WEB-1]. Show and hide is either a toggle `button` with a fixed name ("Show password") and `aria-pressed`, or a plain button whose name changes. APG says a toggle's label must not change with its state [WEB-3]. The code is one `textbox` to assistive tech, however many boxes it draws [WEB-8]. |
| Navigation placement | On sign-in and account screens, inside a named `form` [WEB-7]. |
| Keyboard, pointer, trackpad | Never block paste. 3.3.8 (AA) bars a test such as remembering a password unless the step offers another method, a mechanism that helps, or one of its two recognition options [WEB-1]. Paste and password managers are the help the product keeps open. Pasting a code fills every box. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Field order, the show and hide control's look and the code's box count, inside the floors [WEB-1]. `one-time-code` is not among the input purposes WCAG lists [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Filling the fields from their declared input purpose, which 1.3.5 makes possible [WEB-1]. |
| Not confirmed | Native control: `input[type="password"]` and the `one-time-code` autofill token, since the HTML standard is not in the registry. Accessibility API: how a code drawn as several boxes reads as one field, since no registry page covers it. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
