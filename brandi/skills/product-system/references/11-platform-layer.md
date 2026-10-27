# Platform layer

Every component in the product system gets one spec for each platform it can ship on: web, iOS and
iPadOS, macOS, Android and Windows. Each spec is written against that platform's own guidance and
stamped with the guidance version it was checked against. Native code is generated from the spec
on demand and never kept. The spec and its stamp are the only things that persist.

Every source here was read on 27 October 2026. Every number and rule carries a source key, such as
[APL-2] or [WIN-14], and every key resolves in section 1. Quoted text and API names keep the
owner's spelling.

Four rules hold on every platform, stated once so they are not re-argued per component:

1. **The platform owns behaviour. The brand owns expression, inside the platform's limits.** Apple
   asks that a branded component keep its familiar sizing, placement and behaviour [APL-8].
   Microsoft asks that control template changes stay limited to design intent [WIN-3]. Material
   allows other colour roles on a button only if container and text keep 3:1 [MAT-5]. Every spec
   ends by saying which is which.
2. **Nothing comes from memory.** A field that no primary page settles says "not confirmed". Never
   fill it from another platform's rule.
3. **Units stay native.** Points on Apple platforms [APL-1], dp and sp on Android [MAT-7] [AND-5],
   effective pixels on Windows [WIN-16], CSS pixels on the web [WEB-1]. A spec never converts
   between them. Windows pages write px and epx interchangeably [WIN-16].
4. **A spec is current only while its stamp matches the live guidance.** Code generation reads the
   stamp first. A stale stamp blocks generation until the monthly check in section 5 clears it.

iPadOS shares the iOS spec. Fields split only where Apple's guidance splits, which is mostly focus
[APL-15], pointer [APL-17] and navigation [APL-9].

---

## 1. Sources of truth

Each owner signals its version differently. Apple puts a change log on most HIG pages. Google
versions its design-system data. Microsoft dates every Learn page and dates nothing in Fluent 2. W3C
prints a status and date under every spec title. The monthly check reads exactly these signals.

### 1.1 Apple: iOS, iPadOS and macOS

State on 27 October 2026:

- iOS 27, iPadOS 27 and macOS 27 Golden Gate. Release notes for 27.2 exist on both lists. Whether
  27.2 has shipped or is in beta is not confirmed [APL-31] [APL-32].
- The design language is Liquid Glass, a material for controls and navigation that floats above
  the content layer [APL-7]. It arrived with the 26 releases in June 2025 [APL-0].
- The newest guidance entry is dated 13 October 2026 [APL-0]. The newest form factor is iPhone
  Duo, Apple's first folding iPhone, with guidance added on 9 September 2026. In some poses it
  moves toolbars and tab bars to the side of the screen [APL-0] [APL-20].

How to tell what is current. The What's new page lists every guidance change by date [APL-0]. Most
HIG pages end with a change log table, and its newest date is that page's marker. The platform
overview pages, such as Designing for iOS, have none. The release notes indexes list OS versions
[APL-31] [APL-32]. API pages give the release that introduced or deprecated each API.

HIG pages render in the browser. The same content, change log included, comes as JSON from
`https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`. API
pages come from `https://developer.apple.com/tutorials/data/documentation/<path>.json`, with
availability under `metadata.platforms`. Both routes worked on 27 October 2026.

All rows read 2026-10-27. HIG markers are the newest change log date on the page.

| Key | Page | URL | Marker |
|---|---|---|---|
| APL-0 | Design: What's new | https://developer.apple.com/design/whats-new/ | newest entry 2026-10-13 |
| APL-1 | HIG: Accessibility | https://developer.apple.com/design/human-interface-guidelines/accessibility | 2025-06-09 |
| APL-2 | HIG: Buttons | https://developer.apple.com/design/human-interface-guidelines/buttons | 2025-12-16 |
| APL-3 | HIG: Typography | https://developer.apple.com/design/human-interface-guidelines/typography | 2025-12-16 |
| APL-4 | HIG: Color | https://developer.apple.com/design/human-interface-guidelines/color | 2025-12-16 |
| APL-5 | HIG: Dark Mode | https://developer.apple.com/design/human-interface-guidelines/dark-mode | 2024-08-06 |
| APL-6 | HIG: Motion | https://developer.apple.com/design/human-interface-guidelines/motion | 2025-09-09 |
| APL-7 | HIG: Materials | https://developer.apple.com/design/human-interface-guidelines/materials | 2025-09-09 |
| APL-8 | HIG: Branding | https://developer.apple.com/design/human-interface-guidelines/branding | 2026-09-09 |
| APL-9 | HIG: Tab bars | https://developer.apple.com/design/human-interface-guidelines/tab-bars | 2026-06-08 |
| APL-10 | HIG: Sidebars | https://developer.apple.com/design/human-interface-guidelines/sidebars | 2026-06-08 |
| APL-11 | HIG: Toolbars | https://developer.apple.com/design/human-interface-guidelines/toolbars | 2025-12-16 |
| APL-12 | HIG: Sheets | https://developer.apple.com/design/human-interface-guidelines/sheets | 2026-03-24 |
| APL-13 | HIG: Alerts | https://developer.apple.com/design/human-interface-guidelines/alerts | 2024-02-02 |
| APL-14 | HIG: Lists and tables | https://developer.apple.com/design/human-interface-guidelines/lists-and-tables | 2023-06-21 |
| APL-15 | HIG: Focus and selection | https://developer.apple.com/design/human-interface-guidelines/focus-and-selection | 2023-10-24 |
| APL-16 | HIG: Keyboards | https://developer.apple.com/design/human-interface-guidelines/keyboards | 2025-06-09 |
| APL-17 | HIG: Pointing devices | https://developer.apple.com/design/human-interface-guidelines/pointing-devices | 2023-06-21 |
| APL-18 | HIG: Playing haptics | https://developer.apple.com/design/human-interface-guidelines/playing-haptics | 2024-05-07 |
| APL-19 | HIG: VoiceOver | https://developer.apple.com/design/human-interface-guidelines/voiceover | 2025-03-07 |
| APL-20 | HIG: Designing for iPhone Duo | https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo | 2026-09-09, new page |
| APL-21 | SwiftUI `glassProminent` | https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/glassprominent | iOS 26.0+, macOS 26.0+ |
| APL-22 | SwiftUI `borderedProminent` | https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/borderedprominent | iOS 15.0+, macOS 12.0+ |
| APL-23 | SwiftUI `AccessibilityTraits` `isButton`, `isSelected` | https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton | iOS 13.0+, macOS 10.15+ |
| APL-24 | SwiftUI `accessibilityReduceMotion` | https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion | iOS 13.0+, macOS 10.15+ |
| APL-25 | SwiftUI `colorSchemeContrast` | https://developer.apple.com/documentation/swiftui/environmentvalues/colorschemecontrast | iOS 13.0+, macOS 10.15+ |
| APL-26 | SwiftUI `Table` | https://developer.apple.com/documentation/swiftui/table | iOS 16.0+, macOS 12.0+ |
| APL-27 | SwiftUI `KeyboardShortcut.defaultAction` | https://developer.apple.com/documentation/swiftui/keyboardshortcut/defaultaction | iOS 14.0+, macOS 11.0+ |
| APL-28 | SwiftUI `accessibilityAction(named:_:)` | https://developer.apple.com/documentation/swiftui/view/accessibilityaction(named:_:) | iOS 16.0+, macOS 13.0+ |
| APL-29 | UIKit `UIAccessibilityTraits.button` | https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button | iOS, no version listed |
| APL-30 | AppKit `NSAccessibility.Role` `row`, `table` | https://developer.apple.com/documentation/appkit/nsaccessibility-swift.struct/role/row | macOS |
| APL-31 | iOS and iPadOS release notes | https://developer.apple.com/documentation/ios-ipados-release-notes | newest 27.2 |
| APL-32 | macOS release notes | https://developer.apple.com/documentation/macos-release-notes | newest 27.2 Golden Gate |
| APL-33 | AppKit `NSButton.BezelStyle.push` | https://developer.apple.com/documentation/appkit/nsbutton/bezelstyle-swift.enum/push | macOS |

