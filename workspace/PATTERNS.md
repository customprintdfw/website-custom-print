# System Patterns & Conventions

*This file is the single source of truth for recurring patterns, conventions, and technical standards in this project.*

## Purpose

Documents the established architecture patterns, coding conventions, and technical standards the project follows. This file exists so the agent (and future sessions) can produce consistent code without re-discovering or re-debating how things are done here.

## When to Update This File

Update this file when:
- A new architectural pattern is introduced or adopted (e.g., repository pattern, event-driven flow)
- A coding convention is established that deviates from language defaults
- A reusable approach is identified and should be applied consistently (error handling, logging, validation)
- A pattern is deprecated or replaced by a better approach
- A new integration point is added that follows (or defines) a standard interface
- File/folder structure conventions change

**Do not** document one-off implementations. Only patterns that should be **replicated** across the codebase belong here.

## Format

Organize patterns by category. Each pattern follows this structure:

```
### [Pattern Name]

**Category:** Architecture | Data Flow | Error Handling | Testing | API Design | File Structure | [Other]
**Status:** Active | Deprecated
**Description:** What the pattern is and when to apply it.
**Implementation:**
[Code example or step-by-step description]
**Rationale:** Why this pattern was chosen.
```

When a pattern is **deprecated** you can either delete it or update its status and note the replacement.

If this file gets corrupted, re-create it. 
CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

---

## Architecture

### Section-Based Layout

**Category:** Architecture
**Status:** Active
**Description:** Site organized into distinct sections (Hero, Services, Products, Contact) each in its own directory under src/sections/. Each section exports an index component and may have sub-components.
**Implementation:**
```
src/sections/
  Hero/
    index.tsx (main component)
    components/
      HeroContent.tsx
  ServicesSection/
    index.tsx
    components/
      ServicesGrid.tsx
      ServiceCard.tsx
```
**Rationale:** Clear separation of concerns, easy to locate and modify specific sections, scalable structure.

## Data Flow

### Static Data Arrays

**Category:** Data Flow
**Status:** Active
**Description:** Service and product data defined as const arrays within components, mapped to render cards/items.
**Implementation:**
```typescript
const services = [
  { title: "CNC Work", description: "...", icon: "⚙️", gradient: "from-blue-500 to-blue-600" },
  // ...
];

return (
  <div className="grid">
    {services.map((service, index) => (
      <ServiceCard key={index} {...service} />
    ))}
  </div>
);
```
**Rationale:** No database requirement, easy to maintain, type-safe with TypeScript interfaces.

## Error Handling

<!-- Standard approaches to errors, validation, and recovery -->
