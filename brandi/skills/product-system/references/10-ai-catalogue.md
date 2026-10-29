# AI pattern catalogue

The patterns a product system uses when it puts an assistant on screen. Twenty-one come from
beautifului.dev. Seven more cover what a production SaaS needs and that catalogue does not show.
Every system gets the core set in section 5. The rest are added when a product needs them.

Three framing decisions, made once here so no project argues them again:

1. **beautifului.dev is the source, and it was read in full.** Its catalogue is 21
   agent-interface components by Turbo, a product design studio, published under the MIT
   licence. The source listing behind every View code button was read in full on 27 October
   2026, with each demo's rendered markup. Anything those do not show is marked "not
   confirmed". Nothing is filled in from memory.
2. **The house rules beat the source.** Section 1 is fixed. Where beautifului shows something
   the rules forbid, the entry says so and gives the adaptation, or the part goes to section 6.
3. **Each entry keeps two things apart.** What the published listing does, and what this system
   does. The listings are demos, and most skip states a product cannot ship without: failed,
   stopped, empty. The system column fills those from the house rules.

Entries keep beautifului's word, "agent", when they describe a listing, and use "assistant" for
this system.

---

## 1. House rules

Fixed. Every pattern here obeys them, and so does anything built from one. They are numbered so
a review can cite them.

**Acting**

1. The assistant drafts. A person sends.
2. Anything that sends, pays, approves, changes another system or deletes goes through an
   approval card (a proposal, 4.1) first.
3. One proposal waits at a time, and its action is the only primary on screen. So while it
   waits, every other primary drops to secondary, the Ask panel's Ask included.
4. A person approves each action, or approves the rule behind it. An approved rule can then act
   on its own, and the interface shows which rule acted (4.7).

**Answering**

5. Every figure has a source chip.
6. A standing caveat sits under every answer: what to check first, then "The assistant can be
   wrong."
7. No model names, prompts, tokens or raw tool calls on screen. So no model picker, no
   confidence meter that invites trust in a number, and no agent desktop that exposes internals.
8. Up to three follow-up questions, as quiet buttons.

**Working**

9. Multi-step work shows as a steps log.
10. Stop keeps what was found, and the steps say where it stopped: "Stopped at step 2 of 3".
11. A failure names the step and the system it was talking to, and offers one Try again.

**Access**

12. After every press, focus moves to the outcome, never to the page body.
13. One polite live-region status line per answer. It speaks only on changes. A repeated message
    is announced again. An answer that loads already finished stays quiet. A label that is not
    plain text is read as words.

### Where focus lands (Rule 12)

| Press | Focus lands on |
|---|---|
| Ask in the panel, a follow-up, or Ask from search | The new answer |
| Stop | The "Stopped at step N of M" line |
| Try again | The step being retried |
| Approve | The outcome line that replaces the proposal |
| Reject | The "Rejected" line that replaces the proposal |
| Continue, in a question card | The next question |
| Keep or Discard, in the selection bar | The passage |
| Closing a sheet, modal or menu | The control that opened it |

An outcome that is not a control gets `tabindex="-1"` so it can take focus.

### What the status line says (Rule 13)

| Moment | The line says |
|---|---|
| Work starts | "Working. Step 1 of 3: finding the invoices" |
| A step changes | "Step 2 of 3: checking the totals" |
| A proposal waits | "Waiting for your approval" |
| Done | "Answer ready" |
| Stopped | "Stopped at step 2 of 3" |
| Failed | "Step 2 of 3, checking the totals, failed. Couldn't reach [system]." |
| The same failure after Try again | The same words, announced again |
| A finished answer loads | Nothing |

To build it:

- One element per answer with `role="status"`. It is in the page before anything changes, and
  empty until something does.
- Write to it only on a change. To repeat a message, clear the line, then write the text again a
  moment later, so the repeat registers as a change.
- A finished answer that loads shows its final status as plain text outside the region. The
  region stays empty.
- Numbers and symbols go in as words: "step 2 of 3", not "2/3". "Up 12 per cent", not an arrow
  and "12%".
- Spinners, shimmer and timers are `aria-hidden` and never sit inside the region.

---

## 2. What the 21 listings share

Stated once here so the entries do not repeat it.

- **Reduced motion.** The site's stylesheet cuts every CSS animation and transition to 0.01 ms
  under `prefers-reduced-motion`. Spinners, shimmer and slides stop. Reveals timed in script
  still run: words keep arriving one at a time, and rows keep appearing in turn.
- **Collapsed is not hidden.** Sections close by animating height and opacity to zero. Nothing
  is marked `inert` or hidden. The content stays in the accessibility tree, and its links and
  buttons stay in the tab order. This affects Thinking's trace, Streaming Text's sources,
  Recommendation Card's drawer, Task Rows' details, Tool Chips' rows and Filter Table's rows. In
  this system a closed section is inert or not rendered.
- **Menus move with Tab.** Approval Card, Records Table, Sidebar Nav, Search and Fine-tune Card
  share one menu part. It slides a single highlight to the hovered or focused row and adds no
  arrow keys, so rows are reached with Tab. The part itself is not listed. Its behaviour was
  read from the site's compiled script.
- **Pressed buttons stand in for other controls.** In nine listings, tabs, filters, options and
  selections are toggle buttons with `aria-pressed`.
- **Live regions are rare.** Loading State and Thinking use `role="status"`, and Records Table
  puts it on one help note. Approval Card uses `aria-live="polite"`. No other listing announces
  anything.
- **Focus rarely moves.** Only Chat, Prompt Bar and Sidebar Nav move focus, and always back to a
  text field.
- **Nothing stops.** No listing can stop the agent's work. Failure shows up twice: a Task Rows
  row that then retries by itself, and Loading State's video fallback.
- **Not every part is listed.** Several listings import shared parts the page does not show: a
  button, chips, a shimmer, a text streamer. How those behave is not confirmed, apart from the
  menu above.

---

## 3. The beautifului catalogue

All 21 sit on one page, <https://www.beautifului.dev/>, each under its own anchor with a live
demo and a View code button. Entries use the site's numbering. Each gives the source, what this
system calls the pattern and whether it is core. Then: what it is for, its anatomy, its states,
keyboard, screen reader, whether it acts on anything, and when to use it.

In a states table, "Not in the listing" means the demo never shows that state. It does not make
the state optional. Keyboard and screen-reader notes describe the listing. What this system does
differently sits in a "This system" bullet or under "In this system".

### 01 · Loading State

Source: <https://www.beautifului.dev/#loading-state>, read 27 October 2026. Variants: Drive,
Dots, Orbit, Surfer. In this system: the **status line**, core.

**For.** Showing that long-running work is under way, and for how long.

