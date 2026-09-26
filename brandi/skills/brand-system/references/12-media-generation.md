# Generated media

Higgsfield generates what a language model cannot draw. For a brand pack that is photography in
the art direction, blank real scenes for the mockups, a logo sting and loops. It is also sound, a
spoken brand line, the mark in 3D, and logo sparks from several image models. Brandi drives it
through `brandi media`.

It is optional. A brand built without it is complete. Check for it once, suggest it once, and never
make anything wait on it.

Three rules hold everything below together.

- **A person picks.** A generated file is a candidate until somebody approves it by name. Only
  approved files reach the book and the handover.
- **The mark is never generated.** Image models redraw letterforms and invent detail. The real
  vector mark is composited onto generated scenes, and a sting ends on a frame rendered from the
  master. Logo sparks exist only as references the forge redraws in vector.
- **Credits are money.** Every run is priced before anything is created, and a run that would pass
  the plan's budget is refused before a single job starts.

## Check once, in Recon

```bash
$A media status
```

It never fails. It answers one of four ways: ready (with the plan and the credits), not installed,
installed but signed out, or signed in with no workspace. Each answer carries its next command.

If it is not ready, tell the user in one line what it would add and the command that adds it, then
carry on without it. Do not raise it again this engagement. If it is ready, say so in the same
line as the rest of the Recon summary.

## What it is for, and what it is never for

| Job | What comes back | Where it lands |
| --- | --- | --- |
| `photo` | Photography in the art direction, one shot per surface that carries one | The book's Photography in practice page, the proof artboards |
| `scene` | A blank real surface: the shopfront, the van, the sign, the tote | `brandi mockup`, which composites the real mark onto it |
| `motion` | A logo sting that ends on the real mark; loops for the hero and for social | The book's Motion and sound page, the handover |
| `illustration` | Samples in the written style, drawn only in the palette | The book's Illustration in practice page |
| `icon` | A traced exploration sheet for whoever draws the set | The designer, never production |
| `sound` | A three to six second mnemonic | The Motion and sound page, under the sting |
| `voice` | The brand line, spoken | A check on whether the written voice survives being said |
| `object` | The mark as a 3D model | Signage, merchandise, motion |
| `ideation` | Logo sparks | The forge, which redraws the picked ones in vector |

Never:

- **The logo.** The forge draws it, measures it and a person approves it. A generated raster mark
  cannot be mastered into clear space and minimum sizes, and it redraws letters it was told to set.
- **A website.** Higgsfield can build and deploy sites. Brandi's job ends at the brand: hand the
  approved media to whatever builds the site.
- **A person presented as real.** No generated face is a customer, a member of staff or a
  testimonial. The book says every generated file is a sample of the direction.

## Models are discovered, not baked in

The catalogue changes monthly. Brandi reads it live and chooses from it, so a better model is used
the month it ships.

```bash
$A media models            # today's catalogue: what can do each job, what is chosen, what is new
$A media models --refresh  # read it again now rather than using the copy from today
```

`brandi media plan` reads the catalogue too, and re-reads it once a day.

**Dictated, because they are facts about the job:** what each job needs. A sting needs a start and
an end frame, or it cannot land on the mark. Illustration needs hard palette colours. Icons need a
vector mode. A photograph needs a prompt and no required input image, which keeps upscalers and
relighters off the list. A model that cannot do the job is never offered for it, whatever it is
called.

**Dictated, on evidence:** exclusions. Kling O1 Image is out of the spark wall: given a slot that
refused the paw print, it drew a paw print, on a mockup card it had also been told not to draw.

**Dictated, by a person:** pins. When a trial settles a job for this brand, pin the winner with the
reason, and every re-deal uses it.

```bash
$A media use photo gpt_image_2_5 --why "Held the expression crop and the hands at the edge of frame"
$A media use photo --clear
```

A pin that cannot do the job is refused unless forced. A pin with no reason is refused outright.

**Discovered:** everything else. A newer version of the chosen model's family at the same tier or
above is taken without asking. A newer version at a lower tier is named and left for you. Models
new since the last look are listed first.

