# Roadmap

Eight phases, in order. Each phase states its objective, study targets,
hands-on tasks, deliverables, stop conditions, a checkpoint, and the
uncertainty it is meant to reduce. A phase ends when its deliverables exist and
its stop conditions hold, however long that takes. IDs are shared across the
documents: mechanisms M1–M13, conversion experiments E-DC-01 to E-DC-14, SMT
exercises S-01 to S-08, applied experiments X1–X3.

## Phases

| Phase | Focus                                               | Main outputs                                       |
| ----- | --------------------------------------------------- | -------------------------------------------------- |
| 1     | Test the starting point; make the driver observable | toolchain, `ir-probe` v1, four written predictions |
| 2     | Legality                                            | ledger M1–M4, E-DC-01 to E-DC-05, `ir-probe` v2    |
| 3     | Patterns, rollback and failure                      | ledger M5–M9, failure table, S-01 to S-03          |
| 4     | Types and materializations; bounded arithmetic      | ledger M10–M13, S-04 to S-06                       |
| 5     | Conversion semantics; choosing the experiment       | `semantics.md`, blind score, preregistration       |
| 6     | Building the encoding and the oracle                | encoding, harness, notes on one paper              |
| 7     | Running, comparing, explaining                      | results table, minimal reproducers                 |
| 8     | Synthesis                                           | results audit, comparison of directions, memo      |

Dialect conversion carries phases 1–5 and is the deepest part of the program.
The Toy tutorial and Understanding the IR Structure come first and cover only
what my projects have not already shown. SMT starts in phase 3 and carries
phases 6–7. The [resource map](docs/resource-map.md) gives the sections for
each phase.

## Toolchain

MLIR work uses `llvmorg-23.1.1`, the release `manifest.json` pins. Homebrew's
build of that release is optimized without assertions and leaves out MLIR's
test passes, so `-debug-only=dialect-conversion` and `-test-legalize-patterns`
do not exist in it. Build once, outside the repository. On an 8 GB machine, one
link job and four compile jobs keep the build within memory:

```sh
git clone --depth 1 --branch llvmorg-23.1.1 \
  https://github.com/llvm/llvm-project.git ~/llvm/src-23.1.1
cmake -S ~/llvm/src-23.1.1/llvm -B ~/llvm/build-23.1.1 -G Ninja \
  -DLLVM_ENABLE_PROJECTS=mlir -DLLVM_BUILD_EXAMPLES=ON \
  -DLLVM_TARGETS_TO_BUILD=Native -DCMAKE_BUILD_TYPE=Release \
  -DLLVM_ENABLE_ASSERTIONS=ON -DLLVM_PARALLEL_LINK_JOBS=1
ninja -C ~/llvm/build-23.1.1 -j 4 \
  mlir-opt FileCheck count not toyc-ch3 toyc-ch5 toyc-ch6 toyc-ch7
```

Check that `mlir-opt --version` reports assertions and that `mlir-opt --help`
lists `--test-legalize-patterns`. Upstream tests run with the build's lit, for
example
`~/llvm/build-23.1.1/bin/llvm-lit -v ~/llvm/src-23.1.1/mlir/test/Transforms/test-legalizer.mlir`.

The `z3` CLI is 5.1.0 (Homebrew). Z3Py is pinned to the same Z3 and lives in
`.work/`, run from the repository root:

```sh
python3 -m venv .work/venv
.work/venv/bin/pip install z3-solver==5.1.0.0
.work/venv/bin/python -c "import z3; print(z3.get_version_string())"
```

PyPI shows an "inconsistent provenance" notice on the 5.x releases of
`z3-solver`; read it before installing.

`ir-probe` builds into `.work/` against the build above:
`cmake -S conceptual-foundations/ir-probe -B .work/ir-probe -G Ninja -DMLIR_DIR=$HOME/llvm/build-23.1.1/lib/cmake/mlir`.
Homebrew's MLIR CMake package (the same release) is the fallback until the
build is ready.

## The dialect-conversion ledger

`dialect-conversion/ledger.md` is the main output of phases 1–5. It has one
entry per mechanism:

