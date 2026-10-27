"use client"

import * as React from "react"

import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Field, useFieldControl } from "./field"
import { IconButton } from "./icon-button"
import { TextInput } from "./text-input"
import { TextLink } from "./text-link"

type Caret = [number | null, number | null, "forward" | "backward" | "none" | null]

interface PasswordInputProps {
  autoComplete: "current-password" | "new-password"
  size: "md" | "lg"
  name: string
  minLength?: number
  onValue?: (value: string) => void
}

/**
 * A password with a toggle named for what it does: Show password, then Hide password. Pressing it keeps focus and
 * the caret where they were, and a screen reader hears which way it went. Paste is never blocked.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput({ autoComplete, size, name, minLength, onValue }, ref) {
  const input = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, input)
  const [shown, setShown] = React.useState(false)
  const [news, setNews] = React.useState("")
  const caret = React.useRef<Caret | null>(null)

  // Changing the type resets the selection in some browsers; put the caret (or the selection) back where it was.
  React.useLayoutEffect(() => {
    const el = input.current
    const at = caret.current
    caret.current = null
    if (!el || !at || at[0] === null || at[1] === null) return
    try {
      el.setSelectionRange(at[0], at[1], at[2] ?? undefined)
    } catch {
      // A type that takes no selection has no caret to keep.
    }
  }, [shown])

  return (
    <div data-slot="password-input" className="relative">
      <TextInput
        ref={merged}
        type={shown ? "text" : "password"}
        name={name}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        minLength={minLength}
        size={size}
        className="pr-11 pointer-coarse:pr-12"
        onChange={(event) => onValue?.(event.target.value)}
      />
      <IconButton
        icon={shown ? "EyeOff" : "Eye"}
        label={shown ? "Hide password" : "Show password"}
        size="sm"
        data-slot="password-toggle"
        // Centred by margins, not a translate: the button nudges itself down with a translate while pressed, which
        // would undo a translate here and move it out from under the pointer mid-press.
        className="absolute inset-y-0 right-1 my-auto"
        // A press keeps focus, and the caret, in the field.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const el = input.current
          if (el) caret.current = [el.selectionStart, el.selectionEnd, el.selectionDirection]
          setShown((s) => !s)
          setNews(shown ? "Your password is hidden." : "Your password is showing.")
        }}
      />
      <span aria-live="polite" className="sr-only">
        {news}
      </span>
    </div>
  )
})

interface CodeInputProps {
  length: number
  name: string
  size: "md" | "lg"
  onValue?: (value: string) => void
  onComplete?: (code: string) => void
}

/**
 * A one-time code drawn as boxes, built as one field: assistive technology reads it as one input, the phone offers
 * the code from a message (one-time-code), and pasting fills every box.
 */
const CodeInput = React.forwardRef<HTMLInputElement, CodeInputProps>(function CodeInput({ length, name, size, onValue, onComplete }, ref) {
  const control = useFieldControl({})
  const input = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, input)
  const [code, setCode] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const at = Math.min(code.length, length - 1)
  // The caret stays at the end: a code is typed or pasted in order, and Backspace takes the last digit. Selecting the
  // whole code is left alone, so typing or Backspace replaces it all.
  const toEnd = () => {
    const el = input.current
    if (!el) return
    const all = el.selectionStart === 0 && el.selectionEnd === el.value.length && el.value.length > 0
    if (!all && (el.selectionStart !== el.value.length || el.selectionEnd !== el.value.length)) el.setSelectionRange(el.value.length, el.value.length)
  }

  return (
    // The boxes share the width they are given, up to their full size, so the code never spills out of a narrow card.
    <div data-slot="code-input" data-size={size} className="relative flex w-full gap-2">
      {Array.from({ length }, (_, i) => {
        const active = focused && i === at
        return (
          <div
            key={i}
            aria-hidden="true"
            data-slot="code-slot"
            data-active={active || undefined}
            data-filled={i < code.length || undefined}
            className={cn(
              "flex items-center justify-center rounded-control border border-line-control bg-surface type-heading-lg tabular-nums text-text-strong",
              "aspect-square min-w-0 flex-1",
              size === "lg" ? "max-w-11 pointer-coarse:max-w-12" : "max-w-9 type-heading pointer-coarse:max-w-11",
              "data-active:border-focus data-active:shadow-[0_0_0_1px_var(--focus)] forced-colors:data-active:outline-2 forced-colors:data-active:outline-solid forced-colors:data-active:outline-offset-1",
              control.invalid && "border-danger data-active:border-danger data-active:shadow-[0_0_0_1px_var(--danger)]"
            )}
          >
            {code[i] ?? (active ? <span data-slot="code-caret" className="h-6 w-px bg-text-strong" /> : null)}
          </div>
        )
      })}
      <input
        ref={merged}
        type="text"
        name={name}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        // No maxLength: it would cut a pasted code with a space or a dash in it short before the digits are picked out.
        value={code}
        spellCheck={false}
        // Over the boxes, so a press on any of them lands here; its own text and caret are drawn by the boxes.
        // Forced colours would paint its hidden text over the boxes, so it keeps its own (transparent) colours.
        className="absolute inset-0 size-full bg-transparent text-transparent caret-transparent forced-color-adjust-none selection:bg-transparent focus-visible:outline-hidden"
        {...control.props}
        required={control.required || undefined}
        onFocus={() => {
          setFocused(true)
          toEnd()
        }}
        onBlur={() => setFocused(false)}
        onSelect={toEnd}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, "").slice(0, length)
          setCode(next)
          onValue?.(next)
          if (next.length === length && code.length !== length) onComplete?.(next)
        }}
      />
    </div>
  )
})

