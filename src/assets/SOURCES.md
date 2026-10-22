# Asset provenance

These are real application interfaces, not AI-generated app screens. Every PNG embeds its origin metadata. Demo data and simulated operations are identified in the site captions. Captures prove presentation only, not microphone access, cloud recognition, updates, playback or catalog availability.

## Felaris

Source: https://github.com/khentmoba/Felaris/tree/e0c4d06b03bed3bdaf5f549efdca16c8fd0650fc/src (v0.3.1)

- `felaris-home.png`: 1280 × 800 capture of the actual Felaris v0.3.1 interface (`src/ui.html` and `src/start_page.html`) loaded in the UI test harness with sample tabs, showing the standalone vector logo, Brave Search box, eight site shortcuts, and sidebar controls. No personal browsing data.
- `felaris-new-tab.png`: 1280 × 800 capture of the floating new-tab search (`src/new_tab.html`) open over Felaris Home, showing matching open tabs across workspaces and recent history with site favicons.
- `felaris-site-controls.png`: 1280 × 800 capture of the sidebar's Site controls panel (`src/ui.html`) opened from the address bar lock icon for a sample HTTPS origin, showing connection details, permission defaults, and the cookie/site-data clearing action.
- `felaris-sidebar.png`: 520 × 800 crop of the Felaris v0.3.1 sidebar showing a pinned tab, an active tab, an audio-playing tab with its one-click speaker mute button, a sleeping tab marked with a moon, Downloads, and the workspace switcher.

- `felaris-demo.mp4`, `felaris-poster.jpg`: 25.8-second 1600 × 1000 Remotion video (source in the Felaris repository under `promo-video-v2/`, not committed) built from screen captures of an isolated Felaris v0.3.1 instance with its own profile. Pages shown: Felaris Home, the public Chrome for Developers site, and a local tone test page. No personal browsing data. The music is synthesized in code for this video.

These are captures of the unmodified Felaris v0.3.1 HTML/CSS/JS surfaces against UI fixtures. They show presentation, not native WebView2 tab sleeping or memory behaviour.

## App icons

Each app page uses the app's official icon, resized to 256 × 256 with no other changes:

- `felaris-icon.png`: https://github.com/khentmoba/Felaris/blob/e0c4d06b03bed3bdaf5f549efdca16c8fd0650fc/assets/felaris-icon.png (the vector mark shipped in v0.3.1)
- `speakflow-icon.png`: https://github.com/khentmoba/SpeakFlow/blob/d98869cbe8b04154c166f367a5c4089934f9f814/src-tauri/icons/128x128@2x.png
- `cinder-icon.png`: https://github.com/khentmoba/Cinder/blob/7404e34b28cc231f0807dfac7f5762484f21fbfa/src-tauri/icons/128x128@2x.png
- `everglow-icon.png`: https://github.com/khentmoba/Everglow-Desktop/blob/2e58246013e3bac292e9bbcde8f75e7c6a7ec953/src-tauri/icons/icon.png

App page copy comes from each repository's README and claims nothing those documents don't state.

## SpeakFlow

Source: https://github.com/khentmoba/SpeakFlow/tree/63d3dc3a218d5e275b323130bed0cd84b366fd4d

- `speakflow.png`: original public `assets/pr/english-workspace/dark.png` overview.
- `speakflow-dictation.png`: original React interface rendered locally at 1400 × 900; simulated recording-state and waveform events show Listening. No microphone was accessed.
- `speakflow-engines.png`: the original Dictation model selector with GLM-ASR selected using a demo backend; no real cloud key or request.
- `speakflow-polish.png`: actual result comparison component with fictional original/rewritten text and simulated timing values. No LLM request.

The feature captures use the official Tauri IPC mocks and a local event adapter with the unchanged production React components. A visible DEMO DATA label is added. Development dependencies were installed only in an ignored, isolated capture checkout; Felary has no React/Vite dependency. Preview UI may differ from the pinned downloadable installer.

## Cinder

Source: actual frontend at `C:/APPLICATIONS/Cinder/src`, commit `aa2f887b25dd368e04ab7b31595342ae24bb8389` (https://github.com/khentmoba/Cinder/tree/aa2f887b25dd368e04ab7b31595342ae24bb8389/src).

- `cinder-demo.mp4`, `cinder-poster.jpg`: 27-second 1600 × 1000 Remotion video (source in the Cinder repository under `promo-video-v2/`, not committed) built from captures of the unmodified Cinder v0.4.0 frontend (the `v0.4.0` tag) in headless Chrome, with the Tauri calls answered by a mock that returns synthetic usage. Every usage number is sample data and is labelled DEMO DATA. The music is synthesized in code for this video.
- `cinder.png`: original 1280 × 800 dashboard capture with synthetic usage rows.
- `cinder-agents.png`: actual Pi agent filter selected, with synthetic session totals.
- `cinder-range.png`: actual seven-day range and Cost metric selected, with synthetic data.
- `cinder-updates.png`: actual update dialog, using a fictional demo release. The example v0.2.1 is not a claim that this release exists. No installer was downloaded or executed.

Feature captures are 1400 × 900 and include a visible DEMO DATA label. The native collector and updater were not run; real session logs, personal usage and account information were not used.

## Everglow — public media only

Source repository HEAD when inspected: `4b63440c0a50effb69ccf97cffee58697ac143fa`. Homepages were captured fresh from a local run; source application files were not changed.

- `everglow-cinema-home.png`: Everglow Cinema homepage rendered locally from the same build, signed in by the owner because the cinema catalogue requires an authenticated TMDB proxy; captured 2026-10-20 at 1440 × 900. Cropped to the public Trending Now and Top 10 rows (1440 × 660), removing the account avatar, Continue Watching, personalised picks and a snackbar. No credentials or private screens.
- `everglow-anime-home.png`: Everglow anime homepage rendered locally from Everglow HEAD `4b63440` in agent mode (cinema-guest profile), live public catalogue, captured 2026-10-20 at 1440 × 900; cropped to 1310 × 900 to remove the guest account label. No credentials, private screens or couple data.
- `everglow-manga-home.png`: MangaCelestia homepage, same capture setup; cropped to the top 1336 × 490 to remove the guest label and lower listings/genre list, which included adult titles.

Only cinema, anime, manga and manhwa are shown publicly. No private relationship screens or account details are included. The former `everglow.png` private sign-in image is removed from the current build; repository history has not been rewritten.

## Fonts

Google Fonts distributions served locally. Both families use the SIL Open Font License; complete notices are in `fonts/Barlow-Condensed-OFL.txt` and `fonts/Manrope-OFL.txt`.

- Barlow Condensed 600: https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873_3E.ttf
- Manrope 400: https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F.ttf
- Manrope 600: https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4jE-_F.ttf
