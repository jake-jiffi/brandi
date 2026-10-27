# FileDrop on the web

The file drop is a drop zone with a real button, so nobody depends on dragging, and the web has no drop zone element.

```yaml
component: FileDrop
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
  - key: WEB-10
    url: https://www.w3.org/TR/selectors-4/
    marker: Working Draft 2026-01-22
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No native drop zone. The real control is an HTML `button`, the base concept of the `button` role [WEB-8], labelled "Choose files". Dropping is an extra path, never the only one (2.5.7) [WEB-1]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The zone's edge is 3:1 against adjacent colours (1.4.11), and drag-over shows by more than colour (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, drag over, error and disabled. `dragOver` renders the state for designs. Keyboard focus shows with `:focus-visible` [WEB-10]. It is always visible (2.4.7) and never fully hidden by author content (2.4.11) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | The button is a `button` named by `browseLabel` [WEB-3]. The rule in words ("CSV or XLSX, up to 20 MB") is its description through `aria-describedby` [WEB-8]. The error is announced (4.1.3) and gives the reason and the fix (3.3.1, 3.3.3) [WEB-1]. |
| Navigation placement | In forms and import flows. After a drop, a FileList shows each file [WEB-7]. |
| Keyboard, pointer, trackpad | The button is the keyboard path: Tab, then Space or Enter [WEB-3]. It is also the single-pointer path that 2.5.7 asks for beside dragging [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The zone's look, the copy and the 20 to 24 CSS px icon, inside the floors [WEB-1]. A wrong file is rejected with the reason and the fix, never silently. |
| Platform owns | Space and Enter activation on the button [WEB-3]. |
| Not confirmed | Native control: the file chooser, `accept`, `multiple` and the drag and drop events, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
