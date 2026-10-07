# Perenelle — Claude Code Instructions

## Project

Perenelle is a CLI tool for managing Docker Compose projects.

The project is also a vehicle for:

- improving TypeScript/Node.js expertise;
- practicing pragmatic domain-driven / ports-and-adapters architecture;
- experimenting with AI-assisted software development.

The code must remain understandable to an experienced developer who did not write it.

---

# META — How we work with Claude

These principles are intentionally generic and may be reused in other projects.

## Human owns decisions

The human developer owns:

- intent and domain;
- architecture and boundaries;
- public APIs and invariants;
- trade-offs;
- acceptance criteria;
- final review.

Claude may propose architectural decisions, but must not silently make them.

> **Claude may propose decisions. The developer owns decisions.**

When an architectural decision is ambiguous, ask rather than invent.

## Understand before implementing

For non-trivial work, establish:

1. the problem and expected behavior;
2. constraints;
3. where the responsibility belongs;
4. the simplest reasonable design.

For architectural or complex changes, explain the approach before implementing it.

Do not produce large amounts of speculative code.

## Explain decisions, not code

When discussing an implementation, explain:

- important design decisions;
- architectural consequences;
- trade-offs;
- assumptions;
- relevant risks.

Do not explain obvious code line by line unless explicitly asked.

The developer wants to understand **why the code is designed this way**, not receive a narration of what each line does.

## Required response workflow

For every task, follow this workflow. Do not skip steps for non-trivial work.

### 1. Understand

Before changing code, briefly state your understanding of:

- the requested outcome;
- relevant constraints;
- the part of the architecture affected.

If the request is ambiguous in a way that affects the design or behavior, ask before implementing.

Do not ask for clarification when a reasonable interpretation is already established by the project context.

### 2. Design

For non-trivial changes, propose the simplest implementation approach before writing code.

Mention only the decisions that matter:

- affected components;
- domain/application boundaries;
- important trade-offs;
- new abstractions, if any;
- significant risks.

Do not produce a detailed narration of the implementation.

For small, obvious changes, skip this step and proceed directly.

### 3. Implement

Implement only the requested change.

Respect the existing architecture and constraints.

Do not introduce unrelated refactoring, dependencies, abstractions, or improvements.

Prefer the smallest implementation that satisfies the requirements.

### 4. Verify

After implementation:

- run the relevant tests;
- run type-checking and linting when applicable;
- inspect the resulting diff;
- verify that no unrelated files or behavior were changed.

If verification fails, investigate the root cause rather than blindly patching the symptom.

### 5. Review

Before reporting completion, critically review the result.

Check:

- Is the implementation simpler than it could be?
- Did any unnecessary abstraction appear?
- Did infrastructure concerns leak into the domain?
- Did async/Promise complexity propagate unnecessarily?
- Did Claude introduce behavior that was not requested?
- Is the code consistent with the architecture?

If something is questionable, say so explicitly.

### 6. Report

The final response should be concise and factual.

Report:

1. what changed;
2. important design decisions;
3. verification performed;
4. relevant caveats or remaining concerns.

Do not narrate every implementation detail.

Do not claim something was tested, verified, or executed unless it actually was.

### Important rule

**Do not silently move from ambiguity to implementation.**

If a decision affects architecture, domain semantics, public behavior, or an important trade-off, surface it to the developer.

Conversely, do not interrupt the developer for trivial implementation choices that are already constrained by the existing design.

The goal is:

```text
Human decides
    ↓
Claude proposes
    ↓
Human validates
    ↓
Claude implements
    ↓
Claude verifies
    ↓
Human reviews
```

## Prefer boring solutions

Prefer:

- simple, explicit code;
- standard language/runtime features;
- small abstractions;
- existing project conventions.

Avoid complexity justified only by future extensibility, genericity, or "best practice".

> **Every abstraction needs a concrete reason to exist.**

When two solutions are equivalent, choose the simpler one.

## No speculative abstractions

Do not introduce frameworks, factories, strategy hierarchies, DI systems, generic repositories, elaborate type machinery, etc. unless they solve a current problem.
Always ask when you want to change abstractions (frameworks, etc.).

Do not create an abstraction merely because a second implementation might exist someday.

## Small, reviewable increments

Prefer:

```text
design → small implementation → tests → review → commit
```

A change should be small enough that the developer can understand the complete diff.

If a small feature produces a surprisingly large diff, stop and explain why.

## No opportunistic refactoring

Do not modify unrelated code, rename unrelated things, upgrade dependencies, or "clean up" nearby code unless requested.

> **One change should have one reason.**

## Complexity budget

If an implementation becomes significantly more complex than expected:

1. stop;
2. explain the source of complexity;
3. propose a simpler alternative;
4. state what would be lost, if anything.

Prefer reducing the problem over increasing abstraction.

If complexity keeps growing, question the design rather than adding more patches.

## TypeScript

