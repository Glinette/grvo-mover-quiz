# Verification record

Verified locally on 4 November 2026 (Asia/Singapore).

## Automated verification

- Production bundle builds successfully with esbuild.
- **14 tests pass**, including every one of the 1,024 possible answer sequences and all four result types through the built UI.
- Five questions, four radio answers per question, disabled incomplete navigation, selected answer replacement, Back, retained selection, focus transfer, replay reset, and shared-result entry pass.
- Native share success, cancellation and rejection; clipboard success and denial; manual-copy fallback; Facebook composer URL; and encoded result/campaign links pass with browser APIs stubbed.
- Consent-disabled analytics makes no adapter calls. Consent-enabled calls work; adapter exceptions do not interrupt the quiz. No cookies or persistent quiz data are created.
- Real static HTML for the landing page and each result includes absolute canonical and Open Graph metadata. Tested using an explicit HTTPS fixture domain, then restored the build to localhost. The fixture domain is **not** a deployed site.
- Shared image verified as a PNG with dimensions 1200 × 630.
- CSS foreground/background contrast calculations pass 4.5:1 for body text, muted text, primary CTA text and personality card text.
- Main HTML, JS, CSS, local font, social PNG, and all four static result URLs returned HTTP 200 from the local server.
- Compiled app JavaScript is about 161 KB / 52 KB gzip; CSS about 16 KB / 4.5 KB gzip. Social PNG is metadata-only and is not loaded by the landing UI.

## Real-browser checks

Used the in-app Chromium browser with responsive viewport overrides at 320, 390, 768, and 1440 pixels wide.

- Landing, question, and result layouts inspected; no horizontal page overflow at the checked widths. Rotated hero artwork overflow was fixed during QA. Tablet headline sizing was adjusted for readability.
- Space selects a radio; ArrowDown moves selection. Accessible state confirms the selected radio. Next advances and places focus on the new question heading.
- Completed all five questions in the mobile viewport and reached The Last-Minute Mover. The exhaustive automated suite separately covers every outcome.
- Play Again clears selection. Back from the first question returns to the landing screen.
- Result CTA targets `https://grvo.app/` with only allowlisted campaign parameters. The GRVO site was reachable during link validation.
- Local-only sharing displays an explanation instead of publishing a localhost link.
- All rendered illustrations load. Browser console inspection returned no errors or warnings.
- Reduced-motion CSS disables confetti and transitions; implementation inspected. No system preference was changed during testing.

## Remaining launch checks

No public quiz deployment exists yet. A real physical phone, Safari, the Facebook in-app browser, actual OS share sheets, and Facebook's live crawler/cache were **not** tested. The automated tests cover their API success/failure branches, not external services themselves. After deploying, follow the README's brief public-HTTPS sharing and metadata checks. Test with a screen reader if a formal accessibility conformance report is required; this delivery does not claim a full WCAG audit.

The source bundle includes no secrets, database configuration, or Content Calendar files. No production calendar state or authentication was changed.
