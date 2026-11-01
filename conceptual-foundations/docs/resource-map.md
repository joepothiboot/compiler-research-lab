# Resource map

Five resources carry the study phases; the applied work in phases 5–8 draws on
papers and on my existing projects. Section names were checked against the
sources.

Read the MLIR documentation at the pinned release, `llvmorg-23.1.1`.
mlir.llvm.org follows the main branch; where the two differ, the pinned source
wins.

## MLIR Toy tutorial

- **Where:** https://mlir.llvm.org/docs/Tutorials/Toy/; at the pin,
  `mlir/docs/Tutorials/Toy/` and the code in `mlir/examples/toy/`.
- **Phases:** 1–2.
- **Relevant sections:**
  - Chapter 3, High-level Language-Specific Analysis and Transformation:
    patterns in C++ and in DRR, and how canonicalization applies them.
  - Chapter 5, Partial Lowering to Lower-Level Dialects for Optimization:
    Conversion Target, Conversion Patterns, Partial Lowering, Design
    Considerations With Partial Lowering.
  - Chapter 6, Lowering to LLVM and CodeGeneration: Lowering to LLVM
    (Conversion Target, Type Converter, Conversion Patterns, Full Lowering).
  - Chapter 7, Adding a Composite Type to Toy: only how the struct type is
    converted.
  - Chapter 4, Enabling Generic Transformation with Interfaces: only concepts I
    cannot place.
- **Why:** chapters 5 and 6 are the smallest complete, maintained examples of
  partial and full conversion, with binaries (`toyc-ch5`, `toyc-ch6`) small
  enough for prediction experiments.
- **Skip:** chapter 1 (front ends; json-schema-mlir has one), chapter 2
  (dialects and ODS; nano-dsp-mlir has one), Taking Advantage of Affine
  Optimization (chapter 5), CodeGen: Getting Out of MLIR (chapter 6).
- **Outcome:** the tutorial's concepts classified with evidence; one
  greedy-driver log and one partial-to-full change explained.

## Understanding the IR Structure

- **Where:** as given,
  https://github.com/llvm/llvm-project/blob/main/mlir/docs/Tutorials/UnderstandingTheIRStructure.md;
  at the pin,
  https://github.com/llvm/llvm-project/blob/llvmorg-23.1.1/mlir/docs/Tutorials/UnderstandingTheIRStructure.md.
- **Phases:** 1–2. Most of the work is building `ir-probe`.
- **Relevant sections:** all three: Traversing the IR Nesting; Other IR
  Traversal Methods (`getOps<OpTy>()`, walkers); Traversing the def-use chains.
  With them, `mlir/test/lib/IR/TestPrintNesting.cpp` and
  `mlir/test/IR/print-ir-nesting.mlir`.
- **Supporting:** the MLIR Language Reference (`mlir/docs/LangRef.md`):
  Operations; Blocks; Regions (Definition, Value Scoping, Control Flow and
  SSACFG Regions, Graph Regions, Arguments and Results); Properties;
  Attributes.
- **Why:** an analysis tool rests on what the IR guarantees: which values a use
  can see, the order a walk visits, what the verifier enforces. The page is
  short; the work goes into checking it with code.
- **Skip:** in the Language Reference, Notation, Dialects, the Type System
  beyond the builtin types I use, and IR Versioning.
- **Outcome:** `ir-probe` reproducing the nesting, the def-use structure and
  the dominance check; the note on invariants.

## Dialect Conversion

- **Where:** https://mlir.llvm.org/docs/DialectConversion/; at the pin,
  `mlir/docs/DialectConversion.md`.
- **Phases:** 1–5. The highest-priority resource.
- **Relevant sections:** all of them: Modes of Conversion; Conversion Target
  (Recursive Legality); Rewrite Pattern Specification (Conversion Patterns:
  Remapped Operands / Adaptor, Immediate vs. Delayed IR Modification, Type
  Safety); Type Conversion (Type Converter, Region Signature Conversion);
  Debugging.
- **Supporting, at the pin:**
  - `mlir/include/mlir/Transforms/DialectConversion.h`: `ConversionTarget`, and
    `ConversionConfig` with `unlegalizedOps`, `legalizableOps`, `listener`,
    `buildMaterializations`, `allowPatternRollback`, the folding mode,
    `attachDebugMaterializationKind` and `notifyCallback`.
  - `mlir/lib/Transforms/Utils/DialectConversion.cpp`:
    `OperationConverter::applyConversion`; `OperationLegalizer::legalize`,
    `legalizeWithFold`, `legalizeWithPattern`,
    `legalizePatternCreatedOperations` and `computeLegalizationGraphBenefit`,
    which orders patterns first by legalization depth (from the operations each
    pattern declares it generates), then by benefit;
    `ConversionPatternRewriterImpl::undoRewrites`; `reconcileUnrealizedCasts`.
  - The 18 dialect-conversion tests in `mlir/test/Transforms/`
    (`test-legalize*.mlir`, `test-legalizer*.mlir`,
    `test-block-legalization.mlir`, `test-context-aware-type-converter.mlir`,
    `test-dialect-conversion-pdll.mlir`). Most run `-test-legalize-patterns`
    with options for the mode (`test-legalize-mode=analysis|full`), rollback
    (`allow-pattern-rollback`), folding
    (`test-legalize-folding-mode=never|before-patterns|after-patterns`) and
    materializations (`build-materializations`). Their CHECK lines record the
    behavior at the pin.
  - Pattern Rewriting (`mlir/docs/PatternRewriter.md`): Benefit, and the Greedy
    Pattern Rewrite Driver for contrast.
  - My own passes: nano-dsp-mlir's `DSPToLinalg.cpp` and json-schema-mlir's
    `LowerToStandard.cpp`.