**Quality:** every parameter that is a ladder goes to its top rung on the chosen model: resolution,
quality, mode, bitrate. Anything that ships in the pack gets it. Sparks do not, because they are
sketches for a vector redraw.

### Trial before you commit a job

Across families the choice is a judgement, and a one-prompt trial settles it for this brand. Run
one before you write the prompts for a whole job, and again whenever `models` lists something new.

```bash
$A media trial photo-home-page          # the same prompt on each capable family's best, and its newest
$A media cost trial-photo-home-page-...  # the ids it printed
$A media run  trial-photo-home-page-...
$A media board --kind photo
```

Look at them at full size, not only the board. Hands, eyes and any lettering in frame are where
image models fail, and all three read as fine at thumbnail size. Then pin the winner.

The first trials, on the worked example, decided the fallbacks the code uses when nothing is
pinned:

- **Photography:** nine models on one art-directed prompt. GPT Image 2.5 at max held the expression
  crop and put the brief's hands at the edge of frame. Nano Banana 2 was a close second at 5504px
  wide. Nano Banana Pro's water read as rendered. FLUX.2 drifted into the stock-dog look the brand
  refuses, and both Soul models missed the brief.
- **Scenes:** seven models on a blank shopfront. All seven left the sign panel blank. Nano Banana 2
  gave the cleanest square-on fascia.
- **Stings:** seven video models with the same start and end frames. Kling 3.0 landed on the mark
  and moved the way the motion principle asked. Two Wan models landed but barely moved. Seedance 1.5
  redrew half the mark mid-sting; FLUX 3 Video and Seedance 2.5 shifted the ground off the brand
  green.

## The loop

```bash
$A media plan                       # deal the slots the brand file calls for
$A media list                       # every slot, its state, its brief
$A media set photo-home-page prompt "..."
$A media cost                       # price every ready slot; creates nothing
$A media run                        # price, check the budget, create, wait, download
$A media board                      # boards for the canvas, from the small previews
$A media approve photo-home-page-2 --approved-by "<name>"
```

A video run takes minutes and prints nothing until it ends. Run it in the background, or with a
timeout of at least half an hour, rather than letting the tool call give up on it. One run at a
time: a run holds the plan, and anything that writes the plan waits for it to finish.

`plan` deals only what the brand file asks for. No art direction means no photography, because
generating photographs without a direction is inventing one. No written illustration style means no
illustration. `--kinds` adds `icon`, `sound`, `voice`, `object` or `ideation` to the defaults
(`photo`, `scene`, `motion`, `illustration`). Dealing again keeps every written prompt, every hand
set field and every result, and marks a prompt whose brief has changed since it was written.

`add` makes a slot for anything the dealer does not deal, on any model. `set` changes one field:
`prompt`, `model`, `count`, `title`, `params.<name>` or `refs.<role>`. A new model has the job's
intent refitted to what it takes.

Publish the boards exactly as a concept round: `$A validate --dir brand/media/canvas`, then
`$A canvas`, then the Artifact tool. Without a canvas, render them with `preview.mjs`.

## Writing the prompts

The prompt is the design work. Every photo, scene and motion slot is dealt with a brief and no
prompt, and it will not run until you write one.

Start from the brief. It already carries the palette, the art direction, the treatment, the
refusals and the no-lettering rule. Then write what a photographer would be told on the day:

- **A moment, not an adjective.** "A wet kelpie mid-shake, water in an arc, sharp at the eyes" beats
  "a happy dog".
- **Light, lens and crop, named.** "Late afternoon through a half-open roller door, 35mm, tight on
  the expression."
- **What is in frame, and what is at its edge.** Hands, a hose, the tile. Specific objects make a
  place; "a modern space" makes stock.
- **Refusals stated as what to do instead.** Naming a cliche can put it in the picture. "Shot in
  the real bay" does more than "no white seamless".
- **No text, said plainly, every time.** The real mark is added afterwards.

For **scenes**, the panel the mark goes on must be blank, square to the camera, evenly lit and at
least a third of the frame, so its four corners can be read. Then:

```bash
$A mockup grid brand/media/scene/scene-shopfront-1.png
```

