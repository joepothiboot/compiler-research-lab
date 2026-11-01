# Experiment template

Every experiment, from a small conversion probe to the applied experiment, uses
this record. Copy the skeleton below into the experiment's folder, or into the
phase report for a small experiment. Fill in "Before running" and commit it
before anything runs, so the history shows it came first; a later change is an
amendment, never an edit.

## Skeleton

```markdown
## <ID>: <the question, in one line>

Status: preregistered | run | analyzed

### Before running

- **Real system:** the tool, its revision, the exact command, the inputs.
- **Relevant behavior:** what the system does that this experiment looks at.
- **Model or abstraction:** what stands for the system, what it includes, and
  what it leaves out.
- **Assumptions:** what is taken as true without being checked.
- **Hypothesis:** a claim that could turn out false.
- **Expected outcome:** what should be observed if the hypothesis holds.
- **Falsification condition:** the observation that would refute it.

### Amendments

- What changed, and why.

### After running

- **Actual outcome:** what happened, with the output or a path to it.
- **Reproducibility:** commands; versions (`mlir-opt --version`,
  `z3 --version`, `z3.get_version_string()`); revisions; inputs; any
  nondeterminism and how it was controlled, such as
  `--mlir-disable-threading`; any patch to an upstream test pass.
- **Interpretation:** what the outcome shows, with a label from the
  classification table for each observation.
- **Alternative explanations:** at least two, each with how it was ruled out,
  or a statement that it was not.
- **Limitations:** what the result does not show.
```

## Classifying observations

An observation gets one label, and the label is used only with its evidence.

| Label                                    | Meaning                                                                                                               | Evidence required                                                                                                                          | Often confused with                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Compiler bug                             | The compiler breaks its own contract for an input it claims to support                                                | The contract (documentation, verifier, operation semantics), a minimal reproducer at a pin, and evidence that the behavior is not intended | Unsupported input; missing pattern                  |
| Unsupported input                        | The input lies outside what the component declares it handles                                                         | The declaration that excludes it: a verifier, the documentation, a pass description, a specification                                       | Genuine coverage gap                                |
| Failed conversion under a target         | The chosen target makes an operation illegal and no pattern path leads to a legal form; another target could succeed  | The target configuration, the driver's diagnostic, and a variant target under which the conversion succeeds                                | Missing pattern; compiler bug                       |
| Missing conversion pattern               | No pattern exists for an operation and type combination inside the declared domain that the target requires converted | The domain declaration, the pattern set showing no applicable pattern, and the diagnostic                                                  | Unsupported input                                   |
| Incomplete analysis                      | My analysis cannot decide the case: a timeout, `unknown`, or a feature it does not model                              | The analysis output, or the list of features it does not model                                                                             | Genuine coverage gap                                |
| Abstraction artifact                     | The model produces behavior the system cannot, or cannot express behavior the system has                              | A model result, the system's behavior on the corresponding concrete input, and the abstraction choice that explains the difference         | Compiler bug; coverage gap                          |
| Genuine coverage gap                     | An input inside the declared domain, valid by the oracle, that the system fails to handle, with nothing excluding it  | The domain, the oracle's verdict, a reproducer, and the absence of an excluding declaration                                                | Unsupported input; failed conversion under a target |
| Semantic correctness issue               | The output means something different from the input, under a stated semantics                                         | The semantics, and a concrete input on which the meanings differ, by execution or by an encoding already validated                         | A syntactic difference with the same meaning        |
| Rewrite-system property                  | A property of a rule set as a whole, such as termination, confluence or the joinability of a critical pair            | The rule set, the property's definition, and a witness, for example a term with two distinct normal forms                                  | Semantic correctness issue                          |
| Potentially interesting research problem | A class of observations that existing methods neither explain nor handle, stated as a precise question                | At least two instances of the class, a check of related work, and the question                                                             | A single interesting observation                    |
