# SignInFields on Android

On Android, SignInFields is a password field with show and hide and a one-time code, built on Compose's secure text fields.

```yaml
component: SignInFields
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
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
  - key: MAT-18
    url: https://m3.material.io/styles/color/system/how-the-system-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: AND-1
    url: https://developer.android.com/guide/topics/ui/accessibility/apps
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-2
    url: https://developer.android.com/develop/ui/compose/accessibility/semantics
    marker: updated 2026-10-22
    read: 2026-10-27
  - key: AND-3
    url: https://developer.android.com/develop/ui/views/haptics/haptics-principles
    marker: updated 2026-10-26
    read: 2026-10-27
  - key: AND-5
    url: https://developer.android.com/about/versions/14/features
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-8
    url: https://developer.android.com/about/versions/17
    marker: page 2026-07-01, post 2026-06-16
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
| Native control | Compose `SecureTextField` and `OutlinedSecureTextField`, added in Compose Material 3 1.4.0 for password entry [AND-9]. Android's Credential Manager, a platform API since Android 14, retrieves and stores passwords, passkeys and federated sign-in [AND-5]. |
| Target and spacing | The field and the show and hide toggle keep at least 48 × 48 dp [MAT-7] [AND-1]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | The password hidden or shown, and an error, by the product's rule. Text fields take hovered, focused, pressed and disabled states [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | The show and hide toggle is `Role.Button`, named for what it does, "Show password" [AND-1]. An error reaches TalkBack through `error()` [AND-2]. A code reads as one field, by the product's rule. How a code split across boxes reads as one field in Compose is not confirmed. |
| Navigation placement | On sign-in, under the product lockup, by the product's rule. Material moves a dialog that needs keyboard input to full screen at compact widths [MAT-14]. |
| Keyboard, pointer, trackpad | Since Android 17 the last character typed on a physical keyboard is no longer shown by default, and Compose 1.12 is to bring that to secure text fields [AND-8]. In the 1.5.0 pre-releases the secure fields default to `TextObfuscationMode.System` rather than revealing the last typed character [AND-9]. The Compose API for autofill hints is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Never block paste, and pasting a code fills every box. Each field asks for the right autofill purpose: current password, new password or one-time code. An error says what is wrong and how to fix it. Unproven: no review round has checked it. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Android 17 delays SMS one-time passwords by three hours for apps targeting API 37 and for apps that are not the intended recipient [AND-8]. It points to the SMS Retriever and SMS User Consent APIs instead [AND-8]. |
| Not confirmed | Accessibility API: how a code split across boxes reads as one field in Compose. Keyboard, pointer, trackpad: the Compose API for autofill hints. |