### 1.2 Google: Android and Material 3

State on 27 October 2026:

- Android 17, API level 37, released 16 June 2026. Apps targeting API 37 can no longer opt out of
  orientation and resizability changes on large screens [AND-8]. The Android 17 page, last updated
  1 July 2026, lists quarterly releases 37.1 and 37.2 as betas. Their status on 27 October 2026 is
  not confirmed [AND-8].
- Material 3, with the M3 Expressive update of May 2025 [MAT-1] [MAT-11]. Google I/O on 19 May 2026
  added the Expressive layout system: a layout scaffold, updated breakpoints and a spacing system
  on an 8 dp scale. It also added expressive lists and menus [MAT-2].
- Material on Android is Compose-first. Material Views 1.14.0 is the final stable release of the
  Views library, which is now in maintenance mode [MAT-3]. Android's release post says new APIs,
  libraries and guidance are built for Jetpack Compose only [AND-8].
- Compose Material 3: stable 1.4.0, beta 1.5.0-beta02 from 21 October 2026 [AND-9]. 1.5.0 is the
  release that promotes the Expressive APIs to stable [MAT-3].
- Material design-system data version 38.2.9, published 10 August 2026. Site content snapshot
  `2026-10-13_06-10-19`.

How to tell what is current. The Material blog dates every announcement [MAT-1]. Component overview
pages changed by M3 Expressive carry a dated "M3 Expressive update" box [MAT-11] [MAT-12] [MAT-13].
The token data each page loads carries `system.version.versionName` with its publish time. The Compose
Material 3 release notes give stable and beta versions [AND-9]. Every developer.android.com page
has a "Last updated" footer. For platform releases, read the Android Developers Blog and the
per-version page. The versions index lags: it still features Android 16 [AND-11].

m3.material.io renders in the browser, so a plain fetch returns an empty shell. Use a headless
browser, or read the token JSON a page loads from
`https://m3.material.io/_dsm/data/dsdb-m3/<snapshot>/`. The snapshot folder name sits in the site's
main JavaScript bundle. Both worked on 27 October 2026. On that day the button, type and list token
files all reported version 38.2.9.

All rows read 2026-10-27. Undated Material pages take the site snapshot as their marker.

| Key | Page | URL | Marker |
|---|---|---|---|
| MAT-1 | Material Design blog | https://m3.material.io/blog | newest posts 2026-05-19 |
| MAT-2 | What's new at Google I/O 2026 | https://m3.material.io/blog/whats-new-at-io26 | posted 2026-05-19 |
| MAT-3 | Material Android is Compose-first | https://m3.material.io/blog/material-is-compose-first | posted 2026-05-19 |
| MAT-4 | Components index | https://m3.material.io/components | snapshot 2026-10-13_06-10-19 |
| MAT-5 | Buttons: specs and tokens | https://m3.material.io/components/buttons/specs | data 38.2.9 |
| MAT-6 | Buttons: accessibility | https://m3.material.io/components/buttons/accessibility | snapshot |
| MAT-7 | Accessible design: structure | https://m3.material.io/foundations/designing/structure | snapshot |
| MAT-8 | Accessible design: colour contrast | https://m3.material.io/foundations/designing/color-contrast | snapshot |
| MAT-9 | States: applying states | https://m3.material.io/foundations/interaction/states/applying-states | snapshot |
| MAT-10 | Breakpoints | https://m3.material.io/foundations/layout/breakpoints/overview | snapshot |
| MAT-11 | Navigation bar | https://m3.material.io/components/navigation-bar/overview | Expressive update May 2025 |
| MAT-12 | Navigation rail | https://m3.material.io/components/navigation-rail/overview | Expressive update May 2025 |
| MAT-13 | Navigation drawer | https://m3.material.io/components/navigation-drawer/overview | Expressive update May 2025 |
| MAT-14 | Dialogs: overview, specs, guidelines | https://m3.material.io/components/dialogs/overview (also `/specs`, `/guidelines`) | snapshot |
| MAT-15 | Bottom sheets | https://m3.material.io/components/bottom-sheets/overview | snapshot |
| MAT-16 | Typography: type scale and tokens | https://m3.material.io/styles/typography/type-scale-tokens | data 38.2.9 |
| MAT-17 | Motion physics system | https://m3.material.io/styles/motion/overview/how-it-works | snapshot |
| MAT-18 | Colour system: how it works | https://m3.material.io/styles/color/system/how-the-system-works | snapshot |
| MAT-19 | Dynamic colour: choosing a source | https://m3.material.io/styles/color/dynamic/choosing-a-source | snapshot |
| MAT-20 | Lists: specs and tokens | https://m3.material.io/components/lists/specs | data 38.2.9 |
| MAT-21 | Lists: accessibility | https://m3.material.io/components/lists/accessibility | snapshot |
| AND-1 | Make apps more accessible | https://developer.android.com/guide/topics/ui/accessibility/apps | updated 2026-10-23 |
| AND-2 | Semantics in Compose | https://developer.android.com/develop/ui/compose/accessibility/semantics | updated 2026-10-22 |
| AND-3 | Haptics design principles | https://developer.android.com/develop/ui/views/haptics/haptics-principles | updated 2026-10-26 |
| AND-4 | `HapticFeedbackConstants` | https://developer.android.com/reference/android/view/HapticFeedbackConstants | updated 2026-08-03 |
| AND-5 | Android 14 features: font scaling | https://developer.android.com/about/versions/14/features | updated 2026-10-23 |
| AND-6 | `ValueAnimator` | https://developer.android.com/reference/android/animation/ValueAnimator | updated 2026-08-03 |
| AND-7 | `UiModeManager` | https://developer.android.com/reference/android/app/UiModeManager | updated 2026-08-03 |
| AND-8 | Android 17 page and release post | https://developer.android.com/about/versions/17 and https://android-developers.googleblog.com/2026/06/Android-17.html | page 2026-07-01, post 2026-06-16 |
| AND-9 | Compose Material 3 releases | https://developer.android.com/jetpack/androidx/releases/compose-material3 | updated 2026-10-21 |
| AND-10 | Android Accessibility Help: text and display | https://support.google.com/accessibility/android/answer/11183305 | no date shown |
| AND-11 | Android versions index | https://developer.android.com/about/versions | updated 2025-06-10 |

### 1.3 Microsoft: Windows 11, WinUI and Fluent 2

State on 27 October 2026:

- Windows 11 version 26H2, generally available since 29 September 2026. Version 26H1 ships only on
  new devices [WIN-26].
- Windows App SDK, which carries WinUI: stable 2.5.1 from 16 September 2026, experimental 2.5.4 from
  29 September 2026 [WIN-24]. Version 2.4.0 added touchpad and mouse haptics for WinUI 3 apps
  [WIN-25].
- Fluent 2 hands Windows to WinUI. Its Windows page points to the WinUI kit and documentation
  [FLU-6]. Fluent 2 components meet or surpass WCAG 2.1 AA [FLU-4], one version behind the web
  layer's WCAG 2.2.

How to tell what is current. Every Learn page has a "Last updated on" footer and an `ms.date` meta
tag. Read the footer: `ms.date` can lag by years [WIN-5]. Several Windows design URLs now redirect
under `/windows/apps/develop/`, so record the URL after redirects. The release channels page names
the current SDK [WIN-24]. The release information page names the current Windows feature update
[WIN-26]. Fluent 2 pages carry no dates or version numbers, and the sitemap has no `lastmod`
[FLU-1] [FLU-2]. For Fluent 2, the marker is a hash of the page's main text.

All rows read 2026-10-27. Learn markers are the "Last updated on" date, or `ms.date` where no
footer date exists.

