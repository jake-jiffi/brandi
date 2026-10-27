# The written system

Every product system ships a README and nine sections of writing, eight when the brand has no
characters or illustration. The components make products look alike. The writing makes them say
and do the same things: one word for each state, the same three beats in every error, the same
limits on what the assistant may do alone.

The writing is the part of the system people rely on most, and the part a build agent reads before
it designs anything. The standard is the last system built this way. Its pages gave the exact
words, not a description of a tone. This file sets what each document holds, what comes from the
brand, and what separates a good one from a generic one.

Four rules hold for every document.

1. **Exact copy, never adjectives.** "Clear, friendly error messages" changes nothing. "[The
   booking system] is not responding. Jobs below are from 8:50 am." changes every error written
   after it. Wherever a document would describe a tone, it shows the words, in a table people can
   paste from.
2. **One word per state, across every product.** People learn a word once. A state that reads
   "Pending" in one product and "Waiting" in the next is two words for one thing, and people have
   to learn both. A new state gets its word here before any product ships it.
3. **Every rule carries its reason.** A rule without one gets broken the first time it is
   inconvenient, or "fixed" by someone who never saw the problem it solved. A colour rule's reason
   is its measured ratio.
4. **Numbers are exact.** Sizes in pixels, durations in milliseconds, ratios as measured, scores
   out of 40, counts of pairs, scans and cases. "Good contrast" is a claim. "5.1:1 on `surface`"
   is a fact anyone can check again.

---

## What the documents are made from

Write the documents from the system, not from intentions. They come after the tokens, the
brand-to-product decisions, the component catalogue and the starter, because most of what they say
is read off those. Update Quality gates after every round, and Building it whenever the starter
changes.

| Input | Where it lives | What it feeds |
| --- | --- | --- |
| The voice | `voice.statement`, `voice.attributes[]` with each `notThis`, `voice.tone[]`, `voice.vocabulary` (`use`, `avoid`, `hardThings[]`), `voice.mechanics` and `voice.examples[]` in `brand/brand.json` | The README's content fundamentals; Writing for the product |
| Audiences, personality, values | `strategy.audiences[]`, `strategy.personality`, `strategy.values[]`, `strategy.messaging.pillars[]` | The README's opening and principles; the dial; the brief |
| The locale | `meta.locale`, en-AU when unset | Spelling, the formatter's locale and currency, dates, the financial year, the first day of the week |
| The identity | `identity.colour`, `type`, `shape`, `motion`, `logo`, `iconography`, `imagery`, `illustration` | The README's visual foundations, marks and icons; the characters section |
| The owner | `meta.owner` | The owner of accepted deviations and open items, until the system has a named maintainer |
| The intake | The one batch of answers: the surfaces, who uses each and for what, the systems each touches, the AI stance, the platforms | The README's opening; every example's nouns and systems; whether the assistant sections exist; Reporting's figures and periods; the brief |
| Brand-to-product decisions | `product/product.json` and the decisions made with `02-brand-to-product.md` | From brand book to product; the README's colour, type and shape rules |
| Tokens and their audit | `product/tokens.json`, `product/contrast-audit.json` | Every token name; every ratio quoted as a reason; the chart series |
| Components, AI patterns, starter | What `05-components.md`, `10-ai-catalogue.md` and `07-starter.md` produced | The README's components and usage; the assistant's rules; Building it |
| Gate records | `product/rounds/round-N/record.md` | Quality gates; the review record in Definition of done |

**Routes B and C.** With no `brand.json`, read the same things from the brand's guidelines, its
website and, on route C, the shipped product's own strings. Note the source beside each rule. On
route C the product leads: write down the words it already uses for each state before proposing
any change, and record each change as a decision.

**Gaps.** A gap is a bracketed placeholder, never an invention. If the intake never named the
accounting system, the documents say "[the accounting system]" and the gap goes on the open
questions list. Never fill a table with a made-up system, figure or status word so it looks
finished.

**Brackets.** In the finished documents, brackets mark two things. Invented sample names
("[Northside Plumbing]") stay bracketed for good, under real or labelled. Gaps stay bracketed until
the open question is answered. In this file's snippets, brackets also mark what you fill from the
brand. The systems the intake names are real: write them plainly, spelled the way they spell
themselves.

**The fictional brand.** [Brand] makes software for trades businesses. Its colours are [brand
orange] and [brand ink], and its faces are [the display face] and [the text face]. Its first
product, [Product], is the console dispatchers use to plan the day's jobs. It reads bookings from
[the booking system] and invoices from [the accounting system]. The snippets use en-AU, the
default locale.

**Order and titles.** The documents refer to each other by title, so the titles are fixed.
Publishing them as pages of the Design System artifact is in `12-design-system-artifact.md`.

| Document | Its job |
| --- | --- |
| README | The front page: what the system is for, the principles, the foundations |
| Writing for the product | The voice at work: the words for every state, error, action and figure |
| Screen patterns | The pages every product is built from, with their states and behaviour |
| Reporting and data | Figures, charts and tables that answer one question fast |
| [The characters] in the product | Which character marks which moment, and the rules that keep it a signal |
| Building it | Starting a product on the stack, exactly, and keeping it on the system |
| Quality gates | The two gates, what passing means, and this system's record |
| Brief for build agents | The short brief pasted at the top of any build task |
| Definition of done | The lines a screen meets before anyone calls it done |
| From brand book to product | What the product keeps from the brand book, what it changes, and why |

The characters section exists only when the brand has characters, a mascot or an illustration
system. When it has none, leave the section out and keep the rest in order. Never write a
placeholder page.

---

## README

The front page. It says what the system is for, the principles every screen follows, and the
foundations, each kept short, with the depth left to the sections. Someone who reads only the
README should still get the principles and the hard rules right.

**Headings, in order, and what each holds**

