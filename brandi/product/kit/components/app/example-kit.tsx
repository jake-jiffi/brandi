"use client"

import * as React from "react"

import {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Checkbox,
  Combobox,
  DataTable,
  DatePicker,
  DateRangePicker,
  Delta,
  Dialog,
  EmptyState,
  Field,
  FileDrop,
  FileList,
  FilterChip,
  FormRow,
  IconButton,
  Kbd,
  Menu,
  MultiSelect,
  NumberInput,
  Pagination,
  PlanPicker,
  Popover,
  Progress,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Select,
  Sheet,
  SignInFields,
  Spinner,
  Stepper,
  Switch,
  Tabs,
  Tag,
  TextArea,
  TextInput,
  TextLink,
  TimePicker,
  ToastRegion,
  Toggletip,
  Tooltip,
  type FileListItem,
} from "@/components/system"
import { addDays } from "@/lib/dates"
import { formatNumber, formatTimeRange } from "@/lib/format"
import { at, CUSTOMERS, SERVICES, TECHNICIANS, TODAY } from "@/lib/sample"

/**
 * One family of controls, straight on the canvas under a hairline. Not a card: half the controls (alerts, plans,
 * file lists, empty states) are boxes of their own, and a box inside a box is a card inside a card.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = React.useId()
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-5 border-t border-line pt-6">
      <h2 id={id} className="type-heading-lg text-text-strong">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** A group of controls under a small heading of its own. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h3 className="type-heading-sm text-text-strong">{title}</h3>
      {children}
    </div>
  )
}

const Row = ({ children }: { children: React.ReactNode }) => <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>

/** Every control in the system, live, in this product's theme: a place to see them all before building a screen. */
export function KitControls() {
  const [chips, setChips] = React.useState<string[]>(["Needs you"])
  const [view, setView] = React.useState("week")
  const [tab, setTab] = React.useState("details")
  const [page, setPage] = React.useState(2)
  const [dialog, setDialog] = React.useState(false)
  const [sheet, setSheet] = React.useState(false)
  const [prices, setPrices] = React.useState([
    { id: "call-out", item: "Call-out", unit: "Each visit", price: 95 },
    { id: "labour", item: "Labour", unit: "Per hour", price: 132 },
    { id: "after-hours", item: "After-hours loading", unit: "Per visit", price: 85 },
  ])
  const [files, setFiles] = React.useState<FileListItem[]>([
    { id: "a", name: "[site-photos].zip", size: 18_400_000, status: "uploading", progress: 64 },
    { id: "b", name: "[quote-J-1042].pdf", size: 220_000, status: "done" },
  ])
  const [signIn, setSignIn] = React.useState<{ email?: string; password?: string }>({})

  return (
    <div className="@container">
      <div className="grid items-start gap-x-12 gap-y-10 @min-[1100px]:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-10">
          <Section title="Actions">
            <Group title="Buttons">
              <Row>
                <Button variant="primary" icon="Check">
                  Approve quote
                </Button>
                <Button icon="Download">Export</Button>
                <Button variant="ghost">Cancel</Button>
                <Button variant="brand">Get started</Button>
                <Button variant="danger" icon="Trash2">
                  Delete draft
                </Button>
                <Button variant="link">View details</Button>
              </Row>
              <Row>
                <Button size="sm">Small</Button>
                <Button>Medium</Button>
                <Button size="lg">Large</Button>
                <Button loading>Saving</Button>
                <Button disabled>Not available</Button>
              </Row>
            </Group>
            <Group title="Icon buttons and groups">
              <Row>
                <IconButton icon="RefreshCw" label="Refresh jobs" />
                <IconButton icon="Copy" label="Copy the job link" variant="secondary" />
                <ButtonGroup label="Quote actions">
                  <Button>Edit quote</Button>
                  <Button variant="primary">Send quote</Button>
                </ButtonGroup>
              </Row>
              <p className="type-body text-text">
                Links go somewhere: <TextLink href="/jobs">see every job</TextLink>.
              </p>
            </Group>
            <Group title="Filters and views">
              <Row>
                {["Needs you", "Overdue", "Done"].map((label, i) => (
                  <FilterChip
                    key={label}
                    selected={chips.includes(label)}
                    onChange={(on) => setChips(on ? [...chips, label] : chips.filter((c) => c !== label))}
                    count={[5, 2, 8][i]}
                    attention={label === "Needs you"}
                  >
                    {label}
                  </FilterChip>
                ))}
              </Row>
              <SegmentedControl label="Schedule view" options={["Day", "Week", "Month"].map((l) => ({ value: l.toLowerCase(), label: l }))} value={view} onChange={setView} />
            </Group>
          </Section>

          <Section title="Choices">
            <FormRow>
              <Field label="Service">
                <Select options={SERVICES} placeholder="Choose a service" />
              </Field>
              <Field label="Customer">
                <Combobox options={CUSTOMERS} placeholder="Start typing a name" />
              </Field>
            </FormRow>
            <Field label="Technicians">
              <MultiSelect options={TECHNICIANS} defaultValue={[TECHNICIANS[0]]} placeholder="Add a technician" />
            </Field>
            <Checkbox label="Email the customer a copy" description="It goes to the address on their account." defaultChecked />
            <RadioGroup
              legend="Visit window"
              name="window"
              defaultValue="morning"
              options={[
                { value: "morning", label: "Morning", description: formatTimeRange(at(7), at(12)) },
                { value: "afternoon", label: "Afternoon", description: formatTimeRange(at(12), at(17)) },
              ]}
            />
            <Switch label="Text the customer when the technician is on the way" defaultChecked />
          </Section>

          <Section title="Status">
            <Group title="Badges and tags">
              <Row>
                <Badge tone="highlight">Needs you</Badge>
                <Badge tone="info">Scheduled</Badge>
                <Badge tone="success">Paid</Badge>
                <Badge tone="warning">Due soon</Badge>
                <Badge tone="danger">Overdue</Badge>
                <Badge tone="ai" icon>
                  Drafted
                </Badge>
                <Badge>Archived</Badge>
              </Row>
              <Row>
                <Tag color={1}>Commercial</Tag>
                <Tag color={2}>Residential</Tag>
                <Tag color={3}>Warranty</Tag>
              </Row>
            </Group>
            <Group title="People and keys">
              <Row>
                <Avatar name="[Sam Reid]" />
                <AvatarGroup people={TECHNICIANS.map((name) => ({ name }))} max={3} />
                <Kbd>⌘K</Kbd>
                <Kbd>/</Kbd>
              </Row>
            </Group>
            <Group title="Progress and change">
              <Progress label="Quotes approved this week" value={18} max={24} showValue valueLabel={`${formatNumber(18)} of ${formatNumber(24)}`} />
              <Row>
                <Spinner label="Syncing" />
                <Delta value={6.2} suffix="vs last month" />
                <Delta value={-1.5} format="points" goodWhen="down" suffix="vs last month" />
              </Row>
            </Group>
            <Group title="Labels and definitions">
              <Row>
                <Tooltip content="Sent to the customer and not yet answered">
                  <Badge>Waiting on customer</Badge>
                </Tooltip>
                <Toggletip label="About the call-back rate" content="Jobs that needed a second visit within 30 days, as a share of all finished jobs." />
              </Row>
            </Group>
          </Section>

          <Section title="Overlays">
            <Row>
              <Button onClick={() => setDialog(true)}>Open a dialog</Button>
              <Button onClick={() => setSheet(true)}>Open a sheet</Button>
              <Menu
                label="More actions for J-1042"
                items={[
                  { label: "Duplicate", icon: "Copy" },
                  { label: "Print", icon: "Printer", shortcut: "P" },
                  "separator",
                  { label: "Delete draft", icon: "Trash2", danger: true },
                ]}
              />
              <Popover label="Filter by technician" icon="ListFilter" title="Technician">
                {(close) => (
                  <div className="flex flex-col gap-3">
                    <Select options={TECHNICIANS} placeholder="Choose a technician" aria-label="Technician" />
                    <Button size="sm" variant="primary" onClick={close}>
                      Apply
                    </Button>
                  </div>
                )}
              </Popover>
            </Row>
            <Dialog
              open={dialog}
              onClose={() => setDialog(false)}
              width={400}
              title="Send the quote to [Northside Dental]?"
              description="They get an email with the quote and a link to accept it."
              footer={
                <>
                  <Button onClick={() => setDialog(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => setDialog(false)}>
                    Send quote
                  </Button>
                </>
              }
            />
            <Sheet
              open={sheet}
              onClose={() => setSheet(false)}
              title="J-1042 Annual service"
              description="[Northside Dental], booked for 30 October 2026"
              footer={
                <>
                  <Button onClick={() => setSheet(false)}>Close</Button>
                  <Button variant="primary" onClick={() => setSheet(false)}>
                    Open job
                  </Button>
                </>
              }
            >
              <p className="type-body text-text">A sheet shows a record beside the list, so the list stays where it was.</p>
            </Sheet>
          </Section>

          <Section title="Plans">
            <PlanPicker
              legend="Choose a plan"
              hint="You can change plans at any time."
              defaultValue="team"
              plans={[
                { value: "solo", name: "Solo", price: 0, period: "per month", description: "One person, up to 20 jobs a month." },
                { value: "team", name: "Team", price: 49, period: "per person per month", description: "Scheduling, quotes and invoices.", badge: "Most popular" },
                { value: "business", name: "Business", price: null, description: "Several branches and their own reporting." },
              ]}
            />
          </Section>

          <Section title="Sign in">
            {/* The fields bring no form of their own: the page wraps them with its button. The example signs nobody in.
                Its fields are required, so the form is noValidate and says what is missing itself: without it, the
                browser's bubble stopped the submit before these errors could show. */}
            <form
              noValidate
              className="flex max-w-measure flex-col gap-5"
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                const data = new FormData(form)
                const found = {
                  email: String(data.get("email") ?? "").trim() ? undefined : "Enter an email address, such as owner@example.com.",
                  password: String(data.get("password") ?? "") ? undefined : "Enter your password.",
                }
                setSignIn(found)
                if (found.email || found.password) requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
              }}
            >
              <SignInFields defaultEmail="owner@example.com" forgotHref="/help" emailError={signIn.email} passwordError={signIn.password} />
              <Button variant="primary" type="submit" block>
                Sign in
              </Button>
            </form>
          </Section>
        </div>
        <div className="flex min-w-0 flex-col gap-10">
          <Section title="Text and numbers">
            <FormRow>
              <Field label="Customer reference" hint="As it appears on their purchase order.">
                <TextInput placeholder="PO-4471" />
              </Field>
              <Field label="Call-out fee">
                <TextInput prefix="$" inputMode="decimal" defaultValue="95" />
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Labour hours">
                <NumberInput defaultValue={3.5} min={0} step={0.25} suffix="h" />
              </Field>
              <Field label="Find a job">
                <SearchField placeholder="Search jobs" />
              </Field>
            </FormRow>
            <Field label="Notes for the technician" optional>
              <TextArea rows={3} placeholder="Gate code 4417. Park in the rear lane." />
            </Field>
          </Section>

          <Section title="Dates, times and files">
            <FormRow>
              <Field label="Visit date">
                <DatePicker defaultValue={addDays(TODAY, 2)} min={TODAY} />
              </Field>
              <Field label="Start time">
                <TimePicker defaultValue="09:30" min="06:00" max="18:00" />
              </Field>
            </FormRow>
            {/* Named by its own label, not a Field: inside a Field its last-day input is labelled only by hidden text,
                which axe's label-title-only rule flags (reported to the component's owner). */}
            <Group title="Report period">
              <DateRangePicker
                aria-label="Report period"
                defaultValue={{ from: "2026-10-01", to: "2026-10-31" }}
                compare="previous"
                presets={[
                  { label: "This month", from: "2026-10-01", to: "2026-10-31" },
                  { label: "Last month", from: "2026-09-01", to: "2026-09-30" },
                ]}
              />
            </Group>
            <FileDrop title="Drop the site photos here" description="JPG or PNG, up to 20 MB each" accept=".jpg,.png" multiple onFiles={(added) => setFiles((was) => [...was, ...added.map((f) => ({ id: f.name, name: f.name, size: f.size, status: "done" as const }))])} />
            <FileList files={files} label="Site photos" onRemove={(id) => setFiles((was) => was.filter((f) => f.id !== id))} />
          </Section>

          <Section title="Feedback">
            <Alert tone="info" title="Quotes now expire after 30 days">
              Customers are reminded a week before.
            </Alert>
            <Alert tone="success" title="[Harbour Café] accepted the quote" />
            <Alert tone="warning" title="[Sam Reid] is booked twice on Thursday" actions={[{ label: "Show jobs", href: "/jobs" }]}>
              One visit has to move before the day&apos;s plan goes out.
            </Alert>
            <Row>
              <Button
                icon="Bell"
                onClick={() => ToastRegion.show("Reminder sent to [Harbour Café].", { tone: "success", action: "Undo", onAction: () => ToastRegion.show("Reminder taken back.") })}
              >
                Show a toast
              </Button>
            </Row>
            <EmptyState size="compact" icon="Inbox" title="No notes yet." actions={[{ label: "Add a note", icon: "Plus" }]}>
              Notes help the next technician on site.
            </EmptyState>
          </Section>

          <Section title="Navigation">
            <Tabs label="Example sections" tabs={["Details", "Quote", "Activity"]} value={tab} onChange={setTab} />
            <Breadcrumbs items={[{ label: "Jobs", href: "/jobs" }, { label: "J-1042", href: "/jobs/J-1042" }, { label: "Quote" }]} />
            <Stepper label="Setup progress" steps={["Add your services", "Connect [Accounting system]", "Invite your team"]} current={1} />
            <Pagination page={page} pageSize={10} total={32} onPage={setPage} />
            <Accordion
              headingLevel={3}
              items={[
                { id: "why", title: "Why can I not edit an approved quote?", content: "Once a customer accepts a quote it is their record too. Raise a variation instead." },
                { id: "who", title: "Who sees the notes?", content: "Everyone on the job, and the customer when you share the job sheet." },
              ]}
            />
          </Section>
        </div>
      </div>

      {/* Full width, because a table under 640px of its own width becomes a list, where nothing is edited in place. */}
      <div className="mt-10">
        <Section title="Tables">
          <p className="max-w-measure type-body text-text-muted">Prices edit in place: Enter saves, and Escape puts the value back.</p>
          <DataTable
            caption="Price list"
            columns={[
              { key: "item", label: "Item", type: "strong" },
              { key: "unit", label: "Charged" },
              {
                key: "price",
                label: "Price",
                type: "currency",
                editable: true,
                validate: (v) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? null : "Enter a price of 0 or more, such as 95."),
              },
            ]}
            rows={prices}
            onCellSave={(row, key, value) => {
              setPrices((was) => was.map((p) => (p.id === row.id ? { ...p, [key]: Number(value) } : p)))
            }}
          />
        </Section>
      </div>
    </div>
  )
}
