# Dialog on the web

The dialog is a focused decision or a short form over the page, built to the APG modal dialog pattern.

```yaml
component: Dialog
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
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
```

| Field | Spec |
|---|---|
| Native control | Role `dialog` with `aria-modal="true"`, built to the APG Dialog (Modal) pattern [WEB-6]. A confirmation that needs a response can be an `alertdialog`, with `aria-describedby` on its message [WEB-8]. The `dialog` role names no HTML related concept [WEB-8]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. On phones it rises from the bottom with full-width buttons. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The scrim dims the page, the usual treatment APG describes for inert content [WEB-6]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Open or closed, with `inline` for designs. APG leaves closing on an outside click to each build [WEB-6], and `scrimClose` turns it off once a form inside has changes. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `dialog`, named by its title through `aria-labelledby` [WEB-6]. ARIA requires the name [WEB-8]. `aria-describedby` points to a simple description and is left off for structured content [WEB-6]. `aria-modal="true"` only while everything outside is inert and obscured [WEB-6]. |
| Navigation placement | Centred over the page, in a portal. The web sets no button order [WEB-6], so the product's applies: secondary then primary, right-aligned, with Cancel immediately left of the primary. |
| Keyboard, pointer, trackpad | Focus moves inside on opening: usually the first focusable element, a static start (`tabindex="-1"`) for long or structured content, or the least destructive action before an irreversible step [WEB-6]. Tab and Shift+Tab wrap inside. Escape closes, and focus returns to the opener, or to a logical element if the opener is gone [WEB-6]. A visible close button is in the tab sequence [WEB-6]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Widths 400, 520 and 720 CSS px, the scrim, the radius, the footer order and the phone layout [WEB-6]. Up to five fields, and never a dialog on a dialog. A destructive confirm names the thing and the count, with a `danger-solid` primary: the confirm option 3.3.4 offers before data is deleted [WEB-1]. |
| Platform owns | How assistive tech limits reading to the dialog under `aria-modal` [WEB-8]. |
| Not confirmed | Native control: the HTML `dialog` element, `showModal()` and the `inert` attribute, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
