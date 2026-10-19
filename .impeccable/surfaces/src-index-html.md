---
version: 1
slug: "src-index-html"
primary_target: "src/index.html"
related_targets: ["src/style.css","src/showcase.js"]
---

# Homepage exhibition
Mode: Experience. Scope: homepage and project presentation.
Owner approved exhibition option, black palette, personal introduction plus featured apps, code-first implementation, and real assets rather than fabricated screens. Keep hosting static, source links, and versioned downloads.

## Direction contract
THESIS: The software is the exhibit. Replace the warm list-first page with one wide, selectable app stage and individual visual app stories, not an equal-card grid.
OWN-WORLD: Black #08090b, silver #edeee9, muted #a9adb2, etched #303237 rules. Barlow Condensed display, Manrope body. App screenshots retain their own colors without filters.
STORY: Meet Khent, choose an application, understand its purpose through images and verified features, then download it or explore its source.
FIRST VIEWPORT: 94px header; left-aligned two-line condensed introduction and short personal text at right; below, a vertical application rail beside a wide image plate and caption. At 1440px the first app and section close are visible inside 900px.
FORM: Blackened exhibition plates, fourth of seven grounded candidates. seed:9a8cf9b65eb355fc. Approved sketch: .impeccable/mocks/decision/exhibition.html. No image comp was generated or approved. Signature interaction: application selection swaps the illuminated plate and caption; keyboard and no-JavaScript access are mandatory. Keep a complete focal image, app identities, personal voice, and clear selected state.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Moving exhibition — approved motion plan
- Focal moment: within each desktop app story, the real screenshot remains on a native sticky plinth while the introduction, three feature statements, and actions scroll alongside it. The next application takes over in normal document flow.
- Continuity: on every viewport width, screenshots rise 40px and scale from 0.92 to 1 into their plates, a thin silver line tracks story progress, and feature text/dividers brighten as they enter the reading area. The opening spotlight remains click/keyboard-driven.
- Feedback: existing selected-tab state and download links remain unchanged. No wheel interception, scroll lock, timed sequences, or forced carousel.
- Budget: CSS-only progressive enhancement, no dependencies or scroll listeners. Small image scale and line transforms; text/border color repaint is confined to the three statements. No blur or full-screen effects; no framerate guarantee.
- Responsive behavior: mobile, short viewports and narrow preview panels keep compact unpinned stories, with image/line/feature animation still enabled. Only reduced motion and browsers without view-timeline support use the static fallback. The enhancement also works without JavaScript in supporting browsers. Preserve all content, image captions, anchor navigation and direct downloads.

## Content limitations
SpeakFlow's published dark workspace screenshot is a UI preview from its repository, not a promise that it matches the pinned installer. Everglow imagery depicts its sign-in screen, not authenticated playback. Cinder now shows a capture of its actual frontend, replacing the icon at the owner's request. All usage figures are synthetic and explicitly labeled DEMO DATA in the image and caption; no personal session logs were used. No app interface was fabricated.
