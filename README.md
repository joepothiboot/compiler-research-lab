# compiler-research-lab

A static site about compiler implementation, accelerator modeling, and
compiler-IR inspection.

Site: https://joepothiboot.github.io/compiler-research-lab/

This repository is a showcase of compiler tooling and captured results, not a
project seeking outside contributions.

Captured projects are pinned to commits in `manifest.json`. Their test results,
IR dumps, diagnostics and timings come from the projects' own tools at those
commits. The featured `mock-npu-bench` overview links to a fixed commit but
does not yet have captured artifacts on this site.

| Featured project                                                 | Commit    | Focus                                                     |
| ---------------------------------------------------------------- | --------- | --------------------------------------------------------- |
| [nano-dsp-mlir](https://github.com/joepothiboot/nano-dsp-mlir)   | `0de4c3c` | Small tensor compiler; output checked against a reference |
| [mock-npu-bench](https://github.com/joepothiboot/mock-npu-bench) | `65de79f` | Simulator and performance profiles for a fictional NPU    |
| [VizMLIR](https://github.com/joepothiboot/vizmlir)               | `4064da8` | Browser tool for exploring compiler IR                    |

## Featured projects

**nano-dsp-mlir** is an MLIR compiler for a small tensor DSL. A `dsp` dialect
is lowered to `linalg.generic` and on to LLVM, tiled and vectorized by a
Transform-dialect schedule generated from a target model, and checked bit for
bit against the unscheduled code. Mojo kernels and a C++ reference are tested
against the same values. Captured: 23 lit, 17 Mojo and 7 C++ reference tests.
The emulated Hexagon run and the MLIR-vs-Mojo benchmark aren't captured.

**mock-npu-bench** simulates MN1, a fictional vector accelerator with an
in-order core, vector unit, scratchpad and asynchronous DMA. Its examples and
cycle-level profiles make accelerator behavior tangible. Its overview is
pinned to `65de79f`; simulator output is not yet captured in this site.

**VizMLIR** reads `mlir-opt` pass traces in the browser and shows how the IR
changes per pass. For GPU code it maps launches to blocks and warps, sorts
buffers by memory space, and classifies each load and store (coalesced,
strided, misaligned, broadcast, bank conflict). It follows CUDA-path MLIR down
to PTX and also reads Triton GPU IR. It reads IR only and doesn't time
anything. Captured: 330 vitest tests. The site links to
[its own app](https://joepothiboot.github.io/vizmlir/) instead of embedding it.

## Other projects

**json-schema-mlir** compiles JSON Schema (Draft 2020-12) to native
validators: a hand-written front end into a `schema` dialect, lattice-based
canonicalization, and lowering to the LLVM dialect, plus a Mojo library with
the same lattice. Captured: 11 lit and 12 Mojo tests. Its section includes a
trace viewer for the output of `schema-translate --emit-trace`, which links
each op back to the JSON that produced it.

## How the data stays honest

- Every captured project is pinned to a full commit SHA. The tooling refuses
  branch names, and source links point at pinned commits.
- Every artifact is one of three kinds: `captured` (tool output, with the exact
  command, host and toolchain), `static` (a file read verbatim from the repo),
  or `unavailable` (deliberately missing, with the reason).
- The build fails if an artifact was captured at a different commit than the
  manifest pins, or if the page references an artifact that doesn't exist.

## Conceptual foundations

[`conceptual-foundations/`](conceptual-foundations/README.md) is a phased,
practical program that lays the foundations for master's-level compiler
research: MLIR dialect conversion studied down to its guarantees, SMT modeling
with Z3, and one preregistered experiment that tests a model against the
compiler. It holds plans, notes and reports rather than captured artifacts, so
the site does not show it.

## License

MIT. See [LICENSE](LICENSE).
