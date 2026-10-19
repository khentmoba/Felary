# Felary visual system

## Approved direction
Personal software index. An editorial, warm-paper page with a numbered project list and a contrasting dark downloads shelf. The owner approved this direction and a code-first build.

## Material and type
Paper #f3f0e7, ink #282c25, secondary text #626459, olive #50652d, rules #cdcdbf. The download shelf uses #262e23 with pale green text and actions.
DM Sans provides body, navigation, and project typography. Libre Caslon Display provides display emphasis; both have fallback stacks. Typography is fluid, never larger than 96px.

## Composition
1120px maximum content width, generous section spacing, thin row separators. Project rows are the primary navigation into the work, not decorative cards. Numbers identify positions in the index. Downloads expose the exact version and Windows architecture next to an explicit installer action.

## Behavior
Native anchor navigation, visible keyboard focus, a skip link, reduced-motion support. Project arrows translate slightly on hover. At 700px and below, metadata stacks beneath project descriptions; downloads and About become single-column. No animation hides content. No browser JavaScript is needed.

## Content discipline
Use real repository and release metadata. Never invent product screenshots or biography claims. Explicit installer versions are maintained in src/projects.json. Visual detector warnings about cream and serif treatment are intentional within the owner-approved editorial direction; the full-width shelf has an inset .wrap, not flush text.
