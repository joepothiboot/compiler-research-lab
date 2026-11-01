# Potential research ideas

A working record of research directions under consideration. It is not a thesis
proposal: no topic has been chosen, and nothing here claims novelty.

**Labels.** **F** is a fact, with its source: a command, a file at a commit, or
a document. **H** is a hypothesis that this program or later work could test.
**A** is an assumption, taken as true for now and not checked. **U** is an open
question.

LowerAudit, Lozenge and the planning notes behind them are private
repositories, so they are described here, not linked. What they show counts as
evidence in this document only once it is reproduced in this section.

## How directions are compared

In phase 8, each candidate, and the option "neither; something else", is
assessed on these questions. Every cell gets evidence or "unknown". Nothing is
ranked before then.

| Dimension              | Question                                               |
| ---------------------- | ------------------------------------------------------ |
| Problem clarity        | Can the research question be stated precisely?         |
| Technical feasibility  | Can a meaningful prototype be built?                   |
| Theoretical foundation | Are the needed properties understood?                  |
| Novelty risk           | How much relevant prior work is still to be checked?   |
| Evaluation             | Is there a convincing way to measure the contribution? |
| Scope                  | Can a master's student finish a meaningful result?     |
| Research risk          | Which assumptions could invalidate the approach?       |
| Capability gap         | What must I learn before proceeding?                   |

## A question both candidates share

- F: Each candidate meets a parameter with no upper bound: tensor rank for
  LowerAudit, bit width for Lozenge's width-generic rules. Lozenge's reference
  verdicts cover widths 1–6 (`test/ref/corpus.py`).
- F: Checking finitely many values of such a parameter says nothing about the
  others unless something about the system guarantees it.
- U: Under which conditions do finitely many checks settle every value, and can
  those conditions be checked against real code?

## Candidate A: LowerAudit

**Topic.** Coverage of MLIR dialect conversions: which inputs in a declared
domain a conversion fails to handle, and why.

**What exists.**

- F: A planning repository (`4c559b4`) with a problem statement, a literature
  survey at bibliographic or abstract level, a decision log and a risk
  register. Its README states that it holds no tool code yet.
- F: An earlier prototype (`loweraudit-lab`, `42e72a1`) writes pattern guards
  by hand as SBV predicates, with a coverage-gap query, and reads operation
  definitions from TableGen. The guards were not extracted from the C++
  patterns. A separate script replays a witness through `mlir-opt`; the
  repository records no run of it. The script reports a "failed to legalize
  operation" error as a confirmed bug, and any other outcome, other errors
  included, as a successful lowering that calls for refining the model.

**Motivation.**

- F: Whether a conversion handles an input is decided across pattern guards
  written in C++, type converters, legality callbacks and the verifiers of the
  operations it creates (Dialect Conversion documentation; ledger M1–M13).
- F: Upstream conversions are tested on finitely many example inputs (lit
  tests).
- H: Inputs that are valid for the source dialect but fail to convert exist in
  real conversions and are missed by their tests.

**Preliminary research question.** For a conversion C at a pinned MLIR revision
and a declared input domain D, can the inputs in D that C fails to handle be
found and classified (unsupported input, target restriction, missing pattern,
genuine gap) with evidence a maintainer would accept?

**Hypotheses.**

- H-A1: For one operation family, the outcome depends on a small set of input
  features: element type, rank class, static or dynamic dimensions,
  attributes.
- H-A2: Running the real conversion over an enumerated, bounded domain finds
  failures the upstream tests miss.
- H-A3: For some conversions, behavior at every value of an unbounded parameter
  follows from behavior below a computable bound, under conditions that can be
  checked against the source.

**Assumptions.**

- A-A1: An oracle says which inputs should be handled, for example the source
  dialect's specification or verifier.
- A-A2: "Handled" can be defined operationally: the conversion succeeds, the
  output verifies, and no illegal operation remains. Whether meaning is
  preserved is a separate question that coverage does not answer.
- A-A3: The driver is deterministic for a fixed input, with threading
  disabled.
- A-A4: Results at one pinned revision stay meaningful while upstream changes.

**Technical approach, one option.** Execute the real conversion over an
enumerated domain; observe pattern attempts and outcomes through the driver's
instrumentation; optionally model guards in SMT to explain outcomes; compare
with the inputs the existing tests exercise.

**Required theory.** Dialect-conversion semantics (roadmap phases 1–5); SMT and
bounded modeling (roadmap phases 3–7); test-adequacy criteria; for H-A3,
small-model or cutoff arguments, beyond this program.

**Required implementation.** C++ against MLIR internals (listeners, running
passes from code); input generation; a harness; SMT encodings for
explanations.

**Related-work questions.**

