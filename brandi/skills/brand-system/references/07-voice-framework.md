# 07 · Voice framework

Verbal identity. The half of the brand that ships every day, in emails nobody designed, by
people who will never open the PDF.

A voice document is judged on one thing: does a writer who has never met the founder produce
something that sounds like the brand? Everything below exists to make that true. Adjectives do
not make it true. Examples do.

Read `01-evidence-protocol.md` first. Voice derived from evidence gets a confidence label.
Voice derived from adjectives gets a confidence label too, and it is `Low`.

---

## 1. Voice is constant, tone flexes

- **Voice** is who the brand is. It does not change. It is the same on the pricing page and in
  the cancellation email.
- **Tone** is how the voice modulates for the reader's situation. It changes constantly.

The distinction is the whole mental model for enforcement. When a client asks for something
"more casual", they are asking for a tone change. If you change the voice to get it, you have
broken the brand to satisfy one brief.

---

## 2. Derive voice from evidence, not adjectives

The default failure is a workshop where someone says "friendly, professional, approachable"
and everyone nods. Those three words describe every business that has ever existed and they
constrain nothing.

### Where voice actually comes from, ranked

| Source | Why it is good | Tier |
|---|---|---|
| Their replies to reviews | Unpolished, written under mild pressure, and public. The single best source for a small business. | `P` |
| Their emails and quotes to customers | How they actually talk to someone who is deciding | `S` |
| Their SMS and DMs | The most compressed and therefore most characteristic writing they do | `S` |
| Existing site or profile copy | Often written by someone else, so weight it lower than it looks | `P` |
| Social captions they wrote themselves | Good, if you can confirm they wrote them | `P` |
| A transcript of them explaining the business | Gold for rhythm and vocabulary. Poor for structure. | `S` |
| Adjectives chosen in a workshop | Last resort. Confidence caps at `Low`. | `S` |

### The method

1. **Collect five to ten real pieces.** Fewer than five and confidence caps at `Medium`.
2. **Mark up what recurs.** Sentence length. Where they start a sentence. Whether they use
   contractions. Whether they apologise. Which words appear repeatedly. Whether they use the
   customer's name. Whether they hedge or commit.
3. **Name the pattern, not the impression.** "Short declarative sentences, no hedging, one
   concrete detail per message, never apologises for policy" is a pattern. "Warm but
   professional" is an impression.
4. **Turn each pattern into an attribute** with a "not" half (§3).
5. **The 150-word test.** Pick one concrete surface (a welcome email, a 404 page, a
   cancellation confirmation) and write it *as* the brand. No descriptions of the voice, just
   the text. If you cannot write it, you do not yet have a voice, you have a word list.
   Write the voice section of the brand book in the voice. A voice chapter that describes
   warmth in corporate prose has disproved itself on the page.
6. **Label the gap between actual and aspirational.** If the brand does not sound this way
   today and has no plan to shift, the document is fiction. Say which attributes are
   descriptive (`E`/`P`, this is how they already write) and which are aspirational (`D`, this
   is the decision to change), and log the aspirational ones in the decision log.

---

## 3. Voice attributes

Three to five. Never more, because past five nothing is load-bearing.

Each attribute is a pair, `X, not Y`, where `Y` is the failure mode when `X` is overdone. The
"not" half is what saves a writer from overshooting. "Confident" alone produces swagger.
"Confident, not arrogant" tells the writer where the line is.

### The block format

```markdown
### 2 · Plain, not blunt

- **We are:** we say the thing in the fewest words that still leave room for the person.
- **We are not:** curt. Short is not the same as cold, and a two-word answer to a worried
  question reads as dismissal.
- **Do:** "He was nervous about the dryer, so I towel-dried him and gave him a break. He's
  fine now."
- **Don't:** "Dog was anxious. Towel dried. All good."
- **Evidence:** [PUBLISHED: Google review reply | 2026-06-12] "He was a bit worried about the
  clippers so we took it slow and did the face last."
- **Confidence:** High
```

Five fields, all required. An attribute with no evidence line is aspirational and must say so.
An attribute with no do/don't pair has not been made usable yet.