| ID  | Mechanism                                                       | Phase |
| --- | --------------------------------------------------------------- | ----- |
| M1  | Conversion modes: partial, full, analysis                       | 1–2   |
| M2  | Legality actions (legal, dynamic, illegal) and their precedence | 1–2   |
| M3  | Operations of unknown legality                                  | 2     |
| M4  | Recursive legality                                              | 2     |
| M5  | Pattern order: legalization depth, then benefit                 | 3     |
| M6  | Conversion patterns and adaptors: remapped operands             | 3     |
| M7  | Immediate and delayed IR modification: rollback on and off      | 3     |
| M8  | Folding during conversion                                       | 3     |
| M9  | Legalization of created and in-place-modified operations        | 3     |
| M10 | Type converters: conversions and their order                    | 4     |
| M11 | Source and target materializations                              | 4     |
| M12 | Signature conversion: block arguments and regions               | 4     |
| M13 | Unresolved materializations and cast reconciliation             | 4     |

Each entry answers six questions:

1. What does the mechanism guarantee?
2. What does it not guarantee?
3. Which assumptions does it rely on?
4. Which observable behavior demonstrates it? (an experiment ID)
5. How could a static model of a conversion misrepresent it?
6. Which test would expose a wrong assumption about it?

Every answer cites a section of the documentation, a function at
`llvmorg-23.1.1`, or an experiment. An answer without a citation is marked
_unverified_.

## Phase 1 — Test the starting point; make the driver observable