- **Why:** LowerAudit's premise is a claim about this driver. For rewriting
  questions it is the contrast case: a driver with legality, cost ordering and
  rollback, where the greedy driver has none.
- **Skip:** 1:N conversion beyond what the tests show; PDLL-based conversion
  unless experiment X1 needs it; the driver's performance.
- **Outcome:** the ledger (M1–M13), the failure table, `semantics.md`, and a
  blind prediction score of at least 4 of 5.

## Z3 Guide

- **Where:** https://microsoft.github.io/z3guide/docs/logic/intro/ (SMT-LIB,
  with an in-browser Z3). Exercises run with the local `z3` 5.1.0.
- **Phases:** 3–7.
- **Relevant sections, in order:**
  - Phase 3, Logic: Introduction, Basic Commands, Propositional Logic,
    Uninterpreted Functions and Constants.
  - Phase 4, Theories: Arithmetic (Basics, Non-linear arithmetic, Division),
    Bitvectors.
  - Phase 5: Quantifiers (Logic), Datatypes (Theories).
  - Phase 6: the theory pages the experiment's encoding uses, read against its
    SMT-LIB dump.
  - Phase 7: Optimization.
- **Why:** an SMT-LIB query is what an encoding means, and the guide states the
  theories' limits: its Arithmetic page says non-linear integer arithmetic is
  undecidable and that `check-sat` may return `unknown` or loop.
- **Skip:** Lambdas and Recursive Functions unless an encoding needs them;
  Strategies; FixedPoints; IEEE Floats, Arrays, Strings, Sequences, Regular
  Expressions, Unicode Characters, Special Relations and Finite Fields unless
  the experiment needs one; the Playground.
- **Outcome:** S-01 to S-08, each with a prediction; every query of the
  experiment explainable from its SMT-LIB form.

## Programming Z3

- **Where:** as given, https://theory.stanford.edu/~nikolaj/programmingz3.html.
  If it does not load, the same document is linked from the Z3 Guide:
  https://z3prover.github.io/papers/programmingz3.html (Nikolaj Bjørner,
  Leonardo de Moura, Lev Nachmanson, Christoph Wintersteiger; examples in
  Python).
- **Phases:** 4–8.
- **Relevant sections, in order:**
  - Phase 4: §1 Introduction, §2 Logical Interfaces to Z3 (Sorts, Signatures,
    Terms and Formulas).
  - Phase 5: §3.1 EUF: Equality and Uninterpreted Functions; §4.1
    Incrementality, §4.2 Scopes, §4.3 Assumptions.
  - Phase 6: §4.4 Cores, §4.5 Models, §5.1 Blocking evaluations; §3.4
    Bit-Vectors or §3.5 Algebraic Datatypes as the encoding requires.
  - Phase 7: §5.4 All Cores and Correction Sets, §7.1 Tactic Basics.
  - Phase 8: §4.4 and §4.5 again, for the audit of results.
- **Why:** the solver interaction an experiment needs: incremental queries,
  assumptions, cores, models and enumeration of witnesses.
- **Skip:** §2.4 unless S-07 needs it; §3.2's solver subsections, §3.3 Arrays,
  §3.6–3.8; §4.6; §5.2, §5.3, §5.5–5.8; §6 Solver Implementations; §7.2–7.4;
  §8 Optimization, since the Z3 Guide's page covers what phase 7 needs.
- **Outcome:** the experiment's encoding, the witness enumeration, and the
  audit of every solver result the memo cites.

## Papers for the applied phases

Each was checked to exist with this title, these authors and this venue.
Phase 6 takes the one that matches the experiment.

- Nuno P. Lopes, David Menendez, Santosh Nagarakatte, John Regehr. _Provably
  Correct Peephole Optimizations with Alive._ PLDI 2015. Checking single
  rewrites with SMT, and producing counterexamples. For X2 and X3.
- Nuno P. Lopes, Juneyoung Lee, Chung-Kil Hur, Zhengyang Liu, John Regehr.
  _Alive2: Bounded Translation Validation for LLVM._ PLDI 2021. Refinement with
  poison and undefined values; what bounded checking can miss. For X2 and X3,
  and for X1's question of model fidelity.
- Ross Tate, Michael Stepp, Zachary Tatlock, Sorin Lerner. _Equality
  Saturation: A New Approach to Optimization._ POPL 2009. Rule order and
  saturation. For X3.
- Max Willsey, Chandrakana Nandi, Yisu Remy Wang, Oliver Flatt, Zachary
  Tatlock, Pavel Panchekha. _egg: Fast and Extensible Equality Saturation._
  POPL 2021. For X3.
- Xuejun Yang, Yang Chen, Eric Eide, John Regehr. _Finding and Understanding
  Bugs in C Compilers._ PLDI 2011. Generator-based differential testing, the
  baseline a coverage claim is compared against. For X1.
- Franz Baader, Tobias Nipkow. _Term Rewriting and All That._ Cambridge
  University Press, 1998. The chapters on abstract reduction systems and
  confluence, after the program, for a rewriting direction.

For X1, LowerAudit's own survey lists further sources checked at abstract
level; reading one of them in full is an option for phase 6.

## Existing projects used as material

- nano-dsp-mlir's `DSPToLinalg.cpp` and json-schema-mlir's
  `LowerToStandard.cpp`: predictions and explanations, phases 1–4.
- VizMLIR's captured block-argument finding: phase 2.
- Lozenge's `docs/SEMANTICS.md`, `rules/bitvector.rules` and
  `test/ref/corpus.py`: S-06 and X2.
- LowerAudit's hypotheses and risk register: X1.