### Choosing the set

Generate your own. The list below is calibration, not a menu, and picking off a menu is how
every brand ends up with the same four.

```
Confident, not arrogant       Direct, not blunt          Warm, not saccharine
Witty, not sarcastic          Plain, not basic           Honest, not harsh
Playful, not silly            Practical, not dull        Precise, not clinical
Patient, not condescending    Certain, not rigid         Specific, not pedantic
```

### The distinctiveness test

Score a recent piece of the brand's own copy 1 to 5 against each attribute. Below 3 on any
attribute means the copy is off-voice.

Then run the same test on a **direct competitor's** copy. If their copy scores well on your
attributes, your attributes are not distinctive. They are category table stakes wearing a
voice costume. Go back and find the ones that only fit this brand.

This test takes four minutes and it kills more generic voice documents than anything else in
this file.

---

## 4. The tone matrix

Tone varies on two things at once, and most tone matrices only handle one of them.

- **Context.** What surface is this? A pricing page and an error message have different jobs.
- **Reader emotional state.** What is the person feeling when they read it? Confused,
  delighted, worried about money, angry, grieving, bored, in a hurry.

The emotional-state column is the one that stops a matrix from being decorative. It is also
what tells a writer *why* the dial moved.

Three dials, per the standard model, plus a warmth level under energy:
- **Formality:** High / Medium / Low
- **Energy:** High / Medium / Warm / Low
- **Technical depth:** High / Medium / Low

| Context | Reader is feeling | Formality | Energy | Depth | The rule | Never |
|---|---|---|---|---|---|---|
| **First contact / onboarding** | Curious, slightly unsure they are in the right place | Low-Med | Warm | Low | Confirm they are in the right place before anything else. One next action. | Enthusiasm they have not earned yet. No exclamation marks. |
| **Marketing / hero** | Skimming, unconvinced | Medium | Medium | Low | Signature voice fully on. Specific over clever. | Hype adjectives. Anything the proof bank cannot support. |
| **Product / UI copy** | Task-focused, mildly impatient | Low | Low | Medium | Direct and brief. Verb-first. The interface is not the place for personality. | Jokes. A voice that costs the reader a second. |
| **Support / help** | Stuck, slightly embarrassed | Low-Med | Warm | Medium-High | Thorough, no condescension. Assume competence, explain anyway. | "Simply", "just", "obviously". Every one of them says "you should have known this". |
| **Error** | Interrupted, possibly at fault | Low | Low | Medium | What happened, why, what to do next. In that order, three sentences. | Apology theatre. "Oops!" "Sorry about that!" Blame, in either direction. |
| **Empty state** | Uncertain what to do | Low | Medium | Low | Say what goes here and how to put it there. | "No items found." A shrug is not a state. |
| **Celebration / success** | Pleased, momentarily attentive | Low | High | Low | Brief. Name what happened, point at the next thing. | Confetti in the copy. Sustained celebration. Nobody wants a paragraph. |
| **Billing / price change** | Alert, defensive, calculating | Medium | Low | Medium | Lead with the number and the date. Then the reason. Then the option. | Burying the number. "We're excited to announce updated pricing." Passive voice. |
| **Legal / policy** | Wary, skimming for the catch | High | Low | High | Plain-language summary sitting beside the binding text. The summary is not the contract, and say so. | Plain language that changes the meaning. Legalese with no summary at all. |
| **Cancellation / offboarding** | Decided, possibly annoyed | Medium | Low | Low | Quiet, quick, no friction. Confirm what happens to their data and their money. | Jokes. Guilt. A retention offer in the confirmation. |
| **Bad news / incident** | Affected, wants facts | Medium | Low | Medium-High | What happened, who it affects, what we are doing, when we will next update. Timestamped. | "Some users may have experienced." Passive constructions. Silence. |
| **Review reply, positive** | Generous | Low | Warm | Low | Thank them for something specific from their review. Two sentences. | Copy-paste. The same reply under twelve reviews is worse than no reply. |
| **Review reply, negative** | Angry, and public | Medium | Low | Low | Acknowledge the specific thing. State what you will do. Move it off the platform. Never argue. | Defending yourself in public. Explaining their experience back to them. |
| **404 / dead end** | Mildly annoyed | Low | Medium | Low | Self-aware, one line, point home. | An elaborate joke. Nobody arrived here for entertainment. |

