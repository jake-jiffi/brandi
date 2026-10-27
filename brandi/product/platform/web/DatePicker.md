# DatePicker on the web

The date picker takes a date, typed in the product's format or chosen from a calendar, built as a text field with a calendar dialog.

```yaml
component: DatePicker
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
  - key: WEB-4
    url: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
    marker: undated
    read: 2026-10-27
  - key: WEB-6
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
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
| Native control | Typing always works, in a text input, the related concept of `textbox` [WEB-8]. The calendar is a `dialog` [WEB-6] holding a `grid` of days [WEB-4]. APG's patterns index lists no date picker [WEB-2]. |
| Target and spacing | The calendar button and each day meet 24 × 24 CSS px (2.5.8) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The expected format shows beside the field. |
| Colour and theme | Today and the chosen day show by more than colour (1.4.1), with their marks at 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Empty, typed, invalid, and calendar open. Each day is chosen, today or unavailable. The chosen day carries `aria-selected="true"` [WEB-4], and today `aria-current="date"` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | The field is a `textbox` whose format is its description through `aria-describedby` [WEB-8]. The calendar button is a `button` with `aria-haspopup="dialog"` and `aria-expanded` [WEB-8]. The calendar is a `dialog` named by its month, with days as `gridcell` [WEB-6] [WEB-4]. A date of birth takes the `bday` input purpose (1.3.5) [WEB-1]. |
| Navigation placement | In a Field. The calendar opens in a portal beside the field [WEB-6]. |
| Keyboard, pointer, trackpad | In the calendar, arrows move by day, and Page Up and Page Down move by a page, here a month [WEB-4]. The layout grid rules let arrows wrap to the next week [WEB-4]. Escape closes the calendar and focus returns to the field [WEB-6]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. `navigator.vibrate()` runs only in Chromium-based browsers, and only once the person has interacted with the page. WebKit opposes the API and Firefox removed it in version 129 [WEB-11]. |
| Brand may change | The date format, the calendar's look and which days are unavailable, inside the floors [WEB-1]. A period says what it is compared with. Not yet proven: no review round has checked it. |
| Platform owns | Reporting the active day as focused [WEB-8]. |
| Not confirmed | Native control: HTML date inputs, since the HTML standard is not in the registry. Keyboard, pointer, trackpad: a date picker key map, since no registry page sets one. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