**Objective.** Check the
[starting-capability classification](README.md#starting-capabilities) against
my own code, and get a toolchain that shows the conversion driver's decisions.

**Study targets.**

- Toy tutorial chapters 1–4, as a checklist
  ([resource map](docs/resource-map.md#mlir-toy-tutorial)).
- Understanding the IR Structure, all of it, with `TestPrintNesting.cpp`;
  LangRef: Operations, Blocks, Regions, Properties, Attributes.
- Dialect Conversion: Modes of Conversion, Conversion Target.

**Tasks.**

1. Dialect conversion: build the [toolchain](#toolchain). Run
   `test-legalizer.mlir`, `test-legalizer-full.mlir` and
   `test-legalizer-analysis.mlir`; all three must pass before any experiment.
2. Toy: list the concepts of chapters 1–4 and classify each against my projects
   (proven, verify, gap), with evidence. Skip what is proven. Run `toyc-ch3`
   with `-emit=mlir -opt -debug-only=greedy-rewriter` on one chapter-3 test
   input, and explain one pattern application from the log.
3. IR structure: read the targets, then build `ir-probe` v1. It parses a file,
   allowing unregistered operations, and prints the nesting (operation, region,
   block, operation); for each operation, its name, each operand's definer
   (which result of which operation, or which argument of which block), its
   result types, its inherent and discardable attributes, and the kind of each
   region (SSA CFG or graph). Compare the output with
   `mlir-opt -test-print-nesting` and `--mlir-print-op-generic` on
   `mlir/test/IR/print-ir-nesting.mlir` and on two inputs of my own. At least
   three lit tests.
4. Dialect conversion: read the targets. Then, without running anything, answer
   in writing for the configuration in nano-dsp-mlir's `DSPToLinalg.cpp`
   (`addIllegalDialect`, `markUnknownOpDynamicallyLegal` returning true,
   `applyFullConversion`): which operations must be converted; what happens to
   an operation of another dialect that no pattern handles; what changes under
   `applyPartialConversion`; what changes without
   `markUnknownOpDynamicallyLegal`. Phase 2 tests these four predictions. Draft
   ledger entries M1 and M2.

**Deliverables.** `reports/phase-1.md` with the build record (commands and
versions); the capability classification revised in README.md, with evidence;
`ir-probe/` v1 with tests; ledger drafts M1–M2; the four written predictions.

**Stop conditions.** A Toy chapter ends when each of its concepts is classified
with evidence. If the build fails twice, use Homebrew's `mlir-opt` with
`--log-actions-to=-` (pattern attempts only) for phases 1–2 and record what
that cannot show. `ir-probe` v1 stops at the features listed.

**Checkpoint.** Toy chapters 5–7: continue, skim or skip each, depending on how
many of its concepts are already proven. Each "needs conceptual verification"
item in README.md stays, or moves to proven with its evidence.

**Optional:** Toy chapter 4.

**Uncertainty reduced:** How much of my MLIR experience is understanding, and
how much is working code I could not re-derive? Can I see, on this machine,
what the conversion driver decides?

## Phase 2 — Legality: what a target declares, and what "converted" means

**Objective.** From the target alone, predict which operations a conversion
must convert, may leave alone, or fails on.

**Study targets.**

- Toy chapter 5 (Conversion Target, Conversion Patterns, Partial Lowering),
  chapter 6 (Lowering to LLVM), chapter 7 for its type conversion only.
- Dialect Conversion: Conversion Target and Recursive Legality again;
  `ConversionTarget` in `mlir/include/mlir/Transforms/DialectConversion.h`.
- Upstream tests: `test-legalizer-full.mlir`, `test-legalizer-analysis.mlir`,
  `test-legalize-unknown-root.mlir`.

**Tasks.**

1. Toy: in chapter 5, change the dynamic legality of `toy.print`, then switch
   partial conversion to full; predict each outcome, run with
   `-debug-only=dialect-conversion`, and explain it. In chapter 6, note which
   operations become legal only through other patterns. In chapter 7, find how
   the struct type is converted.
2. Dialect conversion. Each experiment is recorded with the
   [experiment template](docs/experiment-template.md).
   - E-DC-01: one input under partial, full and analysis conversion, with and
     without `markUnknownOpDynamicallyLegal`.
   - E-DC-02: an operation marked illegal inside a legal dialect, and the
     reverse. Which declaration wins?
   - E-DC-03: an operation that is dynamically illegal for some operand types
     and has no applicable pattern.
   - E-DC-04: an illegal operation nested in a recursively legal one, under full
     conversion.
   - E-DC-05: the four phase-1 predictions, reproduced in the test pass or by
     rebuilding nano-dsp-mlir against this build, whichever is simpler.

   Experiments that need another target configuration patch the upstream test
   pass (`mlir/test/lib/Dialect/Test/TestPatterns.cpp`) and keep the patch.
   Complete ledger entries M1–M4.

3. IR structure. `ir-probe` v2: each value's uses, and whether a use sits in a
   nested region (an implicit capture); which operations are isolated from
   above; an independent check that each use is dominated by its definition
   (`DominanceInfo`), compared with the verifier on three invalid inputs. Then
   a one-page note on the invariants an analysis tool may rely on: enforced by
   the verifier, merely conventional, or not guaranteed (graph regions,
   unregistered operations), each with its source. Last, run `ir-probe` on the
   input behind VizMLIR's block-argument finding and write one paragraph: what
   the real IR says, where VizMLIR's model went wrong, and which test would
   have caught it.

**Deliverables.** Ledger M1–M4 with experiment IDs; E-DC-01 to E-DC-05;
`ir-probe` v2 with tests; the invariants note; the VizMLIR paragraph; the
report.

**Stop conditions.** An experiment ends when its prediction is confirmed or
refuted and the deciding mechanism is named from the debug log or the source.
Anything else goes to open questions.

**Checkpoint.** Fewer than three of the four phase-1 predictions right:
legality continues before anything else in phase 3. `ir-probe` is frozen after
v2.

**Optional:** Toy chapter 7.

**Uncertainty reduced:** What does a legality declaration constrain? What
exactly do "converted" and "the conversion succeeded" mean in each mode?

## Phase 3 — Patterns, rollback and failure

**Objective.** Explain any conversion success or failure by the mechanism that
decided it.

**Study targets.**

- Dialect Conversion: Rewrite Pattern Specification, Conversion Patterns,
  Remapped Operands / Adaptor, Immediate vs. Delayed IR Modification,
  Debugging.
- `mlir/lib/Transforms/Utils/DialectConversion.cpp` at the pin:
  `OperationLegalizer::legalize`, `legalizeWithFold`, `legalizeWithPattern`,
  `legalizePatternCreatedOperations`, `computeLegalizationGraphBenefit`;
  `ConversionPatternRewriterImpl::undoRewrites`.
- Pattern Rewriting: Benefit.
- Upstream tests: `test-legalizer.mlir` (both rollback settings),
  `test-legalizer-rollback.mlir`, `test-legalizer-no-rollback.mlir`, and the
  three folding tests.
- Z3 Guide, Logic: Introduction, Basic Commands, Propositional Logic,
  Uninterpreted Functions and Constants.

**Tasks.**

1. Dialect conversion.
   - E-DC-06: two patterns for one operation, with different benefits and
     different distances to a legal form. Which is tried first, and why?
   - E-DC-07: a pattern that creates an operation the target cannot legalize:
     the diagnostic, and what is left of the pattern's changes, with rollback on
     and off.
   - E-DC-08: one input under the three folding modes.
   - E-DC-09: trigger each "failed to legalize …" diagnostic the driver emits at
     the pin, or record why one could not be triggered.

   Write ledger entries M5–M9, and a failure table: diagnostic, the mechanism
   that raises it, what it implies about the input, the target and the
   patterns, and what it does not imply.

2. Z3 Guide, in SMT-LIB with the `z3` CLI, with a prediction written before
   each run.
   - S-01: prove a property by refuting its negation; explain why `sat` on the
     property itself proves nothing.
   - S-02: encode the legality declarations of E-DC-01 to E-DC-04 in
     propositional logic, and ask whether an operation can end up neither legal
     nor converted; compare the model with what the driver did.
   - S-03: a helper that a pattern calls, as an uninterpreted predicate.
     Observe that models choose arbitrary helper behavior; add one axiom;
     explain why `unsat` with an uninterpreted function holds for every
     interpretation, while a `sat` model may match no real helper.

**Deliverables.** Ledger M5–M9; E-DC-06 to E-DC-09; the failure table; `smt/`
with S-01 to S-03; the report.

**Stop conditions.** Experiments as in phase 2. A Z3 Guide page ends when its
exercises run and every result matches its prediction or the mismatch is
explained.

**Checkpoint.** If rollback (M7) is still not predictable, it continues in
phase 4 before type conversion.

**Optional:** E-DC-08.

**Uncertainty reduced:** When a conversion succeeds or fails, which mechanism
decided, and could I have predicted it?

## Phase 4 — Types and materializations; bounded arithmetic

**Objective.** Follow every value and type through a conversion; show that an
SMT verdict depends on the domain and the semantics chosen.

**Study targets.**

- Dialect Conversion: Type Safety, Type Conversion, Type Converter, Region
  Signature Conversion.
- `reconcileUnrealizedCasts` and `OperationConverter::applyConversion` at the
  pin.
- Upstream tests: `test-legalize-type-conversion.mlir`,
  `test-legalizer-no-materializations.mlir`,
  `test-legalize-target-materialization-no-uses.mlir`,
  `test-legalize-remapped-value.mlir`,
  `test-context-aware-type-converter.mlir`.
- Z3 Guide, Theories: Arithmetic (Basics, Non-linear arithmetic, Division),
  Bitvectors. Programming Z3: §1 and §2.

**Tasks.**

1. Dialect conversion.
   - E-DC-10: under partial conversion, a value whose producer is converted
     while one of its users is not: where a materialization appears, and what
     it is.
   - E-DC-11: the same input with materializations disabled
     (`build-materializations=0`).
   - E-DC-12: provoke "failed to legalize unresolved materialization" and
     explain it.
   - E-DC-13: converting the types of block arguments in a region.
   - E-DC-14: for each `TypeConverter` callback and materialization in
     json-schema-mlir's `LowerToStandard.cpp`, the situation that triggers it
     and what would break without it.

   Write ledger entries M10–M13.

2. Z3 Guide.
   - S-04: `x + 1 > x` over the integers, over 8-bit vectors with a signed
     comparison, and with an unsigned one.
   - S-05: a non-linear integer query; record what z3 5.1.0 answers, with and
     without a timeout, and how a tool should report `unknown`.
   - S-06: one shift rule from Lozenge's corpus, checked under SMT-LIB semantics
     (a shift by at least the width gives 0, as Lozenge's `docs/SEMANTICS.md`
     requires) and under a semantics where such a shift is poison, with
     refinement as the criterion: wherever the left side is not poison, the
     right side is not poison and has the same value. Explain any change of
     verdict.
3. Programming Z3: install Z3Py as in [Toolchain](#toolchain), confirm it
   reports the CLI's version, and port S-01 to S-03 to Python.

**Deliverables.** Ledger M10–M13; E-DC-10 to E-DC-14; S-04 to S-06; the Python
ports; the report.

**Stop conditions.** As in phase 3.

**Checkpoint.** List every ledger answer still without evidence; phase 5 closes
those first.

**Optional:** E-DC-13.

**Uncertainty reduced:** Where do types and values change during a conversion,
and where can a mismatch hide? Does an SMT verdict depend on the domain and the
semantics I choose?

## Phase 5 — Conversion semantics on one page; choosing the experiment

**Objective.** Write the conversion semantics precisely enough to model them;
choose and preregister the applied experiment.

**Study targets.** Z3 Guide: Quantifiers (Logic), Datatypes (Theories).
Programming Z3: §3.1 EUF; §4.1 Incrementality, §4.2 Scopes, §4.3 Assumptions.

**Tasks.**

1. Dialect conversion.
   - Close the ledger gaps listed in phase 4.
   - Write `dialect-conversion/semantics.md`: what partial, full and analysis
     conversion do at the pin, in order: traversal, legality check, folding,
     pattern order, legalization of new operations, rollback, materializations,
     and the final success condition. Every sentence cites a section, a
     function at the pin, or an experiment; claims I could not check are listed
     separately.
   - From the ledger's fifth answers, list what a static model of a conversion
     must represent.
   - Blind test: take five cases from upstream conversion tests I have not run,
     hide their CHECK lines and expected diagnostics, predict, then compare.
     Record the score.
2. Z3 Guide.
   - S-07: a property with a universal quantifier over an uninterpreted
     function; record the answer; restate the query without quantifiers by
     negating it; note when compiler-condition queries need quantifiers at all.
   - S-08: one finite domain (operation kinds, element types) encoded as a
     datatype and as integers with range constraints; produce an out-of-domain
     model and classify it.
3. Programming Z3: redo S-02 incrementally, with `push` and `pop` per operation
   kind and `check(assumptions)` to name the responsible declaration.
4. Applied: choose the experiment
   ([criteria](#choosing-the-applied-experiment)); fill in the "Before running"
   fields of the experiment template and commit them before the first run; add
   a decision-log entry to potential-research-ideas.md.

**Deliverables.** `semantics.md`; the static-model list; the blind score; S-07
and S-08; the incremental S-02; `experiment/preregistration.md`; the
decision-log entry; the report.

**Stop conditions.** `semantics.md` is done when every sentence carries a
citation or is listed as unverified, not when it reads well.

**Checkpoint, the main one.** Blind score of 4 or 5: dialect-conversion study
ends here. Score of 3 or less: the mispredicted mechanisms become the first
capability gap in the memo, and if the experiment is X1 it must exercise them.

**Optional:** S-08.

**Uncertainty reduced:** Can I describe conversion precisely enough to model
it, and which parts resist? Which single experiment would most reduce
uncertainty about the candidates?

## Choosing the applied experiment

Chosen at the end of phase 5, not before. Criteria:

1. It tests a hypothesis or assumption recorded in
   [potential-research-ideas.md](potential-research-ideas.md), or one that
   phases 1–5 produced.
2. Its oracle sits outside the model: the real MLIR driver, an independent
   reference evaluator, or z3 on an encoding already validated against one.
3. Both outcomes are informative. Before running, write down what each outcome
   would change in potential-research-ideas.md.
4. It is small: one encoding, one oracle and one set of runs, with no new tool
   to build first.
5. It does not require finishing a candidate's implementation.

Options. Another experiment that meets the criteria is allowed.

- **X1. Does a guard model predict a real conversion?** Model the legality
  declarations and pattern conditions of a small upstream conversion in SMT;
  generate inputs from models; run the real pass; classify every disagreement.
  Possible targets: one TOSA-to-Linalg operation family, or an arith-to-SPIR-V
  case whose legality depends on the target environment. Hypothesis: a model
  built from the declarations and pattern conditions alone predicts success or
  failure on every generated input. Bears on LowerAudit.
- **X2. Do Lozenge's verdicts survive other widths and another semantics?** In
  Z3Py, encode the 30 rules of Lozenge's corpus (the rule reader in
  `test/ref/corpus.py` can be reused) under Lozenge's SMT-LIB semantics and
  under poison semantics for shifts; check widths 1–64; compare with the
  brute-force verdicts at widths 1–6. Hypotheses: the verdict at widths 1–6 is
  the verdict at every width up to 64; no verdict changes between the two
  semantics. Bears on Lozenge, and on the bounded-parameter question both
  candidates share.
- **X3. Are overlapping MLIR patterns joinable in meaning?** For one family of
  upstream patterns that can match the same operations (for example the
  `arith.select`-of-`cmpi` to min/max canonicalizations and the folds on the
  same operations), build each overlap as an input, find what each pattern
  alone produces, and check with SMT whether both results refine the input,
  with poison modeled. Isolating one pattern is part of the work:
  `-canonicalize="enable-patterns=SelectCmpISltToMinSI"` does not apply that
  DRR pattern at the pin, so use the greedy driver's debug log or a test pass
  that registers only the patterns in question. Hypothesis: every overlap in
  the family is joinable in meaning. Bears on Lozenge's question, in a
  production compiler.

## Phase 6 — Building the encoding and the oracle

**Objective.** An encoding whose answers can be checked against the real
system.

**Study targets.** Programming Z3: §4.4 Cores, §4.5 Models, §5.1 Blocking
evaluations, and §3.4 Bit-Vectors or §3.5 Algebraic Datatypes as the encoding
requires. Z3 Guide: the theory pages the encoding uses.

**Tasks.**

1. Programming Z3: build the encoding in `experiment/`; enumerate distinct
   witnesses with blocking clauses; for each `unsat`, extract a core and check
   that it matches the reason I expected.
2. Z3 Guide: dump the solver state as SMT-LIB (`Solver.to_smt2()`), run it with
   the `z3` CLI, and confirm the answers are the same; annotate each assertion
   with its meaning; check that the assumptions alone are satisfiable, since
   otherwise every property holds vacuously.
3. Applied: read the method and evaluation sections of one paper relevant to
   the experiment
   ([candidates](docs/resource-map.md#papers-for-the-applied-phases)) and note
   how the authors checked their model against the real system. Then build the
   oracle harness, which turns a model into a concrete input and runs the real
   system.

**Deliverables.** The encoding and witness generator; the annotated SMT-LIB
dump; the vacuity check; the harness; notes on the paper; the report.

**Stop conditions.** The encoding stops growing at the preregistered scope; new
ideas go to open questions.

**Checkpoint.** If the harness cannot run the real system, cut the scope to
what it can run, as an amendment to the preregistration.

**Optional:** enumerating more than 20 witnesses.

**Uncertainty reduced:** Can I build an encoding whose answers I can check?

## Phase 7 — Running, comparing, explaining

**Objective.** Confront the model with the real system and explain every
disagreement.

**Study targets.** Z3 Guide: Optimization. Programming Z3: §5.4 All Cores and
Correction Sets, §7.1 Tactic Basics.

**Tasks.**

1. Programming Z3: run the full experiment; find a minimal instance of each
   class of disagreement; simplify formulas for the write-up.
2. Z3 Guide: smallest counterexamples with `Optimize`; reread the limits met so
   far (`unknown`, timeouts, out-of-domain models) and record which ones
   affected results.
3. Applied: run every witness through the oracle; classify each disagreement
   with the [taxonomy](docs/experiment-template.md#classifying-observations);
   give each at least two alternative explanations, and say how each was ruled
   out, or that it was not.

**Deliverables.** A results table (witness, model prediction, real outcome,
classification); minimal reproducers; the report.

**Stop conditions.** Every disagreement is classified or explicitly left
unexplained. The scope does not grow to find more.

**Checkpoint.** If the hypothesis was neither confirmed nor refuted, record
why; the memo's first experiment must deal with it.

**Optional:** §5.4.

**Uncertainty reduced:** Do the model's predictions survive contact with the
real system, and what explains each failure?

## Phase 8 — Synthesis

**Objective.** Decide, on evidence, what research can start and how it could
fail.

**Tasks.**

1. Programming Z3: audit every solver result the memo will cite. Replay each
   `sat` model through the oracle; check each core against the reason given;
   confirm the assumptions are satisfiable; list every `unknown` with the
   solver version and timeout.
2. Applied.
   - Analysis: what the experiment established, under which assumptions, and
     which alternative explanations remain.
   - Related work: finish the phase-6 paper as a full critique (claim, method,
     evaluation, what its model leaves out, threats to validity); write the
     related-work questions for each direction.
   - Directions: fill in the comparison in potential-research-ideas.md for
     LowerAudit, Lozenge and "neither, something else", with evidence or
     "unknown" in each cell; add a decision-log entry.
   - Memo: `research-readiness-memo.md` from the
     [template](docs/research-readiness-memo-template.md).

**Deliverables.** The results audit; the paper critique; the updated comparison
and decision log; the memo; the final phase report.

**Stop conditions.** The memo is done when every section is filled and every
claim has evidence or a label.

**Checkpoint.** The memo's decision: start research on a scoped question, run
one more experiment first, or reject both candidates and name what to examine
instead.

**Uncertainty reduced:** Is any direction ready for a scoped research project,
and which result would falsify its central hypothesis?

## Exit criteria

The program is complete when all of these hold:

1. The ledger answers the six questions for M1–M13; at most five answers in it
   are marked _unverified_, and `semantics.md` lists them.
2. The phase-5 blind score is at least 4 of 5, or the memo names the
   mispredicted mechanisms as its first capability gap.
3. Every SMT exercise has a prediction written before it ran, and every
   mismatch is explained.
4. The applied experiment was preregistered before its first run; it is
   reproducible from recorded commands, versions and revisions; every
   disagreement is classified, with at least two alternative explanations
   considered.
5. One paper is critiqued at full-text level.
6. The memo fills all twelve sections, and its first experiment states a
   falsification condition.
7. The comparison of directions has evidence or "unknown" in every cell, and
   "neither" was assessed, not skipped.

## After the program

Each item starts only if the memo's direction needs it, in this order.

- **Haskell, along Lozenge's own stages.** Lozenge's stages 1–2 first
  (`eval`, `typecheck`, `evalT`): algebraic data types and pattern matching,
  then GADTs with singletons. That is the reference semantics everything else
  is checked against. Then its stages 3–4 (`verifyBrute`, `ruleQuery`,
  `verifySmt`), keeping the check that rejects spurious counterexamples. Its
  stage 5 (matching, unification, critical pairs) only for a rewriting
  direction, with recursion schemes only as far as `Fix ExprF` needs them. QuickCheck throughout; it is
  already a test dependency. Skip lenses, effect systems, and type-level
  programming beyond what `TExpr` uses.
- **Theory.** For a rewriting direction: abstract reduction systems,
  termination and confluence, and the critical-pair lemma (Baader and Nipkow);
  conditional critical pairs, since Lozenge's stage 5 skips rules with
  preconditions; refinement with poison (Alive2). For a conversion-coverage
  direction: test-adequacy criteria, and small-model or cutoff arguments for
  unbounded parameters such as rank.
- **MLIR.** For a conversion-coverage direction: 1:N type conversion, PDLL
  patterns, and rewriter listeners as a way to observe pattern application.