- What do existing generators of random MLIR programs find, and what would
  exhaustive bounded enumeration add? Csmith is the reference point for
  generator-based compiler testing.
- How do completeness checks for instruction selectors relate to conversion
  coverage?
- Are there small-model or cutoff results for parameters like rank?
- Which compilers report rewrite rules that are never exercised, and what do
  they do with that information?

**Novelty risks.** U: rule-coverage reporting in production compilers, and
completeness results for instruction selectors, may already cover much of
this. The survey so far is at bibliographic level, so the risk is unmeasured.

**Feasibility risks.**

- The oracle may be missing or ambiguous for the inputs that matter.
- Observing which pattern applied may need instrumentation that changes what is
  observed.
- The domain grows combinatorially.
- On simple conversions, the result may be trivial.
- Conversion code changes with every release; results hold at a pin.

**Evaluation possibilities.** Gaps confirmed by maintainers; comparison with
the inputs the existing tests exercise; the false-positive rate of any SMT
explanation; the cost per conversion.

**Evidence needed before committing.**

1. At least one input that is valid under an explicit oracle, fails a real
   conversion, is not covered by the existing tests, and is acknowledged as a
   problem; or evidence that such inputs are rare.
2. A definition of "handled" agreed with a supervisor.
3. A measured run showing that pattern attempts and outcomes can be observed
   with the fidelity the method needs.
4. A full-text reading of the related work above.
5. If the applied experiment is X1: whether a guard model predicted the real
   driver.

## Candidate B: Lozenge / brokendiamond

**Topic.** Interactions between rewrite rules: critical pairs, joinability,
confluence, and how the rewriting strategy affects the result.

**What exists.**

- F: Lozenge (`851895e`) is a Haskell learning project with specifications,
  stubs and tests for a typed bitvector IR, a brute-force and an SMT verifier,
  matching and unification, critical pairs and an e-graph, built up in six
  stages. 74 functions are `error "TODO"` stubs, among them the SMT-LIB
  emitter, the SMT verifier and every critical-pair function. The `z3`
  subprocess wrapper is implemented.
- F: Its corpus has 30 bitvector rules: 22 valid, 8 deliberately wrong, 4 with
  preconditions. The reference verdicts at widths 1–6 come from an independent
  Python script, `test/ref/corpus.py`, not from the Haskell code.
- F: Its page comparing greedy rewriting with equality saturation states that
  nothing on it is a measurement yet.
- F: Its semantics follow SMT-LIB on purpose: a shift by at least the width
  gives 0 (`docs/SEMANTICS.md`).
- F: Its fifth stage skips rules with preconditions, both in rewriting and in
  critical pairs (`docs/TODO-p5b.md`, `docs/TODO-p5c.md`).
- F: Planning notes for a thesis on confluence of verified rewrite rules
  ("brokendiamond") exist and are private.

**What follows from the definitions.** These are F, by short arguments.

- If every rule preserves meaning (both sides agree on every input that
  satisfies its precondition) and meaning is compositional, every rewrite step
  preserves meaning, so both results of any critical pair mean the same thing.
  Non-confluence of such a rule set changes which equivalent form comes out,
  not whether the output is correct.
- If rules may be wrong, a critical pair whose two results differ in meaning
  shows that at least one of its two rules is wrong, under equivalence
  semantics. Under refinement semantics, as with LLVM- and MLIR-style poison,
  two different results can both refine the same source, so a difference alone
  shows nothing.
- If the two results of a critical pair reach different normal forms, the rule
  set is not confluent, whether or not it terminates; if they reach the same
  one, the pair is joinable. Running out of fuel decides nothing.

**Motivation.**

- F: MLIR's greedy driver applies patterns from a worklist by local benefit,
  and its documentation notes that the traversal order can change what matches
  when the pattern set is ambiguous (Pattern Rewriting, Greedy Pattern Rewrite
  Driver).
- H: In realistic rule sets, non-joinable critical pairs make the final form
  depend on rule order or traversal order.

**Preliminary research questions.** The facts above force a choice between two
variants.

- B1, verified rules: for a rule set verified sound under a stated semantics,
  which critical pairs are not joinable, and does that cause observable
  differences in output form, cost, or test brittleness under the strategies
  compilers use?
- B2, unverified rules: can critical-pair analysis with a semantic check find
  wrong patterns in pattern sets that nobody verified, such as MLIR's C++ and
  DRR patterns?

**Hypotheses.**

- H-B1: Non-joinable critical pairs occur in realistic rule sets and make
  greedy results depend on rule order. Lozenge's demo was designed to test
  this; there are no data yet.
- H-B2: Equality saturation removes that dependence on order, at a measurable
  cost.
