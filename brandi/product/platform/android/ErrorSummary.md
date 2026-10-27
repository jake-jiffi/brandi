# ErrorSummary on Android

On Android, ErrorSummary is a titled list at the top of a form after a failed save, each line taking the person to its field.

```yaml
component: ErrorSummary
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-7
    url: https://m3.material.io/foundations/designing/structure
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-14
    url: https://m3.material.io/components/dialogs/overview
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: AND-1
    url: https://developer.android.com/guide/topics/ui/accessibility/apps
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-2
    url: https://developer.android.com/develop/ui/compose/accessibility/semantics
    marker: updated 2026-10-22
    read: 2026-10-27
  - key: AND-4
    url: https://developer.android.com/reference/android/view/HapticFeedbackConstants
    marker: updated 2026-08-03
    read: 2026-10-27
  - key: AND-5
    url: https://developer.android.com/about/versions/14/features
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-9
    url: https://developer.android.com/jetpack/androidx/releases/compose-material3
    marker: updated 2026-10-21
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no error summary component [MAT-4]. Material's dialog guidance shows every error at once so people can fix everything before trying again [MAT-14]. The closest pattern is a heading and a list of clickable lines at the top of the form. |
| Target and spacing | Each line keeps at least 48 × 48 dp on touch [MAT-7]. A custom element sets its own minimum. `Modifier.minimumInteractiveComponentSize` reserves at least 48 dp when an element would measure smaller [AND-1] [AND-9]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The title takes the product's heading style. |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. The danger tone carries an icon and words as well as colour, by the product's rule. |
| States | Present after a failed save and gone on the next successful one, by the product's rule. Each line takes focused, hovered and pressed states [MAT-9]. |
| Motion | None. It appears in place. Remove animations changes nothing [AND-10]. |
| Accessibility API | The title takes `heading()` [AND-2]. The product moves focus to the summary so TalkBack reads it first. The Compose API for moving accessibility focus is not confirmed. Each line names its field's problem in the same words as the field's error, which reaches the field through `error()` [AND-2]. The role each line should expose is not confirmed. |
| Navigation placement | At the top of the form, for forms longer than about five fields or when an error is out of view, by the product's rule. Material puts field errors inline beside each field [MAT-14], which the Field component also does. |
| Keyboard, pointer, trackpad | Focus lands on the summary when it appears, so the first problem is one step away. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. The API for moving focus there on Android is not confirmed. |
| Haptics | None from the product. `REJECT`, from API 30, signals a rejected or failed interaction [AND-4]. |
| Brand may change | The title ("Fix these and try again" by default), each message matching its Field error word for word, focus on arrival, and everything the person typed kept. Material's dialog guidance also shows every error at once [MAT-14]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Accessibility API: the Compose API for moving accessibility focus, and the role each line exposes. Keyboard, pointer, trackpad: the API for moving focus on Android. |
