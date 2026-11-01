# Research-readiness memo template

The memo is the program's final deliverable, written in phase 8. Copy the
skeleton to `conceptual-foundations/research-readiness-memo.md`. Every section
is required. Every claim carries evidence (a file, a command, a source) or a
label: hypothesis, assumption, or unknown. A short, exact section beats a long,
general one.

## Skeleton

```markdown
# Research-readiness memo

Applied experiment: <ID>

## 1. Scoped research question

<One or two sentences naming the system, the property and the scope (a pinned
revision, a domain). It can be answered by a measurement or a yes or no; a
topic such as "conversion coverage" is not a question.>

## 2. Motivation

<Why the answer matters and to whom, with at least one concrete case from the
program's evidence.>

## 3. Existing evidence

<What the program established, with pointers: ledger entries, experiment
records, audited solver results. Keep what was observed separate from what was
proven within a model.>

## 4. Hypothesis

<A claim that could be false.>

## 5. Formal or operational model

<The model's definitions (semantics, domain, abstraction), what it includes and
leaves out, and the direction of every approximation, with what that direction
means for sat and unsat answers.>

## 6. Methodology

<How the hypothesis will be tested: the oracle, the inputs, the measurements,
and how results will be classified.>

## 7. First experiment

<The next experiment, with every "Before running" field of the experiment
template filled in.>

## 8. Expected observations

<What each possible outcome would look like.>

## 9. Falsification conditions

<The observations that would refute the hypothesis, and what would be done
then.>

## 10. Related-work questions

<The questions to answer before claiming anything new, each with where to
look. Cite only sources actually read, and say at what depth: abstract or full
text.>

## 11. Feasibility risks

<Each risk with its likelihood, impact, early signal and response.>

## 12. Next research steps

<The first steps of the research, in order, and the decisions to take along
the way.>

## Direction chosen

<LowerAudit, Lozenge, another direction, or none, with a pointer to the
comparison and decision log in potential-research-ideas.md. If none: the
evidence that would reopen each candidate.>
```
