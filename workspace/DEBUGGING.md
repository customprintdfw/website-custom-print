# Debugging Records & Issue Tracking

*This file is the single source of truth for debugging sessions, issues, and troubleshooting history in this project.*

## Purpose

Records debugging sessions, error patterns, root causes, solutions, and recurring issues. This file enables systematic problem-solving, prevents re-solving the same bugs, and provides context for future debugging efforts. It supports Roo Code's Debug Mode by maintaining a persistent record of diagnostic work.

## When to Update This File

Update this file when:
- Encountering a new error, bug, or unexpected behavior
- Identifying a root cause during investigation
- Applying a fix or workaround (successful or not)
- Noticing a recurring issue pattern
- During systematic debugging sessions (e.g., in Debug Mode)
- Discovering performance issues, edge cases, or race conditions
- After verifying a fix works across relevant scenarios

**Do not** log transient one-liners or obvious typos. Focus on issues requiring investigation or likely to recur.

## Format

Each entry follows this structure:

```
### [YYYY-MM-DD HH:MM] — [Short Issue Title]

**Status:** Open | Investigating | Fixed | Recurring | Won't Fix
**Symptoms:** What went wrong. Error messages, stack traces, reproduction steps.
**Environment:** dependencies, affected files.
**Root Cause:** (if found) What caused it.
**Investigation Steps:**
- Step 1: What was tried, results.
- Step 2: etc.
**Solution:** What fixed it (code changes, config, workaround).
**Prevention:** How to avoid this in future (patterns, tests, docs).
**Related:** Links to DECISIONS.md entries, commits, or tickets.
```

Mark as **Recurring** if the issue returns.

If this file gets corrupted, re-create it. 
CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

---

## Current Issues

### [2026-03-05] — WordPress Connection Verified Working

**Status:** Fixed
**Symptoms:** User confirmed WordPress connection working correctly in both admin panel test and live blog section.
**Environment:** WordPress REST API integration, `WordPressAdmin` component, `SocialBlog` component.
**Root Cause:** No issue — integration functioning as designed.
**Solution:** Removed temporary `__ANIMA_DBG__` debug logs that were added during troubleshooting session.
**Prevention:** WordPress integration is stable. Monitor for CORS issues if deployed to different domains.

### [2026-02-26] — Tailwind Directive Order Breaking Layout

**Status:** Fixed
**Symptoms:** Site styles broken — utility classes not applying correctly, layout appears unstyled or wrong.
**Root Cause:** `tailwind.css` had `@tailwind components` and `@tailwind utilities` declared before `@tailwind base`. Base resets loaded last and overrode utility classes.
**Solution:** Reordered to `@tailwind base` → `@tailwind components` → `@tailwind utilities`.
**Prevention:** Always keep Tailwind directives in the canonical order: base, components, utilities.


### [2026-02-26] — ERR_SSL_VERSION_OR_CIPHER_MISMATCH on customprintdfw.com domain

**Status:** Open (hosting issue, not code)
**Symptoms:** Browser shows `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` when navigating to `customprintdfw.com`. The live deployed site is inaccessible.
**Environment:** User's live domain `customprintdfw.com`, not the Sandpack preview.
**Root Cause:** The SSL certificate on the hosting server uses an outdated TLS version or cipher suite (TLS 1.0/1.1) that modern browsers reject.
**Solution:** Hosting-level fix required — renew/re-provision SSL certificate via hosting dashboard, or re-issue Let's Encrypt cert via cPanel. Verify with ssllabs.com/ssltest. No code changes needed.
**Prevention:** Use a hosting provider that auto-renews Let's Encrypt certs with TLS 1.2/1.3 support.


<!-- Newest debugging entries first. Closed issues move to "Resolved Issues" below. -->

### [2026-02-26] — ERR_SSL_VERSION_OR_CIPHER_MISMATCH on font loading

**Status:** Fixed
**Symptoms:** Browser console shows `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` when loading the site. Fonts may not render correctly.
**Environment:** Sandpack browser environment, `tailwind.css` @font-face declarations pointing to `cdn2.editmysite.com`.
**Root Cause:** The `cdn2.editmysite.com` CDN has SSL/TLS configuration issues that prevent the Sandpack sandbox from establishing a secure connection to download woff2 font files.
**Solution:** Replaced `@font-face` declarations with Google Fonts CDN (`fonts.googleapis.com`). Added `<link>` tags in `index.html` for Josefin Sans and Montserrat (weights 400, 700).
**Prevention:** Use well-known CDNs (Google Fonts, cdnjs, unpkg) for external resources in sandboxed environments. Avoid obscure CDN domains.

## Resolved Issues

<!-- Historical debugging records -->
