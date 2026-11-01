# Conceptual foundations

_Conversion semantics, SMT modeling, experimental method._

A practical, phased program for moving from building MLIR compilers to doing
compiler research: stating a precise question, building a model of real
compiler behavior, testing that model against the compiler, and saying exactly
what the result does and does not show.

**Status:** phase 1 has not started. No experiment has been run, and nothing in
this section reports a result yet.

| Document                                                                             | Contents                                                                    |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [ROADMAP.md](ROADMAP.md)                                                             | the eight phases, in order                                                  |
| [potential-research-ideas.md](potential-research-ideas.md)                           | LowerAudit, Lozenge and alternatives, with facts and hypotheses kept apart  |
| [docs/learning-objectives.md](docs/learning-objectives.md)                           | the research capabilities the program must produce, and how each is checked |
| [docs/resource-map.md](docs/resource-map.md)                                         | what to read in each resource, in which phase, and what to skip             |
| [docs/experiment-template.md](docs/experiment-template.md)                           | the record every experiment fills in, and how to classify what it found     |
| [docs/phase-report-template.md](docs/phase-report-template.md)                       | the report written at the end of each phase                                 |
| [docs/research-readiness-memo-template.md](docs/research-readiness-memo-template.md) | the final memo                                                              |

## Why

I have built MLIR pipelines: a `dsp` dialect lowered through Linalg,
bufferization and a Transform-dialect schedule to LLVM (nano-dsp-mlir), and a
JSON Schema front end and dialect lowered to LLVM (json-schema-mlir). Building
them did not require knowing what dialect conversion guarantees, what an SMT
answer establishes, or where a symbolic model stops describing the compiler it
models. Research needs exactly that. My two candidate directions, LowerAudit
and Lozenge, both depend on it, and neither is yet supported by evidence that
would justify committing to it.

## Starting capabilities

Classified from my projects' code. This is a prior, not a result: phase 1 tests
it. The projects are private repositories, cited at the commits given; the
first two match `manifest.json`.

**Proven practical competence.** Not studied again.

- Defining a dialect in ODS, with verifiers: nano-dsp-mlir `DSPOps.td`
  (`0de4c3c`), json-schema-mlir `SchemaOps.td` (`914691c`).
- Lowering through Linalg, bufferization and upstream passes to LLVM, and
  Transform-dialect schedules: nano-dsp-mlir's tests and `lib/Schedule/`.
- A hand-written front end that imports into MLIR: json-schema-mlir's
  `schema-translate --import-json-schema`.

**Needs conceptual verification.** The code exists; I have not shown that I
can predict its behavior.

- Dialect conversion with `OpConversionPattern`, `ConversionTarget` and
  `applyFullConversion`. Both conversion passes I wrote (`DSPToLinalg.cpp`,
  `LowerToStandard.cpp`) combine `addIllegalDialect`,
  `markUnknownOpDynamicallyLegal` and full conversion, and I have never written
  down what that combination guarantees. Phases 1–2.
- Type conversion and materializations: `LowerToStandard.cpp` uses a
  `TypeConverter` with source and target materializations. Phase 4.
- Greedy pattern application: `SchemaCanonicalizerPass.cpp`. Phases 1 and 3.
- IR traversal and use-def queries: `walk` in nano-dsp-mlir's
  `ScheduleGen.cpp`, and `DominanceInfo` and user queries in `LocalMemory.cpp`
  (newer than the pinned commit). Phases 1–2.
- Block arguments as values. At its pinned commit, VizMLIR reports uses of a
  function argument as undefined SSA values (captured on this repository's
  site): a defect in my own model of the IR. Phase 2.
- Term-rewriting theory (critical pairs, joinability, confluence). Lozenge's
  fifth stage has specifications and tests, but no implementation and no
  written proofs. Not part of this program unless the applied experiment needs it.
- Reading papers in full. LowerAudit's literature survey checked 16 written
  sources at bibliographic or abstract level only. Phases 6 and 8.

**Genuine knowledge gaps.**

- The conversion driver's mechanics: the order in which it legalizes
  operations and chooses patterns, rollback, legalization of the operations
  patterns create, analysis mode, and what each failure diagnostic means. No
  project of mine depends on them, and LowerAudit's risk register lists
  rollback attribution as unclear. Phases 2–5.
- Writing SMT encodings and reading solver results. No project has a working
  encoding: Lozenge's SMT-LIB emitter and verifier are unimplemented stubs, and
  LowerAudit's earlier prototype hand-wrote guard predicates, with no recorded
  check against MLIR. Phases 3–8.