**How to use it:** the writer finds the row, reads the emotional state, and lets that pick the
dials. The "Never" column is what gets used most, so keep it specific.

---

## 5. Vocabulary

Three tables. All three go in the brand book, and the third is the one that gets used weekly.

### Words we use

Not a thesaurus. Each entry earns its place by carrying meaning the alternative does not.

| We say | Not | Why |
|---|---|---|
| appointment | booking, session | It is a time set aside for one dog. "Session" is a spa word. |
| your dog, or the dog's name | your fur baby, pooch, doggo | The category's affection vocabulary. Six of six competitors use it. |
| groom | style, pamper, treatment | Plain. It is what the job is called. |
| I / we | the team, The Wash House | One person and one part-timer. The corporate plural is a lie at this size. |
| takes about ninety minutes | quick, efficient | A number is a promise. An adjective is not. |

### Words we never use

| Never | Because | Instead |
|---|---|---|
| fur baby, pooch, furkid, doggo | Category cliché, and it patronises the owner | the dog's name |
| pamper, spa day, indulge | Prices the service as a luxury it is not | groom, wash, tidy up |
| simply, just, easy | Tells the reader their difficulty is their fault | delete the word entirely |
| unfortunately | Softens bad news into vagueness | say the thing |
| we strive to, we're committed to | Intention posing as a fact | say what you actually do |
| unprecedented, revolutionary, game-changing | Unearned, and unprovable | delete |
| reach out | Corporate softening of "call" or "email" | call, email, text |
| please note | Precedes a sentence that would be clearer alone | delete and start the sentence |

### How we say hard things

The most useful page in any voice document. Populate it with the situations this business
actually faces, not generic ones.

| Situation | Never | Say |
|---|---|---|
| Price increase | "We're excited to announce updated pricing." | "From 1 October a full groom goes from $95 to $105. It is the first increase in two years. Nothing else changes." |
| We made a mistake | "We apologise for any inconvenience caused." | "I cut his coat shorter than you asked. That is on me. Your next groom is free, and I have put a note on the file." |
| We cannot help | "Unfortunately we are unable to accommodate that request." | "I can't do that one. [Name] on Albion Street handles doubles and would be a better fit." |
| Fully booked | "We're currently at capacity." | "Nothing until the 14th. I'll text you if something opens up sooner." |
| The dog was difficult | "Your dog was uncooperative." | "He found the dryer hard today, so I towel-dried and stopped early. He wasn't distressed, just done." |
| Deposit is non-refundable | "Deposits are strictly non-refundable as per our terms." | "The deposit holds the slot, so I can't refund it inside 24 hours. Tell me as early as you can and I'll move it instead." |
| Late payment | "Your account is overdue. Please remit payment." | "The invoice from the 3rd is still open. Here's the link. If there's a problem with it, tell me." |

Rules visible in every row: the number comes first, the passive voice is gone, the policy is
stated as a decision a person made rather than a rule that fell from the sky, and every "no"
carries an alternative.

---

## 6. Grammar and mechanics

Every one is a decision. Undecided means every writer decides differently, which is how a
brand ends up looking like four brands.

