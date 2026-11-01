# Learning objectives

Eleven research capabilities, each with what it requires, how it is
demonstrated, the misconceptions it is meant to remove, and the evidence that
counts as completion. "Demonstrated" means without help: code written with
assistance counts once I can rebuild it from an empty file and explain every
line.

| ID   | Capability                                            | Phases |
| ---- | ----------------------------------------------------- | ------ |
| RC1  | Predict the outcome of a dialect conversion           | 1–5    |
| RC2  | State what a conversion mechanism guarantees          | 1–5    |
| RC3  | Separate enforced IR invariants from conventions      | 1–2    |
| RC4  | Write an SMT encoding and state its meaning           | 3–6    |
| RC5  | Say what a solver answer establishes about the system | 3–8    |
| RC6  | Show that a verdict depends on semantics and domain   | 4–7    |
| RC7  | Check a model against the system it models            | 6–7    |
| RC8  | Classify an observation                               | 2–8    |
| RC9  | Design and preregister a falsifiable experiment       | 5–7    |
| RC10 | Read a paper critically                               | 6, 8   |
| RC11 | Compare research directions on evidence               | 8      |

## RC1. Predict the outcome of a dialect conversion

- **Requires:** the conversion modes, the legality actions and their
  precedence, the pattern order, rollback, and when operations created by a
  pattern must themselves be legalized.
- **Demonstration:** given an input, a target, a pattern set and a mode, write
  the resulting IR or diagnostic and the mechanism that decides it, before
  running.
- **Misconceptions:**
  - "Full conversion converts every operation." It requires every operation to
    be legal afterwards; legal operations stay as they are, including those
    made legal by `markUnknownOpDynamicallyLegal`.
  - "Partial conversion cannot fail." It fails when an operation explicitly
    marked illegal remains.
  - "Analysis conversion shows the converted IR." It applies no rewrites; it
    reports which operations would be legalizable.
  - "The pattern with the highest benefit is tried first." The conversion
    driver orders patterns first by legalization depth, computed from the
    operations each pattern declares it generates, and only then by benefit.
- **Evidence:** a blind score of at least 4 of 5 on upstream conversion tests
  with their CHECK lines hidden (phase 5), and the phase-1 predictions about
  `DSPToLinalg.cpp` checked in E-DC-05.

## RC2. State what a conversion mechanism guarantees

