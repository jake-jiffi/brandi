# Stepper on the web

The stepper shows progress through a short setup, with finished steps checked and the current step ringed, built as an ordered list.

```yaml
component: Stepper
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
| Native control | An ordered list: `list`, base concept `ol` [WEB-8]. The current step carries `aria-current="step"` [WEB-8]. Finished steps that can be revisited are links or buttons [WEB-3]. |
| Target and spacing | Revisitable steps meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Each label is the outcome ("Connect [source]"). |
| Colour and theme | The check and the ring come with words, never colour alone (1.4.1), and the marks are 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Completed, current and not started, each read with its label: "Completed", "Current step" or "Not started". `aria-current="step"` marks the current one [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `list` of `listitem` [WEB-8]. Each item's name includes its state in words. Location within the process is 2.4.8 (AAA) [WEB-1]. |
| Navigation placement | At the top of a setup flow, inside `main` [WEB-7]. `orientation` sets the layout. |
| Keyboard, pointer, trackpad | Finished steps are Tab stops, and steps not started are not interactive (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Marks, orientation and labels, inside the floors [WEB-1]. Five steps at most. Tasks in any order are an OnboardingChecklist, not a Stepper. |
| Platform owns | List semantics and `aria-current` exposure [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