- H-B3: Semantic checking of overlapping MLIR patterns finds a wrong pattern
  that the existing tests miss.

**Assumptions.**

- A-B1: Rules are first-order term rewrites. MLIR patterns rewrite DAGs and
  carry C++ side conditions, so classical critical-pair results may not
  transfer.
- A-B2: The semantics used for verification is the one that matters. Lozenge's
  shift semantics differ from LLVM's and MLIR's.
- A-B3: A width-generic rule that holds at the widths checked holds at all
  widths.
- A-B4: Ignoring rules with preconditions is acceptable. Lozenge's fifth stage
  does so, which misses every critical pair that involves a conditional rule.

**Technical approach, one option.** Compute critical pairs; decide joinability
by normalizing with fuel; check pairs that do not join for equality of meaning
with SMT; compare greedy normal forms across rule orders with the results of
equality saturation.

**Required theory.** Abstract reduction systems, termination, local
confluence, Newman's lemma and the critical-pair lemma (Baader and Nipkow);
unification; equality saturation (Tate et al.; egg); refinement with poison
(Alive2); for MLIR patterns, critical pairs in graph rewriting, not yet
surveyed.

**Required implementation.** Lozenge's stages 1–5, which are stubs, or an
equivalent; SMT encodings validated against a reference semantics; for B2 and
H-B3, extraction of MLIR patterns and an executable or SMT semantics for their
operations.

**Related-work questions.**

- How do Alive and Alive2 state and check the correctness of one rewrite, and
  how do they treat poison and undefined values?
- What does equality saturation (Tate et al.; egg) claim about rule order, and
  at what cost?
- Has critical-pair analysis been applied to the peephole or canonicalization
  rules of a compiler? Not yet searched.
- How do MLIR's pattern drivers handle non-convergence (iteration limits,
  `-canonicalize="test-convergence=true"`)?

**Novelty risks.** Critical-pair analysis and completion are classical;
verifying single rewrites is well studied (Alive); equality saturation is
established (egg). A contribution would have to lie in the application, the
semantic check, or the evaluation. Not assessed.

**Feasibility risks.**

- 74 stubbed functions: the prototype is a specification, not a tool.
- The semantics may not match real compilers (A-B2).
- MLIR patterns may not fit the first-order model (A-B1).
- The number of critical pairs may grow faster than they can be checked.

**Evaluation possibilities.** The number of critical pairs and the share that
join; semantic verdicts for the rest; order dependence observed in real
pipelines; wrong patterns found (H-B3); the cost of saturation against greedy
rewriting.

**Evidence needed before committing.**

1. A verifier, Lozenge's or another, validated against its reference
   semantics: no spurious counterexamples on the corpus.
2. A choice between B1 and B2, with the semantics (total or poison) justified.
3. At least one realistic rule set where non-joinable pairs cause observable
   differences, or evidence that they do not.
4. Full-text readings of Alive2 on refinement and of equality saturation.
5. If the applied experiment is X2 or X3: its result.

## Other directions, unexamined

Recorded so they are not lost. None has been evaluated.

- Checking static IR analyses against ground truth, for example VizMLIR's
  memory-access verdicts against hardware counters.
- Soundness of lattice-based canonicalization: json-schema-mlir merges
  constraints by a meet operation whose Mojo tests check a grid of cases; an
  SMT proof of the meet rules is a small, self-contained formal question.
- Neither of these nor A nor B: an acceptable outcome of the program.

## Comparison

Filled in during phase 8, from the evidence available then. Until then, no
cell is filled and nothing is ranked.

| Dimension              | LowerAudit | Lozenge | Neither; something else |
| ---------------------- | ---------- | ------- | ----------------------- |
| Problem clarity        | —          | —       | —                       |
| Technical feasibility  | —          | —       | —                       |
| Theoretical foundation | —          | —       | —                       |
| Novelty risk           | —          | —       | —                       |
| Evaluation             | —          | —       | —                       |
| Scope                  | —          | —       | —                       |
| Research risk          | —          | —       | —                       |
| Capability gap         | —          | —       | —                       |

## Decision log

Entries are added and never edited; a change of mind is a new entry that
supersedes an old one. Status is ACCEPTED, PROPOSED or SUPERSEDED.

### RD-001 · ACCEPTED · Keep both candidates open

- **Decision:** LowerAudit and Lozenge stay exploratory, and no thesis topic is
  chosen. The program evaluates both with the same criteria, and "neither"
  stays an option.
- **Evidence:** the inspection above. LowerAudit has a plan and hypotheses but
  no tool; Lozenge has specifications and tests but no implementation. Neither
  has produced a result that could support or refute its premise.
- **Revisit:** at the phase-5 checkpoint, when the applied experiment is
  chosen, and in phase 8.
