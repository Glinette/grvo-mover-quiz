# GRVO · What Type of Mover Are You?

A complete mobile-first, no-login moving personality quiz. Five questions, four original illustrated characters, deterministic results, accessible native radio controls, Back/replay, native sharing and clipboard fallbacks, Facebook sharing, campaign attribution, and static social result pages.

**Live quiz:** https://grvo-mover-quiz.vercel.app/  
**Source:** https://github.com/Glinette/grvo-mover-quiz  
**Vercel project:** https://vercel.com/amerie/grvo-mover-quiz

This is a **standalone React 18 project** using the same lightweight React/esbuild approach as the adjacent GRVO Content Calendar. It has no calendar imports, Supabase dependency, database, authentication, or shared runtime. Deploy it as its own Vercel project. The only external product destination is `https://grvo.app/`.

## Local run

Use Node.js 22 or newer. In this directory:

```sh
npm ci
npm run build
npm test
npm run dev
```

Open **http://localhost:4174**. Stop the server with Ctrl+C. The preview serves `dist`; after source changes, build again and refresh. A local build uses localhost metadata and deliberately avoids sharing a local URL with friends. To inspect public metadata locally, set `SITE_URL` to your real quiz origin before building.

No runtime environment variables, paid services, secrets, database migrations, or API keys are required. `npm ci` installs development/build packages; the browser receives only React, quiz code, CSS, and local assets. Fonts and illustrations are self-hosted.

## GitHub upload

Create an empty GitHub repository for **this quiz**, then run these commands from `grvo-mover-quiz` (replace the repository URL with your own):

```sh
git init
git add .
git commit -m "Build GRVO moving personality quiz"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/grvo-mover-quiz.git
git push -u origin main
```

Alternatively upload this folder's source files through GitHub's **Add file → Upload files**. Include `public`, `scripts`, `src`, `tests`, `index.html`, `package.json`, `package-lock.json`, `vercel.json`, and `.gitignore`. Do not upload `node_modules`, `.env` files, or the surrounding workspace. If using a repository containing several projects, commit this directory and select it as Vercel's Root Directory.

## Vercel deployment

1. Import the new GitHub repository into **a new Vercel project**. Do not select or replace the Content Calendar project.
2. Choose Framework Preset **Other**. Root Directory is the repository root for a quiz-only repository, or `grvo-mover-quiz` for a multi-project repository.
3. Use Install Command `npm ci`, Build Command `npm run build`, and Output Directory `dist`. These build/output settings are also in `vercel.json`.
4. Set `SITE_URL` to the real public HTTPS origin for this quiz, with no subpath/query, e.g. your assigned `https://<your-project>.vercel.app`. If omitted, the build detects `VERCEL_PROJECT_PRODUCTION_URL`. Enable Vercel's system environment variable exposure if needed. Hosted builds reject missing or local public URLs.
5. Deploy. Ensure the **production quiz URL is publicly accessible without deployment protection** so visitors and social crawlers can open it. Keep preview deployments protected if desired. Add a custom domain in Vercel if wanted; update `SITE_URL` and redeploy after changing domains.
6. Open the actual returned production URL on a phone. Finish the quiz and test the GRVO link, Copy Result, native sharing, and Facebook's share composer. No live Facebook post is necessary to validate the composer.
7. Inspect the public source for absolute `og:image`, canonical and `og:url` values. The PNG must load at `/assets/social-preview.png`. Use Facebook's Sharing Debugger to refresh its preview cache after launch or a metadata change.

**Deployment status:** deployed to Vercel Production on 4 November 2026. The live quiz is **https://grvo-mover-quiz.vercel.app/**. The root, all four result pages, and the social PNG were verified publicly accessible with HTTP 200 and correct production canonical/Open Graph URLs. The five-question flow and Copy Result success state were also checked in the deployed browser. Other example domains in this README remain placeholders.

Vercel's URL variables are documented in [System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables). `SITE_URL` is build-time configuration; `.env.example` is explanatory and the build does not automatically load `.env` files. Set variables in Vercel, or in your local shell:

```powershell
$env:SITE_URL = 'https://YOUR-ACTUAL-QUIZ-DOMAIN'
npm run build
Remove-Item Env:SITE_URL
```

## Sharing and social previews

- Native **Share My Result** opens the device's share sheet when supported. Cancel does nothing. Unsupported/failed sharing falls back to copying the result caption and URL.
- **Copy Result** tries the Clipboard API, then a legacy browser fallback, then displays a selectable text area if access is denied. It never reports a failed copy as successful.
- **Share on Facebook** opens `https://www.facebook.com/sharer/sharer.php` with the public result URL. This only opens a composer; it does not automatically post. The analytics event records `opened`, not a claimed successful post.
- Result captions include the requested Facebook copy and the specific personality/tagline. Facebook decides whether it accepts any suggested caption, so the user can paste the copied caption into the composer themselves.
- A generic, original **1200 × 630 PNG** is included at `public/assets/social-preview.png`, with editable vector source and a regeneration script. All four characters also have independent SVG files.
- The build emits `/results/planner/`, `/results/lastminute/`, `/results/sentimental/`, and `/results/chill/`. Each is real static HTML with distinct Open Graph title/description and canonical URL, readable by crawlers without JavaScript. The image is deliberately the shared generic quiz artwork. Opening a result link says **Meet** the personality and offers **Find My Personality**; it does not pretend the visitor completed the quiz.
- If sharing the root quiz URL, Facebook may show the generic quiz preview rather than the visitor's result. JavaScript-only metadata changes cannot reliably personalize a crawler preview. The static result URLs here provide personality-specific metadata without a server, although Facebook caches previews and controls their final presentation.

