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

Source repository HEAD when inspected: `4b63440c0a50effb69ccf97cffee58697ac143fa`. Existing proof captures were reused; source application files were not changed.

- `everglow-cinema.png`: `C:/APPLICATIONS/Everglow/docs/pr-proof/pr-461/cinema-1-spoilers-hidden-430.png`. Actual cinema episode controls with demo content; cropped to the top 860 × 740 pixels to remove unused background.
- `everglow-anime.png`: `C:/APPLICATIONS/Everglow/docs/pr-proof/anime-hero-sizing/desktop-banner.png` (1280 × 720). Original production anime spotlight widget with labeled demo artwork/title. Its README documents the synthetic scene and no account/couple data.
- `everglow-reading.png`: `C:/APPLICATIONS/Everglow/docs/pr-proof/pr-390/shot-mangacelestia.png` (900 × 445). Actual public guest catalog, showing manga/manhwa/manhua filters. This image is not the separate books interface.

Only cinema, anime, books, manga and manhwa are introduced publicly. No private relationship screens or account details are included. The former `everglow.png` private sign-in image is removed from the current build; repository history has not been rewritten. A fresh local agent-mode web capture did not complete, so it was not used or presented as evidence.

## Fonts

Google Fonts distributions served locally. Both families use the SIL Open Font License; complete notices are in `fonts/Barlow-Condensed-OFL.txt` and `fonts/Manrope-OFL.txt`.

- Barlow Condensed 600: https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873_3E.ttf
- Manrope 400: https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F.ttf
- Manrope 600: https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4jE-_F.ttf
