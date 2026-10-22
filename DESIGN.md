---
name: Felary
description: A black exhibition for personal software.
colors:
  background: "#08090b"
  foreground: "#edeee9"
  muted: "#a9adb2"
  line: "#303237"
  accent: "#c8d1c1"
  surface: "#111316"
  forest: "#111916"
  cobalt: "#0e1420"
  plum: "#14101f"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(52px, 6.12vw, 88px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(40px, 4.4vw, 64px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  feature:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(18px, 1.6vw, 23px)"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "4px"
spacing:
  compact: "12px"
  control: "18px"
  group: "24px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.control}"
    padding: "13px 18px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
---

# Design System: Felary

## Overview
**Creative North Star: "The midnight exhibition"**

The owner chose a black-and-silver replacement for the warm-paper portfolio. The software leads: restrained chrome, large condensed lettering, and real application imagery with room to breathe.

**Key Characteristics:**
- A continuous black ground with silver text.
- One focal application rather than equal promotional tiles.
- Real screenshots and clearly identified app artwork.

## Colors
The frontmatter records the implemented palette. Background and foreground establish the exhibition; muted ink carries secondary information; thin line ink separates content. Accent is a pale hover and selection tone, not a glow. Forest, cobalt and plum identify app plates without recoloring their images.

**The Unfiltered Work Rule.** Preserve the original colors and proportions of application images.

## Typography
Self-hosted Barlow Condensed provides uppercase display and section headings. Self-hosted Manrope provides personal copy, application names, captions and controls. No external font requests are required; licenses ship beside the fonts.

Display peaks at 88px; application story headings use 40px, reduced to 36px on mobile. Supporting copy is generally 14–15px with generous line height, and metadata is at least 12px. Body copy remains within 65 characters where practical.

## Layout
A 1296px maximum container uses 48px side gutters on larger screens and 20px on phones. The homepage opens with a personal introduction and a single app plate, supported by a 252px title rail.

At 1100px, the rail and type compress. At 760px, the rail becomes horizontal and the app stories become single-column. At 360px, navigation gaps tighten. App stories pair generous images with purpose, feature lists and actions. Downloads retain readable rows rather than cards.

The moving exhibition is a progressive enhancement for view-timeline-capable browsers with no reduced-motion preference. Image arrival, line progress and feature emphasis work at every viewport width, including narrow embedded previews. Only the sticky two-column layout requires at least 900px width and 700px height: figures then stick 48px from the top while feature statements scroll in larger reading beats. Mobile and short viewports keep compact, unpinned flow but retain scroll animation. Reduced motion and unsupported browsers retain the static layout.

## Elevation & Depth
No shadows, bevels, or faux-metal textures. Depth comes from restrained tonal fields and the original app imagery. Selected state uses brighter text, a line, an arrow on desktop, and semantic state.

## Shapes
Thin rules and mostly square plates. Primary download controls use the small control radius. Icons are consistent small stroked SVGs.

## Components
- **Primary actions:** silver field with dark text, 46px minimum height, pale accent on hover.
- **Text links:** offset underlines and a small arrow; no color-only distinction from body text.
- **App rail:** progressively enhanced anchor links become keyboard-operable tabs with a single selected panel. Without JavaScript, links lead to the complete app introductions.
- **Image plates:** contained, unfiltered artwork; full-image links and captions explain what is shown. Feature galleries reserve a 16:10 plate to avoid image-ratio jumps. On supported full desktop layouts, a small IntersectionObserver controller crossfades the plate to the state matching the feature crossing the 45% reading line; only that feature stays silver. The caption, alt text and full-image link track the selected image. Missing scenes fall back to the overview, and late image loads cannot override the currently selected feature.
- **Inline feature pictures:** compact, reduced-motion, no-JavaScript and unsupported layouts show the matching screenshot beneath each feature instead of hiding it in an offscreen gallery. Captions explicitly identify demo data, simulated releases and images that show only one part of a section. Missing images receive a text fallback when JavaScript is available.
- **Release details:** a version, release date and, when the app has a page, "What's new" link on each download row; a silver-on-accent "New" tag marks releases under 30 days old (decided in the browser, so it expires without a rebuild). App pages carry the release notes as a two-column section, with a short accent rule before each note. The hero's category, platform, version and update date sit under the app name, never above it.
- **Footer:** every page lists the four app pages; the current one is plain silver text.
- **Focus:** visible 2px outline with a 6px offset; the skip link appears on focus.
- **Motion:** a 350ms brightness transition when selecting an app, disabled under reduced-motion preferences. The moving exhibition uses native CSS view timelines: a thin silver line tracks story progress, screenshots rise 40px and scale from 0.92 to 1 into their image plates as they enter, and feature text/dividers brighten from the readable muted tone to silver. These effects scrub in both directions with scrolling. Text and border-color changes can repaint; no framerate is promised. Feature-image crossfades use 240ms natural deceleration and are disabled for reduced motion. There is no autoplay, carousel timer, scroll interception or forced slide sequence. The opening tabs and direct download links remain independent of scrolling.

## Do's and Don'ts
- Do preserve app identities and real image proportions.
- Do label official artwork separately from interface screenshots.
- Do keep all introductory content and downloads accessible without JavaScript.
- Don't invent product screens, usage data, biography details, or feature claims.
- Don't revive the superseded cream-and-serif identity for new sections.
- Don't turn the exhibition into glowing panels or a decorative dashboard.
