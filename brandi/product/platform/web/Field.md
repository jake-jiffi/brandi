# Field on the web

The field wires one control to its label, an optional marker, a hint and an error, and the web has no single element for that wiring.

```yaml
component: Field
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
| Native control | None as one element. A visible label tied to the control (3.3.2, 1.3.1) [WEB-1], with `aria-describedby` for the hint or error, and `aria-invalid` and `aria-required` on the control [WEB-8]. |
| Target and spacing | The control inside meets 2.5.8 [WEB-1]. The label and hint are not targets. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Labels sit above fields, in sentence case, with no colons. |
| Colour and theme | Label, hint and error text 4.5:1 (1.4.3) [WEB-1]. The error carries an icon as well as colour (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Default, optional, required, invalid, disabled and read-only, held on the control. `:user-invalid` matches only after the person has interacted, which suits errors shown on leaving or saving [WEB-10]. ARIA asks authors not to mark a required field invalid before a save attempt [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | The control is named by the label (4.1.2) [WEB-1]. `aria-describedby` points to the hint, or to the error that replaces it [WEB-8]. `aria-required="true"` with no visible marker, and `aria-invalid="true"` once a check fails [WEB-8]. `aria-errormessage` counts only while `aria-invalid` is true [WEB-8]. The error is announced (4.1.3) and says what is wrong and how to fix it (3.3.1, 3.3.3) [WEB-1]. |
| Navigation placement | Inside a form, a FormSection or a FormRow. A named form is a `form` landmark [WEB-7]. |
| Keyboard, pointer, trackpad | Tab reaches the control, never the label (2.1.1) [WEB-1]. Errors appear when the person leaves the field or saves, never while they type, and changing a value never changes context (3.2.2) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Label placement (above), the "(optional)" marker, hint and error styles and the error icon, inside the contrast floors [WEB-1]. Optional fields are marked and required ones are not, so `aria-required` carries the rule [WEB-8]. |
| Platform owns | How the browser computes the control's name and description and exposes them to the tree [WEB-8]. |
| Not confirmed | Accessibility API: how an HTML `label` and its `for` name a control, and what a click on the label does, since the HTML standard is not in the registry. Accessibility API: the full name computation, since Accessible Name and Description Computation was not read. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