| Decision | House setting | Rationale | Example |
|---|---|---|---|
| **Spelling** | Australian English. `-ise`, `-our`, `-re`. | The audience is Australian. American spelling reads as an imported template. | colour, organise, centre, licence (noun) / license (verb) |
| **Contractions** | Yes, always. | Not using them is the fastest way to sound like a form letter. | "We're closed Monday", not "We are closed Monday" |
| **Sentence length** | Target 12 to 18 words. Hard cap 25. | Long sentences hide the point. The cap forces a decision about which clause matters. | Split at the "and". |
| **Paragraph length** | Three sentences maximum in customer-facing copy. | Read on a phone, at a red light. | |
| **Em dashes** | Never. | House rule across all Brandi output. Commas, full stops or parentheses. | "It takes ninety minutes, sometimes less." |
| **Oxford comma** | Only where it prevents a misreading. | Australian convention. Consistency matters more than the choice. | "wash, cut and dry" / "for my dogs, Nadia, and the vet" |
| **Headings** | Sentence case. | Title Case Reads As A Press Release. | "What to expect on the day" |
| **Buttons and links** | Sentence case, action verb first, no full stop, no exclamation mark. | A button is an instruction. | "Book an appointment", not "Book Now!" |
| **Numerals** | Words for one to nine, numerals from 10. Always numerals for money, times, measurements, ages and quantities in a list. | Reads naturally in prose, scannable in facts. | "three dogs a day" / "90 minutes" / "$105" |
| **Money** | `$105`, no decimals when whole. Thousands with a comma. Ranges with "to". | Decimals on a round number read as a bill. | "$95 to $140", not "$95.00-$140.00" |
| **Dates** | `3 October`, or `3 October 2026`. Never `3/10/26`. | Numeric dates are ambiguous across regions and unreadable at a glance. | "Closed 3 to 6 October" |
| **Times** | `9am`, `5.30pm`. No leading zero, no colon, no space, lowercase. | Australian convention. | "Open 8am to 4pm" |
| **Phone** | `04XX XXX XXX`, `(03) XXXX XXXX`. | Grouped the way people read them aloud. | |
| **Exclamation marks** | One per page maximum, and prefer zero. Never in error, billing or legal copy. | An exclamation mark is a claim about the reader's feelings. | |
| **Emoji** | Not in the product, not in email subjects, not as bullets. Permitted in social replies if the owner already writes that way. | Emoji as a bullet marker is a template tell. | |
| **ALL CAPS** | Acronyms only. Never for emphasis. | Caps do not emphasise, they shout and they slow reading. | |
| **Ampersand** | In the wordmark only. Never in body copy. | | "wash and dry", not "wash & dry" |
| **Pronouns** | "I" when it is one person doing the work. "We" only when it is genuinely more than one. Second person for the reader, always. | The corporate "we" from a sole trader is the most common small-business voice error. | |
| **Voice** | Active. If the actor is missing from a sentence, put them back. | Passive constructions are where accountability goes to hide. | "I cut it too short", not "it was cut too short" |
| **Hyphens and ranges** | Hyphen for compound modifiers. The word "to" for ranges in prose, an en rule in tables. | | "two-hour slot", "9am to 5pm" |

Where an existing house style already covers one of these, defer to it and record the deferral
rather than restating it.

---

## 7. Three levels of the same thought

The same claim, the same proof, at three lengths. Every important idea in the brand gets all
three, written together, so they cannot drift apart.

- **One line.** 8 to 14 words. Works as a hero, a bio, a sign, a text reply, the thing the
  owner says at a barbecue.
- **One paragraph.** 40 to 70 words. Works as an About intro, an email opener, a Google
  Business description, a proposal summary.
- **One page.** 250 to 400 words. Works as the About page, the story section, a pitch.

**The rule:** if the page version says something the line version does not support, the
strategy is broken and the copy is fine. Fix the strategy. This is the cheapest strategic
diagnostic in the whole system and it costs one afternoon.

### Worked triple

**One line**

> One dog at a time. Yours is the only one here.

**One paragraph**

> The Wash House books one dog into the salon at a time. No other dogs in the room, no cage
> dryer, no waiting in a crate for someone to get to you. A full groom takes about ninety
> minutes and we book two hours, because dogs that find this hard need the extra half hour and
> should not be rushed through it. If your dog has had a bad time somewhere else, this is the
> difference.

**One page**