| Key | Page | URL | Marker |
|---|---|---|---|
| FLU-1 | Fluent 2: What's new | https://fluent2.microsoft.design/get-started/whatisnew/ | undated |
| FLU-2 | Fluent 2 sitemap | https://fluent2.microsoft.design/sitemap-0.xml | no `lastmod` |
| FLU-3 | Fluent 2: Typography | https://fluent2.microsoft.design/typography/ | undated |
| FLU-4 | Fluent 2: Accessibility | https://fluent2.microsoft.design/accessibility/ | undated |
| FLU-5 | Fluent 2: Motion | https://fluent2.microsoft.design/motion/ | undated |
| FLU-6 | Fluent 2: Windows | https://fluent2.microsoft.design/components/windows/ | undated |
| WIN-1 | Design Windows apps | https://learn.microsoft.com/en-us/windows/apps/design/ | `ms.date` 2026-10-07 |
| WIN-2 | Guidelines for touch targets | https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-targeting | 2026-09-27 |
| WIN-3 | Visual feedback and focus visuals | https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-visualfeedback | 2026-09-27 |
| WIN-4 | Content layout and spacing | https://learn.microsoft.com/en-us/windows/apps/design/style/spacing | 2026-10-14 |
| WIN-5 | Typography | https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography | 2026-04-14, `ms.date` 2021-06-24 |
| WIN-6 | Text scaling | https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling | 2026-03-05 |
| WIN-7 | Color | https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/color | 2026-10-13 |
| WIN-8 | Theming in Windows apps | https://learn.microsoft.com/en-us/windows/apps/develop/ui/theming | 2026-02-19 |
| WIN-9 | Contrast themes | https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes | 2026-08-29 |
| WIN-10 | Motion | https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion | 2026-02-28 |
| WIN-11 | `UISettings.AnimationsEnabled` | https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled | `ms.date` 2017-02-08 |
| WIN-12 | Geometry | https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry | 2026-02-19 |
| WIN-13 | Buttons | https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons | 2026-10-13 |
| WIN-14 | Dialogs | https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs | 2026-07-15 |
| WIN-15 | NavigationView | https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview | 2026-10-02 |
| WIN-16 | Screen sizes and breakpoints | https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design | 2026-07-13 |
| WIN-17 | Keyboard interactions | https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions | 2026-09-27 |
| WIN-18 | Keyboard accessibility | https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility | 2026-10-04 |
| WIN-19 | Basic accessibility information | https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information | 2026-08-29 |
| WIN-20 | UI Automation: Button control type | https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportbuttoncontroltype | 2025-07-14 |
| WIN-21 | UI Automation: DataItem control type | https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdataitemcontroltype | 2025-07-14 |
| WIN-22 | ListView and GridView | https://learn.microsoft.com/en-us/windows/apps/design/controls/listview-and-gridview | 2026-09-19 |
| WIN-23 | Community Toolkit DataGrid | https://learn.microsoft.com/en-us/windows/communitytoolkit/controls/datagrid | 2024-06-07 |
| WIN-24 | Windows App SDK release channels | https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-channels | 2026-09-29 |
| WIN-25 | Windows App SDK 2.x release notes | https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable | 2026-09-29 |
| WIN-26 | Windows 11 release information | https://learn.microsoft.com/en-us/windows/release-health/windows11-release-information | 2026-10-26 |

### 1.4 W3C: the web

State on 27 October 2026:

- WCAG 2.2 is a W3C Recommendation dated 12 December 2024. Its errata page was last modified on
  1 October 2026, and every entry since the current publication is editorial [WEB-1].
- WCAG 3.0 is a Working Draft dated 10 September 2026 [WEB-12]. It is not a target.
- WAI-ARIA 1.2 is the Recommendation, dated 6 June 2023. ARIA 1.3 is a Working Draft dated 4 June
  2026 [WEB-8].
- The ARIA Authoring Practices Guide is APG 1.2, first published as a W3C Note in November 2021. Its
  pattern pages carry no dates [WEB-2].
- Media Queries Level 5 (19 February 2026) and Selectors Level 4 (22 January 2026) are Working
  Drafts [WEB-9] [WEB-10]. The Vibration API is a Candidate Recommendation Draft dated 21 May 2026
  [WEB-11].

How to tell what is current. The status line under each spec title gives the maturity and the date.
"This version" gives the dated URL. WCAG 2.2 links an errata page with its own last-modified date.
APG has a change history page. Its pattern pages are undated, so their marker is a hash of the main
text.

All rows read 2026-10-27.

| Key | Page | URL | Marker |
|---|---|---|---|
| WEB-1 | WCAG 2.2, with errata | https://www.w3.org/TR/WCAG22/ and https://www.w3.org/WAI/WCAG22/errata/ | Recommendation 2024-12-12, errata 2026-10-01 |
| WEB-2 | APG: home, patterns index, change history | https://www.w3.org/WAI/ARIA/apg/, https://www.w3.org/WAI/ARIA/apg/patterns/ and https://www.w3.org/WAI/ARIA/apg/about/change-history/ | APG 1.2, undated |
| WEB-3 | APG: Button pattern | https://www.w3.org/WAI/ARIA/apg/patterns/button/ | undated |
| WEB-4 | APG: Grid pattern | https://www.w3.org/WAI/ARIA/apg/patterns/grid/ | undated |
| WEB-5 | APG: Table pattern | https://www.w3.org/WAI/ARIA/apg/patterns/table/ | undated |
| WEB-6 | APG: Dialog (Modal) pattern | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ | undated |
| WEB-7 | APG: Landmark regions | https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/ | undated |
| WEB-8 | WAI-ARIA 1.2 and 1.3 | https://www.w3.org/TR/wai-aria-1.2/ and https://www.w3.org/TR/wai-aria-1.3/ | Recommendation 2023-06-06, 1.3 Working Draft 2026-06-04 |
| WEB-9 | Media Queries Level 5 | https://www.w3.org/TR/mediaqueries-5/ | Working Draft 2026-02-19 |
| WEB-10 | Selectors Level 4 | https://www.w3.org/TR/selectors-4/ | Working Draft 2026-01-22 |
| WEB-11 | Vibration API | https://www.w3.org/TR/vibration/ | Candidate Recommendation Draft 2026-05-21 |
| WEB-12 | WCAG 3.0 | https://www.w3.org/TR/wcag-3.0/ | Working Draft 2026-09-10 |

---

## 2. The spec format

A platform spec is a stamp plus thirteen fields. One spec per component per platform.

### 2.1 The stamp

```yaml
component: button-primary
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
checked_on: 2026-10-27
status: current               # current | stale since YYYY-MM-DD
sources:
  - key: APL-2
    url: https://developer.apple.com/design/human-interface-guidelines/buttons
    marker: change log 2025-12-16
    read: 2026-10-27
  - key: APL-21
    url: https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/glassprominent
    marker: iOS 26.0+, macOS 26.0+
    read: 2026-10-27
```

The marker is whatever the owner publishes. Section 5.3 lists which one to record per owner.

### 2.2 The fields

| Field | What it holds |
|---|---|
| Native control | The platform control, API or pattern, by name. If none exists, say so and name the closest pattern. |
| Target and spacing | Minimum hit area, the platform default, spacing to neighbours, in native units. |
| Type | System font and text style, the scaling mechanism, and the largest scale the layout must survive. |
| Colour and theme | Light and dark, increased or high contrast, and who owns the accent colour. |
| States | The platform's state list and how each state is drawn. Disabled is a state, not an omission. |
| Motion | The platform's motion, and what changes under the reduced-motion setting. |
| Accessibility API | Per screen reader: role or control type, where the label comes from, value or state, traits, actions. VoiceOver on Apple platforms, TalkBack on Android, Narrator through UI Automation on Windows, the browser's accessibility tree on the web. |
| Navigation placement | Which container holds it, and where on screen. |
| Keyboard, pointer, trackpad | Activation keys, focus behaviour, hover and pointer effects. |
| Haptics | The system haptic it plays, or none. |
| Brand may change | What the brand controls, inside the platform's limits. |
| Platform owns | What the brand never touches. |
| Not confirmed | Every field the sources did not settle. Never left out. |