- Haskell beyond the basics: GADTs with singletons, monad transformer stacks,
  recursion schemes. Lozenge's typed core is built on them; at `851895e`, 74
  of its functions are `error "TODO"` stubs, and its learning log records no
  implementation for any of its six stages. See [Haskell](#haskell).

## Objectives

By the end of the last phase I should be able to:

1. read a compiler paper and state what its evaluation does and does not
   support;
2. predict the outcome of a dialect conversion from its input, target, patterns
   and mode, and name the mechanism that decides it;
3. write SMT encodings of compiler conditions and state their logical meaning;
4. say what a `sat`, `unsat` or `unknown` answer establishes about the real
   system, and what it does not;
5. recognize when a model and the compiler disagree because of the model;
6. turn an observation into a precise research question, or show that it is
   not one;
7. design a small experiment that could falsify a hypothesis, and preregister
   it;
8. compare LowerAudit, Lozenge and other directions on evidence, including
   rejecting all of them.

[Learning objectives](docs/learning-objectives.md) turns these into
capabilities with pass criteria.

## How the program works

- **A phase ends with its deliverables.** It is done when its deliverables
  exist and its stop conditions are met, however long that takes.
- **Predict, then run.** Every experiment and every solver query has a written
  prediction from before it ran.
- **Every claim carries a label:** fact (with the command, source line or
  document that establishes it), hypothesis, assumption, or unknown.
- **Observations are classified.** A compiler bug, an unsupported input, a
  coverage gap and an abstraction artifact need different evidence; the
  [experiment template](docs/experiment-template.md#classifying-observations)
  says which.
- **Unaided capability counts.** Exit criteria measure what I can do without
  help. Code written with assistance counts once I can rebuild it from an empty
  file and explain every line.
- **Candidates are tested, not advanced.** LowerAudit and Lozenge get the same
  scrutiny, and "neither" is an acceptable outcome.

## Technologies

| Technology             | Role                                                                     | Version                                                                  |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| C++ and MLIR           | the system under study: the conversion driver, IR invariants             | `llvmorg-23.1.1` built with assertions; the release `manifest.json` pins |
| SMT-LIB and `z3` (CLI) | the exact meaning of an encoding; ground truth for what was asked        | z3 5.1.0                                                                 |
| Z3Py                   | building and querying encodings                                          | `z3-solver` 5.1.0.0, the same Z3 as the CLI                              |
| Python                 | harnesses that turn models into concrete inputs and compare the outcomes | 3.11, as in `manifest.json`                                              |
| Haskell                | Lozenge's language                                                       | GHC 9.10.3; used only if the applied experiment needs it (see below)     |

## Haskell

Haskell matters beyond this program: Lozenge is written in it, and term
representations, interpreters and property tests fit it well. It gets no
separate curriculum here. What Lozenge's code (`851895e`) shows:

- **What blocks the SMT verifier.** `verifySmt` and the ten functions it
  depends on in Lozenge's stages 1–4 are all stubs (its `docs/TODO-p4b.md`
  lists them), and the corpus test needs about eight more. Only the `z3`
  subprocess wrapper, `Solver.hs`, is implemented. Finishing the verifier is
  not a narrow task.
- **Language gaps on that path:** GADTs indexed by sort and width with `SNat`
  singletons (`typecheck`, `evalT`), deciding at run time that two type indices
  are equal, a `ReaderT`/`ExceptT` stack with derived instances (`runVerify`),
  and recursion schemes over `Fix ExprF` (Lozenge's fifth stage).
- **Formal-modeling gaps, which no Haskell fixes:** which query establishes
  that a rule with a precondition is valid; what "verified" means for a
  width-generic rule checked at the one width in `configWidth`; whether
  SMT-LIB's total shift semantics, which Lozenge adopts on purpose, transfers
  to compiler IRs where an oversized shift is poison; and how rules with
  preconditions enter critical pairs (Lozenge's fifth stage skips them).
- **Minimum Haskell for one meaningful experiment.** None for experiment X2 in
  the [roadmap](ROADMAP.md#choosing-the-applied-experiment): it asks the
  modeling questions above with Z3Py and Lozenge's independent Python reference
  (`test/ref/corpus.py`). An experiment through Lozenge's own code needs at
  least `smtName`, `toSmt`, `checkEnv` and `evalT` plus one property test. That
  is outside this program, so choosing it is a recorded change of scope.
- **After the program,** in the order the
  [roadmap](ROADMAP.md#after-the-program) gives.

## Deliberately excluded

- A full LLVM backend, GPU and NPU architecture, advanced bufferization, new
  dialects from scratch: my projects already cover what this program needs from
  them.
- Complete formal-verification coursework, SMT solver internals, full Haskell
  study, full Knuth–Bendix completion, termination proofs: valuable later; none
  is needed to run and judge one experiment.
- Paper-writing training, CI and infrastructure work: the outputs are notes,
  experiments and a memo.
- Implementing LowerAudit or finishing Lozenge: the program tests their
  premises; it does not build them.

## Layout

Directories appear when their first file does.

```text
conceptual-foundations/
├── README.md                    this file
├── ROADMAP.md                   the phases
├── potential-research-ideas.md  candidates, evidence, decision log
├── docs/                        templates, resource map, learning objectives
├── reports/                     phase-1.md … phase-8.md         (from phase 1)
├── ir-probe/                    C++ IR inspection tool, tests   (from phase 1)
├── dialect-conversion/          ledger, semantics note, inputs  (from phase 1)
├── smt/                         SMT-LIB and Z3Py exercises      (from phase 3)
├── experiment/                  the applied experiment          (from phase 5)
└── research-readiness-memo.md                                   (phase 8)
```

- Builds and virtual environments go in the repository's `.work/` directory,
  which git and Prettier already ignore. The LLVM checkout and build live
  outside the repository.
- CI checks this Markdown with `prettier --check .`; run
  `npx prettier --write conceptual-foundations` before committing.
- Every result names the command, tool versions and revision that produced it,
  the rule the rest of this repository applies to captured artifacts.
- An experiment that needs a modified upstream test pass keeps the change as a
  patch file next to its record, so a clean `llvmorg-23.1.1` checkout
  reproduces it.

## Relation to the rest of this repository

The site renders pinned, captured output of finished projects. This section is
work in progress with no captured artifacts, so the site does not render it;
the site's tests also forbid links to a branch. It shares the repository's LLVM
pin and its provenance rule. Once the final memo exists, the site can link to
it at a pinned commit.
