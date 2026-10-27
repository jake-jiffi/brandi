# RadioGroup on the web

The radio group is one choice from two to five options people see side by side, built on HTML radio inputs.

```yaml
component: RadioGroup
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
| Native control | HTML `input[type="radio"]` elements, the related concept of the `radio` role, inside a `fieldset`, the related concept of the `group` role [WEB-8]. The APG patterns index lists a Radio Group pattern [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Each radio's edge and dot are 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Unchecked, checked, disabled and focus, through `:checked`, `:disabled` and `:focus-visible` [WEB-10]. `aria-checked` is `true` or `false`, since `mixed` is not allowed on a radio [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A group named by its `legend`, owning radios that each need a name [WEB-8]. As ARIA, role `radiogroup` owning `radio` [WEB-8]. Option descriptions are tied by `aria-describedby`, and the group supports `aria-required` and `aria-invalid` [WEB-8]. |
| Navigation placement | In forms. More than five options is a Select [WEB-8]. |
| Keyboard, pointer, trackpad | ARIA requires a radiogroup to manage focus: one Tab stop, with the arrows moving inside it [WEB-8]. Which arrows, and whether they wrap: not confirmed. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Layout, descriptions and preselecting the safest option, inside the 3:1 floor [WEB-1]. |
| Platform owns | Role mapping and the checked state's exposure [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the radio key map and wrapping, since neither the APG Radio Group page nor the HTML standard is in the registry. Accessibility API: how a `legend` names its `fieldset`, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
