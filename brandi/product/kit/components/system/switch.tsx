"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { Switch as SwitchTrack } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export interface SwitchProps {
  /** Names the setting, never "On" or "Off". */
  label: React.ReactNode
  checked?: boolean
  defaultChecked?: boolean
  /** Applies at once: there is no Save. */
  onChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  id?: string
  className?: string
  style?: React.CSSProperties
}

/** A setting that applies at once, with no Save. The switch sits before its label, which toggles it too. The ref is the switch. */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { label, checked, defaultChecked, onChange, disabled = false, name, id, className, style },
  ref
) {
  const base = React.useId()
  const switchId = id ?? `${base}-switch`
  return (
    <div data-slot="switch-field" className={cn("flex min-w-0 items-center gap-3 pointer-coarse:min-h-11", className)} style={style}>
      <SwitchTrack
        ref={ref}
        id={switchId}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(next) => onChange?.(next)}
        disabled={disabled}
        name={name}
      />
      {/* The label states why it is off in words, so it keeps its contrast: no fade from the switch beside it. */}
      <Label htmlFor={switchId} className={cn("block peer-disabled:opacity-100", disabled && "cursor-not-allowed text-text-subtle")}>
        {label}
      </Label>
    </div>
  )
})