**Anatomy.** A three-by-three pixel grid, a shimmering label and an elapsed timer in tabular
figures. The timer counts tenths of a second, then minutes and seconds. Drive and Dots run a
chevron wave across square or round cells. Orbit runs a comet round the edge of the grid. Surfer
adds a looping, muted video under the row, with a "Video unavailable" fallback.

**States.**

| State | Listing | This system |
|---|---|---|
| Working | Grid moves, label shimmers, timer counts | Same, and the label names the step in words |
| Done | Not in the listing: the component only shows work under way | The line states the outcome ("Answer ready"). Grid and timer go |
| Stopped | Not in the listing | "Stopped at step 2 of 3" |
| Failed | Surfer's video fallback only | Names the step and the system. One Try again |
| Reduced motion | Grid holds its dim frame and the timer keeps counting (the listing's own note) | Same |

**Keyboard.**

- Listing: nothing to operate.
- This system: Stop belongs to the running answer. In the Ask panel it takes the place of Ask.
  Anywhere else it sits at the end of the status line.

**Screen reader.**

- Listing: the whole row is `role="status"`. The grid is hidden, but the timer sits inside the
  region and changes ten times a second.
- This system: the status line is the answer's one live region (Rule 13). Grid, shimmer and
  timer are `aria-hidden`. The line speaks when the step or state changes, never when the clock
  ticks.

**Acts on anything?** No.

**Use it when.** The person can see a wait: before an answer's first word, through a slow step,
during a bulk fill.

**Not adopted: Surfer.** WCAG 2.2 SC 2.2.2 asks for a way to pause moving content that starts by
itself, runs past five seconds and sits beside other content
(<https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html>). The video has no pause
control, and the listing does not check reduced motion for it.

### 02 · Thinking

Source: <https://www.beautifului.dev/#thinking-state>, read 27 October 2026. Variants: Steps,
Reasoning, Search, Coding. In this system: the **steps log**, core, built from Steps and from
Task Rows (06).

**For.** An expandable trace of what the agent did while it worked.

**Anatomy.** A header button holding a sparkle, a label and a chevron. The label shimmers while
work runs ("Thinking", "Searching the web", "Running tools"). It settles to a past-tense summary
("Thought for 4 seconds", "Searched the web", "Ran 3 tools"). Under it sits a trace joined by a
thin vertical rule:

- Steps: one row per step, a spinner on the current row, a check on finished ones.
- Reasoning: sentences of the agent's reasoning.
- Search: the query, then each source read as a link that opens a new tab, then "+7 more" as
  plain text.
- Coding: Read, Edit and Run rows with a file name or a command, and added and removed line
  counts on the edit. Each row is a toggle.

**States.**

| State | Listing | This system |
|---|---|---|
| Working | Opens by itself, label shimmers, rows arrive in turn | Open, current step named in words, Stop available |
| Done | Closes by itself, label becomes the summary, still expandable | Same: a one-line summary that opens to the steps |
| Waiting for approval | Not in the listing | The step that would act reads "Waiting for your approval", and the proposal card appears (Rule 2) |
| Stopped | Not in the listing | Finished steps and their results stay. "Stopped at step 2 of 3" (Rule 10) |
| Failed | Not in the listing | The failed row names the step and the system it was talking to, with one Try again (Rule 11) |
| Partial | Not in the listing | What earlier steps found stays visible above a stopped or failed row |

**Keyboard.**

- Listing: the header is a native button with `aria-expanded`. Enter or Space toggles it, and a
  manual toggle overrides the automatic open and close. Search rows are links. Coding rows are
  toggle buttons. A closed trace keeps its links and buttons in the tab order (section 2).
- This system: the same header. A closed trace is inert. Stop and Try again follow the focus
  table in section 1.

**Screen reader.**

- Listing: the label sits in a `role="status"` span inside the header button, so the change from
  working to done is announced. Coding rows expose `aria-pressed`. Rows show their state by icon
  only.
- This system: the steps are an ordered list. Each row's state is a word (done, running,
  waiting, stopped, failed). The answer's status line speaks step changes, and the header adds
  no live region of its own.

**Acts on anything?** The trace does not. A step that would send, pay, approve, change another
system or delete waits on a proposal.

**Use it when.** An answer takes more than one step, or touches more than one system.

**In this system.** Steps is adopted. Search is adapted: "Searched the web", then the sources
read as source chips, without the query string, which is a raw tool input (Rule 7). Reasoning
and Coding are not adopted (section 6).

### 03 · Streaming Text

Source: <https://www.beautifului.dev/#streaming-text>, read 27 October 2026. No variants. In this
system: the **answer**, core.

**For.** A streamed answer with inline sources, actions and follow-ups.

**Anatomy.** Answer text that arrives a word at a time, each word resolving out of a blur, with a
caret while it streams. An inline source chip (site icon and domain) sits in the sentence it
supports and opens the source in a new tab. When the stream ends, three things appear:

- A row of four icon buttons: copy, retry, thumbs up, thumbs down.
- A sources toggle, a stack of site icons and a count ("10 sources"), that opens a list of
  source names and domains.
- A "Follow-ups" label over two suggested questions.

**States.**

| State | Listing | This system |
|---|---|---|
| Streaming | Words arrive with a caret. Actions and follow-ups are transparent | Same. Status line: "Writing the answer". Stop available |
| Done | Actions, sources toggle and follow-ups appear | Also the standing caveat (Rule 6) and a source chip on every figure (Rule 5) |
| Stopped | Not in the listing | Text so far stays, marked "Stopped". Sources found so far stay |
| Failed | Not in the listing | Text so far stays. A failure line names the step and the system, with one Try again |
| Loaded finished | Not in the listing: the demo loops | Rendered whole. The status line stays quiet (Rule 13) |

**Keyboard.**

- Listing: native links and buttons. While the answer streams, the action row and follow-ups are
  transparent and ignore the pointer, but they stay in the tab order. Tab can land on buttons
  nobody can see.
- This system: a control that is not ready is not rendered, or is inert.

**Screen reader.**

- Listing: all four action buttons share one label, "Action". The sources toggle has
  `aria-expanded`. Source images have empty alt, so the domain names the chip. Nothing on the
  answer is live.
- This system: each action has its own name ("Copy answer"). The answer text is not a live
  region, and the status line says when it is ready. A chip's name gives the source and the
  place, and says when it opens a new tab.

**Acts on anything?** No. Follow-ups ask. They never act.

**Use it when.** Any assistant reply.

**In this system.** The answer runs in this order: text with inline source chips, then the
standing caveat ("Check [the specific thing] first. The assistant can be wrong."), then actions
and sources, then up to three follow-ups as quiet buttons in a labelled group (Rule 8). A chip
names a document and a place, not only a site. A figure the assistant worked out names its
inputs ("from 12 invoices").

### 04 · Approval Card

Source: <https://www.beautifului.dev/#approval-card>, read 27 October 2026. No variants. In this
system: the **question card**, on demand. The approval card in Rule 2 is the proposal card
(4.1).