Every value cites a key. When two primary pages disagree, record both and name the conflict. Apple's
Buttons page asks for title-style capitalisation on button labels [APL-2], and its Alerts page asks
for sentence-style capitalisation on alert buttons [APL-13]. Both go in the spec, with the context
each one applies to.

---

## 3. Where the platforms disagree

These are the decisions that change most between platforms. Each cell is cited. Check any default
shared across platforms against every row before adopting it.

| Decision | Web | iOS and iPadOS | macOS | Android | Windows |
|---|---|---|---|---|---|
| Minimum target | 24 × 24 CSS px at AA (2.5.8). 44 × 44 at AAA (2.5.5) [WEB-1] | Default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. Button hit region at least 44 × 44 pt [APL-2] | Default 28 × 28 pt, minimum 20 × 20 pt [APL-1] | Touch 48 × 48 dp, pointer 44 × 44 dp [MAT-7]. Android docs agree on 48 × 48 dp [AND-1] | 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2] |
| Spacing between targets | A target under 24 px passes if a 24 CSS px diameter circle centred on it meets no other target or circle (2.5.8) [WEB-1] | About 12 pt around a bezelled control, about 24 pt around an unbezelled one [APL-1] | Same as iOS [APL-1] | 8 dp or more [MAT-7] | 8 epx between buttons, 12 epx between a control and its label [WIN-4] |
| Top-level navigation | No platform container. Repeated navigation keeps its order (3.2.3) and can be bypassed (2.4.1) [WEB-1]. Label each `nav` landmark when there are several [WEB-7] | Tab bar: floats at the bottom on iPhone, sits near the top on iPad and can convert to a sidebar [APL-9]. On iPhone Duo, bars move to the side [APL-20] | Sidebar on the leading side [APL-10]. Toolbar in the window frame, with every toolbar command also in the menu bar [APL-11] | Navigation bar, 3 to 5 destinations, at compact and medium widths. Navigation rail, 3 to 7, from medium up. The expanded rail replaces the drawer [MAT-11] [MAT-12] [MAT-13] | NavigationView. Auto mode: minimal when narrow, icon-only pane from 641 px, full left pane from 1008 px. Top pane for 5 or fewer categories [WIN-15] |
| System font and body text | No platform font. WCAG limits resizing and spacing, not size [WEB-1] | SF Pro. Body 17 pt on 22 pt at the default size [APL-3] | SF Pro. Body 13 pt on 16 pt [APL-3] | Roboto by default [MAT-16]. Body large 16 on 24, label large 14 on 20 [MAT-16] | Segoe UI Variable. Body 14 on 20 epx [WIN-5] [FLU-3] |
| Type ramp | No platform ramp. The brand ramp must pass 1.4.4 and 1.4.12 [WEB-1] | 11 text styles, from Large Title 34 pt to Caption 2 at 11 pt, at the default size [APL-3] | 11 text styles, from Large Title 26 pt down to 10 pt for Footnote and both Captions [APL-3] | 15 baseline and 15 emphasised styles, from Display large 57 to Label small 11 [MAT-16] | From Caption 12 on 16 to Display 68 on 92 epx. No Bold or Italic styles [WIN-5] [FLU-3] |
| Text scaling | Text resizes to 200% with nothing lost (1.4.4) and reflows at 320 CSS px (1.4.10) [WEB-1] | Dynamic Type up to AX5, where Body is 53 pt [APL-3]. Aim for at least 200% [APL-1] | No Dynamic Type [APL-3] | Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5] | Text size from 100% to 225%. WinUI controls support it by default [WIN-6] |
| Modal dialog | Role `dialog` with `aria-modal="true"`. Tab wraps inside, Escape closes, focus returns to the opener [WEB-6] | Alert: title, optional message, up to three buttons [APL-13] | Alert with the app icon. Optional suppression checkbox and Help button [APL-13] | Basic dialog, 280 to 560 dp wide, 28 dp corners. Full-screen dialog at compact [MAT-14] [MAT-10] | ContentDialog. One open per window [WIN-14] |
| Dialog button order | No order rule. The pattern sets focus placement, not order [WEB-6] | Default button trailing, Cancel leading [APL-13] | Same as iOS [APL-13] | Trailing edge, confirming action nearest the edge. Two actions at most [MAT-14] | "Do it" buttons leftmost, safe action rightmost [WIN-14] |
| Sheets and side surfaces | APG has no sheet pattern [WEB-2]. System rule, not APG's: build sheets to the modal dialog pattern [WEB-6] | Sheet, modal or non-modal. Medium and large detents, a grabber, swipe to dismiss [APL-12] | Sheet, always modal to its window. Use a panel for repeated input [APL-12] | Bottom sheet at compact and medium. 28 dp top corners, 640 dp maximum width [MAT-15]. Side sheets anchor to the side of the screen [MAT-4] | The dialog guidance covers ContentDialog and flyouts, no sheet [WIN-14]. Overlays take 8 px corners [WIN-12] |
| Focus indicator | Always visible (2.4.7) and never fully hidden (2.4.11), both AA. AAA asks for an indicator at least as large as a 2 CSS px perimeter, at 3:1 between focused and unfocused states (2.4.13) [WEB-1] | iPhone has no focus system. iPadOS draws a halo on text fields and custom views, and highlights list rows [APL-15] | System focus ring in `keyboardFocusIndicatorColor` [APL-4]. List rows highlight in the accent colour [APL-15] | Ring 3 dp thick, 2 dp outside the component, in `secondary` [MAT-5] | 2 px outer and 1 px inner border, 1 px from the control. Brushes can be rebranded [WIN-3] |
| Accent colour | The brand's. WCAG governs only contrast: 4.5:1 for text (1.4.3), 3:1 for components (1.4.11) [WEB-1] | App accent fills the prominent button. Use it sparingly [APL-4] [APL-8] | App accent shows only while the user's accent is Multicolor. Any other choice replaces it [APL-4] | Dynamic colour from the user's wallpaper or from content [MAT-19] | User's `SystemAccentColor` by default. The app may override it [WIN-8] |
| Contrast setting | `prefers-contrast` and `forced-colors` media features, in a Working Draft [WEB-9] | Increase Contrast. Custom colours need increased-contrast variants for light and dark [APL-4]. Read it with `colorSchemeContrast` [APL-25] | Same as iOS [APL-4] [APL-25] | Standard, medium (3:1) and high (7:1) contrast through colour roles [MAT-18]. `UiModeManager.getContrast()` for custom drawing [AND-7] | Contrast themes, typically 7:1 or more. Map brushes to `SystemColor` resources [WIN-9] |
| Reduced motion | `prefers-reduced-motion` [WEB-9]. Turning off interaction motion is AAA (2.3.3) [WEB-1] | Reduce Motion: fades replace slides, springs tighten [APL-1]. Read `accessibilityReduceMotion` [APL-24] | Same as iOS [APL-1] [APL-24] | Remove animations setting [AND-10]. `ValueAnimator.areAnimatorsEnabled()` [AND-6] | `UISettings.AnimationsEnabled` [WIN-11]. Fluent asks for a no-motion setting [FLU-5] |
| Haptics | WCAG 2.2 has no haptics criterion [WEB-1]. The Vibration API is a Candidate Recommendation Draft [WEB-11] | System controls play haptics. Feedback generators: notification, impact, selection [APL-18] | On a Force Touch trackpad: alignment, level change, generic. Game controllers can also play haptics [APL-18] | `HapticFeedbackConstants` such as `CONFIRM`, `REJECT`, `TOGGLE_ON` [AND-4]. No haptic beats a buzzy one [AND-3] | Touchpad and mouse haptics for WinUI 3 from Windows App SDK 2.4.0, where hardware supports them [WIN-25]. Design guidance: not confirmed |

Three of these change components, not tokens:

