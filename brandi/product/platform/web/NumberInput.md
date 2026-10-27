# NumberInput on the web

The number input takes a quantity or an amount with step buttons, built as an ARIA spinbutton on a text input.

```yaml
component: NumberInput
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
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
| Native control | Role `spinbutton` on a text input, with sibling step buttons, which ARIA allows [WEB-8]. The APG patterns index lists a Spinbutton pattern [WEB-2]. |
| Target and spacing | The step buttons meet 2.5.8, and 40 CSS px on touch [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1 (1.4.3), with the border and step buttons at 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Value, minimum, maximum, invalid and disabled. `aria-valuenow`, `aria-valuemin` and `aria-valuemax` give the value and the range, and `aria-valuetext` gives words when a number alone misleads [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Role `spinbutton`, named by its label, with its value in `aria-valuenow` [WEB-8]. A prefix or suffix is read with the field [WEB-8]. The step buttons are named by what they change ("Increase quantity") [WEB-3]. |
| Navigation placement | In a Field [WEB-7]. |
| Keyboard, pointer, trackpad | Up and Down step the value, and focus lands on the text input. ARIA keeps the step buttons out of the Tab ring [WEB-8]. A typed value is checked when the person leaves the field, never while they type (3.3.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The step size, the step buttons' look and `inputMode`, inside the floors [WEB-1]. Pointer users get the step buttons and keyboard users get Up and Down [WEB-8]. Not yet proven: no review round has checked it. |
| Platform owns | Reporting value changes to assistive tech [WEB-8]. |
| Not confirmed | Native control: HTML `input[type="number"]`, since the HTML standard is not in the registry. Keyboard, pointer, trackpad: the APG Spinbutton key map, including Page Up, Page Down, Home and End, since its page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