**For.** The site's line is "Human-in-the-loop questions the agent asks before acting." It asks
questions one at a time. It never shows an action to approve.

**Anatomy.** A dismiss button. The question. Options as rows, each with a radio dot or a check. A
"Something else…" field for a free answer. A footer with previous and next arrows, a counter
("1 / 3") whose digits roll like an odometer, a quiet Skip, and an accent Continue that reads
Send on the last question.

**Behaviour.** A single choice moves to the next question by itself after a short pause. On the
last question, a single choice sends the answers by itself. Multiple choice waits for Continue,
which stays disabled until there is an answer.

Skip moves on, but on the last question it closes the card without sending. Dismiss shrinks the
card to an "Open approval" button. Sending shows "Answers sent" and a "Start over" button.

**States.**

| State | Listing | This system |
|---|---|---|
| Asking | One question shown, the rest hidden | Same |
| Answered | Continue enabled | Same |
| Sent | "Answers sent", with Start over | "Answers sent". The assistant's next answer follows |
| Dismissed | Collapsed to "Open approval" | Collapsed to a button that says how many questions wait |
| Failed | Not in the listing | The answers did not reach the assistant. One Try again |

**Keyboard.** Options are buttons in the tab order. Controls on hidden questions get
`tabindex="-1"`. Enter in "Something else…" moves on when there is an answer. The arrows
disable at either end, and there are no arrow keys between options (section 2). When a single
choice moves on by itself, focus stays on an option that is now hidden and unreachable. Nothing
moves it.

**Screen reader.** Options are toggle buttons with `aria-pressed`, not radios or
checkboxes, so "pick one" and "pick any" sound the same. The question is styled text, not a
heading or a legend. The question area is `aria-live="polite"`, and hidden questions are
`aria-hidden`. The counter is split into one span per digit for the roll. The listing skips the
slide when reduced motion is set.

**Acts on anything?** No. Answers go back to the agent. Whatever comes next goes through a
proposal.

**Use it when.** The assistant needs a decision before it can draft: which option, how many, who
for.

**In this system.** One question per fieldset, with the question as its legend. Single choice is
a radio group, multiple choice a checkbox group. The counter reads "Question 1 of 3" (Rule 13).
The card adds no live region of its own.

