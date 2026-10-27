# OnboardingChecklist on the web

The onboarding checklist lists first-run tasks someone can do in any order, built as a list with a progress bar.

```yaml
component: OnboardingChecklist
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
| Native control | A `list` of tasks [WEB-8], each a link or button to do it [WEB-3], with a `progressbar` for the whole [WEB-8]. |
| Target and spacing | Each task meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Each task is named by its outcome. |
| Colour and theme | Done tasks show a check and words, never colour alone (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Each task not started or done, and the list's progress. Finished tasks can be revisited. Progress reads as words ("2 of 5 done") through `aria-valuetext` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `list` of `listitem` [WEB-8]. Each task's name includes its state in words. The `progressbar` is named for the setup, with `aria-valuetext` "2 of 5 done" [WEB-8]. |
| Navigation placement | On Home or a first-run page, inside `main` [WEB-7]. Not a Stepper: the order is free. |
| Keyboard, pointer, trackpad | Tab moves through the tasks (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Layout, wording and when it goes away, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Reading progress from `aria-valuetext` [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
