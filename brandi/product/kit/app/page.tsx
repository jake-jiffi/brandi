import { Button } from "@/components/system"

export default function Page() {
  return (
    <main id="main" tabIndex={-1} className="p-8">
      <h1 className="type-title">Starter</h1>
      <Button variant="primary" icon="Check">Approve</Button>
    </main>
  )
}
