# TimePicker on the web

The time picker takes a time, typed in the product's `hours` style, with an optional list of times, built as a text field or a combobox.

```yaml
component: TimePicker
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Vibration API (Candidate Recommendation Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-2
    url: https://www.w3.org/WAI/ARIA/apg/
    marker: APG 1.2, undated
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
  - key: WEB-11
    url: https://www.w3.org/TR/vibration/
    marker: Candidate Recommendation Draft 2026-05-21
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Typing always works, in a text input, the related concept of `textbox` [WEB-8]. A list of suggested times makes it a `combobox` over a `listbox` [WEB-8], for which the APG patterns index lists a Combobox pattern [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Times read and type in the `hours` style, so what people type and what they read agree. |
| Colour and theme | Text 4.5:1 (1.4.3) and a 3:1 border (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Empty, typed, invalid, list open and disabled. `aria-expanded` gives the list's state [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `textbox`, or a `combobox` with a list, named by its label (3.3.2) [WEB-1]. The format is its description through `aria-describedby` [WEB-8]. A typed value is checked when the person leaves the field, and an error says what is wrong and how to fix it (3.3.1, 3.3.3) [WEB-1]. |
| Navigation placement | In a Field, often beside a DatePicker [WEB-7]. |
| Keyboard, pointer, trackpad | Typing always works. A list follows the Combobox keys [WEB-8]. Escape closes it. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. `navigator.vibrate()` runs only in Chromium-based browsers, and only once the person has interacted with the page. WebKit opposes the API and Firefox removed it in version 129 [WEB-11]. |
| Brand may change | The time format and the step between suggested times, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Reporting the active option as focused [WEB-8]. |
| Not confirmed | Native control: HTML time inputs, since the HTML standard is not in the registry. Keyboard, pointer, trackpad: the APG Combobox key map, since its page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