- **Requires:** the six ledger questions answered for each mechanism M1–M13
  ([roadmap](../ROADMAP.md#the-dialect-conversion-ledger)).
- **Demonstration:** for any mechanism, state what it guarantees, what it does
  not, and the experiment that shows the difference.
- **Misconceptions:**
  - "If the conversion succeeds, the output is valid IR." The driver's success
    and the verifier's verdict are separate; a pattern can create an operation
    its verifier rejects.
  - "A pattern that returns success keeps its changes." With rollback enabled,
    the driver undoes a pattern's changes when the operations it created cannot
    be legalized.
  - "After `eraseOp` or `replaceOp`, the old operation is gone." In the default
    rollback mode both are delayed to the end of the conversion, and the old
    operation stays visible to later patterns.
- **Evidence:** the ledger with at most five answers marked _unverified_, all
  listed in `semantics.md`; the failure table from phase 3.

## RC3. Separate enforced IR invariants from conventions

- **Requires:** operations, regions and blocks; block arguments as values;
  value scoping and dominance in SSA CFG regions; graph regions; isolation from
  above; properties and discardable attributes.
- **Demonstration:** `ir-probe` reports the nesting, the definers and uses of
  values, and dominance violations on chosen inputs.
- **Misconceptions:**
  - "`Operation::walk` visits operations in pre-order." Post-order is the
    default.
  - "Block arguments are not definitions." They are values like operation
    results; VizMLIR's captured output shows what treating them otherwise does.
  - "Every region requires dominance." Graph regions do not.
- **Evidence:** on three invalid inputs, `ir-probe`'s dominance check flags
  exactly the uses the verifier rejects; the invariants note cites a source for
  every invariant it calls enforced.

## RC4. Write an SMT encoding and state its meaning

- **Requires:** satisfiability and validity; models; the theories of
  integers, bitvectors, uninterpreted functions and datatypes; quantifiers.
- **Demonstration:** for an encoding, write the formula it asserts in logical
  notation and say what each answer would mean.
- **Misconceptions:**
  - "`sat` on a property proves it." It shows the property can hold; validity
    needs `unsat` for its negation.
  - "Every value in a model carries information." Values of unconstrained
    variables are arbitrary.
  - "The Python code is the encoding." The encoding is the SMT-LIB term it
    builds; `Solver.to_smt2()` shows it.
- **Evidence:** for each of S-01 to S-08, the formula, the prediction, the
  answer, and agreement or an explanation.

## RC5. Say what a solver answer establishes about the system

- **Requires:** the direction of every approximation in a model: whether every
  real behavior is a model behavior (over-approximation), or every model
  behavior is real (under-approximation).
- **Demonstration:** for each result in the experiment, state what transfers to
  the real system and why.
- **Misconceptions:**
  - "`unknown` means there is no counterexample." It means no answer.
  - "`unsat` over an abstraction proves the property for the system." Only if
    the abstraction includes every real behavior. With an uninterpreted
    function it holds for every interpretation, the real one included; with a
    bounded domain it holds only inside the bound.
  - "A `sat` model is a real counterexample." Only once it replays in the real
    system.
- **Evidence:** the phase-8 audit: every `sat` model replayed, every core
  checked against the stated reason, every `unknown` listed with solver version
  and timeout.

## RC6. Show that a verdict depends on semantics and domain

- **Requires:** integer and bitvector arithmetic; SMT-LIB's total semantics for
  shifts against poison semantics; refinement; width-generic rules.
- **Demonstration:** a rule or property whose verdict changes when only the
  semantics or only the domain changes, with both encodings.
- **Misconceptions:**
  - "Equivalent under SMT-LIB means equivalent in the compiler." Not where the
    compiler's semantics differ, for example a shift by at least the width,
    which is poison in LLVM and MLIR.
  - "Valid at width 8 means valid."
- **Evidence:** S-04 and S-06; in X2, the comparison across widths and
  semantics.

## RC7. Check a model against the system it models

- **Requires:** a harness that turns models into concrete inputs; an oracle
  outside the model; reproducible runs.
- **Demonstration:** the applied experiment's results table: witness, model
  prediction, real outcome, classification.
- **Misconceptions:**
  - "A disagreement means the compiler is wrong." The model, the harness, the
    oracle or the specification may be wrong instead.
  - "Agreement on many inputs validates the model." Only inputs that could have
    exposed a difference count.
- **Evidence:** every witness replayed; the agreement rate reported; every
  disagreement classified, with at least two alternative explanations.

## RC8. Classify an observation

- **Requires:** the taxonomy in the
  [experiment template](experiment-template.md#classifying-observations) and
  the evidence each label needs.
- **Demonstration:** each observation in a report that claims a bug, a gap or
  a problem carries a label and that label's evidence.
- **Misconceptions:**
  - "A failed conversion is a bug." It may be an unsupported input or a
    restriction of the chosen target.
  - "Overlapping patterns conflict." An overlap whose results join is
    harmless.
  - "Non-confluence of verified rules causes miscompilation." Under equivalence
    semantics, it cannot.
- **Evidence:** from phase 2 on, no phase report contains an unlabeled claim of
  a bug, gap or problem.

## RC9. Design and preregister a falsifiable experiment

- **Requires:** a hypothesis that can fail; an observation that would refute
  it; a plan for each outcome.
- **Demonstration:** the preregistration, committed before the first run.
- **Misconceptions:**
  - "More runs strengthen a hypothesis." Only runs that could have refuted it
    do.
  - "The hypothesis can be adjusted after seeing results." Changes are
    amendments, reported as such.
- **Evidence:** `experiment/preregistration.md`, committed before the first
  run, with a falsification condition the experiment could have met.

## RC10. Read a paper critically

- **Requires:** separating a paper's claim from its evidence; finding what its
  model leaves out; threats to validity.
- **Demonstration:** a written critique of one paper relevant to the
  experiment.
- **Misconceptions:**
  - "The headline result generalizes." Only within the paper's domain and
    assumptions.
  - "Related work means papers with similar keywords." It means work that
    answers or constrains my question.
- **Evidence:** a critique stating the claim, method, evaluation, what the
  model leaves out, threats to validity, and one question it leaves open for a
  direction in potential-research-ideas.md.

## RC11. Compare research directions on evidence

- **Requires:** the eight comparison dimensions; the evidence each candidate
  produced; the option of rejecting all of them.
- **Demonstration:** the phase-8 comparison and decision-log entry.
- **Misconceptions:**
  - "The candidate with more code is further along." Code without validated
    results is not evidence of feasibility.
  - "Rejecting both candidates means the program failed."
- **Evidence:** every comparison cell holds evidence or "unknown"; the
  decision-log entry names the evidence that would reverse it.