HTTPS and a user gesture are required by many sharing/clipboard implementations; see [MDN Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) and [MDN Clipboard](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API). Facebook in-app browser behavior varies. The manual-copy fallback remains available on deployed sites.

To regenerate the PNG after changing `scripts/art.mjs`, optionally install `sharp` as a local tool (it is not required by the quiz/build):

```sh
npm install --no-save --package-lock=false sharp
node scripts/render-social.mjs
npm run build
```

## Scoring and interactions

Each A/B/C/D answer adds one point to Planner/LastMinute/Sentimental/Chill respectively. Highest score wins; a tie uses the latest answer belonging to a tied type, from Q5 back through Q1. With five questions, only a 2–2–1 tie is possible; the implementation still checks the entire sequence as specified.

An explicit Next button allows users to review their answer and makes keyboard/screen-reader navigation predictable. Back retains selections; changing an answer replaces its point rather than accumulating points. Replay starts empty. Quiz answers are kept only in memory and are cleared by a full page reload. There is no scientific validity claim.

## Analytics and privacy

The core app makes **no analytics network requests**, sets no cookies, uses no persistent storage, and requests no names, emails, phone numbers, or precise location. No tracker or consent banner is needed for the default build. Hosting providers may independently keep ordinary server access logs.

Events are emitted as local `grvo:analytics` DOM events:

| Event | Data |
| --- | --- |
| `quiz_start` | No payload |
| `question_answer` | `question` (1–5), `answer` (type slug); fires on selection/change |
| `quiz_complete` | `result` |
| `result_share` | `result`, `method`, `status`; success for copy/native, opened for Facebook |
| `grvo_cta_click` | `placement`, optional `result` |

To connect analytics later, integrate an approved consent mechanism and define `window.GRVO_ANALYTICS = { consent: true, send(event) { /* configured provider */ } }` **only after the relevant consent**. No adapter runs while consent is absent/false. Revocation should set consent back to false. Use an external same-origin JS module rather than an inline script (CSP blocks inline scripts). Update `connect-src` in `vercel.json` to permit only the configured analytics endpoint; it defaults to `none`. Add any provider-required privacy disclosures then. Adapter failures are contained and never block the quiz. Do not add personal data or raw URLs to events.

The app carries only `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `utm_content` into share/GRVO links (maximum 200 characters each). It drops unrelated query parameters such as click IDs, emails, and tokens. Missing CTA source/medium/campaign use `grvo_mover_quiz` / `quiz` / `moving_personality`. Campaign values should contain campaign labels, never personal details. Only approved campaign fields are preserved; no fingerprint or attribution cookies are used.

## Verification

`npm run build` must precede `npm test`: UI tests execute the actual built bundle in jsdom.

Automated checks cover all 1,024 answer combinations; all four outcomes through the UI; invalid/incomplete responses; all five questions; selection replacement; Back/replay/focus; static result entry; copy success/denial/manual fallback; native share success/cancel/error; Facebook URL encoding; campaign filtering; analytics consent and failed-adapter isolation; static metadata and PNG dimensions; local asset references; and key color contrast.

Browser checks and their limits are recorded in `QA.md`. Unit/UI tests stub sharing APIs; they cannot guarantee behavior of a future Facebook deployment or a physical device's operating-system share sheet. Validate those once a public HTTPS deployment exists.

Accessibility includes semantic regions/headings, fieldset/legend and native radio inputs, arrow-key/Space selection, visible focus, focus transfer to each question/result, a skip link, disabled incomplete navigation, large answer rows, status announcements, and `prefers-reduced-motion` handling. Decorative illustrations have empty alt text; the hero grouping has a descriptive accessible label. The quiz provides readable no-JavaScript and application-error states plus a static 404 page.

## Source map

- `src/app.jsx`: screens and interaction state.
- `src/quiz.mjs`: exact content, scoring, campaign and URL helpers.
- `src/share.mjs`: native and clipboard fallbacks.
- `src/analytics.mjs`: local events and consent-gated adapter.
- `src/styles.css`: responsive styling, focus states, reduced motion.
- `scripts/art.mjs`: original vector character/social illustration sources.
- `scripts/build.mjs`: production bundle, static result HTML, metadata, sitemap and 404.
- `scripts/serve.mjs`: local static preview server.
- `public/assets`: self-contained artwork, social PNG and licensed Inter variable font (Montserrat-style fallback stack; license included).
- `tests`: scoring, built-UI, and delivery checks.

Rollback by redeploying an earlier Vercel deployment or reverting your quiz commit. There is no database or calendar state to migrate or roll back.
