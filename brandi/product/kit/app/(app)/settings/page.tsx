import type { Metadata } from "next"

import { AppearanceSection, DangerZone, KeyboardSection, NotificationsSection, ProfileSection, SettingsNav } from "@/components/app/example-settings"
import { PageHeader } from "@/components/system"

export const metadata: Metadata = { title: "Settings" }

/** A sticky side navigation beside one column of sections. Each saves on its own; switches apply at once. */
export default function SettingsPage() {
  return (
    <div className="@container flex flex-col gap-8">
      <PageHeader title="Settings" description="Your profile, what the product sends you, and how it behaves for you." />
      <div className="grid items-start gap-10 @min-[960px]:grid-cols-[--spacing(48)_minmax(0,1fr)]">
        {/* Under 960px the sections are one column a thumb scrolls, so the side navigation steps aside. */}
        <div className="sticky top-6 @max-[959px]:hidden">
          <SettingsNav />
        </div>
        <div className="flex max-w-content min-w-0 flex-col gap-10">
          <ProfileSection />
          <NotificationsSection />
          <KeyboardSection />
          <AppearanceSection />
          <DangerZone />
        </div>
      </div>
    </div>
  )
}