- **The opening: two paragraphs, no heading.**
  - The first says what the system is the starting point for, listing the product kinds from the
    intake. It names what the system turns the brand into (its colours, faces and characters, by
    the brand's own names). Then it lists the few places the brand shows up on screen, as a short,
    closed list.
  - The second gives the rule for adding things, names the gates everything has passed, and lists
    the sections by title. The rule: add something only when the system has no way to say it, and
    add it to the system first, so the next product gets it too.
- **Principles.** Six, numbered, each a bold name and one or two sentences. Every system keeps all
  six in substance, worded in the brand's voice.
  1. Every screen answers three questions, in this order: what is happening, what it means, what to
     do next. A screen that needs a walkthrough is not finished.
  2. Name the state, then the next step. Status copy is literal. Errors say which system failed and
     how to fix it.
  3. One primary action per view, in the colour that means "this is what the page is for" in each
     theme. Everything else is secondary or quiet.
  4. People stay on the hook. The assistant drafts and a person sends. Anything that sends, pays,
     approves, changes another system or deletes waits for a person to approve it, or the rule
     behind it.
  5. Personality is earned. Warmth lives in greetings, empty states, first runs and finishes.
     Working screens are quiet. Never a joke in an error, a confirmation or anything about money.
  6. Real or labelled. Live figures, or the sample-data badge.

  Tie a principle to one of the brand's own ideas where one fits (a value, a messaging pillar), so
  the product reads as the brand at work.
- **Content fundamentals.** The voice in one paragraph: who it sounds like, sentence length, tense,
  who "you" and "we" are, the spelling. Then the hardest rules, each with an example:
  - sentence case everywhere, with uppercase only as a style
  - buttons of one to three words, verb first
  - literal status copy, and saying who will see it
  - empty states that say what is empty and what to do
  - naming the thing doing the work
  - the punctuation bans and the banned words
  - digits, dates, times and money.

  It ends by pointing to Writing for the product.
- **Visual foundations**, under these subheadings.
  - *Material hierarchy.* The layers from back to front (canvas, then rail and panes, then cards,
    then controls), each with its tokens, radius, shadow and gap.
  - *Colour.* Role tokens in UI, never the brand primitives, which exist so the roles can alias
    them. What `primary` is in each theme. Every brand colour that fails as text, with what it does
    instead and its ratio. What `highlight` means, and every place it may appear. The text tiers,
    nothing quieter than `text-subtle`. Lines and selection. Light by default, dark a full theme,
    never a per-screen choice.
  - *Status.* The five families (`success`, `warning`, `danger`, `info`, `ai`), each with text,
    `-surface`, `-solid` and `-line` roles. Status is never carried by colour alone. `ai` marks
    what the assistant made. A status Badge and a category Tag differ in form, so the two never
    look alike.
  - *Type.* The display face's moments (one per screen) and its sizes. What it must never do, with
    the face's own reason (a face with one weight is never bold or italic; one with old-style
    figures never sets numbers). The text face's scale, each style with its size and line height.
    Tabular figures for every number. Tracking by size. 16px inputs on phones, so iOS never zooms.
  - *Spacing and layout.* The scale, the gaps and the padding. The shell's dimensions. The measure
    in `em`, with its character count measured for this text face. Never a prose cap in `ch`: a
    `ch` is the width of the face's zero, and in the last system a wide zero pushed 65ch past 100
    characters. The breakpoints and what changes at each. Container queries. Control heights and
    touch sizes.
  - *Corners.* Shape as a signal (the last system's rule: if it is a pill, you can press it), then
    every radius and what takes it.
  - *Shadows and borders.* What shadows are tinted with and why, their depth in each theme, and
    which surfaces take which.
  - *States.* Focus in each theme and in forced colours. Hover and pressed. Disabled, which fades,
    loses its shadow and says why nearby. Loading. Partial outage: the rest of the screen keeps
    working, and it says which source is unavailable and when it was last checked.
  - *Motion.* One curve and the duration tokens, what moves and how far. What reduced motion keeps
    (fades) and drops (slides, lifts, loops), and the loading-indicator exception with its reason.
  - *Contrast.* How many pairs were checked in both themes, with translucent washes laid over the
    surface beneath, and how many failed. Then the ratios that carry rules: body, muted and subtle
    text, status text on its own surface, rail text, `on-primary`, control lines, focus and the
    chart series.
- **Brand marks and imagery.**
  - The logo: the component or the files, never type or a redraw, with its colourways, clear space
    and minimum size. In product it appears only in the rail lockup and on sign-in.
  - The product lockup, one per screen.
  - The characters or illustration in a paragraph, pointing to their section.
  - The app icon and favicon.
  - Where photography is and is not used in product, and which illustration format is for screens
    and which for email and print.
- **Iconography.** The set and why it was chosen, its grid and stroke, `currentColor`, no fill. A
  size in pixels for each context: the rail, controls and tables, chips and meta lines, badges,
  empty states. Never mix sets and never use emoji as icons. Every icon-only button gets a label
  and a tooltip.
- **Components.** How many, in which groups, and the behaviour they share: keyboard patterns, focus
  into overlays and back, Escape closing only the top layer, menus in a portal. Tables, metrics and
  charts have loading, empty and error states, and take plain data, so a canvas design and the
  shipped product describe the same thing. Production code never imports the preview bundle. It
  uses the starter, dressed to match.
- **Using this system.** The mechanics, from `05-components.md`, `06-canvas.md`, `07-starter.md`
  and `12-design-system-artifact.md`. The bundle's namespace and load order, the font files and
  their licence, the theme provider. Mounting components on a Design canvas. The sample-data badge
  and the bracket rule. The type definitions, and where the starter and its example product live.

**Fill in from the brand.** The product kinds from the intake's surfaces. The brand's colours,
faces and characters by the names the brand gives them. The voice paragraph from `voice.statement`
and `voice.attributes`. Principle tie-ins from `strategy.values` and the messaging pillars. Every
ratio from `product/contrast-audit.json`, never from memory.

**The bar.** A good README states rules a screen can fail. A generic one states values nobody can
check.

| Generic | Good |
| --- | --- |
| "A clean, modern interface that reflects the brand" | "The jobs are the loudest thing on screen. [Brand] shows up in a few deliberate places: [the rail], the page title, the highlight, and [the characters] in empty, loading, done and error moments." |
| "Use the brand colours appropriately" | "[Brand orange] is never text and never carries white text on light grounds ([n]:1)." |
| "Accessible colour contrast throughout" | "[N] pairs checked in both themes, no failures. `text-subtle` is at least [n]:1 on `surface`, `surface-subtle` and `canvas`." |
| "We value simplicity" | "A screen that needs a walkthrough is not finished." |

**Snippet, for [Brand].**

```md
[System name] is the starting point for every [Brand] product: the dispatch console, the customer
portal, the technicians' phone app and the admin screens. It turns the [Brand] brand ([brand
orange] and [brand ink], [the display face] and [the text face], [the characters]) into an
interface dispatchers can work in all day. The jobs are the loudest thing on screen. [Brand] shows
up in a few deliberate places: [the rail], the page title, the highlight, and [the characters] in
empty, loading, done and error moments.

- **[Brand orange] is never text and never carries white text on light grounds ([n]:1).** It is
  the `brand` button (with `on-brand` text), `selected-line`, chart `series-1` and illustration
  fill. Links use `link`.
```

---

## Writing for the product

The brand's voice at work, applied dozens of times a day to people in the middle of a task. It is
what makes two products built by two teams sound like one.

**Headings, in order, and what each holds**

- **The opening.** Two or three sentences: what the brand promises, why the product has to deliver
  it on every screen, and the stance. Same voice as the brand, at work. Plain beats clever.
- **The dial.** A table, Moment | Dial | Sounds like, under one rule: personality goes up where
  people have a moment, and down where they are working, worried or dealing with money. At least
  four rows:
  - greetings, first runs, finished setups and all-caught-up moments, turned up
  - working screens (tables, forms, settings, reports), plain
  - errors, money, permissions and deleting, straight and calm, no jokes
  - the assistant, plain, specific and sourced.

  The Sounds like column holds real lines, never adjectives.
- **State, meaning, next step.** The brand's copy formula, if it has one, compressed on screen to
  three beats: what is happening, what it means, what to do. Most status copy is two short
  sentences and a button. At least three examples, each with its button.
- **Voice.** Who "you" is and who "we" is. The product never says "I"; only the assistant does,
  about its own work. Contractions, with "not" in full when the negative is the point. Name the
  thing doing the work, never "the system". Never blame the person. One idea per sentence.
- **Capitals and punctuation.**
  - Sentence case everywhere, with proper nouns (the intake's systems) in their own case. That
    holds on every platform, including where a platform asks for title-style, such as Apple's
    buttons. The product's guidelines win (`11-platform-layer.md`, section 2.3).
  - Full stops on sentences only, with where that is and is not.
  - Uppercase is a style, not text. Write the words in sentence case and let the style uppercase
    them, so screen readers do not spell them out.
  - No em dashes, and ranges with "to". No exclamation marks, no emoji, no "&" outside proper
    names.
  - The ellipsis character only for an action still running and for truncated text.
- **Buttons and links.** A Do | Don't table of at least six pairs, then the rules. Verb first, one
  to three words: the label is the outcome, so people know what happens before they press.
  Destructive buttons say what goes and how many. Cancel cancels, never Yes and No. Links say
  where they go, in words unique on the page. The same action takes the same word in every
  product.
- **Titles and headings.** Page titles are the nouns people use, never "Dashboard", "Overview" or
  "Management". Card titles say what the card shows. A Write | Not table, plain over formal, of at
  least five rows.
- **Status words.** A table, State | Words | Badge tone, covering all nine states. The words below
  are the last system's. Keep them unless the brand's vocabulary says otherwise, and then keep the
  replacement in every product.

  | State | Words | Badge tone |
  | --- | --- | --- |
  | Waiting on the reader | Needs you | `highlight` |
  | Waiting on someone else | Waiting on [client], Waiting on [team] | `neutral` |
  | Happening now | In progress, Syncing, Scheduled | `info` |
  | Going to plan | On track | `success` |
  | Finished well | Approved, Paid, Sent, Live, Connected, Done | `success` |
  | Heads up | Due soon, Stale, Near limit, Behind | `warning` |
  | Something is wrong | Failed, Overdue, Blocked, Disconnected, Sync failed | `danger` |
  | Made by the assistant | Drafted, Answered, Suggested | `ai` |
  | Out of play | Archived, Paused, Snoozed, Inactive, Stopped, Not done | `neutral` |

  Under it, the rule that keeps a person's unfinished work apart from an assistant's draft: Draft
  in `neutral` for the person, Drafted in `ai` with the assistant's icon.
- **Errors.** What happened and in which system, why if known, and what to do. Everything the
  person typed is kept. A table, Where | Write, for six scopes: a field, a section, a page, part of
  a page, no access, not found. Error codes go in a "Details for support" disclosure, never on
  their own.
- **Confirmations.** The title is a question with the thing and the count. The body gives the
  consequence and what is safe. The buttons are Cancel, then the verb with the count, in the
  danger style. A change to a customer's account shows before and after, and says what is
  recorded. If it can be undone, don't confirm: do it and offer Undo.
- **Success.** Past tense, specific, with Undo when it can be reversed. Never "Success!" or
  "Done!".
- **Empty, loading and waiting.** A table, Situation | Title | Body and action, for nothing yet, no
  results, all done, and waiting on a system. Then the timing. Under a second, say nothing. Over
  ten seconds, say how long it usually takes and let people leave.
- **Forms.** Labels are nouns, in sentence case, with no colons. Hints give the format or why it
  matters. Placeholders show an example, never the label or an instruction. Optional fields say
  "(optional)"; required ones are not marked. Errors appear when the person leaves the field or
  presses save, never while they type. Long forms also list the problems at the top, each linking
  to its field.
- **The assistant**, when the intake's AI stance gives the products one. Its patterns, states and
  approval rule live in `10-ai-catalogue.md`. This heading holds how it writes.
  - It is "the assistant" in the interface, or the product's own name for it.
  - It may say "I" about its own work. No feelings, no flattery, no "Great question", no apology
    theatre.
  - Every figure has a source, shown as a source chip, and it says what it could not check.
  - It drafts, people send. A draft is marked Drafted in the `ai` tone, with Use this, Edit and
    Discard. An answer is marked Answered, and its actions are what the answer leads to.
  - It asks before it acts, unless it acts under a rule a person approved. The proposal's title is
    a question with the thing and the count. The body says why, and a list shows every record it
    will touch. The button repeats the verb and the count, and a line under it says nothing happens
    until the person presses it.
  - While a proposal runs, it names the work. Afterwards it says what happened and when. After Not
    now: "Nothing has changed."
  - Its working line names the work, never "Thinking…" once it knows. Work of more than one step
    is a steps log, each step named by what it does, with where each figure came from. Never model
    names, prompts or tool calls.
  - Follow-up suggestions are what the person might ask next, in their words, and never ask what
    the answer already said. Three at most. Never "Tell me more".
  - When it can't finish, it says where it stopped and why, naming the system, and offers Try
    again. When the person presses Stop, it keeps what it found and says so.
  - A standing caveat sits under every answer: what to check first, then "The assistant can be
    wrong."
- **Numbers, dates and units.** The formatter, or `Intl` with the brand's locale, never hand
  formatting. A table, Thing | Write | Not, with a row for each of these:
  - counts in the interface
  - money in tables and detail, with cents only when there are cents
  - money on cards and axes, compact
  - negative money and percentages
  - a change in a rate, in points, never a percent of a percent
  - hours, or the domain's own unit
  - dates in sentences, dates in tables, times, and relative time with the exact time on hover
  - phone numbers and the region's identifiers, grouped the way the region writes them, never run
    together
  - the financial year.

  Then the first day of the week, and the time zone when people work across zones. Last, the split
  for small numbers. The brand's prose rule stays in email, docs and long help text. The interface
  uses digits, because people scan.
- **Words we use.** A table, Use | Not, starting from the last system's rows:
  - sign in and sign out
  - set up (verb) and setup (noun), and email
  - people or team members rather than users, outside admin settings
  - archive (reversible, the default) against delete (permanent, confirmed)
  - approve and decline
  - the freshness line: "Updated 8:50 am from [system]".

  Each business's own nouns, once a product belongs to them. Then **Never use**: one list, used
  everywhere, joining `voice.vocabulary.avoid` to the product's own. The product words: seamless,
  robust, powerful, intuitive, effortless, easy, simply, just ("just click"), oops, whoops, uh-oh.
  The product phrases: "Something went wrong", "Are you sure?", "Invalid", "Please wait",
  "Submit", "Click here", "Success!".
- **Words for everyone.**
  - Every icon-only button has a name that says what it acts on ("More actions for [Northside
    Plumbing]").
  - Never point by colour or position. Name the thing.
  - Characters are decorative (`alt=""`), and the words beside them carry the meaning.
  - Loading lines and toasts are announced (`role="status"`), so each must make sense read aloud
    on its own.
  - Counts and changes carry their meaning in words for screen readers ("Jobs, 3 need you", "Up
    4.8%, better vs last month").
  - Errors are announced where they appear, and the summary's links take people to the field.
- **Ready to paste.** A table, Situation | Copy, with the literal string for every situation that
  recurs. At least: saving a form, while saving, saved, leaving with unsaved changes, retrying,
  freshness and stale data. Then read only, who will see it, sample data, signed out, offline, page
  not found, and the subject line of a product email.

**Fill in from the brand.**

- The voice paragraph and the dial's lines come from `voice.statement`, `voice.attributes` and
  `voice.tone`. The brand's tone rows for interface copy, errors, empty states, success and
  billing fold into the dial's four.
- `voice.vocabulary.hardThings` sets the sound of the errors, money and permissions row.
- The systems, nouns and the assistant's name come from the intake. The formats come from
  `meta.locale` and the formatter contract in `03-fundamentals-first.md`.
- Where an interface rule departs from `voice.mechanics` (digits for one to nine is the usual
  one), the interface rule wins on screen. The departure gets a row in From brand book to product.

**The bar.** A good one gives the words. A generic one describes them.

| Generic | Good |
| --- | --- |
| "Friendly but professional" | A dial whose Sounds like column holds real lines for each moment |
| "Use clear error messages" | Six scopes, each with its exact sentence, naming the system and the fix |
| "Pending", "Waiting" and "Awaiting approval" across three products | One word per state, with its badge tone, in a table every product reads from |
| "Format dates consistently" | "4 November 2026" in sentences and "4 Nov" in tables, with the wrong forms beside them |
| A list of tone words | The literal string for every situation that recurs, ready to paste |

**Snippet, for [Brand].**

```md
| Moment | Dial | Sounds like |
| --- | --- | --- |
| Greeting, first run, setup finished, all caught up | Warm, brief | "Morning, [first name]. 4 jobs are waiting on you." "All caught up. Every job has a technician." |
| Working screens: tables, forms, settings, reports | Plain | "Jobs" "18 booked, 3 waiting on customers" |
| Errors, money, permissions, deleting | Straight and calm, no jokes | "Payment from [Northside Plumbing] failed. The card was declined. Ask them to update it, then try again." |
| The assistant | Plain, specific, sourced | "3 jobs tomorrow start before the technician's shift." with [the booking system] as the source |

- "[The booking system] is not responding. Jobs below are from 8:50 am." **Try again**
- "[Sam] is booked on 2 jobs at 10:00 am on Thu 6 Nov. One has to move before the day's plan goes
  out." **Show jobs**
- "Your [accounting system] connection expires in 3 days. After that, invoices stop syncing."
  **Reconnect [accounting system]**

| Situation | Copy |
| --- | --- |
| Stale data | [The accounting system] last synced 3 hours ago. **Sync now** |
| Product email subject | 3 jobs need you (not "Action required: pending items") |
```

---

## Screen patterns

The pages every product is built from. Start from the closest pattern, keep its structure, and
change the content. Each pattern is drawn on the canvas with the real components
(`06-canvas.md`).

**Headings, in order, and what each holds**

- **The opening.** A sentence or two: every product is built from the same set of screens, so
  start from the closest one.
- **The shell.** The frame from `03-fundamentals-first.md`: the skip link, the canvas, the rail
  from top to bottom, and the main column with its page header. The spacing tokens between them.
  Which pages cap their width and which run full width. What scrolls and what sticks. One primary
  action per page.
- **Pages.** One subheading per pattern. Each gives its job in a line, its structure in order, its
  limits as numbers, and the components it is built from. The ten core patterns:
  - *Home.* What needs me, and how are we tracking. The only page with a greeting and the ask bar.
    A waiting-on-you list of up to five rows, each with its badge and next step, then See all. Two
    to four metric cards in one row, at most one hero. One chart at most, and recent activity if it
    helps. "Nothing on Home that is neither actionable nor a headline figure."
  - *Records.* The index of one kind of thing.
    - A header with the plural noun, the total and the primary action.
    - A toolbar: search, filter chips, the view switcher, exports.
    - A paginated table. Selecting rows swaps the filters for bulk actions.
    - The first column names the record and is the row's link, so rows open from the keyboard.
      Seven columns at most.
    - Where a row opens at each width, and a sticky head on long tables.
  - *List and detail.* Queues people work through one item at a time. The list's width and its own
    scroll, the open row's style, and the detail's own header with the status and the actions. Up
    and Down move between rows. After an action, move to the next item that needs the person, and
    say so in a toast.
  - *Record.* One thing in full. Breadcrumbs, the name as the title, status badges, and one primary
    action plus a menu for the rest. Two to seven tabs. An overview in two columns: the details and
    related records in one, the summary, people and timeline in the other.
  - *Report.* How something is tracking over a period. The period control and the comparison sit
    in the header. Metric cards, then the one chart that answers the page's question, then the
    breakdown table. A footnote gives the source, when it was updated, and what is left out.
  - *Settings.* A sticky side navigation beside one column of sections. Each section saves on its
    own, and switches apply at once with no save. A danger zone comes last, each button opening a
    confirmation.
  - *Create and edit.*
    - A table, Size | Use: a dialog for up to five fields, a sheet for a longer edit where the list
      still matters, a page of its own for anything long.
    - One column, with Cancel then the primary at the end.
    - Validate when a field is left and on save. Keep everything typed when something fails, with
      an error summary at the top of a long form.
    - A form dialog ignores scrim clicks once something is typed.
  - *Setup.*
    - A stepper of five steps at most, each named by its outcome, with one decision per step and a
      line on why it matters.
    - Before the person signs in to another system, say what the product will read and what it will
      change.
    - The brand's character at the start and the finish, if it has one, then the first useful thing
      to do.
    - Progress is saved, and safe steps can be skipped and finished later.
  - *The assistant*, built from the patterns in `10-ai-catalogue.md`.
    - Where people ask, and the one column the ask bar and the answers share, newest answer last.
    - While it works, a steps log, folded to one line once it has answered, with Stop where the
      status will go.
    - The answer: the question as its heading, a source for every figure, its status, its actions,
      and up to three follow-ups as quiet buttons.
    - While it streams, sources, suggestions and actions wait. A screen reader hears one line when
      it starts and one when it ends, never every word.
    - Failure and Stop keep what it found. Focus then moves to the steps line or the question.
    - It never acts without a person's approval, of the action or of the rule behind it. One
      proposal waits at a time, its action is the only primary on the screen, and Not now can be
      undone.
  - *Sign in.* The canvas ground, one panel, the product lockup and a line in the display face
    ("Welcome back"). Single sign-on first, then email. The character beside the panel on wide
    screens, nothing on phones. A footnote saying who to ask ("Trouble signing in? Ask your [Brand]
    admin.").

  A product that needs a page none of these covers gets a new pattern, added here first, so the
  next product gets it too.
- **States.**
  - *Empty.* A table, Kind | Character | Example, for nothing yet, no results, all done and could
    not load. The sizes: page, section, compact. Inside a table the empty state replaces the rows
    and keeps the header and toolbar.
  - *Loading.* Nothing under a second. A skeleton shaped like what is coming. A loading state that
    names the system and the work when waiting on one. After ten seconds, how long it usually
    takes. A working button keeps its width, shows a spinner and cannot be pressed twice.
  - *Problems.* A table, Scope | Pattern, for one field, a failed save on a long form, one card or
    section, and a source behind the page (the last good data stays, marked with its time). Then
    the whole page, no access, not found, and offline.
- **Feedback, from lightest to heaviest.** Inline, alert, banner, toast, dialog, each with what it
  is about and its rules, under one instruction: use the lightest one that works.
  - Only news interrupts a screen reader. An alert already there when the page loads is a polite
    status.
  - Banners come one at a time.
  - A toast confirms a completed action. It stays longer when it carries Undo, and never carries an
    error that needs action.
  - A dialog is for a decision that must come first and can't be undone. If it can be undone, do
    it and offer Undo instead.
- **Overlays.**
  - Dialogs for confirmations of things that can't be undone, and for short forms. Never a dialog
    on a dialog.
  - Sheets for a record or an edit beside the list. A sheet may open a confirmation.
  - Menus for actions on one thing, destructive items last.
  - The command menu to jump, act or ask from anywhere.
  - Tooltips for labels and definitions only, never for anything people need to act on.
  - Menus, selects and tooltips open in a portal and flip to stay on screen.
- **Table, list or cards.** A table, The job | Use. Comparing values across many records takes a
  table. Working through items one at a time takes a list with the detail beside it. A few
  different things, each with its own shape, take cards. Anything on a phone takes a list.
- **Finding your way.** The rail for the places in a product. Tabs for sections of one place.
  Segmented controls for views of the same content. Side navigation for a long settings page.
  Breadcrumbs from two levels deep. The URL holds the state people would share: the tab, filters,
  sort, page and open record. Rail counts mean work.
- **Screen sizes.** A table, Width | What changes, from `03-fundamentals-first.md`. The shell
  measures its own width, so a canvas board, a split view and a browser tab of the same width look
  the same.
- **Keyboard.**
  - The command menu shortcut on each platform. "/" for search on list pages, unless single-key
    shortcuts are turned off.
  - Escape closes only the top layer, and focus goes back to what opened it.
  - Arrow keys inside lists, tabs, segmented controls and menus. Tab order follows reading order.
  - The skip link first, and focus on `main` after a route change.
  - After an action removes what had focus, focus goes somewhere that makes sense, never the page
    body.
- **Density.** Comfortable by default, compact for operations tables people scan all day, each with
  its row and control heights. One density per table, never mixed, and never tighter than compact.

**Fill in from the brand.** The intake's nouns in every example, its systems in setup and problems,
its identity providers on sign in, and the brand's characters, or none, in the states. Keep the
structure and the counts. They are what make the second product feel like the first.

**The bar.** A good one gives counts and limits. A generic one gives advice.

| Generic | Good |
| --- | --- |
| "Home shows the main metrics" | "Two to four metric cards in one row, at most one hero. Nothing on Home that is neither actionable nor a headline figure." |
| "Handle errors gracefully" | Eight problem scopes, each with its component, its tone and what keeps working |
| "Use modals sparingly" | The feedback ladder, lightest first, with the rule for each rung |
| "Fully responsive" | A table that says what changes at 1280, 1024 and 640 |
| Pages without states | Every page with its empty, loading and problem forms, and where focus goes after each action |

**Snippet, for [Brand].**

```md
### Home

What needs me, and how are we tracking. The only page with a greeting and the AskBar.

1. Greeting in `display` ("Morning, [first name].") and one summary line in `body-lg` ("4 jobs are
   waiting on you, and 2 of tomorrow's jobs have no technician.").
2. AskBar.
3. **Waiting on you:** a List of up to five rows, each with its badge and the next step in the meta
   line, then "See all".
4. **Today in figures:** two to four MetricCards in one row, at most one `hero`.
5. One chart at most, then recent activity if it helps.

Nothing on Home that is neither actionable nor a headline figure.
```

---

## Reporting and data

How figures are shown, so a report answers one question fast: are we on track, what changed, and
what needs a person. The opening says why figures matter to these products' people, in a sentence
drawn from the intake.

**Headings, in order, and what each holds**

- **Start with the question.** Write the question the screen answers before choosing a chart, with
  an example from the domain. Then a table, The job | Use | Component, with these eight rows:
  - one headline number and its change: a figure, not a chart
  - change over time: a line
  - amounts across a few categories: vertical bars
  - ranking named things: horizontal bars, sorted
  - parts of one whole, five or fewer: one segmented bar
  - a trend beside a figure: a sparkline
  - exact values people will check or export: a table
  - progress toward a known end: a bar with the numbers in words.

  Then the forms the system never uses (pies, donuts, gauges, 3D, radar charts, two y-axes). Two
  measures on different scales get two charts, or are indexed to a common base.
- **Metric cards.**
  - The label says exactly what is counted.
  - The value is rounded in the card and exact in the table.
  - The delta gives the direction and whether that is good (down is good for costs, overdue amounts
    and churn), with the comparison written beside it. A change in a rate is in points, never a
    percent of a percent. Screen readers hear the judgement in words.
  - An optional sparkline or progress bar, and a footnote that says what is left out.
  - Two to four per row, at most one hero.
  - When a source is down, the card says unavailable and when it last answered, never a zero
    nobody measured. While loading, a skeleton the size of the figure.
- **Colour in charts.** A table, Slot | Light | Dark | Family, with each series' hex in both themes
  from the product tokens. Then the rules:
  - Fixed order, never by rank. A seventh series folds into "Other", or the chart splits into small
    multiples.
  - Colour follows the thing. Once [Northside Plumbing] is slot 2, it stays slot 2 on every chart
    and after every filter. Filtering never repaints the survivors.
  - Checked, not guessed. Each slot reaches 3:1 on `surface` in both themes, and neighbouring
    series stay separable for colour-blind and normal vision. Say how many slots are safe for every
    pair: that caps any chart where every series can sit beside every other.
  - Four or more series need a second signal: direct labels, a legend in plot order, gaps between
    stacked parts.
  - Comparisons (last period, a target, a forecast) are grey and dashed, in `chart-compare`, with
    its ratio.
  - Status colours are reserved for good, watch and bad, and always come with a word or an icon.
  - Sequential data uses one ramp of a brand colour, light to dark. Diverging data uses two series
    colours either side of a grey middle, never the status colours.
  - Text never takes a series colour. A coloured mark beside the label carries the identity.
- **Marks and anatomy.**
  - Line width and joins, hover markers, bar width and ends, gaps between stacked parts. Horizontal
    gridlines only. The axis label style. Y-axes start at zero for bars.
  - Values are compact on axes, and exact on hover and in tables.
  - Legends: none for one series, always for two or more, and two to four also labelled directly.
    Five or more series is too many for one chart.
  - Label selectively: the latest point, the peak, the one that needs a person.
- **Interaction.**
  - A hover layer on every chart, with hit areas larger than the marks and a tooltip that stays
    inside the plot.
  - The plot takes keyboard focus, and Left and Right move through the points.
  - The tooltip's content as exact copy: value, period, comparison.
  - Filters and the period control sit in one row above the charts they change, and every chart on
    the page follows them.
  - Every chart can be read as a table, and its accessible name states the takeaway.
- **Chart states.** A table, State | What shows: loading, no data for the period, could not load
  (the reason and the source, announced), missing values (skipped, never drawn as zero), negative
  values.
- **Tables of figures.** Numbers right-aligned in tabular figures, text left-aligned. Units in the
  column head where they repeat, currency symbols in the cells. The totals row. A missing value
  stays blank and reads "No value" to screen readers, or shows the column's own empty text when
  missing means something. A real zero is 0. Cards round; tables don't.
- **Periods and time.** The financial year as the business names it, with its dates. The first day
  of the week. The business's own cycles, labelled by their dates. Like-for-like comparisons: this
  month to date against the same days last month. The business's own time zone, named when people
  span zones.
- **Freshness and trust.** Every figure says where it came from and when. Data older than its
  normal sync turns into a warning badge with Sync now. When a source is down, the last good
  figures stay, marked with their time, under a banner. Anything the assistant calculated carries
  the `ai` tone and its sources. Real or labelled.
- **Numbers.** A table, Style | Example | Where, from the formatter contract in
  `03-fundamentals-first.md`. Cards and axes round; tables, detail views and exports stay exact.
  Then the parity record between the bundle's formatter and the starter's, with its case count.
- **Exports.** File names say what and when (`jobs-2026-11-04.csv`). Exports carry exact values
  and the screen's own column names. A printed or PDF report carries the product lockup, the
  period, the source and when it was produced.

**Fill in from the brand.** The six series as the product tokens solved them, each with the brand
family it came from. The last system put its signature colour first, and darkened a light brand
colour until it worked as a mark. The domain's figures, units, periods and comparisons come from
the intake, and so do the systems in every freshness line. Money and dates follow the locale.

**The bar.** A good one leaves no chart decision to taste.

| Generic | Good |
| --- | --- |
| "Use charts to visualise data" | A form and a component for each kind of question, plus the forms the system never uses |
| "Charts use the brand palette" | Six slots with hex values in both themes, a fixed order, and what each slot passed |
| "Show loading and empty states" | Five chart states, including missing values, which are never drawn as zero |
| "Show the trend" | "Down 2 pts, better vs September", written out as what a screen reader hears |

**Snippet, for [Brand].**

```md
- **The label says exactly what is counted:** "Call-back rate, jobs completed in the last 30
  days", not "Call-backs".
- **The Delta** says the direction and whether it is good (`goodWhen="down"` for call-backs), with
  the comparison beside it: "vs September". Screen readers hear "Down 2 pts, better vs September".
- **The footnote** says what is left out: "Excludes warranty work."
- **When [the booking system] is down**, the card shows `unavailable` and when it last answered.
  Never a zero nobody measured.
```

---

## [The characters] in the product

Only when the brand has characters, a mascot or an illustration system (`identity.illustration`,
or characters in the brand book). Title it with the brand's own name for them. In the brand book
they tell the brand's story; in a product, they say what state people are in. They are the only
illustration on working screens, shown only at moments: welcome, waiting, done, all caught up,
nothing found, something broken.

**Headings, in order, and what each holds**

- **Who they are here.** What each character means in the product, and which is the default. Which
  one stands for the system's mess: a failed sync, a conflict, a broken connection. That one is
  never the person's own mistake, and never a person. Two together tell the whole story at once, so
  they appear together only at sign-in and first run.
- **Poses.** A table, Pose | The moment | Example copy | Where, one row per pose the brand's pack
  actually has. Pose names match the pack, so a still in a design and a live scene mean the same
  thing. Each moment's row has its copy, because the words carry the meaning. The faces go here
  too: the assistant's avatar, the app icon, the favicon, a broken connection's mark.
- **Sizes.** A table, Use | Height: a full-page empty state, an empty state in a card, narrow
  places, waiting on a system, sign-in and first run, and faces as avatars and marks. Then the
  height below which a full-body character never appears.
- **Rules.**
  - One character per screen. Two moments never compete.
  - Only in empty states, loading states, sign-in, setup and help. Never in tables, forms, dialogs,
    toasts, alerts, page headers or a busy dashboard, and never as decoration.
  - Never recoloured, flipped, rotated, cropped, squashed or outlined. No words or speech bubbles
    on them, never shown from behind, and the same colours in both themes.
  - Never two formats on one screen, such as 3D stills beside flat drawings.
  - The mess character never appears for the person's own mistake. A form error is a field error,
    not a character.
  - Always decorative (`alt=""` or `aria-hidden`), so the screen works the same with the picture
    removed.
- **Formats**, when the brand has more than one. Which format product screens use, and which is for
  email, printable reports and fallbacks. Live scenes appear in three places only: first run, a
  long job people watch, and a finish worth marking. Their budgets are numbers:
  - loaded lazily, on the client only, with the still shown first and kept as the fallback
  - the renderer at a pinned version
  - a file-size and triangle budget per character, and a cap on device pixel ratio
  - the still under reduced motion; offscreen scenes stopped and hidden tabs paused
  - a scene change taking its duration token, then resting, with nothing looping on a working
    screen except a loader while the work is real
  - no announcements from the scene. The status text and actions stay in the interface around it.
- **Where the files live.** The asset group in the system, the source collection, and where they go
  in a product: rendered at explicit sizes, with only the sign-in picture preloaded.
- **App icon and favicon.** Which pose, on what ground, at which sizes. Product names never go
  inside the icon.

**Fill in from the brand.** The characters' names and meanings from the brand book, the pose names
from the brand's own pack, and `identity.illustration` (`style`, `dos`, `donts`, `library`).
Never invent a pose the pack does not have. A moment with no pose gets no picture, and the words
carry it.

**The bar.** A good one makes each character a signal people can read. A generic one makes it
decoration.

| Generic | Good |
| --- | --- |
| "Illustrations add delight" | A pose table: each pose tied to one moment, one component and one line of copy |
| "Keep the characters on brand" | Everything that is never done to them, listed, and the same colours in both themes |
| "Optimise the 3D assets" | Budgets as numbers: file size and triangles per character, a pixel-ratio cap, a pinned renderer |
| Silence on mistakes | "Never for the person's own mistake. A form error is a field error, not a character." |

**Snippet, for [Brand].**

```md
| Pose | The moment | Example copy | Where |
| --- | --- | --- | --- |
| `searching` | No results; not found | "No jobs match these filters." | EmptyState |
| `broken` | Could not load; sync failed; a conflict | "We couldn't load jobs. [The booking system] is not responding." | EmptyState `page` or `section` |
| `resting` | All caught up | "All caught up. Every job has a technician." | EmptyState on Home and queues |
```

---

## Building it

How to start a product on the stack and keep it on the system. It gives the exact versions and
commands, what the starter holds, and how the tokens map into the framework. Then what was patched
and why, where each component lives, the rules for the code, and the traps. Most of it is read off
the starter (`07-starter.md`).

**Headings, in order, and what each holds**

- **The opening.** The stack in one sentence: Next.js with the App Router, Tailwind CSS 4,
  shadcn/ui on Radix, TypeScript strict. The starter is that stack dressed in the tokens. Three
  rules: start from it, don't restyle shadcn by hand, and never hard-code a colour, radius or
  shadow the tokens already name.
- **Versions.** Every library at its exact version, with the month they were tested together.
  Newer minor versions are fine. Read the framework docs that ship in `node_modules` before using an
  API remembered from an older version.
- **Start a product.** Numbered steps, each an exact command (versions pinned, flags written out)
  or an exact file action. The last step runs the build, lint and dev-server checks, which pass
  with no changes. Run the sequence on a fresh project before writing it, and say on the page that
  it was run.
- **What is in the starter.** A table, File | What it does, for every file.
- **Tokens in Tailwind.**
  - Colours are roles, with example classes. shadcn's own names point at the same tokens, so copied
    examples still land on brand.
  - Brand primitives are not utilities, so a brand colour that fails as text cannot be written. Its
    ratio is the reason.
  - Type utilities instead of stacked size classes.
  - The line-length utility, and why it is not `max-w-prose`.
  - Radii, shadows that switch with the theme, the dark-mode selectors, touch sizes and the focus
    classes.
  - The utility that holds a skeleton back, so a fast page never flashes one.
- **What the patches change.** A table, Component | Change | Why, for every patched component.
  Every row gives its reason, unless the change is token colours alone.
- **Design system to product.** A table, In the design system | In the product, for every component
  in the catalogue. Then the rule for gaps: where the product has no component yet, the
  design-system card is the spec.
- **Rules for the code.**
  - Server components by default, with client code only in the leaf that needs it.
  - A metadata title on every page.
  - The state people would share lives in the URL.
  - Numbers go through the formatter. Dates and times use the business's time zone.
  - No raw values. A value the tokens lack goes into the system first.
  - Icons hidden from screen readers beside words, and named when they stand alone.
  - Images at their real sizes.
  - Brand marks from the system's assets, never redrawn.
- **Things that catch people out.** Every trap found while building and checking the starter, each
  with its symptom and its fix.
- **Other platforms**, when the system carries platform specs (`11-platform-layer.md`). A pointer to
  them, and the rule that native code is generated on demand, never kept by default.

**Fill in from the brand.** The product's name, set once. The font files and their licence. The
character stills, if any. Versions and steps from the run on a fresh project, never from memory.

**The bar.** A good one was run, not remembered.

| Generic | Good |
| --- | --- |
| "Install the dependencies and configure the theme" | Numbered, exact commands with pinned versions, run on a fresh project before the page was written |
| "Use the design tokens" | "No brand colours as utilities: `text-brand-orange` can't be written, because it is [n]:1 on white." |
| "Components are customised to match the brand" | Every patch in a table, each with its reason |
| "Known issues" | Each trap with its symptom and fix: "The theme removes Tailwind's default palette, so `bg-blue-500` silently does nothing. Use a role." |

**Snippet, for [Brand].**

```md
| Component | Change | Why |
| --- | --- | --- |
| badge | The badge radius, the system's tones, `dot` | Badges are read, not pressed |
| tabs | Underline by default, on a hairline, with the panel's own focus ring | A grey pill list reads as a segmented control |
```

---

## Quality gates

The record that every component and screen passed two independent gates, and the method anyone can
run again. `08-quality-gates.md` sets the method and the bar. This document is the system's own
copy, plus its record, round by round.

**Headings, in order, and what each holds**

- **The opening.** The two gates and the ground each owns. Impeccable judges craft: whether it looks
  and reads like a considered product, and holds up at the edges. ui-ux-pro-max checks the rules:
  accessibility, interaction, forms, navigation, charts, the stack. Run both, record both.
- **Who owns what.** A table, Core area | Impeccable | ui-ux-pro-max. Its rows: overall quality,
  visual craft, deterministic checks, accessibility, touch and interaction, edge cases, copy,
  motion, forms, navigation, charts, the stack. It says what a gate deliberately does not do here:
  ui-ux-pro-max's style generator stays off, because the brand is fixed.
- **Running them.** The exact detector commands at each width and theme, for a running app and for
  static pages, and what CI needs. How the review gates run: each in its own context, with evidence
  for every finding. How to search ui-ux-pro-max's rules. The behaviour checks neither tool
  automates, and how many scripted checks the system keeps.
- **What passing means.** A table, Gate | Pass, copied from the bar in `08-quality-gates.md`, every
  threshold as a number.
- **This system's record.**
  - A table of rounds (Round | Critique | Audit | Issues | Rules), every round including the first,
    bad numbers and all.
  - A table of deterministic checks with their counts: detector scans and findings per target, axe,
    behaviour checks, contrast pairs, formatter parity cases.
  - The tool versions for every round, and which scores ran single-context.
  - *What the gates changed*, grouped by gate, each item a concrete change.
  - *Accepted deviations*, a table, What | Decision | Why, naming the owner.
  - *Still open*, each item concrete, with its owner.

**Fill in from the system.** Everything comes from `reviews/round-N/record.md` and the
deterministic checks' output. Never a score a round did not produce. The owner is `meta.owner`
until the system has a named maintainer.

**The bar.** A good one shows every round, the bad ones included.

| Generic | Good |
| --- | --- |
| "Passed an accessibility review" | "axe: no violations on any board, light and dark, at 1440, 820 and 390." |
| The final score only | Every round, the first included, so the next team knows how many rounds the bar takes |
| "A few known issues remain" | Accepted deviations, each with a decision and a reason, and open items, each with an owner |
| "Reviewed with AI tools" | Each tool's version, per round, and which scores ran single-context |

**Snippet, for [Brand].**

```md
| What | Decision | Why |
| --- | --- | --- |
| Body text is 14px on phones | Interface text stays `body` at every width; reading text is `body-lg` everywhere; inputs are 16px on touch screens | On a phone, interface text is labels, rows and values. 16px everywhere would push a third of every list below the fold |
```

---

## Brief for build agents

The brief someone pastes at the top of any task that asks an AI agent to design or build a product
on the system. It is short on purpose. The system carries the detail; the brief sets the bar and
leaves the agent room to think. Long, step-by-step briefs get literal, generic screens.

**Headings, in order, and what each holds**

- **The opening.** When to paste it, that the brackets get filled, and why it is short.
- **The brief**, in one fenced block.
  - What the product is, who it helps do what, the outcome, and what it replaces.
  - The source of truth (the system's link) and the documents to read before designing anything:
    the README, Writing for the product, Screen patterns, Reporting and data, Building it. Build
    from the starter. Where the system has a way to say something, use it.
  - *Hold these lines*, six bullets:
    - Tokens only. Light by default, and dark works too.
    - One primary action per view, plus the brand's hardest visual bans (the colours that are never
      text, the display-face rule).
    - Real or labelled.
    - The assistant drafts, and a person approves each action, or the rule behind it.
    - Copy follows Writing for the product: sentence case, digits, the locale's spelling, no em
      dashes, no exclamation marks, none of the banned words.
    - Every screen has its loading, empty, error and partial-outage states, works at 390px wide,
      and works by keyboard alone.
  - *Pass the gates*: the pass lines from `08-quality-gates.md`, then the Definition of done, with
    the review record in the hand-over.
  - Room to think. The agent decides the composition: what each screen leads with, what can go, how
    the workflow feels. If the system can't express something, the agent proposes a component,
    shows it, says why, and keeps it in the system's language. It asks before leaving a gate
    failing.
- **Filling it in.** Who and what in the people's own words, not features. What it replaces, which
  tells the agent what "faster" means. The data attached: the systems, a sample export, the fields
  that matter, and who must never see what. The first screen, named if one matters most. Otherwise
  the agent proposes the flow, and that is reviewed first.
- **Reviewing what comes back.**
  - Read the review record before the screens. No record, or a gate marked skipped, means it isn't
    done.
  - Check three moments by hand: the first screen with no data, the error when a source is down,
    and the main task on a phone.
  - If it looks like any SaaS product painted in [the brand's colours], send it back with Screen
    patterns and Writing for the product open. Ask what this product should lead with.

**Fill in from the brand.** The hardest visual bans from the README, the locale's spelling, the
system's link once published, and the pass lines from the bar.

**The bar.** A good brief is short and sets the bar. A long one gets literal, generic screens.

| Generic | Good |
| --- | --- |
| A long spec, screen by screen | One screen of brief: the job, the lines to hold, the gates, and room to decide the composition |
| "Keep it on brand" | "Tokens only. No raw colours, radii, shadows or fonts." |
| "Test it thoroughly" | Three moments checked by hand: no data, a source down, the main task on a phone |

**Snippet, for [Brand].**

```text
You're building [Product]: a [Brand] tool that helps [dispatchers] [plan the day's jobs], so that
[no technician drives to a cancelled job]. It replaces [a whiteboard and two spreadsheets].

Hold these lines:
- Tokens only. No raw colours, radii, shadows or fonts. Light by default; dark must work too.
- One primary action per view. [Brand orange] is never text. One [display face] moment per screen.
```

---

## Definition of done

The lines a screen or feature meets before anyone calls it done, with the review record attached.
"Mostly" is not done. Write down what is left and who owns it.

**Headings, in order, and what each holds.** Every line is something a person can mark true or
false by looking, or a script can check. Each draws on the document that owns the rule.

- **The job.**
  - The screen answers its question first: what is happening, what it means, what to do next.
  - One primary action, named for its result.
  - Destructive actions confirm only when they can't be undone, and say what goes and how many.
  - The assistant, where present, drafts, shows its sources and steps, and can be stopped. When it
    can't finish, it says where it stopped and offers Try again. Anything it would send, pay,
    approve, change elsewhere or delete waits for a person to approve it, or the rule behind it.
- **Words.** Sentence case, the locale's spelling, digits, the status words. No em dashes,
  exclamation marks, emoji, "Submit", "Click here", "Something went wrong" or banned words. Errors
  name the system, what happened and the fix, and keep what was typed. Every figure says where it
  came from and when. Sample data carries the badge, with invented names in brackets.
- **Look.** Tokens and components only: no raw colours, radii, shadows or font sizes. The brand's
  colour bans and the display-face rule. Pills only for things you press, or the brand's own shape
  signal. Cards never inside cards. No small uppercase label above a heading. Both themes checked.
  Characters only in their moments, one per screen.
- **States.**
  - Loading: nothing under a second, skeletons in place, the system named when waiting on one.
  - Empty: nothing yet, no results, all done.
  - Errors: one field, one section, a source down with the last good data and its time, the whole
    page, no access, not found.
  - Long names, big numbers and unbroken strings wrap or truncate, with the full text available.
  - Missing values say "Not set" or "No data", never zero.
- **Sizes.** No sideways scrolling at 1440, 1280, 1024, 820, 640 and 390px wide: the three gate
  widths, and each width where the shell changes. Under 1024px the
  rail is a drawer behind a menu button. On phones, tables become lists and controls grow to their
  touch sizes. Text zooms to 200% without loss.
- **Access.**
  - Keyboard alone: everything reachable in reading order, a visible focus ring everywhere, Escape
    closing the top layer, focus returning to what opened it, a working skip link.
  - Focus is never lost or hidden, and single-key shortcuts can be turned off.
  - Screen reader: one `h1` and a real heading outline, named landmarks, and every control named
    with its visible words in the name. Counts and changes in words, errors and status announced,
    and only news interrupting.
  - Contrast: text 4.5:1 (large text 3:1), controls and focus 3:1, in both themes. Never colour
    alone.
  - Reduced motion: fades only, and loading indicators slow down rather than stop. Forced colours:
    focus, the current page, selected states and the wordmark still show.
  - Targets: at least 24px everywhere. On touch screens nothing pressable is under 40px, and
    default controls are 44px.
- **Data.** Numbers through the formatter: exact in tables, compact on cards and axes, rate changes
  in points. Charts follow Reporting and data: the right form, fixed series order, one axis, a
  legend for two or more series, a takeaway in the accessible name, a table view, and loading,
  empty and error states.
- **Engineering.** The build passes with TypeScript strict, and lint reports nothing. Every page
  has a metadata title. Tabs, filters, sort, page and the open record live in the URL. Anything
  that reads the URL or the request sits inside a Suspense boundary, and the dev server shows no
  warnings. Server components unless a leaf needs the client. Images with their sizes. No secrets
  or personal data in URLs or logs.
- **Gates.** The pass lines from `08-quality-gates.md`, and the review record attached.
- **Review record template.** A fenced block with these fields: the screen or feature; the date and
  the reviewer, person or agent; tools and versions; detector findings at each width and theme. The
  critique's total, lowest heuristic, P0 to P3 counts, and whether it ran single-context.
  ui-ux-pro-max's counts and the rules checked. Behaviour checks. What was fixed in this pass, and
  what was left open, with its owner.

**Fill in from the brand.** The colour bans and display-face rule from the README, the locale, the
widths from the shell and the bar, and the pass lines from `08-quality-gates.md`.

**The bar.** Every line can be marked true or false. None needs a judgement call.

| Generic | Good |
| --- | --- |
| "Accessible" | "Keyboard alone: everything reachable in reading order, a visible focus ring everywhere, Escape closes the top layer, focus returns to what opened it, the skip link works." |
| "Responsive" | "No sideways scrolling at 1440, 1280, 1024, 820, 640 and 390px wide." |
| "Handles edge cases" | "Long names, big numbers and unbroken strings (emails, URLs) wrap or truncate with the full text available." |
| A checklist and no record | The review record template, filled in and attached |

**Snippet, for [Brand].**

```text
Screen or feature:
Date, reviewer (person or agent):
Tools and versions:
Detector: [findings at 1440, 820 and 390, light and dark]
Impeccable critique: [Nielsen total, lowest heuristic, P0 to P3 counts, single-context or not]
ui-ux-pro-max: [Critical / High / Medium / Low counts; rules checked]
Behaviour checks: [keyboard, focus return, Escape, phone navigation, reduced motion]
Fixed in this pass: [list]
Left open, with owner: [list]
```

---

## From brand book to product

The record of what the product keeps from the brand book, what it changes, and why, so nobody
"fixes" a product back to the brand book. It ends with what would help most if the brand files were
updated.

**Headings, in order, and what each holds**

- **The opening.** What the brand source is (the book or repository, and its date) and what it was
  made for: the website, proposals, slides. Then the stance. Read as a product system it leaves
  gaps, and a few of its values fail when people work in them all day.
- **What carries straight over.** A short list: the palette as the `brand-*` primitives, the faces
  and where each is used, and the brand's modes with what each becomes in the product (with
  ratios). Then the characters, and the voice with its banned words.
- **Colour, Type, Shape, space and marks, Words.** Four headings, each a table, The brand book |
  The product | Why, one row per departure. A colour row's reason quotes its measured ratio. The
  rows the last system needed show what to look for:
  - *Colour*: a brand colour that fails as text or under white text; a highlight kept apart from
    warnings. Muted text and borders that fail on the brand's dark mode; borders too faint for
    control edges. Then the shadow colour, missing status and chart colours, and one theme per mode
    becoming two full themes.
  - *Type*: the marketing scale against the product's; tracking at small sizes; the display face on
    cards against one moment per screen; figures; font file formats.
  - *Shape, space and marks*: corner rules against shape as a signal, and the brand's spacing names
    against the framework's. Logo files with clear space inside the viewBox against tight copies
    for interface use. Icons, where the brand has no guidance.
  - *Words*: small numbers in words against digits on screen; banned-word lists merged into one;
    the copy formula against three beats.
- **Code.** What the brand's own code ships (a framework preset, marketing components) and what the
  product uses instead (the theme generated from the product tokens, the starter), with the reason.
- **The characters**, when the brand has them. How the product uses the brand's collection, pointing
  to their section for the budgets.
- **Worth fixing in the brand files.** An ordered list for whoever owns the brand files, most
  helpful first.

**Fill in from the brand.** Every decision in `product/product.json` and the translation phase
(`02-brand-to-product.md`), the ratios from `product/contrast-audit.json`, and the brand source with
its date. Every departure the translation made gets a row. A departure without a row is the one
somebody undoes.

**The bar.** A good one gives every departure its reason. A generic one lists changes.

| Generic | Good |
| --- | --- |
| "Adapted the palette for accessibility" | "White on [brand orange], and [brand orange] text on white, are both [n]:1", as the reason on the row that takes it off text |
| "Simplified the type scale" | "Working screens are dense; the website scale gives a dashboard three shouting headings" |
| A list of changes | Three columns on every row, with a measured number in the reason wherever one exists |
| Nothing for the brand team | An ordered list of what to fix in the brand files, most helpful first |

**Snippet, for [Brand].**

```md
| The brand book | The product | Why |
| --- | --- | --- |
| [Brand orange] for buttons, accents and links | [Brand orange] is the `brand` button with dark text, `series-1`, `selected-line` and illustration. The primary is [brand ink]. Links are `link`. | White on [brand orange], and [brand orange] text on white, are both [n]:1 |
| Spell out one to nine | Digits in the interface; the brand rule stays for emails, docs and long help text | People scan interfaces |
```

---

## Before you call the written system done

- [ ] Every document is present, in order, under its fixed title, and every cross-reference by
      title resolves. The characters section exists only if the brand has characters or
      illustration.
- [ ] No adjective stands where copy belongs. Every situation a document names has its exact words.
- [ ] All nine states have words and a badge tone, and no word serves two states. Search the canvas
      and the starter: they use no other status words.
- [ ] Every rule that restricts something says why. Every ratio quoted matches
      `product/contrast-audit.json`.
- [ ] Every number is a measurement or a decision on record. None comes from memory.
- [ ] Every token, component, prop and file the documents name exists under that name in the
      tokens, the catalogue and the starter.
- [ ] The README states each rule in the same words as the section that owns it. No rule appears
      two ways.
- [ ] The documents pass their own writing rules. Search them for em dashes, exclamation marks,
      Title Case headings and every banned word, and check the examples use the locale's formats.
- [ ] Systems from the intake are spelled as they spell themselves. Invented people, clients and
      places are in brackets. Every gap is bracketed and on the open questions list.
- [ ] Every example names this brand's products, systems and nouns. Nothing is carried over from
      another brand's system.
- [ ] The approval rule reads the same in the README, Writing for the product, Screen patterns, the
      brief and Definition of done. The assistant sections match the AI stance and
      `10-ai-catalogue.md`.
- [ ] The Building it steps were run on a fresh project, and the page's versions are the ones that
      run used.
- [ ] Quality gates matches every `reviews/round-N/record.md`, tool versions included. Its pass
      lines match `08-quality-gates.md`, and so do the brief's and Definition of done's.
- [ ] Every departure in `product/product.json` and the translation phase has a row, with its
      reason, in From brand book to product.
- [ ] The README's first two paragraphs say what the system is for, where the brand shows up, and
      the rule for adding things.