Read the corners, record them under `identity.mockups` with the scene as the photo and a caption
that says it is generated, and `$A mockup build` composites the real artwork.

For the **sting**, describe the motion in the terms of the motion principle and the motion
signature, and say it ends still on the end frame. Never ask the model to draw the mark: the start
and end frames are rendered from the master on the brand ground, and the prompt describes only what
happens between them. Every sting is scored on the way in: its last frame against the end frame, by
SSIM. At 0.995 or above it is marked as landing. Below, it drifted, and the board says so.

For **loops**, one continuous shot with room for type over it. Vertical loops keep the top 14% and
bottom 20% clear, where the platforms put their own chrome.

For **voice**, choose a voice first with `higgsfield voices list`, then set `params.voice_id` and
`params.voice_type` on the slot. The prompt is the words.

## Logo sparks, and the forge

Sparks come after the forge has dealt its slots, and before anybody draws.

```bash
$A logo plan --count 12
$A media plan --kinds ideation     # one spark slot per concept slot, each on a different model
$A media cost && $A media run
$A media board --kind ideation
$A media pick idea-C1-1 idea-D2-2  # what the person thinks is worth pursuing
```

The rotation is built from the live catalogue: the best of every capable image family, so twelve
sparks are not one model's house style twelve times. Check each spark against its own slot's
refusals before anybody picks it.

A picked spark goes to the forge's draw step. The drawing agent gets its own slot brief and its own
spark, nothing else, and redraws the idea as a vector mark under the brief's constraints. It does not
trace. Where the spark breaks the brief, the brief wins. Import that slot's file on its own, with a
model string naming both, because one import call gives every file in it the same string:

```bash
$A logo import brand/logo/concepts/round-01/C1.svg --model "claude-opus-5, redrawn from a Higgsfield spark"
```

When a concept becomes the master, the generation manifest lists every picked spark with its model
and job id. Image models can reproduce marks that already exist, so those sparks go into the
similarity search with the mark itself. A spark can be picked. It can never be approved.

## Everything else Higgsfield does

`brandi media` wraps the generation models. The rest of the CLI is used directly, and anything it
makes is brought under the same record with `import`:

```bash
higgsfield generate list --json              # find the job id
$A media import <job_id> --kind photo --title "Product on the counter"
```

| Need | Command |
| --- | --- |
| Product photography from a real product shot | `higgsfield product-photoshoot create --mode product_shot --prompt "..." --image product.jpg` (or `lifestyle_scene`) |
| Marketplace listing images | `higgsfield marketplace-cards create --scope full-set --prompt "..." --image product.png` |
| A second read of an existing website | `higgsfield marketing-studio brand-kits fetch --url <site> --wait` |
| Ad creative in a format preset | `higgsfield marketing-studio ad-formats list`, then `dtc-ads generate` |
| The hero loop recut to vertical | `higgsfield generate workflow reframe --video <file> --aspect-ratio 9:16` |
| A client photo too small to print | `$A media add <id> --kind edit --model topaz_image --refs '{"image_references":["photos/x.jpg"]}' --params '{"output_width":6000,"output_height":4000}'` |
| A cut-out | `$A media add <id> --kind edit --model image_background_remover --refs '{"image_references":["photos/x.jpg"]}'` |
| One real person, consistent across images | `higgsfield soul-id create`, from five to twenty photographs of a person who agreed in writing |

A brand kit fetched from a site is Higgsfield's reading of it. Record anything you keep with
`$A evidence --provenance extracted` and the URL as the source, and check it against the site's
computed styles before it outranks what Recon measured. An upscale adds pixels, not detail: say so
wherever it is used.

## Before anything leaves the machine

- **Uploads.** A reference file is uploaded to Higgsfield. Only files inside the project are ever
  sent, and a symlink out of it is refused. A client's photographs are the client's: say once that
  they will be uploaded before the first run that uses them.
- **Commercial use.** It depends on the account's terms. Check them before generated media goes
  into paid placements, and record the answer with `$A decision`.
- **Provenance.** Every result records its model, its prompt and its Higgsfield job id. Files are
  kept as they were downloaded, including any content credentials a model embeds.
