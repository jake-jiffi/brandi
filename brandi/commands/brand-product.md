---
description: Build or continue a SaaS product design system from a brand, with options, states and gates on the Design canvas
argument-hint: [a brand file, a brand name or site, a shipped product's repo, or nothing at all]
---

Run the product-system journey. Invoke the `product-system` skill and follow it exactly.

What the user said, which may be empty: $ARGUMENTS

Start by finding the route. If `brand/brand.json` exists, it is route A: run `brandi system`. If the
user named an existing brand or a site, it is route B. If they named a shipped product, it is route
C. If `product/tokens.json` already exists, this is a system being continued: read its last round
record and resume from there rather than starting over.

Three things the user cares about, so get them right:

- Ask once, in a single batched question, and never again. Everything else you work out yourself or
  file as an open question with a stated working assumption.
- Fundamentals first: the shell, the phone layout, the focus model and the number formatter come
  before any decorative component, and round one gates them first.
- Nothing is published, and no live artifact is changed, until the user says yes.
