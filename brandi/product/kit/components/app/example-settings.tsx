"use client"

import { useTheme } from "next-themes"
import * as React from "react"

import { Button, Dialog, Field, FormActions, FormSection, RadioGroup, SideNav, Switch, TextInput, ToastRegion } from "@/components/system"
import { useShortcuts } from "@/hooks/use-shortcuts"
import { PERSON, SUMMARY_TIME, WORKSPACES } from "@/lib/sample"

import { setMorningSummary, useExample } from "./example-store"

const SETTINGS_SECTIONS = [
  { label: "Profile", href: "#profile" },
  { label: "Notifications", href: "#notifications" },
  { label: "Keyboard", href: "#keyboard" },
  { label: "Appearance", href: "#appearance" },
  { label: "Danger zone", href: "#danger-zone" },
]

const onHashChange = (listener: () => void) => {
  window.addEventListener("hashchange", listener)
  return () => window.removeEventListener("hashchange", listener)
}

/** The sections, sticky beside them. The section in the address is the current one, the first until there is one. */
export function SettingsNav() {
  const hash = React.useSyncExternalStore(
    onHashChange,
    () => window.location.hash,
    () => ""
  )
  const current = SETTINGS_SECTIONS.some((s) => s.href === hash) ? hash : SETTINGS_SECTIONS[0].href
  return <SideNav label="Settings sections" items={SETTINGS_SECTIONS} value={current} />
}

const never = () => () => {}

/** True in the browser and false on the server, without an effect: for what only the browser knows. */
const useInBrowser = () =>
  React.useSyncExternalStore(
    never,
    () => true,
    () => false
  )

/** The only section with fields to type in, so the only one with a Save. */
export function ProfileSection() {
  const [name, setName] = React.useState(PERSON.name)
  const [email, setEmail] = React.useState(PERSON.email)
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({})
  const [saving, setSaving] = React.useState(false)
  const form = React.useRef<HTMLFormElement | null>(null)

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    const found = {
      name: name.trim() ? undefined : "Enter your name, as your team knows you.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : "Enter an email address, such as owner@example.com.",
    }
    setErrors(found)
    if (found.name || found.email) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      ToastRegion.show("Profile saved.", { tone: "success" })
    }, 600)
  }

  return (
    <FormSection id="profile" title="Profile" description="How you appear to your team, and where the product writes to you." className="scroll-mt-6">
      <form ref={form} noValidate onSubmit={save} className="flex flex-col gap-5">
        <Field label="Name" error={errors.name}>
          <TextInput value={name} autoComplete="name" onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Email" hint="Quotes, summaries and sign-in links go here." error={errors.email}>
          <TextInput type="email" value={email} autoComplete="email" onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <FormActions>
          <Button variant="primary" type="submit" loading={saving}>
            Save profile
          </Button>
        </FormActions>
      </form>
    </FormSection>
  )
}

/** Switches apply at once, with no Save. The morning summary also ticks off its setup task on Home. */
export function NotificationsSection() {
  const { morningSummary } = useExample()
  return (
    <FormSection id="notifications" title="Notifications" description="Sent to you, and nobody else." className="scroll-mt-6">
      <Switch label="Email me when a quote needs my approval" defaultChecked />
      <Switch label={`Email me a summary at ${SUMMARY_TIME} each weekday`} checked={morningSummary} onChange={setMorningSummary} />
    </FormSection>
  )
}

/** Single-key shortcuts, off for speech input and switch users (WCAG 2.1.4). Applies at once, everywhere. */
export function KeyboardSection() {
  const [on, setOn] = useShortcuts()
  return (
    <FormSection
      id="keyboard"
      title="Keyboard"
      description="Single keys such as / jump to search. Turn them off if you use speech input or a switch device. Cmd and Ctrl shortcuts stay on."
      className="scroll-mt-6"
    >
      <Switch label="Single-key shortcuts" checked={on} onChange={setOn} />
    </FormSection>
  )
}

/** Light or dark for the whole product, on this device. A whole theme, never a per-screen decision. */
export function AppearanceSection() {
  const { resolvedTheme, setTheme } = useTheme()
  // The theme is known only in the browser, so nothing is chosen until it is.
  const known = useInBrowser()
  return (
    <FormSection id="appearance" title="Appearance" description="Applies at once, on this device." className="scroll-mt-6">
      <RadioGroup
        legend="Theme"
        name="theme"
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        value={known ? resolvedTheme : undefined}
        onChange={setTheme}
      />
    </FormSection>
  )
}

/** The danger zone comes last, and its one button asks first, because deleting cannot be undone. */
export function DangerZone() {
  const [open, setOpen] = React.useState(false)
  const branch = WORKSPACES[0].name
  return (
    <FormSection id="danger-zone" title="Danger zone" description="What happens here cannot be undone." className="scroll-mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-0.5">
          <p className="type-label text-text-strong">Delete the {branch} branch</p>
          <p className="max-w-measure type-meta text-text-muted">Every job, quote and invoice in the branch goes, for everyone in it.</p>
        </div>
        <Button variant="danger" icon="Trash2" onClick={() => setOpen(true)}>
          Delete branch
        </Button>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        width={400}
        title={`Delete the ${branch} branch?`}
        description={`Every job, quote and invoice in the ${branch} branch goes, for everyone in it. This cannot be undone.`}
        footnote="The example product deletes nothing."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="danger-solid"
              onClick={() => {
                setOpen(false)
                ToastRegion.show(`The ${branch} branch is still here: the example product keeps its sample data.`)
              }}
            >
              Delete branch
            </Button>
          </>
        }
      />
    </FormSection>
  )
}
