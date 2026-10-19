# Asset provenance

These are real application interfaces, not AI-generated app screens. Every PNG embeds its origin metadata. Demo data and simulated operations are identified in the site captions. Captures prove presentation only, not microphone access, cloud recognition, updates, playback or catalog availability.

## SpeakFlow

Source: https://github.com/khentmoba/SpeakFlow/tree/63d3dc3a218d5e275b323130bed0cd84b366fd4d

- `speakflow.png`: original public `assets/pr/english-workspace/dark.png` overview.
- `speakflow-dictation.png`: original React interface rendered locally at 1400 × 900; simulated recording-state and waveform events show Listening. No microphone was accessed.
- `speakflow-engines.png`: the original Dictation model selector with GLM-ASR selected using a demo backend; no real cloud key or request.
- `speakflow-polish.png`: actual result comparison component with fictional original/rewritten text and simulated timing values. No LLM request.

The feature captures use the official Tauri IPC mocks and a local event adapter with the unchanged production React components. A visible DEMO DATA label is added. Development dependencies were installed only in an ignored, isolated capture checkout; Felary has no React/Vite dependency. Preview UI may differ from the pinned downloadable installer.

## Cinder

Source: actual frontend at `C:/APPLICATIONS/Cinder/src`, commit `aa2f887b25dd368e04ab7b31595342ae24bb8389` (https://github.com/khentmoba/Cinder/tree/aa2f887b25dd368e04ab7b31595342ae24bb8389/src).

- `cinder.png`: original 1280 × 800 dashboard capture with synthetic usage rows.
- `cinder-agents.png`: actual Pi agent filter selected, with synthetic session totals.
- `cinder-range.png`: actual seven-day range and Cost metric selected, with synthetic data.
- `cinder-updates.png`: actual update dialog, using a fictional demo release. The example v0.2.1 is not a claim that this release exists. No installer was downloaded or executed.

Feature captures are 1400 × 900 and include a visible DEMO DATA label. The native collector and updater were not run; real session logs, personal usage and account information were not used.

## Everglow — public media only

Source repository HEAD when inspected: `4b63440c0a50effb69ccf97cffee58697ac143fa`. Homepages were captured fresh from a local run; source application files were not changed.

- `everglow-anime-home.png`: Everglow anime homepage rendered locally from Everglow HEAD `4b63440` in agent mode (cinema-guest profile), live public catalogue, captured 2026-10-20 at 1440 × 900; cropped to 1310 × 900 to remove the guest account label. No credentials, private screens or couple data.
- `everglow-manga-home.png`: MangaCelestia homepage, same capture setup; cropped to the top 1336 × 490 to remove the guest label and lower listings/genre list, which included adult titles.
- `everglow-books-home.png`: Books homepage, same capture setup (live Open Library/Gutenberg catalogue); cropped to 1440 × 742 to remove the overlapping bottom navigation.

Only cinema, anime, books, manga and manhwa are introduced publicly. No private relationship screens or account details are included. The former `everglow.png` private sign-in image is removed from the current build; repository history has not been rewritten.

## Fonts

Google Fonts distributions served locally. Both families use the SIL Open Font License; complete notices are in `fonts/Barlow-Condensed-OFL.txt` and `fonts/Manrope-OFL.txt`.

- Barlow Condensed 600: https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873_3E.ttf
- Manrope 400: https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F.ttf
- Manrope 600: https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4jE-_F.ttf