export interface SignInFieldsProps {
  /** password: an email and a password. new-password: an email and a new password, with its rule. code: a one-time code. */
  mode?: "password" | "new-password" | "code"
  /** What is wrong with the email and how to fix it. */
  emailError?: React.ReactNode
  /** What is wrong with the password and how to fix it. */
  passwordError?: React.ReactNode
  /** What is wrong with the code and how to fix it. */
  codeError?: React.ReactNode
  /** The email to start with, such as the one the person signed in with last time. */
  defaultEmail?: string
  /** The rule a new password meets, shown under it. "At least 12 characters." by default. */
  passwordRule?: string
  /** The shortest new password accepted. 12 by default. */
  minLength?: number
  /** Digits in the code. 6 by default. */
  codeLength?: number
  /** Where the code was sent ([name]@example.com), for the code's hint. */
  sentTo?: string
  /** Where to reset a forgotten password. Adds the link under the password. */
  forgotHref?: string
  /** Called once every box of the code is filled. */
  onCodeComplete?: (code: string) => void
  /** Called with the fields' values as the person types. */
  onChange?: (values: { email: string; password: string; code: string }) => void
  /** 36 or 44px fields; sign-in takes the large size by default. */
  size?: "md" | "lg"
  className?: string
  style?: React.CSSProperties
}

/**
 * The fields of a sign-in: an email and a password, a new password, or a one-time code, each with the autocomplete
 * token that lets browsers, password managers and phones fill it, and the show-password toggle. The page brings
 * its own form and button.
 */
export const SignInFields = React.forwardRef<HTMLDivElement, SignInFieldsProps>(function SignInFields(
  { mode = "password", emailError, passwordError, codeError, defaultEmail, passwordRule, minLength = 12, codeLength = 6, sentTo, forgotHref, onCodeComplete, onChange, size = "lg", className, style },
  ref
) {
  const values = React.useRef({ email: defaultEmail ?? "", password: "", code: "" })
  const tell = (key: "email" | "password" | "code", value: string) => {
    values.current = { ...values.current, [key]: value }
    onChange?.(values.current)
  }
  const length = Math.max(4, Math.min(8, Math.round(Number(codeLength) || 6)))

  if (mode === "code") {
    return (
      <div ref={ref} data-slot="sign-in-fields" data-mode="code" className={cn("flex flex-col gap-5", className)} style={style}>
        <Field label="Verification code" hint={`Enter the ${length}-digit code we sent to ${sentTo ?? "you"}.`} error={codeError}>
          <CodeInput length={length} name="code" size={size} onValue={(v) => tell("code", v)} onComplete={onCodeComplete} />
        </Field>
      </div>
    )
  }

  const fresh = mode === "new-password"
  return (
    <div ref={ref} data-slot="sign-in-fields" data-mode={mode} className={cn("flex flex-col gap-5", className)} style={style}>
      <Field label="Email" error={emailError}>
        <TextInput
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="[name]@example.com"
          defaultValue={defaultEmail}
          size={size}
          onChange={(event) => tell("email", event.target.value)}
        />
      </Field>
      <div className="flex flex-col gap-1.5">
        <Field label={fresh ? "New password" : "Password"} hint={fresh ? (passwordRule ?? `At least ${minLength} characters.`) : undefined} error={passwordError}>
          <PasswordInput autoComplete={fresh ? "new-password" : "current-password"} size={size} name="password" minLength={fresh ? minLength : undefined} onValue={(v) => tell("password", v)} />
        </Field>
        {forgotHref && !fresh ? (
          <TextLink href={forgotHref} className="self-start type-body">
            Forgot your password?
          </TextLink>
        ) : null}
      </div>
    </div>
  )
})
