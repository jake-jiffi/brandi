# Operating a system

A product system is never finished. Products ship, modules are added, platforms change their
guidance, and the canvas, the system and the code drift apart unless something checks them. Five
modes keep it current. Each runs as a round of its own, with a record.

## The source of truth moves

Until the first product ships, the system leads: it is designed, and the code follows. Once a
product ships, that product becomes the reference build. Its tokens are copied as they are, boards
are generated from its code, and the system re-syncs from it. Say in the record which way the source
of truth runs, and when it changed.

## module: a new product area

1. **Options.** Draw the hard screens four ways (A to D), each title naming its weakness. The person
   picks, and the pick is recorded on the canvas. Hard is a screen no written pattern covers yet:
   a module whose screens a pattern already covers reuses it, and draws a set only when that
   pattern does not fit (`06-canvas.md`, section 4). The round record names the modules that drew
   a set and those that reused a pattern.
2. **Pages.** Every page of the pick, with the real components.
3. **States.** A states board for the module, its title listing every state it covers, with the
   edge cases drawn and the outside systems' failure modes among them. Add the module to its
   surface's `modules` in `product/product.json` when it opens, so the coverage gate asks for that
   board (`08-quality-gates.md`, Coverage); a module nobody listed can go without one unnoticed.
4. **Gates.** A round, to the full bar.
5. **Promote.** Anything new the module needed that another product could use goes into the system:
   a component with its README, its preview in both themes, its platform specs and its pairs. Then a
   version bump and a changelog entry.

Before a module starts, run `standards` (below): a module built on last month's platform guidance
starts out of date.

## sync: pull a shipped product back

When a product has shipped, the system re-syncs from it:

- Copy the shipped tokens as they are, and record the repo, commit and method.
- Compare the shipped components with the system's: new ones, changed props, removed ones.
- Merge, keep the notes the system carries (behaviour rules, accepted deviations), and list
  removals before deleting anything. The Design System type supports a GitHub sync and a re-sync
  that merges, keeps notes and lists removals; read its current instructions before using it.
- Run `$A product audit` on the synced tokens. A shipped product with accepted contrast misses is a
  finding to raise with its team, not a value to copy silently into the system's record.

## drift: canvas against system against code

Run it every round. It compares:

| Compared | Against | A failure looks like |
| --- | --- | --- |
| Token values copied into the canvas | `product/tokens.json` | A canvas copy of `tokens.css` that predates a token change |
| The starter's `globals.css` | `product/tokens.json` | A value hand-edited in `globals.css` |
| Copies of the bundle and its CSS | Each other, by checksum | A fix visible in one place and not another |
| Components mounted on boards, with their props | The system's component manifest | A board mounting a component or a prop the system does not have |
| Components in the starter | The system's catalogue | A product component with no system card, or the reverse |
| A value written beside a size token's name in the docs and CONVENTIONS.md (`` `radius-md` (15px) ``, or a table row) | `product/tokens.json` | A README that still gives the radii from before a shape change |
| Screens on the canvas | The pattern definitions in the docs, and the starter's routes | Settings drawn one way on the canvas, another in the docs, a third in code |

The last system found the last row the hard way: its canvas, docs and starter gave three different
answers for one settings page, and a review round scored Consistency at 2 out of 4 until Settings was
rebuilt to match. Generating canvas screens from the same pattern definitions as the docs and the
starter is what stops it recurring.

A definition with a prop row typed `native` passes its element's own props through (placeholder,
autocomplete, readonly), so a board may set them. Any other definition is held to the props it
declares.

Report each difference with both values and where each lives, and fix it at the source: the tokens,
the component definition or the pattern. Never patch a copy.

## round: run the gates

The full method is in `08-quality-gates.md`. A round ends with:

- the record (`product/rounds/round-N/record.md`, written by `$A product round`) and a summary row
  in the quality-gates section;
- a version bump (a new component or role is a minor version; a breaking rename is a major one);
- a changelog entry saying what changed and why;
- one publish batch per artifact, after the person approves. Publishing piecemeal through a round is
  slower and harder to reason about than one batch at the end.

## After every round

A round on a real brand tests Brandi as much as the brand. Most of what the pilot brands found was
the kit, a generator or a gate, and it showed only because that brand had a trait the kit's fixture
lacks. What is not the brand's own goes back into Brandi, so the next brand starts with it.

1. **Classify every finding** as one of:
   - **kit**: a component or its check, in `<brandi>/product/kit`.
   - **generator**: what a command writes: the tokens, the starter, the boards, the book.
   - **gate**: a check or scan that passed what it should have failed, or failed what was right.
   - **reference**: the skill taught the wrong thing, or nothing.
   - **brand only**: this brand's own decision or asset. It stays in the brand's record, and Brandi
     does not change.

   When in doubt, it is not brand only: a defect another brand could hit is Brandi's.
2. **Take each of the others back into Brandi, with four things:**
   - the fix, and a check or test that fails without it. Run it on the unfixed code and watch it
     fail.
   - a trait fixture in `<brandi>/product/traits` when a brand trait exposed it, failing on the
     unfixed kit (its README says how).
   - an entry in `<brandi>/product/lessons.json`: what broke, in one sentence with no client's name,
     copy or colours; the trait; the guards by their exact names; and where the rule is taught.
   - the reference text that teaches the rule, under the heading the entry names.

   `<brandi>/tests/productlessons.test.mjs` holds every entry to the code, so a guard renamed or
   dropped fails the suite. Brandi's repo is public: nothing taken back names a client or carries a
   client's copy or colours, in the code, the fixtures or the commit message.
3. **Run the traits before the next round**, and start it only when every row passes:

   ```bash
   node <brandi>/product/tools/traits.mjs --scratch <dir> --modules product/starter/node_modules
   ```

   It writes each trait's tokens, runs the kit loop on the components the lessons name, and prints
   one row a trait. A failing row is a finding of its own, classified the same way.
4. **Note it in the fix plan.** Each finding in `product/rounds/round-N/fix-plan.md` carries its
   class, and its lesson id once it is in Brandi.

Working where Brandi itself cannot be changed (the plugin installed, not its repo), write each
finding up for Brandi's maintainers in the same four parts, and carry on with the round.

## standards: keep the platform layer current

Monthly, and before every new module:

1. For each platform the system targets, fetch the guidance sources `11-platform-layer.md` lists and
   read their version markers (release notes, "What's new" pages, changelogs, version numbers).
2. Compare them with the version recorded on each platform spec.
3. For each change: what changed, which components it touches, and what it means for the system
   (a new minimum target size, a new navigation pattern, a retired control).
4. Update the affected specs, record the new versions, and add a changelog entry.
5. Check the web stack too: the starter's framework, styling and component library releases, the
   detector, axe and ui-ux-pro-max.

The skill carries the procedure. Setting up the monthly schedule (a scheduled task in Claude Code or
Cowork) and acting on what it finds are the system owner's job: upkeep sits with whoever manages the
system.