- **Dialog button order is opposite.** Apple and Material put the confirming action on the trailing
  edge. Windows puts it leftmost [APL-13] [MAT-14] [WIN-14]. Never share one order across platforms.
- **Two platforms have no data table.** Material 3 has no data table component [MAT-4], and WinUI 3
  has no first-party data grid [WIN-23]. On those platforms a table is a custom component, so its
  spec carries the full accessibility semantics instead of inheriting them.
- **List focus wraps on Android and stops on the web.** Material lists wrap arrow-key focus at the
  ends [MAT-21]. APG data grids stop at the edges [WEB-4]. Follow each platform.

---

## 4. Worked example

Two components, five platforms each. The stamp line lists the keys behind the spec. Their markers
are in section 1.

### 4.1 Primary button

#### Web

Stamp: WEB-1, WEB-3, WEB-9, WEB-10. Checked against WCAG 2.2 AA.

| Field | Spec |
|---|---|
| Native control | HTML `button` element. Standard HTML controls meet Name, Role, Value (4.1.2) when used to spec [WEB-1]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | Brand type ramp. The label survives 200% text resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Label 4.5:1 against the fill, or 3:1 for large text (1.4.3). Fill 3:1 against adjacent colours (1.4.11) [WEB-1]. Dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, hover, focus, active, disabled. Show keyboard focus with `:focus-visible` [WEB-10]. Set `aria-disabled="true"` when the action is unavailable [WEB-3]. Inactive components are exempt from 1.4.11 [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `button`. Name from the text content, or from `aria-labelledby` or `aria-label`. Description through `aria-describedby`. `aria-pressed` only on toggle buttons [WEB-3]. The name contains the visible label text (2.5.3) [WEB-1]. |
| Navigation placement | Page content. A button acts and a link navigates, and the role must match the function [WEB-3]. |
| Keyboard, pointer, trackpad | Reachable by keyboard (2.1.1) [WEB-1]. Space and Enter activate. A button that opens a dialog moves focus into it, and focus returns to the button when the dialog closes [WEB-3]. Activation runs on the pointer's up-event, the No Down-Event option of 2.5.2 [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Fill, label colour, type, shape, padding and focus ring style, inside the contrast, focus and target floors [WEB-1]. |
| Platform owns | Role, name computation, Space and Enter activation, focus movement [WEB-3]. |
| Not confirmed | System colour keywords for forced colours mode. CSS Color 4 was not read. |

#### iOS and iPadOS

Stamp: APL-1, APL-2, APL-3, APL-4, APL-6, APL-7, APL-8, APL-11, APL-12, APL-13, APL-16, APL-17,
APL-18, APL-19, APL-20, APL-21, APL-22, APL-23, APL-24, APL-29. Checked against iOS 27 and iPadOS 27
[APL-31].

| Field | Spec |
|---|---|
| Native control | SwiftUI `Button` with the `glassProminent` style, iOS 26.0 and later, or `borderedProminent` [APL-21] [APL-22]. UIKit `UIButton` [APL-2]. Give it the primary role, never on a destructive action [APL-2]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. Control default 44 × 44 pt, minimum 28 × 28 pt, about 12 pt of padding around a bezelled button [APL-1]. |
| Type | SF Pro through a text style, so the label follows Dynamic Type. Body is 17 pt at the default size and 53 pt at AX5 [APL-3]. Short labels, verb first, title-style capitalisation [APL-2]. Alert buttons take sentence-style capitalisation instead [APL-13]. |
| Colour and theme | The prominent style puts the app accent on the button's background [APL-2] [APL-4]. One or two prominent buttons per view [APL-2]. Custom colours need light, dark and increased-contrast variants [APL-4]. Keep the label colour clear of colourful content behind it [APL-2]. |
| States | Always draw a press state on a custom button [APL-2]. For a slow action, show an activity indicator inside the button, and optionally change the label, such as "Checkout" to "Checking out…" [APL-2]. Disabled styling: not confirmed. |
| Motion | Liquid Glass reacts more strongly to touch than to a trackpad [APL-6]. Under Reduce Motion, cut automatic animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Trait `isButton` in SwiftUI, `.button` in UIKit [APL-23] [APL-29]. The label is the visible title. An icon-only button needs a descriptive label [APL-19]. |
| Navigation placement | In a toolbar, one `.prominent` action, on the trailing side [APL-11]. In a sheet, Done trailing and Cancel leading [APL-12]. On iPhone Duo's side bars, navigation controls come first at the top, then prominent actions such as Done [APL-20]. |
| Keyboard, pointer, trackpad | Return activates the primary button and can close the sheet or alert it sits in [APL-2]. iPadOS reaches buttons through Full Keyboard Access, so don't build custom keyboard focus for them [APL-16]. System bar buttons get the pointer highlight effect. A custom filled button takes lift, Apple's effect for small opaque elements [APL-17]. |
| Haptics | Standard toggles, sliders and pickers play system haptics. Buttons are not on that list [APL-18]. Use a notification haptic only to report an outcome, and let people turn haptics off [APL-18]. |
| Brand may change | The accent colour on the prominent background, the label wording, and a custom font if it supports Dynamic Type and Bold Text [APL-8] [APL-3]. |
| Platform owns | The Liquid Glass material, sizes, placement in bars, and corner radii concentric with the bar [APL-7] [APL-11] [APL-8]. |
| Not confirmed | Disabled styling. Whether standard buttons play a haptic. |

#### macOS

Stamp: APL-1, APL-2, APL-3, APL-4, APL-5, APL-11, APL-13, APL-15, APL-16, APL-18, APL-19, APL-21,
APL-23, APL-24, APL-27, APL-33. Checked against macOS 27 Golden Gate [APL-32].

| Field | Spec |
|---|---|
| Native control | Push button, `NSButton.BezelStyle.push` [APL-33], set as the default button [APL-2]. In SwiftUI, `.keyboardShortcut(.defaultAction)` binds Return [APL-27]. `glassProminent` also runs on macOS 26.0 and later [APL-21]. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt. About 12 pt around bezelled controls [APL-1]. |
| Type | SF Pro, Body 13 pt on 16 pt. macOS has no Dynamic Type [APL-3]. Match system controls with `controlContentFont(ofSize:)` [APL-3]. End the title with an ellipsis when the button opens another window [APL-2]. |
| Colour and theme | The default button gets special colouration [APL-27]. The app accent applies only while the user's accent setting is Multicolor [APL-4]. Light, dark and increased-contrast variants [APL-4]. With the Graphite accent, windows tint from the desktop picture [APL-5]. |
| States | Press state [APL-2]. A tooltip appears after a short hover [APL-2]. Disabled styling: not confirmed. |
| Motion | Reduce Motion rules as on iOS [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Trait `isButton`, macOS 10.15 and later [APL-23]. Label rules as on iOS [APL-19]. |
| Navigation placement | In alerts and dialogs, default trailing and Cancel leading [APL-13]. In the toolbar, the prominent action sits trailing, and every toolbar command also lives in the menu bar [APL-11]. |
| Keyboard, pointer, trackpad | Return triggers the default button. Esc or Command-Period cancels [APL-13]. Full Keyboard Access reaches every control [APL-15] [APL-16]. Push buttons can support spring loading by force click on a Magic Trackpad [APL-2]. |
| Haptics | None for a button press. Trackpad haptics cover drags and force clicks [APL-18]. |
| Brand may change | Label wording and push button tint [APL-2]. The accent colour, only under Multicolor [APL-4]. |
| Platform owns | Bezel style, control size, default button colouring [APL-2] [APL-27]. The focus ring [APL-15]. |
| Not confirmed | Push button heights per control size. Disabled styling. |

#### Android

Stamp: MAT-3, MAT-4, MAT-5, MAT-6, MAT-7, MAT-9, MAT-16, MAT-17, MAT-18, MAT-19, AND-1, AND-2,
AND-3, AND-4, AND-5, AND-6, AND-10. Checked against Android 17, API 37 [AND-8], design-system data
38.2.9 and Compose Material 3 1.4.0 [AND-9].

| Field | Spec |
|---|---|
| Native control | Material 3 filled button, the default colour style [MAT-5]. Compose `Button`. Sizes XS 32, S 40 (default), M 56, L 96 and XL 136 dp. Round by default, square as an option [MAT-5]. Build in Compose, since Material Views is in maintenance [MAT-3]. |
| Target and spacing | Touch target at least 48 × 48 dp. The XS and S sizes need extra target area to reach it [MAT-5] [MAT-7]. Compose Material buttons enforce the minimum [AND-1]. 8 dp between targets [MAT-7]. 16 dp of padding each side on the S size [MAT-5]. |
| Type | Label large, 14 on 20 [MAT-5] [MAT-16]. Text in sp, scaled nonlinearly to 200% [AND-5]. The label fits in two lines at 200%, or another way to read it exists [MAT-6]. |
| Colour and theme | Container `primary`, label `on primary`. Other roles are allowed if container and text keep 3:1 [MAT-5]. Container 3:1 against the background [MAT-6]. Dynamic colour from wallpaper or content [MAT-19]. Medium and high contrast arrive through the colour roles [MAT-18]. |
| States | Enabled, disabled, hovered, focused, pressed [MAT-5]. State layers: hover 8%, focus 10%, pressed 10%. Disabled: container `on surface` at 10%, label at 38% [MAT-5]. Disabled skips contrast rules and takes no hover, focus or press [MAT-9]. Pressing morphs the corners squarer [MAT-5]. |
| Motion | Spring-based motion physics, expressive or standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` reports false when the animator scale is 0 [AND-6]. |
| Accessibility API | TalkBack. `Role.Button` [AND-1]. The name matches the visible label, such as Done or Send [MAT-6]. Never put "button" in the description [AND-1]. An icon inside a labelled button takes `contentDescription = null` [AND-2]. |
| Navigation placement | Content area. For a screen's main action, Material offers floating action buttons as a separate component [MAT-4]. |
| Keyboard, pointer, trackpad | Tab focuses, Space or Enter activates [MAT-6]. Focus ring 3 dp thick, 2 dp outside the button, in `secondary` [MAT-5]. |
| Haptics | `CONFIRM` and `REJECT` report outcomes, from API 30 [AND-4]. Use the predefined constants, and choose no haptic over a buzzy one [AND-3]. Since API 33, only privileged apps can ignore the user's touch feedback setting [AND-4]. |
| Brand may change | Colour roles, keeping 3:1. Round or square shape, and size [MAT-5]. The brand and plain typefaces, Roboto by default [MAT-16]. |
| Platform owns | State layer opacities, the focus ring, the 48 dp target [MAT-5]. The pressed ripple [MAT-9]. |
| Not confirmed | Whether Material buttons play a haptic by default. Rules for opting out of dynamic colour. |

#### Windows

Stamp: FLU-3, WIN-2, WIN-3, WIN-4, WIN-5, WIN-6, WIN-7, WIN-8, WIN-9, WIN-10, WIN-11, WIN-12,
WIN-13, WIN-14, WIN-16, WIN-17, WIN-19, WIN-20, WIN-25. Checked against Windows 11 26H2 [WIN-26]
and Windows App SDK 2.5.1 [WIN-24].

| Field | Spec |
|---|---|
| Native control | WinUI `Button` [WIN-13]. In a dialog, `DefaultButton` marks the default [WIN-14]. The resource key for an accent-styled button: not confirmed. |
| Target and spacing | 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. Minimum width 120 px for short labels [WIN-13]. 8 epx between buttons [WIN-4]. Sizes and margins in multiples of 4 epx [WIN-16]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Minimum 14 px Semibold or 12 px Regular. Sentence case. No Bold or Italic in the ramp [WIN-5]. WinUI scales text to 225% by default [WIN-6]. Past 26 characters, widen, stack or wrap [WIN-13]. |
| Colour and theme | `SystemAccentColor` follows the user's setting. The app may override it in App.xaml and must check contrast [WIN-8]. Accent used sparingly [WIN-7]. In contrast themes, map to `SystemColorButtonFaceColor` and `SystemColorButtonTextColor`, with `SystemColorHighlightColor` for hover and press [WIN-9]. Corners 4 px through `ControlCornerRadius` [WIN-12]. |
| States | Control template visual states, restyled through theme resources such as `ButtonBackground` and `ButtonBackgroundPointerOver` [WIN-8]. Keep template changes to design intent [WIN-3]. The full state list: not confirmed. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Direct entrance: cubic-bezier(0,0,0,1) at 167, 250 or 333 ms [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Control type Button. Name from the visible text, or `AutomationProperties.Name` on an icon-only button, never including the word "button" [WIN-19]. Invoke pattern, or Toggle for a toggle, never both. Help text says what activation does [WIN-20]. |
| Navigation placement | Page content or a command area. In dialogs, "do it" buttons leftmost and the safe action rightmost [WIN-14]. Order: OK, Do it or Yes, then Don't do it or No, then Cancel. Show one or two buttons at a time [WIN-13]. |
| Keyboard, pointer, trackpad | Enter or Space raises Click on the focused button. `ClickMode` defaults to Release [WIN-13]. Esc cancels transient UI. Give important commands access keys, Alt plus a letter [WIN-17]. Focus visual: 2 px outer and 1 px inner border [WIN-3]. |
| Haptics | WinUI 3 apps can use touchpad and mouse haptics from Windows App SDK 2.4.0, where hardware supports them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Accent colour through a `SystemAccentColor` override [WIN-8]. Corner radius through `ControlCornerRadius` [WIN-12]. Focus visual brushes and thickness [WIN-3]. |
| Platform owns | One font throughout, Segoe UI Variable recommended [WIN-5]. Dialog button order [WIN-14]. Activation keys [WIN-13]. |
| Not confirmed | The accent button style's resource key. The full visual state list. Haptic guidance. |

### 4.2 Data table row

#### Web

Stamp: WEB-1, WEB-4, WEB-5, WEB-9. Checked against WCAG 2.2 AA.

| Field | Spec |
|---|---|
| Native control | `tr` in an HTML `table` for static data. Cells are not focusable, and each control in a row is its own tab stop. Prefer the native `table` to role `table` [WEB-5]. Interactive rows use the grid pattern: role `grid`, one tab stop for the whole grid [WEB-4]. |
| Target and spacing | Every control in the row meets 24 × 24 CSS px (2.5.8) [WEB-1]. Neither pattern sets a row height [WEB-4] [WEB-5]. |
| Type | Brand ramp. Data tables may scroll in two directions under reflow (1.4.10, note 2) [WEB-1]. |
| Colour and theme | Selection is never shown by colour alone (1.4.1). The selected indicator keeps 3:1 against adjacent colours (1.4.11) [WEB-1]. |
| States | A selected row in a grid carries `aria-selected="true"` [WEB-4]. The sorted column's header carries `aria-sort` [WEB-4] [WEB-5]. |
| Motion | Any row animation respects `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Role `row` inside `table`, `grid` or `rowgroup`. Cells are `cell` or `gridcell`, headers `columnheader` or `rowheader` [WEB-4] [WEB-5]. Set `aria-rowcount` and `aria-rowindex` when rows are missing from the DOM. Label the table with `aria-labelledby` or `aria-label` [WEB-5]. |
| Navigation placement | Page content. A table is a static structure, not a widget [WEB-5]. |
| Keyboard, pointer, trackpad | Static table: no key handling [WEB-5]. Grid: arrows move one cell and stop at the edges. Home and End move within the row, Control+Home and Control+End to the first and last cells. Page Up and Page Down move by a page. Shift+Space selects the row and Control+A selects all [WEB-4]. |
| Haptics | None [WEB-1]. |
| Brand may change | Row height, dividers, striping, hover tint and density, none of which the patterns set [WEB-4] [WEB-5]. |
| Platform owns | Roles, states and the key map [WEB-4] [WEB-5]. |
| Not confirmed | Nothing for this row. |

#### iOS and iPadOS

Stamp: APL-1, APL-3, APL-4, APL-10, APL-14, APL-15, APL-17, APL-18, APL-19, APL-23, APL-26, APL-28.
Checked against iOS 27 and iPadOS 27 [APL-31].

| Field | Spec |
|---|---|
| Native control | SwiftUI `Table`, iOS 16.0 and later. In a compact width it hides the headers and every column after the first. In a regular width, such as iPad or iPhone Duo's inner display, it shows them all [APL-26]. Make the first column carry the row on its own [APL-26]. A `List` row for simple data [APL-14]. |
| Target and spacing | A row tap meets 44 × 44 pt [APL-1]. Row height: not confirmed. |
| Type | Body 17 pt at the default size. At large sizes, stack secondary items under the text and drop columns [APL-3]. No tight leading on three or more lines [APL-3]. |
| Colour and theme | System background colours, plain or grouped [APL-4]. On iPadOS, a focused row draws white text on an accent-colour highlight [APL-15]. |
| States | A navigation table keeps the selected row highlighted. An options table flashes the row, then adds a checkmark [APL-14]. Selecting items needs edit mode on iOS and iPadOS [APL-14]. |
| Motion | Reduce Motion rules [APL-1]. |
| Accessibility API | VoiceOver. Group the row so its parts read together [APL-19]. `isSelected` trait for selection [APL-23]. Expose swipe actions as named accessibility actions too [APL-28], and give the gesture an on-screen alternative [APL-1]. |
| Navigation placement | On iPad, the content list of a split view, between sidebar and detail [APL-10]. Drill in with a disclosure indicator. An info button only reveals more information [APL-14]. |
| Keyboard, pointer, trackpad | iPadOS: Tab moves between focus groups, arrows move within the list [APL-15]. Pointer hover on a row uses tint, not scale or shadow [APL-17]. |
| Haptics | None specified for rows [APL-18]. |
| Brand may change | Row content and leading image. The accent colour, used sparingly [APL-4]. |
| Platform owns | The compact-width collapse [APL-26]. Disclosure accessories and edit mode [APL-14]. |
| Not confirmed | Row height. |

#### macOS

Stamp: APL-1, APL-3, APL-4, APL-14, APL-16, APL-18, APL-19, APL-26, APL-30. Checked against macOS 27
Golden Gate [APL-32].

| Field | Spec |
|---|---|
| Native control | SwiftUI `Table`, macOS 12.0 and later [APL-26], or AppKit `NSTableView`. An outline view for hierarchical rows [APL-14]. |
| Target and spacing | Controls in the row: minimum 20 × 20 pt [APL-1]. Row height: not confirmed. |
| Type | Body 13 pt [APL-3]. Header text in `headerTextColor` [APL-4]. Column headings are nouns in title-style capitalisation, with no ending punctuation [APL-14]. |
| Colour and theme | Striping in `alternatingContentBackgroundColors`. Selection in `selectedContentBackgroundColor` in the key window and `unemphasizedSelectedContentBackgroundColor` elsewhere. Grid lines in `gridColor`, selected text in `alternateSelectedControlTextColor` [APL-4]. |
| States | Selected in the key window, selected in another window, sorted, resized [APL-4] [APL-14]. |
| Motion | Reduce Motion rules [APL-1]. |
| Accessibility API | VoiceOver. AppKit table and row roles [APL-30]. Group related elements [APL-19]. |
| Navigation placement | Often inside a split view [APL-14]. |
| Keyboard, pointer, trackpad | Click a heading to sort, click it again to reverse. Columns resize [APL-14]. Control-arrow moves focus between cells, and Control-Tab moves to the next table when Tab moves between cells [APL-16]. |
| Haptics | None for rows [APL-18]. |
| Brand may change | The accent colour, shown only under Multicolor [APL-4]. |
| Platform owns | Selection and striping colours [APL-4]. Sort and resize behaviour [APL-14]. |
| Not confirmed | Row height. |

#### Android

Stamp: MAT-4, MAT-10, MAT-16, MAT-20, MAT-21, AND-2, AND-4, AND-5, AND-10. Checked against Android
17 [AND-8] and design-system data 38.2.9.

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no data table component [MAT-4]. The closest pattern is the expressive list item [MAT-20]. Compose `ListItem` merges its children's semantics [AND-2]. |
| Target and spacing | Anything tappable in a slot meets 48 × 48 dp [MAT-20]. Item heights 56, 72 and 88 dp for one, two and three lines, with 16 dp leading and trailing space [MAT-20]. |
| Type | Label in body large, 16 on 24 [MAT-20] [MAT-16]. Text in sp, nonlinear to 200% [AND-5]. |
| Colour and theme | Show selection with two cues, such as a leading checkmark and a filled colour [MAT-21]. |
| States | Enabled, disabled, hovered, focused, pressed, dragged, selected [MAT-20]. A selected item morphs to 16 dp corners. Unselected segmented items have 4 dp inner and 16 dp outer corners [MAT-20]. |
| Motion | The shape morph on selection [MAT-20]. People can turn on Remove animations [AND-10]. |
| Accessibility API | TalkBack. The label is the label text plus the supporting text. A selectable item in Compose takes role Checkbox for multi-select or Radio button for single-select, on the whole item, with a checked state [MAT-21]. `collectionInfo` and `collectionItemInfo` announce position. Swipe actions are also custom actions [AND-2]. |
| Navigation placement | The list pane. Two panes, list and detail, are recommended at expanded and large widths [MAT-10]. |
| Keyboard, pointer, trackpad | Tab lands on the first or the selected item. Arrow keys move and wrap at the ends. Space or Enter activates [MAT-21]. |
| Haptics | `SEGMENT_TICK` exists for stepping through choices such as list items [AND-4]. Whether lists play it by default: not confirmed. |
| Brand may change | Standard or segmented style, colour roles, and slot content inside the list rules [MAT-20]. |
| Platform owns | The 48 dp target [MAT-20]. Roles, states and the key map [MAT-21]. |
| Not confirmed | A multi-column header and sort pattern. Which colour role draws a selected item. |

#### Windows

Stamp: WIN-2, WIN-4, WIN-9, WIN-11, WIN-12, WIN-16, WIN-17, WIN-18, WIN-21, WIN-22, WIN-23.
Checked against Windows 11 26H2 [WIN-26] and Windows App SDK 2.5.1 [WIN-24].

| Field | Spec |
|---|---|
| Native control | No first-party data grid for WinUI 3. The Community Toolkit DataGrid is not offered for WinUI 3 in Toolkit 8.0 and later, per a page last updated 7 June 2024 [WIN-23]. The closest control is a `ListView` item templated into columns [WIN-22]. |
| Target and spacing | 40 × 40 px touch target [WIN-2]. Layout in multiples of 4 epx [WIN-16]. |
| Type | Body and Caption on multi-line rows, 32 epx icons, Body Strong for section headers [WIN-4]. |
| Colour and theme | List backplates take 4 px corners [WIN-12]. In contrast themes, selected and hovered rows use `SystemColorHighlightColor` with `SystemColorHighlightTextColor` [WIN-9]. |
| States | `SelectionMode` None, Single, Multiple or Extended. `IsItemClickEnabled` raises ItemClick before SelectionChanged [WIN-22]. |
| Motion | Check `UISettings.AnimationsEnabled` before any row animation [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Control type DataItem, named by its primary text. GridItem and TableItem patterns inside a grid with headers, SelectionItem when selectable. A selectable item can be exposed as ListItem instead [WIN-21]. |
| Navigation placement | Page content. F6 moves between panes [WIN-18]. |
| Keyboard, pointer, trackpad | Up and Down move through a single-column list. Enter selects like Space unless the row has an extra action [WIN-17]. ListView has arrow-key navigation built in [WIN-18]. |
| Haptics | Not confirmed. |
| Brand may change | The row template and density, on the 4 epx grid [WIN-16]. |
| Platform owns | Selection modes [WIN-22]. UI Automation patterns [WIN-21]. Contrast theme colours [WIN-9]. |
| Not confirmed | Column headers and sorting without the toolkit grid. Haptics. |

---

## 5. The monthly standards check

Run it once a month, and again whenever an owner ships a major release. It compares every marker in
every stamp with the live source, then reports what moved and what that means for the system.

### 5.1 What to fetch

| Owner | Fetch | Read this marker | Note |
|---|---|---|---|
| Apple | What's new [APL-0] | Entries dated after the last check | Plain HTML fetch works |
| Apple | Every HIG page a stamp cites | Newest date in the change log table | JSON route in section 1.1 |
| Apple | Release notes indexes [APL-31] [APL-32] | Newest OS version | JSON route works |
| Apple | Every API page a stamp cites | Introduced and deprecated versions | `metadata.platforms` in the JSON |
| Google | Material blog [MAT-1] | Posts dated after the last check | Needs a headless browser |
| Google | Material design-system data | `system.version.versionName` and its date | Any token JSON a page loads |
| Google | Material site snapshot | Folder name in the main JavaScript bundle | Changes on every publish |
| Google | Every Material page a stamp cites | Main text hash, and any new "M3 Expressive update" box | Needs a headless browser |
| Google | Compose Material 3 releases [AND-9] | Stable and beta versions, "Latest update" date | |
| Google | Every developer.android.com page a stamp cites | "Last updated" footer | |
| Google | Android Developers Blog and the per-version page [AND-8] | New Android or quarterly release | Not the versions index, which lags [AND-11] |
| Microsoft | Every Learn page a stamp cites | "Last updated on" footer, then `ms.date` | Record the URL after redirects |
| Microsoft | Windows App SDK release channels [WIN-24] | Stable version and date | |
| Microsoft | Windows 11 release information [WIN-26] | Newest feature update | |
| Microsoft | Fluent 2 sitemap [FLU-2] and every Fluent page a stamp cites | New or removed URLs, main text hash | Nothing is dated |
| W3C | WCAG 2.2 [WEB-1] | Status line, dated version URL, errata last-modified date | |
| W3C | WCAG 3.0, ARIA 1.3, Media Queries 5, Selectors 4, Vibration [WEB-12] [WEB-8] [WEB-9] [WEB-10] [WEB-11] | Status line and date | |
| W3C | APG change history and every pattern a stamp cites [WEB-2] | New history entries, main text hash | Pattern pages are undated |

### 5.2 Which changes matter

Sort every difference into one of three levels. When unsure, take the higher one.

**Must change.** A spec is now wrong.

- A number or rule a spec states has changed: a target size, type size, contrast ratio, focus ring
  size or button order.
- A control or pattern a spec names is deprecated or no longer recommended. The model case is
  Material dropping its recommendation of the navigation drawer in May 2025 [MAT-13].
- An API a spec names is renamed, removed or deprecated. Compose Material 3 1.5.0 pre-releases
  renamed and removed APIs between August and October 2026 [AND-9].
- A new device or OS release moves a component. iPhone Duo moved tab bars and toolbars to the side
  [APL-20].
- A W3C draft the system has adopted becomes a Recommendation, or a followed Recommendation gains
  substantive errata.

**Review.** A spec may be incomplete.

- New guidance on a cited page with no number changed, such as Apple's "Updated guidance for Liquid
  Glass" entries [APL-0].
- A new page in an area a spec covers.
- An experimental API becomes stable. Compose Material 3 1.5.0 will do this for the Expressive APIs
  [MAT-3].
- A platform release adds required behaviour. Android 17 removed the large-screen resizability
  opt-out for apps targeting API 37 [AND-8].

**Log only.** No spec is affected.

- Videos, articles, design kits, device bezels, art updates and typo fixes.
- Changes to pages no stamp cites.
- Editorial errata, such as every WCAG 2.2 entry since its current publication [WEB-1].
- A marker that moved with no change to the text.

### 5.3 How each spec records its version

The stamp in section 2.1 is the record. Each source line holds the key, the URL after redirects, the
owner's marker and the read date. The stamp also names the OS or SDK release the spec was checked
against.

- A spec is current while every marker in its stamp matches the live source.
- One mismatch sets `status: stale since <date of the check>`.
- Never generate native code from a stale spec. Clear the review, then regenerate.
- After a review, update the changed fields and the markers together, with the new read date. A
  marker updated without a review hides a change.

| Owner | Marker to record |
|---|---|
| Apple HIG | Newest date in the page's change log |
| Apple API | Introduced and deprecated versions |
| Material tokens | Design-system version, such as 38.2.9 |
| Material pages | Site snapshot plus a hash of the main text |
| Android docs | "Last updated" date |
| Microsoft Learn | "Last updated on" date. Typography shows why: `ms.date` 2021-06-24, last updated 2026-04-14 [WIN-5] |
| Fluent 2 and APG | Hash of the main page text |
| W3C specs | Status line and its date |

### 5.4 How to report

One report per run. It opens with a one-line verdict, then the detail. Values in angle brackets are
placeholders.

```markdown
# Standards check, <date>

Verdict: <n> changes. <n> must change, <n> review, <n> log only. <n> sources not fetched.

## Markers
| Key | Was | Now | Level |
|---|---|---|---|
| APL-8 | change log 2026-09-09 | change log <new date> | Review |

## Changes
### APL-8 HIG: Branding (Review)
- What changed: <the change log line, quoted>
- Specs affected: <component and platform, for every spec whose "Brand may change" names the accent>
- What it means for the system: <tokens that move, components whose behaviour changes, decisions needed>
- Action: <what gets reviewed, and which regeneration waits for it>

## Not fetched
- <key>: <what failed>. Unchecked, not unchanged.
```

Four rules for the report:

1. Quote the owner's own words for what changed.
2. Name every affected spec by component and platform.
3. Say what it means in system terms: which tokens move, which components change behaviour, which
   decisions someone has to make.
4. A source that failed to fetch is "not fetched". It never counts as "no change".

---

## 6. Not confirmed on 27 October 2026

What the primary pages did not settle:

- Windows: the resource key for an accent-styled Button. No current Learn design page names it.
- Windows: the full list of Button visual states.
- Windows: when to play touchpad or mouse haptics. Only the SDK capability is documented [WIN-25].
- Windows: column headers and sorting for WinUI 3 rows without the toolkit DataGrid. The DataGrid
  page was last updated on 7 June 2024 and may be out of date [WIN-23].
- Android: whether quarterly releases 37.1 and 37.2 have shipped. The Android 17 page lists both
  as betas but was last updated on 1 July 2026 [AND-8].
- Android: whether Material buttons or list items play a haptic by default.
- Android: rules for opting out of dynamic colour in favour of a fixed brand scheme.
- Android: which colour role draws a selected list item. The roles are listed, and the mapping sits
  in images [MAT-20].
- Android: a click-label semantic for TalkBack. The Compose Semantics page does not cover one
  [AND-2].
- Material: type weights. The token data holds more than one weight per style, varying by context,
  so no weight is recorded here [MAT-16].
- Apple: disabled button styling, push button heights per control size, and table row heights.
- Apple: whether standard buttons play a haptic.
- Apple: whether iOS 27.2 and macOS 27.2 have shipped or are in beta [APL-31] [APL-32].
- Web: system colour keywords for forced colours mode. CSS Color 4 was not read.

Conflicts between primary pages, recorded rather than resolved:

- Apple's Buttons page asks for title-style capitalisation on button labels [APL-2]. Its Alerts page
  asks for sentence-style capitalisation on alert buttons [APL-13].
- Material lists wrap arrow-key focus at the ends [MAT-21]. APG data grids stop at the edges
  [WEB-4].
- Android's versions index still features Android 16 [AND-11], while Android 17 shipped on 16 June
  2026 [AND-8].
