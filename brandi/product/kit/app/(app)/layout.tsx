import { Shell } from "@/components/app/shell"

/** Every page with the rail sits in this group, so the shell stays mounted between them. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>
}