> Most grooming salons run four or five dogs at once. It is the only way the numbers work at
> $70 a groom: dogs go into crates between stages, a cage dryer runs, and there is barking for
> most of the day. For a lot of dogs that is fine. For some of them it is the reason they
> shake in the car park.
>
> The Wash House runs one dog at a time. When your dog is here, the salon is empty apart from
> the two of us. There is no cage dryer on the premises. Everything is hand-dried, which takes
> longer and is quieter.
>
> A full groom takes about ninety minutes. Appointments are two hours, because a dog that
> needs a break should be able to have one without the next appointment stacking up behind it.
> Sometimes that means the last half hour is spent sitting on the floor with a dog who has
> decided today is not the day, and that is a legitimate use of the time.
>
> [PROOF: 4.9 across 22 Google reviews, captured 2026-08-29. Six of those reviews mention
> anxious or reactive dogs without being asked.]
>
> It costs more than the walk-in places. A full groom is $105. If your dog is easy and happy
> anywhere, you probably do not need this and I will say so.

Note what the page version does: same claim, more proof, one concession, and a line that turns
away a customer. That last move is only available to a brand that has decided who it is not
for, which is why the strategy comes first.

---

## 8. Before and after

Eight rewrites. Each "before" is plausibly bad, the kind of thing a competent person writes on
a Tuesday, not a strawman. Name the specific fault, then fix it.

These eight demonstrate the method. The delivered voice section needs fifteen (see §11), drawn
from the brand's own real copy rather than invented, and covering the surfaces this brand
actually uses.

**1 · Hero**

> **Before:** Passionate about providing the highest quality grooming services for your beloved
> fur babies.
> **Fault:** three category clichés, zero information, and an adjective doing the work a fact
> should do. Any of six competitors could run this line.
> **After:** One dog at a time. Yours is the only one here.

**2 · Error message**

> **Before:** Oops! Something went wrong. Please try again later.
> **Fault:** apology theatre, no diagnosis, no action. "Later" is not a time.
> **After:** That booking did not save. The time slot was taken about a minute ago. Pick
> another time, or call and I will sort it out.

**3 · Price increase email**

> **Before:** Hi! We're excited to announce some updates to our pricing structure effective
> from next month. As you know, costs have risen across the board and we've had to make some
> difficult decisions to continue delivering the quality service you've come to expect.
> **Fault:** the number is missing, the date is vague, "excited" is false, and the reader has
> to get to paragraph three to learn what they will pay.
> **After:** From 1 October a full groom is $105, up from $95. It is the first increase in two
> years. Everything else stays the same, including the two-hour slots. If that changes things
> for you, tell me and we will work something out.

**4 · Booking confirmation SMS**

> **Before:** Your appointment is confirmed! We look forward to seeing you and your furry
> friend soon! 🐶
> **Fault:** two exclamation marks, an emoji as decoration, "furry friend", and no useful
> detail. The one thing a confirmation must do is confirm the details, and it does not.
> **After:** Booked: Milo, Thursday 3 October, 10am. About two hours. Parking is easiest on
> Barkly Street. Text this number if anything changes.

**5 · About paragraph**

> **Before:** Established with a passion for animals, The Wash House has been proudly serving
> the Brunswick community for many years. Our experienced team is dedicated to providing a
> premium grooming experience in a safe, loving environment.
> **Fault:** "many years" is a fabrication risk (nobody has given a date), "team" is a lie at
> this size, and every noun is an adjective's hostage. Nothing here is checkable.
> **After:** I have been grooming dogs on Sydney Road since [YEAR, ask Nadia]. It is me and
> Sam on Saturdays. One dog in the salon at a time, no cage dryer, and about ninety minutes a
> groom.

**6 · Reply to a two-star review**

> **Before:** We're so sorry to hear this wasn't your experience! We pride ourselves on our
> high standards and this is very unusual for us. Please contact us so we can make it right!
> **Fault:** defends the business in the same breath as the apology, calls the customer's
> experience unusual (which reads as doubt), and is visibly a template.
> **After:** You are right that Milo's coat came back uneven around the back legs. I rushed the
> last section because we ran over. Come back this week and I will redo it, no charge. I have
> called the number on your booking.

**7 · Service description**

