# Review Instructions

These instructions apply to every agent in the review pipeline and take precedence over default review guidance.

---

## What "Important" means here

Flag as **Important** only when the issue would break functionality in production, cause a runtime error, or produce silently incorrect output:

- Incorrect logic or wrong conditional that changes behavior
- Unguarded null/undefined access that throws at runtime
- Silent failure where output is wrong but no error is raised
- Missing auth or authorization check on a protected action
- Security vulnerability that is practically exploitable

Style, naming, and refactoring suggestions are **Nit** at most.

---

## PR size

```
~100 lines changed   → Good
~300 lines changed   → Acceptable if it's one logical change
~1000 lines changed  → Flag it: ask the author to split into smaller PRs
```

If a PR exceeds 1000 lines, flag this as **Important** with a suggestion to split. Large PRs hide bugs and slow down review.

---

## The Five-Axis Review

Evaluate every change across these five dimensions:

**1. Correctness** — Does the code do what it claims? Edge cases handled (null, empty, boundary values)? Error paths covered, not just the happy path? Off-by-one errors, race conditions, state inconsistencies?

**2. Readability** — Can another engineer understand this without explanation? Names descriptive and consistent with project conventions? No nested ternaries or deep callbacks? No dead code (`_unused`, `// removed`, backwards-compat shims no longer needed)?

**3. Architecture** — Does the change follow existing patterns? If a new pattern, is it justified? Clean module boundaries? No circular dependencies? Abstractions earning their complexity — don't generalize until the third use case?

**4. Security** — Input validated at system boundaries? No secrets in code, logs, or version control? Auth and authorization checked? Queries parameterized? External data treated as untrusted?

**5. Performance** — N+1 query patterns? Unbounded loops or unconstrained data fetching? Synchronous operations that should be async? Unnecessary re-renders? Missing pagination on list endpoints? Images without dimensions or lazy loading?

---

## Review the tests first

Before looking at implementation: do tests exist for the change? Do they test behavior (not implementation details)? Would they catch a regression if the code changed?

---

## Dead code

After any refactoring or implementation change, check for orphaned code — unreachable functions, unused variables, removed-feature shims, `// TODO` comments referencing deleted work. Flag dead code as **Nit** with a specific list.

---

## Dependency discipline

When a PR adds a new dependency, flag it for review:

- Does the existing stack already solve this?
- Is it actively maintained? (check last commit, open issues)
- Does `npm audit` / `composer audit` show known vulnerabilities?
- What is the license? (must be compatible with the project)
- How large is it? (check bundle impact)

Flag any new dependency that fails these checks as **Important**.

---

## Security — flag these as Critical

- `eval()` or `innerHTML` used with user-provided or external data
- Secrets, API keys, or tokens committed to code or logged
- Stack traces or internal error details exposed to end users
- Client-side validation used as the only security boundary (no server-side check)
- SQL or query strings built by concatenating user input
- Auth or permission check missing on a protected endpoint

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

Before posting an Important or Critical finding, confirm it with a **file:line citation** in the source — not an inference from naming. Show the code path that demonstrates the problem.

---

## Do not accept these rationalizations

- "It works, that's good enough" — working code can still be insecure, unreadable, or architecturally wrong
- "The tests pass, so it's good" — tests don't catch security issues, architecture problems, or dead code
- "AI-generated code is probably fine" — AI code needs more scrutiny, not less, it's confident even when wrong
- "I'll clean it up later" — later never comes, require cleanup before merge

---

## Approval standard

Approve when the change definitely improves overall code health, even if imperfect. Don't block because it isn't exactly how you would have written it. Block only on Critical or Important issues.

---

## Summary format

Open every review body with: `X blocking, Y nits`. If no blocking issues, lead with **"No blocking issues"** before listing nits.
