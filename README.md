# compiler-research-lab

Dialect design, verified lowering, and constraint-based program analysis,
each pinned to a commit and run for real to produce every number in this
repo.

Site: https://joepothiboot.github.io/compiler-research-lab/

This repository is a showcase of compiler tooling and captured results, not a
project seeking outside contributions.

Captured projects are pinned to commits in `manifest.json`. Their test results,
IR dumps, diagnostics and timings come from the projects' own tools at those
commits.

| Project          | Commit    | Focus                                                                 |
| ---------------- | --------- | --------------------------------------------------------------------- |
| nano-dsp-mlir    | `0de4c3c` | Dialect, lowering and transform schedule, checked against a reference |
| VizMLIR          | `4064da8` | Browser tool for exploring compiler IR                                |
| json-schema-mlir | `914691c` | Constraint lattice as an MLIR dialect, canonicalized and lowered      |

## Software / language layer

**nano-dsp-mlir** is an MLIR compiler for a small DSL. A `dsp` dialect
is lowered to `linalg.generic` and on to LLVM, tiled and vectorized by a
Transform-dialect schedule generated from a target model, and checked bit for
bit against the unscheduled code. Mojo kernels and a C++ reference are tested
against the same values. Captured: 23 lit, 17 Mojo and 7 C++ reference tests.
The emulated Hexagon run and the MLIR-vs-Mojo benchmark aren't captured.

**VizMLIR** reads `mlir-opt` pass traces in the browser and shows how the IR
changes per pass. For GPU code it maps launches to blocks and warps, sorts
buffers by memory space, and classifies each load and store (coalesced,
strided, misaligned, broadcast, bank conflict). It follows CUDA-path MLIR down
to PTX and also reads Triton GPU IR. It reads IR only and doesn't time
anything. Captured: 330 vitest tests. The site links to
[its own app](https://joepothiboot.github.io/vizmlir/) instead of embedding it.

**json-schema-mlir** compiles JSON Schema (Draft 2020-12) to native
validators: a hand-written front end into a `schema` dialect, lattice-based
canonicalization, and lowering to the LLVM dialect, plus a Mojo library with
the same lattice. Captured: 11 lit and 12 Mojo tests. Its section includes a
trace viewer for the output of `schema-translate --emit-trace`, which links
each op back to the JSON that produced it.

## License

MIT. See [LICENSE](LICENSE).
