# TextInput on the web

The text input is a single-line field, built on the HTML `input` element.

```yaml
component: TextInput
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
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
  - key: WEB-10
    url: https://www.w3.org/TR/selectors-4/
    marker: Working Draft 2026-01-22
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | HTML `input[type="text"]`, the related concept of the `textbox` role [WEB-8]. ARIA meant its own `textbox` for hosts with no text input, so the native element comes first [WEB-8]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. The product sets 36 CSS px, or 44 on touch. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The product sets 16 CSS px input text on touch. |
| Colour and theme | Text and placeholder 4.5:1, since a placeholder is text too (1.4.3) [WEB-1]. The border, `line-control`, is 3:1 on every surface it sits on, as 1.4.11 asks of what identifies a control [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Default, hover, focus, invalid, read-only and disabled, through `:focus-visible`, `:user-invalid`, `:read-only`, `:disabled` and `:placeholder-shown` [WEB-10]. Focus is a 2px `focus` edge. Invalid is a danger edge that stays danger while focused. Read-only is a dashed edge and a lock. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Role `textbox`, named by its Field label (3.3.2) [WEB-1]. A placeholder is a hint, never the label, since ARIA gives the two different purposes [WEB-8]. The prefix and suffix are read with the field through `aria-describedby` [WEB-8]. Read-only stays focusable, since ARIA keeps navigation to read-only content open [WEB-8]. |
| Navigation placement | Inside a Field, in a form [WEB-7]. |
| Keyboard, pointer, trackpad | Tab focuses it. In a single-line input, Enter usually submits the form, as ARIA's `textbox` note records [WEB-8]. Pointer activation runs on the up-event, the No Down-Event option of 2.5.2 [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Heights, edges, prefix and suffix, the read-only lock and the 16 CSS px touch text, inside 3:1 for the border and 4.5:1 for text [WEB-1]. `type`, `inputMode` and `autoComplete` are set per field, and 1.3.5 asks for a programmatic purpose on fields about the person [WEB-1]. |
| Platform owns | Editing, the caret and the value the native input exposes [WEB-8]. |
| Not confirmed | Type: whether 16 CSS px input text stops mobile browsers zooming on focus, since no browser documentation is in the registry. Keyboard, pointer, trackpad: what `inputMode` and `autoComplete` do, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
