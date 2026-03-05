# System Decisions

*This file is the single source of truth for architectural and implementation decisions in this project.*

## Purpose

Records key technical decisions, their rationale, alternatives considered, and outcomes. This file prevents the same discussions from happening twice and helps future-you (or future-sessions) understand *why* things are the way they are.

## When to Update This File

Update this file when:
- A significant technical or architectural decision is made
- A library, framework, or tool is chosen over alternatives
- A design pattern or approach is selected for a non-trivial problem
- A previous decision is revisited, changed, or reversed
- A constraint or trade-off is discovered that shaped the implementation
- A workaround is chosen due to external limitations (API quirks, library bugs, etc.)

**Do not** log trivial decisions (variable naming, minor formatting). If it wouldn't be worth explaining to a teammate joining the project, skip it.

## Format

Each entry follows this structure:

```
### [YYYY-MM-DD] — [Short Decision Title]

**Status:** Accepted | Superseded | Deprecated
**Context:** Why this decision was needed. What problem or question triggered it.
**Decision:** What was decided.
**Alternatives Considered:**
- [Alternative A] — Why it was rejected.
- [Alternative B] — Why it was rejected.
**Consequences:** What this decision enables, constrains, or risks.
```

If this file gets corrupted, re-create it. 
CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

---

## Decisions

### [2026-02-24] — Brand Color System with Gradients

**Status:** Accepted
**Context:** CustomPrint DFW brand uses lime green, black, blue, and yellow. Needed vibrant, eye-catching design for print shop.
**Decision:** Implemented gradient system using Tailwind's gradient utilities (from-blue-600 to-lime-400, from-lime-400 to-yellow-400) for hero, buttons, and accents. Black backgrounds with lime/yellow accents for contrast.
**Alternatives Considered:**
- Flat colors only — Rejected: Less dynamic and modern
- Single primary color — Rejected: Doesn't showcase full brand palette
**Consequences:** Creates vibrant, memorable brand presence. Gradients require careful contrast management for accessibility.

### [2026-02-26] — Anima Playground SDK for All Data

**Status:** Accepted
**Context:** Need database-backed content for Products, Services, and Portals with an admin interface.
**Decision:** Use `@animaapp/playground-react-sdk` with `useQuery`/`useMutation` hooks. All three entity types (Product, Service, Portal) are managed via the SDK. Admin panel at `/admin` protected by `useAuth({ requireAuth: true })`.
**Alternatives Considered:**
- Local state with hardcoded data — Rejected: Not editable without code changes
- Custom backend — Rejected: SDK provides this out of the box
**Consequences:** Site shows empty states until admin populates data. Admin link only visible when logged in.

### [2026-02-24] — Product Showcase Without Database

**Status:** Accepted
**Context:** Client wants storefront capability but no database per requirements.
**Decision:** Static product grid with hardcoded products and "Order Now" buttons that can link to contact form or external ordering system.
**Alternatives Considered:**
- Full e-commerce with cart — Rejected: Requires database
- No products section — Rejected: Client specifically requested storefront
**Consequences:** Simple, maintainable solution. Products must be updated in code. Can integrate with external ordering system later.
