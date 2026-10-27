# AIProposal on the web

The AI proposal is the assistant asking before it acts, where nothing happens until a person presses the button, built as a named region with a footer of buttons.

```yaml
component: AIProposal
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
| Native control | None. A `region` named by its heading [WEB-8], holding the records it will touch and a footer of HTML `button` elements [WEB-3]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The title is a question with the thing and the count ("Send reminders for 2 invoices?"). |
| Colour and theme | While it waits, the assistant's colour runs round the card as well as the Needs you badge, so colour is never alone (1.4.1) [WEB-1]. The outcome shows no outline at rest under `forced-colors` [WEB-9]. Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. |
| States | `asking`, `working`, `done`, `failed` and `dismissed`, shown as Needs you, In progress, Done, Failed and Not done. A failure keeps Not now, Edit and Try again. Each state is said in words, not only by the badge's colour (1.4.1) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `region` named by its heading, level 3 by default [WEB-8]. Not now, Edit and Try again are described by the question through `aria-describedby` [WEB-8]. The outcome replaces the buttons, takes focus (`tabindex="-1"`) and is announced (4.1.3) [WEB-1]. |
| Navigation placement | Inline in the answer it belongs to. One proposal waits at a time, and its action is the only primary on screen while it waits [WEB-7]. |
| Keyboard, pointer, trackpad | Buttons run in reading order: Not now, Edit, then the action (2.4.3) [WEB-1]. After a press, focus moves to the outcome, or to the question when there is nothing to read, never the page body [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The note ("Nothing happens until you press [button]"), the verb and count on the primary, and up to five records with "and 12 more" [WEB-1]. Before a payment or a deletion, it is the confirm option 3.3.4 offers [WEB-1]. |
| Platform owns | Exposing the region and its description [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
