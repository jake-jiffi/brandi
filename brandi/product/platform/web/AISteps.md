# AISteps on the web

The AI steps log shows what the assistant is doing, step by step, open while it works and folded to one line when done, built as a disclosure over an ordered list.

```yaml
component: AISteps
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
| Native control | A disclosure: the summary line is a `button` with `aria-expanded`, controlling an ordered `list` of steps [WEB-8]. The APG patterns index lists a Disclosure pattern [WEB-2]. |
| Target and spacing | The summary line meets 24 × 24 CSS px (2.5.8) [WEB-1]. The reference's 36 CSS px line failed on touch, so the product sets 40 there. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Each step's state is in words as well as its icon (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Steps `done`, `running`, `waiting`, `failed` or `skipped`. Running reads "Working, step 2 of 4". Failure reads "Failed at step 2 of 3" and a stop "Stopped at step 2 of 3". `aria-expanded` gives the open state [WEB-8]. |
| Motion | One spinner at a time: the summary spins only while the list is folded, and it slows under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | A `button` named by the summary line, with `aria-expanded` and `aria-controls` [WEB-8]. Each step says its state in words. The start, a failure and the end are announced through a polite `status`, never every change [WEB-8]. AIAnswer turns its own end announcement off (`announceEnd`). |
| Navigation placement | Inside AIAnswer, or on its own in a Card titled with the job's name for a long job [WEB-7]. |
| Keyboard, pointer, trackpad | Space and Enter toggle the summary [WEB-3]. After Try again, focus moves to the summary line (2.4.3) [WEB-1]. Folded steps leave the tab order [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Step names in the person's words, `detail`, the folded `title` and the icons, inside the floors [WEB-1]. `title` never hides a failure or a stop. |
| Platform owns | Button activation and taking folded content out of the tree [WEB-3] [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Disclosure key map, since its page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
