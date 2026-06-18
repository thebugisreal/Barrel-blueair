# Review Instructions

These instructions apply to every agent in the review pipeline and take precedence over default review guidance.

---

## What "Important" means here

Reserve Important for findings that would break behavior in production: incorrect logic, unguarded null access that throws, silent failures where output is wrong but no error is raised, missing auth checks, or unscoped data access.

Style, naming, and refactoring suggestions are **Nit** at most.

---

## The Five-Axis Review

Evaluate every change across these five dimensions:

**1. Correctness** — Does the code do what it claims? Edge cases handled (null, empty, boundary values)? Error paths covered, not just the happy path? Off-by-one errors, race conditions, state inconsistencies?

**2. Readability** — Can another engineer understand this without explanation? Names descriptive and consistent with project conventions? No nested ternaries or deep callbacks? No dead code (`_unused`, `// removed`, backwards-compat shims no longer needed)?

**3. Architecture** — Does the change follow existing patterns? If a new pattern, is it justified? Clean module boundaries? No circular dependencies? Abstractions earning their complexity — don't generalize until the third use case?

**4. Security** — Input validated at system boundaries? No secrets in code, logs, or version control? Auth and authorization checked? Queries parameterized? External data treated as untrusted?

**5. Performance** — N+1 query patterns? Unbounded loops or unconstrained data fetching? Synchronous operations that should be async? Unnecessary re-renders? Missing pagination on list endpoints?

---

## Review the tests first

Before looking at implementation, check whether tests exist for the change, whether they test behavior (not implementation details), and whether they would catch a regression if the code changed.

---

## Categorize every finding

| Label | Meaning | Author action |
|---|---|---|
| **Critical** | Security vulnerability, data loss, broken functionality | Must fix before merge |
| **Important** | Runtime bug, wrong logic, silent failure | Must fix before merge |
| **Nit** | Style, naming, minor cleanup | Optional |
| **FYI** | Context only | No action needed |

Label every comment. Unlabeled comments create ambiguity about what's required.

---

## Cap the nits

Report at most **five Nits** per review. If you found more, say "plus N similar items" in the summary. If all findings are Nits, lead with "No blocking issues."

---

## Verification bar

Before posting an Important finding, confirm it with a **file:line citation** in the source — not an inference from naming. "This might throw" is not sufficient; show the code path.

---

## Approval standard

Approve a change when it definitely improves overall code health, even if imperfect. Don't block because it isn't exactly how you would have written it. Block only on Critical or Important issues.

---

## Summary format

Open the review body with a one-line tally: `X blocking, Y nits`. If no blocking issues, lead with **"No blocking issues"** before listing nits.

---

## Do not

- Rubber-stamp without evidence of review
- Soften real issues ("this might be a minor concern" when it's a production bug)
- Post behavior claims without a file:line citation
- Accept "I'll clean it up later" — require cleanup before merge unless it's a genuine emergency