> **Before:** Full Groom: Our signature service includes a luxurious wash, conditioning
> treatment, professional blow-dry, breed-standard styling, nail trim, ear clean and a
> finishing spritz.
> **Fault:** "luxurious", "signature" and "professional" are all self-assessment. The list is
> right, the framing is a spa menu, and it contradicts the positioning.
> **After:** Full groom, $105, about ninety minutes. Wash, hand dry, clip or scissor to the
> length you want, nails, ears. Hand-dried, because there is no cage dryer here.

**8 · Cancellation policy**

> **Before:** Please note that cancellations made within 24 hours of your scheduled appointment
> time will unfortunately incur a 50% fee as per our terms and conditions.
> **Fault:** opens with "please note", hides behind "as per our terms", and "unfortunately"
> pretends nobody decided this. Somebody decided this.
> **After:** Cancel with more than 24 hours' notice and there is no charge. Inside 24 hours it
> is half the groom price, because the slot usually cannot be refilled. If something has gone
> wrong, call me.

---

## 9. Confidence labelling

Every voice section carries a confidence label, assigned per `01-evidence-protocol.md` §3.

| Sub-section | High | Medium | Low |
|---|---|---|---|
| Voice attributes | Derived from five or more real pieces of the brand's writing, and consistent across two or more source types | Two to four pieces, or one strong founder transcript | Chosen from adjectives with no writing sample |
| Tone matrix | Explicit guidance exists and matches observed behaviour | Inferred from three or more examples in that context | Extrapolated from one or two examples, or from the category |
| Vocabulary | Explicitly listed by the owner, or observed consistently across five or more pieces | Pattern-based across templates and messages | Inferred from personality, single source |
| Mechanics | An existing house style is documented and being followed | Decisions made here, consistent with observed writing | Decisions made here with nothing to check against |
| Worked examples | Rewrites of the brand's real copy, approved by the owner | Rewrites of their real copy, not yet approved | Invented examples in the brand's presumed voice |

Present it inline, with the reason and the remedy:

```markdown
## 15. Voice and tone  ·  Confidence: Medium

> Derived from four Google review replies and one welcome SMS. No long-form copy exists yet.
> Raising to High needs three to five longer pieces the owner wrote themselves: an About draft,
> a customer email, a caption they were pleased with.
```

Aspirational attributes are labelled separately from descriptive ones. A voice document that
quietly mixes "how they write" with "how we have decided they should write" is the reason
voice documents get ignored: the writer tries to match it, cannot, and concludes the document
is wrong about the brand.

---

## 10. The stress test

Run before the voice section ships, and annually after.

1. Take a fresh brief the document has never seen. Write the copy using only the document.
2. Score the result 1 to 5 against each attribute.
3. **Anything below 3 on any attribute means the document is incomplete, not that the copy
   needs another pass.** Find the missing rule and add it.
4. Run the competitor variant from §3. If a competitor's copy scores well on your attributes,
   the attributes are not distinctive.
5. Check the mechanics table actually resolved every question the writing raised. Every
   question it did not resolve is a missing row.

**Review triggers:** annually as a floor, after any positioning change, after any audience
shift, whenever the stress test fails twice running, and whenever the person who writes most
of the copy changes.

---

## 11. Failure modes

1. **Generic attributes.** "Friendly, professional, approachable." Every brand claims these.
   They constrain nothing and they fail the competitor test instantly.
2. **Documented aspiration presented as description.** The brand does not sound like this and
   has no plan to change. The document is fiction and writers will treat it as such.
3. **Cartoonish before/after pairs.** An obviously terrible "before" next to an obviously good
   "after" teaches nothing. Real voice work shows the nuanced shift, where the before is
   defensible and the after is better.
4. **Attributes with no do/don't sentences.** An adjective a writer cannot act on.
5. **A tone matrix with no "never" column.** The prohibitions are what get used.
6. **Mechanics left undecided.** Every undecided row is four writers making four choices.
7. **Voice documented, never distributed.** A perfect document nobody references is worth
   nothing. It belongs where the writing happens: in the repo, in the email templates, in the
   brand skill, not in a PDF in a shared drive.
8. **Fewer than fifteen worked examples.** Fifteen paired examples is the floor. The examples
   are the most-used part of the document in practice, by a wide margin. Past twenty-five the
   library becomes harder to scan than to use.