No auto-advance and no auto-send: choosing selects, and Continue moves on. Moving focus as the result of a choice
is a change of context, which SC 3.2.2 rules out unless the person was told first
(<https://www.w3.org/WAI/WCAG22/Understanding/on-input.html>). After Continue, focus moves to the
next question (Rule 12).

### 05 · Tool Chips

Source: <https://www.beautifului.dev/#tool-chips>, read 27 October 2026. No variants. In this
system: **not adopted** (section 6).

**For.** An agent run as compact rows of tool calls, then chips that sum up the file edits.

**Anatomy.** A collapsible run header ("4 tool calls, 2 messages"). Rows with an icon (think,
write, run, read), a label ("Write 204 lines", "Rebuild and verify") and a chip holding a file
name or a shell command. Each row opens to its detail: reasoning, added code, check results.

After the rows come file chips with added and removed counts. Hovering or focusing one floats a
diff of that file. Last, a "+2 more" button.

**States.** Working: rows arrive one at a time. Done: the file chips appear. Failed and stopped
are not in the listing.

**Keyboard.** The header and rows are buttons with `aria-expanded`. A file chip opens its diff
on focus and closes it on blur. There is no Escape. "+2 more" has no action in the listing.

**Screen reader.** File chips are labelled "Show diff for [file]" and carry `aria-expanded`. The
floating diff renders at the end of the page body, far from its chip in reading order. Diff
lines carry a plus or minus sign as well as colour.

**Acts on anything?** Yes. It reports writes and commands that already ran, with no approval
step.

**Why not.** Raw tool calls on screen (Rule 7), and actions that ran before anyone approved them
(Rule 2). The steps log covers the same need in plain words. Where a product's output is code,
show the result in a code block diff (18), never the call.

### 06 · Task Rows

Source: <https://www.beautifului.dev/#task-rows>, read 27 October 2026. Variants: Capsules,
List. In this system: the row format of the **steps log**, core, with 02.

**For.** Live status for a set of agent tasks: running, failed, completed.

**Anatomy.** One row per task: a status badge, the task name, an amount ("12 suppliers"), a
status pill and a chevron. A row opens to detail lines, each a label and a value ("Matched tax
and contact IDs", "12/12"). Capsules are separate rounded rows. List is one card with dividers.

**States.**

| State | Listing | This system |
|---|---|---|
| Pending | Empty ring around the step number | "Not started", in words |
| Running | Spinning ring around the step number. No pill | "Running", in words, beside the spinner |
| Failed | Red cross, and a "Failed" pill with a spinning retry icon. The row then completes by itself | Names the step and the system. The self-retry becomes one Try again the person presses |
| Completed | Green check, "Completed" pill | Same |
| Stopped | Not in the listing | "Stopped". Later rows read "Not run" |

**Keyboard.** Each row is a button with `aria-expanded`. A running row opens by itself, and a
manual toggle overrides that. Closed details stay in the accessibility tree (section 2).

**Screen reader.** "Completed" and "Failed" are words. Running is a spinner and a digit with no
word. The retry icon is not a control. There is no live region.

**Acts on anything?** The demo's third task drafts emails. Drafting is fine (Rule 1). Sending
them is a proposal.

**Use it when.** Work splits into named tasks with counts, batch work above all.

### 07 · Chat

Source: <https://www.beautifului.dev/#chat-composer>, read 27 October 2026. The site's harness
page puts it in a full screen: <https://www.beautifului.dev/harness>, read the same day. In this
system: the **Ask panel**, core.

**For.** A panel with tabs, a thread and a composer. Replies begin only after the person sends.

**Anatomy.** A header of tab chips and three icon buttons (a plus, a clock, a more icon). A
thread: the person's message on the right, then reply sections, each with a label, a sub-label,
a duration ("for 4s") and the text. A reply still resolving is faded and slightly blurred. A
composer: a one-line field and Send, disabled while the field is empty.

The harness adds an empty state: a greeting by first name, "What can I help you with?", the
prompt bar, three suggested prompts, a nudge to connect apps and a "Shuffle suggestions"
control.

**States.**

| State | Listing | This system |
|---|---|---|
| Empty | Harness only | Greeting, composer, up to three suggestions as quiet buttons. A viewer sees none that create anything (4.6) |
| Replying | Sections arrive in turn | Steps log, then the answer |
| Done | All sections settled | The answer's done state |
| Stopped, failed | Not in the listing | From the steps log and the answer |

**Keyboard.**

- Listing: Enter sends. Tabs are toggle buttons. A click anywhere in the composer focuses the
  field. There is no Stop.
- This system: the composer's button says Ask, the verb AskBar uses (Send is what a person does
  to an email), and becomes Stop while an answer runs. Focus follows the table in section 1. The
  composer comes after the thread in the tab order, so it is the next stop after the new
  answer's own controls.

**Screen reader.**

- Listing: tabs use `aria-pressed`, not tab roles. All three header buttons are labelled
  "Action". The field is labelled "Chat prompt" and the button "Send". Replies are not
  announced.
- This system: tabs, if kept, are a tablist, and header buttons have their own names. Each
  answer has its own status line. The thread itself is not a live region.

**Acts on anything?** No.

**Use it when.** The product has an assistant people talk to.

### 08 · Prompt Bar

Source: <https://www.beautifului.dev/#prompt-bar>, read 27 October 2026. Variants: Rounded,
Pill, and a tall hero size. In this system: the **composer**, core, without its model picker.

**For.** A composer with attachments, @ sources, / commands, a model picker, dictation and send.

**Anatomy.** A plus button that opens the sources menu. A text area that grows to a set height,
then scrolls. Attachment chips, each with a remove button. A model picker. A dictation toggle.
Send, disabled until there is text or an attachment.

The @ menu lists "Add photos & files", data sources, web search and connected apps, one of
which has a Connect control. The / menu lists commands, each with a one-line description. Both
filter as you type, show "No matches for "[query]"" when nothing fits, and end with a hint
line.

Choosing the top model plays a one-off rainbow sweep across the composer, skipped under reduced
motion. Dictation shows "Listening…", then drops the transcript into the draft and returns
focus to the field. The demo plays itself until the first pointer or key press.

**States.**

| State | Listing | This system |
|---|---|---|
| Empty | Placeholder, Send disabled | Same |
| Drafting | Send enabled | Same |
| Menu open, no matches | "No matches for …" | Same, with the result count in words |
| Listening | Dictation pressed, "Listening…" | Same, on demand |
| Working | Not in the listing | Ask becomes Stop |
| Proposal waiting | Not in the listing | Ask drops to secondary (Rule 3) |

**Keyboard.** @ or / opens a menu. Up and Down move the highlight, wrapping at the ends.
Enter or Tab picks. Escape closes. Enter sends, Shift+Enter adds a line, and Enter during IME
composition does not send. A click outside closes the menus.

**Screen reader.** Plus, model, dictation and Send are labelled. Plus and model carry
`aria-expanded`. Dictation carries `aria-pressed` and swaps its label to "Stop dictation". The
menus have no listbox role, and the highlighted row is visual only: no
`aria-activedescendant`, no selected state.

The Connect control is a `role="button"` span with `tabindex="-1"` inside a row that is itself a
button, so no keyboard can reach it.

**Acts on anything?** Connect links an outside account. Commands start work. Anything a command
would send or change goes through a proposal.

**Use it when.** Every Ask surface.

**In this system.** No model picker and no sweep (Rule 7). While a menu is open the field is a
combobox, the menu a listbox, and the highlighted row its `aria-activedescendant`. Connecting an
app is its own control, reachable by keyboard. Dictation, @ sources and / commands are on
demand.

### 09 · Recommendation Card

Source: <https://www.beautifului.dev/#recommendation-card>, read 27 October 2026. No variants. In
this system: folded into the **proposal card** (4.1), without the meter.

**For.** An agent suggestion with a confidence meter and actions.

**Anatomy.** A question as the title ("Want me to place this restock order?"). The suggested
action as a sentence, with an entity chip and a value pill. A footer: a three-bar meter and its
label ("High confidence", "Needs review", "No signal"), an Alternatives button, and a primary
action worded for the option ("Accept", "Configure", "Accept full restock").

Alternatives opens an "Other options" drawer inside the card, and picking one makes it the
suggestion. Accepting turns the primary into "Accepted".

**States.** Suggested, alternatives open, accepted. The listing has no reject, no undo, and no
working or failed state.

**Keyboard.** Native buttons. Alternatives carries `aria-expanded`. The closed drawer's buttons
stay in the tab order (section 2).

**Screen reader.** The bars have no text of their own. The label beside them carries the
meaning. "Accepted" replaces the button text without an announcement.

**Acts on anything?** Yes. Placing an order pays and changes another system, and in the listing
one press does it.

**In this system.** The question title, the action sentence and the Other options drawer move
into the proposal card. The meter goes (Rule 7). In its place: why the assistant suggests this,
with source chips, and the caveat's "check first". Accept becomes Approve, under Rules 2 to 4.

### 10 · Context Cards

Source: <https://www.beautifului.dev/#context-cards>, read 27 October 2026. No variants. In this
system: the **sources list**, on demand.

**For.** Retrieved knowledge chunks, shown with their sources.

**Anatomy.** A header ("All chunks" and a count). One card per chunk: a title, a character
count, the excerpt, and a source chip with a file-type badge and the file name.

**States.** Cards fade in once, chips follow, then nothing changes. Empty, loading and failed are
not in the listing.

**Keyboard.** Nothing is focusable. Source chips are text, not links.

**Screen reader.** No roles or labels beyond the text.

**Acts on anything?** No.

**Use it when.** Answers draw on documents and people need to check the passage, not only the
name.

**In this system.** Each source the answer used, named by document and place (page, row,
record), with the excerpt and a link that opens it. Chunk and character counts go: they are
retrieval internals, the same family as tokens (Rule 7). An answer that used no sources says so
in the list.

### 11 · Diff Table

Source: <https://www.beautifului.dev/#diff-table>, read 27 October 2026. No variants. In this
system: the **change preview**, on demand, shown inside a proposal.

**For.** AI-proposed edits across the rows of a table, kept or dropped row by row before
applying.

**Anatomy.** A title ("Proposed menu cleanup") and a hint ("Click changed rows to toggle"). A
table: removed rows tinted red with the last cell struck through, and an added row tinted green,
each with an included mark. A footer summary ("2 removals · 1 addition") and an accent "Apply 3
changes", disabled at zero. After applying: "3 edits applied".

**States.**

| State | Listing | This system |
|---|---|---|
| Proposed | The diff settles: removals tint, the addition slides in | Same, inside the proposal card |
| Some excluded | Summary and button count follow the selection | Same |
| Applied | "3 edits applied" | The outcome line counts what changed and links to it |
| Partial | Not in the listing | Names each row that failed and the system it was writing to. One Try again for those rows |
| Failed | Not in the listing | Names the step and the system. One Try again |

**Keyboard.** Changed rows become focusable once the diff settles, and Enter or Space toggles a
row. After applying, rows stop responding.

**Screen reader.** The added row is `role="checkbox"` with `aria-checked` and a label ("Include
adding [item]"). Removed rows report their state through `aria-selected` on a table row outside
a grid, where support is not confirmed. The hint says "Click", which assumes a pointer.

**Acts on anything?** Yes. Apply changes the data, in one press.

**In this system.** Every changed row is a labelled checkbox. The hint is device-neutral
("Choose which changes to include"). Apply is the proposal's single primary (Rule 3). After
applying, focus moves to the outcome line (Rule 12).

**Use it when.** The assistant proposes edits to more than one record.

### 12 · Records Table

Source: <https://www.beautifului.dev/#records-table>, read 27 October 2026. No variants. In this
system: a **records table with an AI column**, on demand, without the model and prompt settings.

**For.** A CRM-style grid where columns are properties. A header opens the property's settings,
and a new AI property fills its cells row by row.

**Anatomy.** A sticky first column with row numbers, a checkbox per row, and a select-all that
can show a mixed state. Columns for categories (tags with a "+N" overflow), last interaction,
connection strength (a dot and a word) and links. Sort arrows on two columns. Drag handles to
resize every column.

Below the rows, a footer of summaries: count, "Add calculation", average, link count, "N
filled". A plus header adds a property. A table menu offers Add property, Compact columns, Reset
column widths and Clear selection.

The property popover, in order:

- Type, and Tool (a model menu).
- Grounding, a switch with the help note "Grounding lets the model verify generated values
  against connected sources."
- Inputs ("Use values from") and a prompt field with @ mention chips.
- "Go calculate", Pin, and on the added AI column only, Hide from view.
- More settings: Required value, Allow empty results, Show confidence.

A new property scrolls into view with its settings open. While it calculates, each cell reads
"Calculating…" until its row resolves.

**States.**

| State | Listing | This system |
|---|---|---|
| Filling | "Calculating…" per cell, one row at a time | Same, with Stop |
| Filled | Values, and the footer shows "N filled" | Each value carries a source chip and the AI-drafted mark (4.3) |
| Partly filled | Only while running | Stopped or failed cells say so. Filled cells stay |
| Failed cell | Not in the listing | Names the step and the system. One Try again for the failed cells |
| Empty table | Not in the listing | Says what to add, or which filter to clear |

**Keyboard.** The scroll area is focusable and labelled ("Companies table. Scroll horizontally
and vertically to view all columns and records."). Row checkboxes are native. The sort arrow is
a `role="button"` span nested inside the header button, reached by Tab and pressed with Enter or
Space. Resize handles are pointer only: `role="separator"` and a label, but no tabindex.
Popovers close on any outside press and on scroll. There is no Escape.

**Screen reader.** Checkboxes, tag groups ("Categories: …") and resize handles are labelled.
Settings menus use `role="menu"` with `menuitemradio` and `menuitemcheckbox`. The prompt field is
a contenteditable `role="textbox"` with `aria-multiline`. Sort direction shows only as a
rotating arrow: there is no `aria-sort`. The select-all's mixed state is a drawn dash only: the
checkbox is never set to indeterminate, so a partial selection is announced as not checked.

**Acts on anything?** "Go calculate" writes a value into every row.

**In this system.** The AI column says what it fills and from what ("Website, from Company").
No model menu, prompt field, grounding switch or Show confidence (Rule 7). Filling empty cells
is a draft, marked as one. Overwriting a value a person entered goes through a change preview
inside a proposal (Rule 2). Sorted columns carry `aria-sort`, and resize handles take arrow
keys.

**Use it when.** People enrich many records at once.

### 13 · Filter Table

Source: <https://www.beautifului.dev/#filter-table>, read 27 October 2026. No variants. In this
system: **filter chips**, on demand. Not AI-specific.

**For.** Status chips that filter a task table in place.

**Anatomy.** A row of chips, each a colour dot, a label and a count. A table of task, date,
status pill and owner. Rows that do not match the filter collapse to nothing.

**States.** All, or one status. An empty result is not in the listing.

**Keyboard.** Chips are toggle buttons. The table scrolls inside a focusable region.

**Screen reader.** Chips expose `aria-pressed`. The region is labelled ("Scrollable task
table"), but the rows are styled boxes, not table markup, so column headers are never
announced. Collapsed rows stay in the accessibility tree (section 2).

**Acts on anything?** No.

**In this system.** Real table markup. Filtered rows are removed, not collapsed. The result
count changes in words, and an empty result says which filter to clear.

**Use it when.** A list has a handful of statuses.

### 14 · Sidebar Nav

Source: <https://www.beautifului.dev/#sidebar-nav>, read 27 October 2026. No variants. In this
system: the **sidebar**, on demand.

**For.** Collapsible navigation for a workspace and its chats.

**Anatomy.** A workspace switcher that opens a menu: the current workspace with a check, New
workspace, Workspace settings, Invite team members, Sign out. Collapse and expand buttons. New
chat, Home, and Invite users with a seat count ("3/10"). A Chats heading whose search button
grows into a field. Recent chats, and "No chats found" when the search matches nothing. A
footer button ("Upgrade").

**States.** Expanded, collapsed to icons, searching, no results.

**Keyboard.** Opening chat search moves focus to the field. Escape in the field closes it and
clears the query. Collapse and expand swap which of the two buttons is focusable. The workspace
menu closes on an outside press and has no Escape. Rows are reached with Tab (section 2).

**Screen reader.** The sidebar is an `aside` labelled "Workspace navigation". The switcher and
the search button carry `aria-expanded`. The current item is shown by background only: there is
no `aria-current`. Chat rows carry a title with the full name.

**Acts on anything?** New workspace, invitations and sign-out are the person's own actions.

**In this system.** The current item carries `aria-current="page"`. Escape closes the workspace
menu and returns focus to the switcher. It is role-aware (4.6): a viewer never sees New
workspace or Invite.

**Use it when.** The product has workspaces and saved conversations.

### 15 · Search

Source: <https://www.beautifului.dev/#search>, read 27 October 2026. No variants. In this system:
**search**, with Ask routing (4.4), on demand.

**For.** Command search with live filtering and an empty state.

**Anatomy.** A field with a search icon, a clear button once there is text, and a results list:
five suggestions while the field is empty, matches as you type. Once the query is three or more
characters with no match, an empty state: an icon, "No results found" and "Adjust your search to
try again".

**States.** Suggestions, filtering, no results, picked (the item fills the field). A loading
state is not in the listing.

**Keyboard.** Results are buttons reached with Tab (section 2). No arrow keys, no Escape.

**Screen reader.** The field and the clear button are labelled. The results list has no listbox
role, and the result count is not announced.

**Acts on anything?** No.

**In this system.** A combobox with a listbox, arrow keys, Escape to clear, and the result count
in words. While results load, the list says so in words. Ask routing decides whether the last
row offers Ask.

**Use it when.** People look for records by name or number.

### 16 · Flowchart

Source: <https://www.beautifului.dev/#flowchart>, read 27 October 2026. No variants. In this
system: the **rule view**, on demand.

**For.** An agent workflow on a dotted canvas: a trigger card and an If / Else card, joined by a
connector.

**Anatomy.** Each card has a kind pill (Trigger, If / Else). The trigger card has a title and a
caption ("New order created", "Trigger when a new order is created"). The condition card reads
as a sentence of chips: If [source] [property] is [value], and [source] [property] is [value].

Chips open dropdowns with the current value checked. Cards drag anywhere on the canvas, and the
connector follows. Selecting a card lights its connector.

**States.** Idle, card selected, menu open, dragging. No validation, running or failed state in
the listing.

**Keyboard.** The trigger card is a toggle button. Chips are buttons with `aria-expanded`, and
their menu rows are buttons. Dragging is pointer only. Menus close on an outside press, with no
Escape.

**Screen reader.** Selection is `aria-pressed`. The connector is drawn, not described. Menus have
no menu or listbox role.

**Acts on anything?** It defines what will act later.

**In this system.** A rule reads top to bottom as text first and canvas second: when [trigger],
if [conditions], then [action]. Order and links can be edited without dragging. A rule acts only
after a person approves it (Rule 4), and everything it touches carries the rule line (4.7).

**Use it when.** People approve rules the assistant then runs.

### 17 · Insight Cards

Source: <https://www.beautifului.dev/#insight-cards>, read 27 October 2026. No variants. In this
system: **insight cards**, on demand.

**For.** Agent insights in a paged carousel, each with a small live chart.

**Anatomy.** A header ("Insights" and the number of pages) with previous and next buttons. Each
page holds one sentence of insight, with inline @ mentions and figures in red or green. Then a
chart card, and a follow-up question as a pill. The three demo charts:

- a two-line comparison with a legend and deltas;
- bars against a threshold, with a spend and usage toggle;
- a hero number over a segmented bar with a legend.

Moving the pointer over a chart shows values.

**States.** One page at a time, wrapping at both ends. The listing's header comment mentions
autoplay that yields once a person takes over, but the published code has no autoplay: not
confirmed. Loading, empty and failed are not in the listing.

**Keyboard.** Previous, next, the toggle and the segments are buttons. Chart values need a
pointer. The follow-up pill does nothing in the listing.

**Screen reader.** Previous and next are labelled. The segments sit in a labelled group
("Allocation segments"), each labelled with its share and carrying `aria-pressed`. The header
gives the total but not the current page. Figures show direction by colour and sign.

**Acts on anything?** No.

**In this system.** Every figure has a source chip (Rule 5), and each insight ends with the
standing caveat (Rule 6). The pager reads "Insight 1 of 3" (Rule 13). The follow-up is a quiet
button that asks and never acts (Rule 8). Chart values are reachable without a pointer.

An insight that fails to build names the step and the system it was talking to, with one Try
again (Rule 11).

**Use it when.** The assistant reports on numbers without being asked: weekly summaries,
anomalies.

### 18 · Code Block

Source: <https://www.beautifului.dev/#code-block>, read 27 October 2026. Variants: Code, Diff. In
this system: the **code block**, on demand.

**For.** A line-numbered listing, or a unified diff.

**Anatomy.** A header with a file icon and name. Code: numbered lines, light syntax colour,
wrapping, and a Copy button that reads "Copied" for 1.5 seconds. Diff: one gutter of line
numbers, a green bar or a hatched bar on each changed line, a row tint and word-level
highlights. The header shows added and removed counts instead of Copy.

**States.** Code, diff, copied.

**Keyboard.** Copy is a button.

**Screen reader.** Copy keeps the label "Copy code", so the change to "Copied" is never
announced. Diff lines carry no added or removed marker in text: the bar, tint and hatching do
that work.

**Acts on anything?** No.

**In this system.** Changed lines say "added" or "removed" in text for assistive technology.
Copy's name changes with its state.

**Use it when.** The product's output is code or configuration. Never to show the assistant's
own tool calls (Rule 7).

### 19 · Fine-tune Card

Source: <https://www.beautifului.dev/#fine-tune-card>, read 27 October 2026. No variants. In
this system: the **inspector**, on demand.

**For.** The site's line is "The agent adjusts design properties in an inspector."

**Anatomy.** A header: a title, and a status that shimmers "Adjust" until anything changes, then
shows "Edited" with a check. A layout section: a three-way segmented control (row, column, grid)
and number fields in pairs (W, H, Radius, Opacity). A Type dropdown.

**States.** Untouched ("Adjust") and edited ("Edited"). The listing does not tell the agent's
edits from the person's: not confirmed.

**Keyboard.** Each number field's label is a scrub handle. Drag sideways, or use the arrow keys:
Up or Right adds, Down or Left subtracts, Shift multiplies by ten. The value is also a text
field. The segmented control and the dropdown are buttons, and dropdown rows are reached with
Tab (section 2).

**Screen reader.** Scrub handles are `role="slider"` with value, minimum and maximum, labelled
with the short name ("W", "H"). Text fields are labelled "[name] value". Segments are labelled
("row layout") and carry `aria-pressed`. The dropdown carries `aria-expanded`, and its rows have
no role.

**Acts on anything?** It changes the object being edited.

**In this system.** The assistant's adjustments land as a draft the person keeps or discards
(Rule 1). Each changed field shows that it changed. Short labels get full names for assistive
technology ("Width").

**Use it when.** The product edits visual objects: layouts, templates, design files.

### 20 · Selection Actions

Source: <https://www.beautifului.dev/#selection-actions>, read 27 October 2026. No variants. In
this system: the **selection bar**, on demand.

**For.** Highlight a passage and hand it to the agent to rewrite.

**Anatomy.** A pill bar under the selected text. Idle: a "Describe edits" field, Explain and
Improve, a toggle that reveals Shorten, Tone and Grammar, and a send button once the field has
text. Working: a spinner and a working label ("Improving…"). The rewrite then streams in over
the selected passage. Result: Keep, Discard and Try again.

**States.**

| State | Listing | This system |
|---|---|---|
| Idle | Field and actions | Same |
| Working | Spinner and label, then the rewrite streams in | Same, with the status line and Stop |
| Result | Keep, Discard, Try again | Same. Focus moves to Keep |
| Stopped, failed | Not in the listing | The original stays. A failure names the step and the system, with one Try again |

In the listing, Explain does nothing, and Keep and Discard both return the bar to idle. The demo
works on one preset selection, so how the bar follows a real selection is not confirmed.

**Keyboard.** Enter in the field submits. All controls are native buttons. There is no Escape.
Running an action removes the idle controls, the pressed button with them, and nothing takes
focus.

**Screen reader.** The field ("Describe edits"), the more-actions toggle (with
`aria-expanded`), send ("Send edit instruction") and Try again are labelled. The working label
and the result are not announced.

**Acts on anything?** No. It drafts a rewrite, and the person keeps or discards it: Rule 1 in
one bar.

**In this system.** After an action, focus moves to the working label, then to Keep when the
rewrite lands (Rule 12). Discard restores the original. The status line says when the rewrite is
ready.

**Use it when.** People edit long text: emails, posts, documents.

### 21 · Agent Screen

Source: <https://www.beautifului.dev/#agent-screen>, read 27 October 2026. Variants: Working,
Loading. In this system: **not adopted** (section 6).

**For.** Watching an agent's screen live, teaching it a task, and recording.

**Anatomy.** A resting card: a framed capture of the agent's desktop, an "Open" button that
appears on hover, and "[Agent]'s screen" underneath. Open expands to a full-page viewer: the
agent's name, a recording timer, "Teach a task" (which starts recording) or "End", and
Collapse. Loading shows a spinner and "Connecting to agent's screen".

Recording keeps running after the viewer collapses. The header comment says the card then shows
a REC badge, but the published code shows the timer only inside the open viewer: not confirmed.

**Keyboard.** Escape collapses the viewer, and so does a click on the backdrop. The page behind
stops scrolling while it is open. The listing never moves focus into the viewer or back out.

The card itself opens on click, which a keyboard cannot do. The Open button is transparent until
hover, with no rule to show it on focus, so keyboard focus lands on a button nobody can see. SC
2.4.7 asks for focus to be visible
(<https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html>).

**Screen reader.** The viewer is `role="dialog"` with `aria-modal="true"`, labelled
"[Agent]'s screen". The capture has empty alt.

**Acts on anything?** The listing shows the agent working on its own screen. What it does there
is not shown.

**Why not.** An agent desktop exposes internals (Rule 7). If the agent works in other systems
through that screen, each action there is one nobody approved (Rule 2). The steps log names each
system the work touched and links to what changed. Recommendation: if a product needs "teach a
task", the demonstration should end as a plain-language rule in the rule view (16), approved
under Rule 4.

---

## 4. Beyond beautifului

Seven patterns a production SaaS needs that the catalogue does not show. Each follows from the
house rules, and none has a beautifului source.

### 4.1 · Proposal card

The house approval card. Core.

**For.** The one way the assistant asks to act. Anything that sends, pays, approves, changes
another system or deletes waits here first (Rule 2).

**Anatomy.**

- A heading naming the action as verb, object and destination: "Send the June newsletter to
  2,140 customers".
- What will happen, in a sentence or two, with a source chip on every figure (Rule 5).
- The change preview (11) when it edits records, or the review sheet (4.2) when it goes to a
  group.
- Why the assistant proposes it, with sources. No confidence meter (Rule 7).
- Other options, when there are any (from 09).
- Approve, named for the action ("Approve and send"). The only primary on screen (Rule 3).
  For a send to a group, the primary is "Review the send" instead, and Approve sits in the
  review sheet.
- Approve as a rule, secondary. It shows the rule in plain words before saving it (Rule 4).
- Edit, which opens the draft. Reject, quiet.

**States.**

| State | What shows |
|---|---|
| Waiting | The card. The status line says "Waiting for your approval" once. Every other primary on screen is secondary |
| Queued | The next proposal appears only after this one is approved or rejected |
| Working | After Approve, the steps log shows progress |
| Done | An outcome line replaces the card: what happened, where, and a link ("Sent to 2,140 customers. View the send.") |
| Partial | "Sent to 2,138 of 2,140. 2 failed at [system]." One Try again for the 2 |
| Failed | Names the step and the system. One Try again |
| Rejected | "Rejected. Nothing was sent." |
| Done by a rule | No card. The item carries the rule line (4.7) |

A plan with two actions raises two proposals, one after the other, and the steps log shows
which step waits.

**Keyboard.** When the card is the outcome of a press, focus moves to its heading (Rule 12).
After Approve or Reject, focus moves to the line that replaces the card.

**Screen reader.** The card is a region named by its heading. Approve's name carries the action
and the object. Counts and money read as words (Rule 13).

**Use it when.** The assistant can act at all. Ship it with the first action, not after.

### 4.2 · Approval review sheet

On demand.

**For.** Checking a send that goes to a group before approving it. For such a send, the
proposal's primary opens this sheet ("Review the send"), and Approve lives here.

**Anatomy,** in this order:

1. Who gets it: the count and the group, with a source chip on the count.
2. Who won't, and why: each excluded group, its count and the reason (unsubscribed, no address
   on file, already sent).
3. When it lands: date, time and time zone, or "as soon as you approve".
4. A preview per device, one tab each.
5. Send me a test, to the approver only. It confirms with "Test sent to [address]".
6. Reject, then Approve. Approve is the only primary.

**States.** Reviewing, test sent, approved (the proposal's done state), rejected.

**Keyboard.** It opens as a modal with focus on its heading, and Tab stays inside. Escape closes
it without deciding and returns focus to the proposal, which keeps waiting.

**Screen reader.** The sheet is a `dialog` named by its heading. The device previews are a
tablist. Counts read as words.

**Use it when.** A send goes to a group: campaigns, notifications, bulk email.

### 4.3 · AI-drafted marker

Core.

**For.** Saying who asked for a draft and how the brand check went, on the item itself.

**Anatomy.** One line on the draft: "Drafted with AI by [name], brand check passed." [name] is
the person who asked for it.

**States.**

| State | The line |
|---|---|
| Passed | "Drafted with AI by [name], brand check passed" |
| Issues | "Drafted with AI by [name], brand check found 2 issues", with a link to them |
| Checking | "Drafted with AI by [name], checking the brand" |
| Not checked | "Drafted with AI by [name], brand check not run" |
| Edited | "Drafted with AI by [name], edited by [name]". The check runs again |

An auto-draft (4.5) has no one who asked, so what started it takes the name's place: "Drafted
with AI when [trigger], brand check passed".

**A draft for a thread.** A reply drafted for a conversation is the composer's text, not a second
box beside it: `Conversation` takes it as `draft`, and the marker describes the composer until the
person sends it. One composer, one Send.

**Keyboard.** The issues link is focusable. Nothing else is.

**Screen reader.** Plain text, tied to the item as its description (`aria-describedby`). Not a
live region.

**Acts on anything?** No. It describes a draft.

**Use it when.** The assistant writes anything a person might send or publish.

### 4.4 · Ask routing

On demand, with search (15).

**For.** Deciding when a shared box offers Ask, and when it finds the record instead.

**The fixed rule.** Input that looks like an identifier or an email finds the record first, and
Ask isn't offered.

**The routing table.** Write one per product. The first two rows are fixed. The rest are
examples.

| Input | What happens | Ask offered |
|---|---|---|
| An identifier: an order or invoice number, an account ID | Opens or lists the matching record | No |
| An email address | The person or account with that address | No |
| A record's exact name | That record first | The product's call |
| A question or free text | Results, then Ask with the text filled in | Yes, as the last row |
| Nothing matches | The empty state offers Ask | Yes |

**Keyboard.** Ask is the last option in the listbox. Choosing it sends the text to the Ask
panel, and focus moves to the new answer (Rule 12).

**Screen reader.** The Ask row's name includes the text: "Ask the assistant: [text]".

**Use it when.** One box serves finding and asking.

### 4.5 · Auto-draft

On demand.

**For.** A draft the assistant starts without being asked, such as a reply to a new enquiry. It
never sends.

**Anatomy.** The draft sits where the person will look for it, in the thread or in drafts. It
carries the AI-drafted marker (4.3), with what started it in place of a name ("Drafted with AI
when [trigger]"). It offers Open and Discard. There is no send timer and no "sending in 5 minutes unless you stop it": that
would be the assistant sending.

**States.** Drafting, ready, edited, discarded.

**Keyboard and screen reader.** The draft is an ordinary item in its list. A ready draft
appears in place. It does not move focus or interrupt.

**Acts on anything?** Never. Sending is the person's own press (Rule 1). A send to a group opens
the review sheet (4.2).

**Use it when.** Work arrives that the assistant can prepare before a person gets to it.

### 4.6 · Role-aware surfaces

Core.

**For.** Showing each person only what their role can do.

**Rules.**

- A viewer never sees create actions. They are absent, not disabled.
- The assistant suggests nothing a viewer cannot do: no follow-up, command or empty-state
  suggestion that creates anything.
- A proposal the person cannot approve says who can.
- This holds in every pattern: sidebar, composer commands, table headers, suggestions,
  proposals.

**Acts on anything?** No. It limits what appears.

**Use it when.** The product has more than one role.

### 4.7 · Rule line

Core, with the proposal card.

**For.** Showing which approved rule acted, wherever it acted (Rule 4).

**Anatomy.** "Done by the rule "[rule name]", approved by [name] on [date]." A link opens the
rule view (16).

**Where it appears.** On the item the rule changed, in that item's history, and in the steps log
when the rule ran steps.

**States.** Acted. Failed: it names the step and the system, with one Try again. Rule changed or
paused since: the line stays and says so.

**Keyboard and screen reader.** A plain line with one link.

**Use it when.** Any approved rule can act.

---

## 5. Core and on demand

Every product system gets the core. The rest are added when a product needs them.

### Core

| Pattern | Built from | Why it is core |
|---|---|---|
| Answer | 03 Streaming Text | Every reply carries source chips, the caveat and follow-ups (Rules 5, 6, 8). Built once, so no surface can ship an answer without them |
| Status line | 01 Loading State | It holds the answer's one live region (Rule 13), and Stop when there is no composer |
| Steps log | 02 Thinking (Steps), 06 Task Rows | Rules 9 to 11 need one place to say what ran, where it stopped and what failed |
| Composer | 08 Prompt Bar | Every Ask surface needs input, its Ask button and Stop |
| Ask panel | 07 Chat | It holds the thread, the empty state and the focus targets in Rule 12 |
| Proposal card, with the rule line | 4.1 and 4.7, drawing on 09 and 11 | Rules 2 to 4. It has to exist before the assistant's first action ships |
| AI-drafted marker | 4.3 | Drafts are the assistant's main output (Rule 1). Each one says who asked and how the brand check went |
| Role-aware surfaces | 4.6 | A rule on every pattern. Added late, it means auditing every button |

### On demand

| Pattern | Built from | Add it when |
|---|---|---|
| Question card | 04 Approval Card | The assistant needs a decision before it can draft |
| Sources list | 10 Context Cards | People check passages, not only names |
| Change preview | 11 Diff Table | Proposals edit more than one record |
| Records table with an AI column | 12 Records Table | People enrich many records at once |
| Filter chips | 13 Filter Table | Lists have a handful of statuses |
| Sidebar | 14 Sidebar Nav | The product has workspaces and saved conversations |
| Search with Ask routing | 15 Search, 4.4 | One box serves finding and asking |
| Rule view | 16 Flowchart | People approve rules the assistant runs |
| Insight cards | 17 Insight Cards | The assistant reports numbers unprompted |
| Code block | 18 Code Block | The product's output is code or configuration |
| Inspector | 19 Fine-tune Card | The product edits visual objects |
| Selection bar | 20 Selection Actions | People edit long text |
| Approval review sheet | 4.2 | Sends go to a group |
| Auto-draft | 4.5 | The assistant prepares work before anyone asks |
| Dictation, @ sources, / commands | 08 Prompt Bar | People speak their input, choose between sources, or repeat named jobs |

---

## 6. Not in the core, and why

The parts of beautifului that break the house rules. None of them ships, in the core or on
demand.

| What | Where | Rule | What replaces it |
|---|---|---|---|
| Model picker, and the sweep that celebrates the top model | 08 Prompt Bar, 12's Tool menu | 7 | Nothing. The system chooses |
| Confidence meter, and the "Show confidence" switch | 09 Recommendation Card, 12 | 7 | Why the assistant suggests it, with sources, plus the caveat's check first |
| Agent desktop | 21 Agent Screen | 7, and 2 if it works in other systems | The steps log, naming each system touched and linking to what changed |
| Raw tool calls: commands, file reads, edits and their diffs | 05 Tool Chips, 02 Coding | 7 and 2 | The steps log in plain words. A code block (18) for code output |
| The agent's reasoning | 02 Reasoning | 7, as internals | Step names |
| Search query strings | 02 Search | 7 | "Searched the web" and the sources read, as chips |
| Prompt field and grounding switch | 12 Records Table | 7 | A plain line saying what the column fills, from what |
| Chunk and character counts | 10 Context Cards | 7 | Sources by document and place |
| A looping video in the loader | 01 Surfer | WCAG SC 2.2.2 | The status line |

Rule 7 does not name reasoning. It is treated as internals here because it is the model's
working, not a step a person can check.

---

## 7. Licence

beautifului.dev publishes its components under the MIT licence:
<https://www.beautifului.dev/license>, read 27 October 2026.

- Every pattern in this file is rebuilt on the system's own tokens and components. This file
  reproduces no code from the site, and the system's components are written from scratch too.
- If code is ever copied from beautifului.dev, its MIT notice goes with it. The licence asks for
  the copyright line and the permission notice in all copies or substantial portions, exactly
  as the licence page publishes them.
- Some listings import third-party packages: a shader in Prompt Bar, a chart library in Insight
  Cards, and icon sets in Sidebar Nav and Selection Actions. Those have their own licences.
  Check them before copying.
- Several listings import shared parts the page does not list, so copying one listing does not
  give you a working component.
- The Prompt Bar listing draws other companies' product marks inline. Those marks are not the
  site's to license.