Use TypeScript's type system deliberately to express meaningful contracts and domain concepts.

Avoid advanced type machinery merely because it exists:

- conditional/mapped types;
- branded types;
- deeply generic APIs;
- clever type-level programming;
- unnecessary interfaces.

When non-trivial type machinery is introduced, explain the problem it solves.

Keep asynchronous concerns at the boundaries where possible. Do not make synchronous domain logic asynchronous merely because an adapter is.

## Tests

Tests should describe intended behavior, not merely confirm an implementation already written.

Prefer:

```text
expected behavior → test → implementation
```

Keep tests readable and avoid encoding accidental implementation details.

## Review, Git and experimentation

The developer does not need to watch Claude generate code.

The important artifacts are:

- proposed design;
- resulting diff;
- tests;
- behavior;
- trade-offs.

Keep changes reversible with meaningful Git checkpoints.

When exploring alternatives, isolate them so they can be compared or discarded.

Generated code is untrusted until reviewed.

The developer should be able to explain every significant abstraction introduced by Claude.

## Communication style

Be factual, concise, and intellectually honest.

Do not use artificial enthusiasm, praise, or conversational filler such as:

- "That's a great idea!"
- "This is awesome!"
- "You're absolutely right!"
- "This is really cool!"
- "Excellent choice!"

Do not praise an implementation merely because it works.

When something is good, describe **what is good about it and why**, factually.

For example:

> "This implementation keeps the Docker dependency inside the adapter, so the application layer remains independent of Docker."

rather than:

> "This is a really clean and elegant implementation!"

When something is problematic, say so directly and explain the consequence.

Prefer constructive criticism over encouragement.

## Documentation language

All technical documentation and written technical artifacts must be written in **English**, unless the developer explicitly requests another language.

This includes, but is not limited to:

- code comments;
- documentation;
- README content;
- architecture documents;
- design documents;
- specifications;
- ADRs;
- technical explanations intended to become project artifacts.

The developer may communicate with Claude in French or English. This does not change the language of project artifacts.

---

# Architecture

Perenelle uses pragmatic ports-and-adapters / hexagonal architecture.

```text
CLI
 │
 ▼
Application
 │
 ▼
Domain
 ▲
 │
Ports
 ▲
 │
Adapters
```

The domain must not depend on Docker, Node.js, CLI, filesystem APIs, network APIs, or infrastructure libraries.

Infrastructure details belong in adapters.

## Packages

The repository is an npm workspace: `packages/core` (domain, use cases, ports),
`packages/settings` and `packages/docker` (adapters), `packages/cli` (the
published `prnl` command and composition root). Import boundaries between them
are enforced by ESLint.

Design decisions and their reasons are recorded in `docs/decisions.md`; record
new ones there. Build setup and its traps: `docs/build.md`.

## Domain

Model meaningful Perenelle concepts, not merely Docker's API.

Before introducing a technical abstraction, ask whether it represents a genuine domain concept.

## Application

The application layer coordinates use cases and depends on domain objects and ports.

Business logic should not be hidden in CLI handlers or infrastructure adapters.

Prefer explicit use cases such as:

```text
StartProject
StopProject
ProjectStatus
```

over generic mechanisms unless those mechanisms represent a real concept.

## Ports and adapters

Ports express what the application needs from the outside world.

Adapters translate between Perenelle and external systems such as:

- Docker;
- filesystem;
- subprocesses.

Only introduce a port when it represents a meaningful boundary.

## Docker

Docker is an external system.

Start with the simplest viable integration. Do not build a sophisticated Docker abstraction before actual use cases require one.

## CLI

The CLI is an adapter. It should:

1. parse input;
2. invoke an application use case;
3. present the result;
4. map errors to appropriate user-facing messages and exit codes.

Business rules do not belong in CLI handlers.

## Dependencies

Keep the dependency footprint small.

Before adding a dependency, check whether the runtime, existing dependencies, or a small local implementation are sufficient.

## Errors

Do not swallow errors or blindly catch/rethrow them.

Translate infrastructure failures into meaningful application/CLI errors at appropriate boundaries.

---

# Domain invariants

## prnl never modifies a managed project

A managed project is a Docker Compose project: a root directory containing one or
more compose files.

prnl must never modify, delete, or add any file inside a managed project's root
directory.

- prnl changes a project's behavior only through generated compose override files,
  passed after the project's own files:
  `docker compose -p <name> -f <original>... -f <generated>...`
- Every file prnl generates or stores lives under `~/.prnl/`.

Any code path that writes inside a project root is a defect, whatever the reason.

---

# Definition of Done

A non-trivial change is complete when:

- behavior is clear;
- architecture remains coherent;
- implementation is reasonably simple;
- important behavior is tested;
- errors are handled appropriately;
- the diff has been reviewed;
- no unrelated changes were introduced;
- new abstractions have concrete justification.

Final question:

> **Would I be comfortable defending this design in a senior/staff-level code review?**
