/**
 * @typedef {object} TourStep
 * @property {string} title
 * @property {string} text
 * @property {string[]} [artifacts]
 * @property {string} [timeline]
 * @property {boolean} [trace]
 */

/**
 * @typedef {object} ProjectContent
 * @property {string} summary
 * @property {string[]} purpose
 * @property {string} [status]
 * @property {{ text: string, href?: string }[]} [statusLinks]
 * @property {{ name: string, path: string, text: string }[]} architecture
 * @property {string[]} tests
 * @property {string[]} benchmarks
 * @property {string} quickDemo
 * @property {string} art  inline SVG thumbnail, abstract
 * @property {string} [pdf]
 * @property {string} [trace]
 * @property {string[]} [traceIntro]
 * @property {TourStep[]} tour
 */

export const STAGE_TEXT = {
  source: "JSON Schema constraints as schema-dialect IR.",
  diagnostics: "Verifier errors with file, line and column.",
  mlir: "Custom dialects lowered to the LLVM dialect.",
  passes:
    "IR snapshots and structural diffs, per pass, and verified rewrite rules.",
  profiling: "Compile time per pass, plus runtime numbers where they exist.",
};

/** @type {Record<string, ProjectContent>} */
export const PROJECTS = {
  "schema-mlir": {
    summary:
      "JSON Schema constraints as an MLIR dialect, optimized as IR and lowered to native code.",
    purpose: [
      "json-schema-mlir represents JSON Schema validation rules as operations in a `schema` dialect. Constraints are optimized as IR (subsumption, fusion, removing redundant checks) before being lowered to arith/scf/math and the LLVM dialect.",
      "The same constraint lattice also exists as a Mojo library (`mojo/schema/`), with the canonicalizer's subsumption and meet rules and the lowered validation semantics. Its tests check that merging two constraints never changes which values are accepted.",
      "At the pinned commit the front end is in the tree: `schema-translate --import-json-schema` lexes and parses a JSON Schema file, builds an AST with source ranges, and imports it as schema-dialect IR. `schema-opt` then takes `.mlir` input through the passes. The tour starts from the front end, using the Person example; the later steps use the repository's own canonicalization test inputs.",
    ],
    architecture: [
      {
        name: "schema dialect",
        path: "include/Schema/SchemaOps.td",
        text: "ODS definitions for validate_string, validate_number and struct, with verifiers.",
      },
      {
        name: "--schema-canonicalize",
        path: "lib/Schema/SchemaCanonicalizerPass.cpp",
        text: "Constraint-lattice subsumption and conjunction fusion.",
      },
      {
        name: "--lower-schema-to-std",
        path: "lib/Schema/LowerToStandard.cpp",
        text: "Type-guarded lowering to arith/scf/math plus runtime ABI calls.",
      },
      {
        name: "--schema-to-llvm-pipeline",
        path: "tools/schema-opt/schema-opt.cpp",
        text: "Registers the pipelines that continue to the LLVM dialect.",
      },
      {
        name: "Mojo lattice library",
        path: "mojo/schema/lattice.mojo",
        text: "StringConstraints and NumberConstraints with subsumes, meet and validate, following the same rules as the two passes above.",
      },
    ],
    tests: ["schema-tests", "schema-mojo-tests"],
    benchmarks: ["schema-pass-timing"],
    quickDemo:
      "Follow one real test function from the dialect, through canonicalization and lowering, to the LLVM dialect, plus one verifier diagnostic.",
    art: `<svg viewBox="0 0 176 128" role="img" aria-label="The lattice of intervals from lo to hi: two constraints mark out regions, and their meet is where they overlap">
<g fill="currentColor" opacity=".4"><circle cx="36.0" cy="116.0" r="1.6"/><circle cx="36.0" cy="105.6" r="1.6"/><circle cx="36.0" cy="95.2" r="1.6"/><circle cx="36.0" cy="84.8" r="1.6"/><circle cx="36.0" cy="74.4" r="1.6"/><circle cx="36.0" cy="64.0" r="1.6"/><circle cx="36.0" cy="53.6" r="1.6"/><circle cx="36.0" cy="43.2" r="1.6"/><circle cx="36.0" cy="32.8" r="1.6"/><circle cx="36.0" cy="22.4" r="1.6"/><circle cx="36.0" cy="12.0" r="1.6"/><circle cx="46.4" cy="105.6" r="1.6"/><circle cx="46.4" cy="95.2" r="1.6"/><circle cx="46.4" cy="84.8" r="1.6"/><circle cx="46.4" cy="74.4" r="1.6"/><circle cx="46.4" cy="64.0" r="1.6"/><circle cx="46.4" cy="53.6" r="1.6"/><circle cx="46.4" cy="43.2" r="1.6"/><circle cx="46.4" cy="32.8" r="1.6"/><circle cx="46.4" cy="22.4" r="1.6"/><circle cx="46.4" cy="12.0" r="1.6"/><circle cx="56.8" cy="95.2" r="1.6"/><circle cx="56.8" cy="84.8" r="1.6"/><circle cx="56.8" cy="74.4" r="1.6"/><circle cx="56.8" cy="64.0" r="1.6"/><circle cx="56.8" cy="53.6" r="1.6"/><circle cx="56.8" cy="43.2" r="1.6"/><circle cx="56.8" cy="32.8" r="1.6"/><circle cx="56.8" cy="22.4" r="1.6"/><circle cx="56.8" cy="12.0" r="1.6"/><circle cx="67.2" cy="84.8" r="1.6"/><circle cx="67.2" cy="74.4" r="1.6"/><circle cx="67.2" cy="64.0" r="1.6"/><circle cx="67.2" cy="53.6" r="1.6"/><circle cx="67.2" cy="43.2" r="1.6"/><circle cx="67.2" cy="32.8" r="1.6"/><circle cx="67.2" cy="22.4" r="1.6"/><circle cx="67.2" cy="12.0" r="1.6"/><circle cx="77.6" cy="22.4" r="1.6"/><circle cx="77.6" cy="12.0" r="1.6"/><circle cx="88.0" cy="22.4" r="1.6"/><circle cx="88.0" cy="12.0" r="1.6"/><circle cx="98.4" cy="22.4" r="1.6"/><circle cx="98.4" cy="12.0" r="1.6"/><circle cx="108.8" cy="22.4" r="1.6"/><circle cx="108.8" cy="12.0" r="1.6"/><circle cx="119.2" cy="22.4" r="1.6"/><circle cx="119.2" cy="12.0" r="1.6"/><circle cx="129.6" cy="22.4" r="1.6"/><circle cx="129.6" cy="12.0" r="1.6"/><circle cx="140.0" cy="12.0" r="1.6"/></g>
<path d="M56.8 95.2L56.8 32.8M56.8 32.8L119.2 32.8M77.6 74.4L77.6 12.0M77.6 12.0L140.0 12.0" stroke="currentColor" fill="none" stroke-width=".8" opacity=".6"/>
<g fill="var(--accent)"><circle cx="77.6" cy="74.4" r="2.6"/><circle cx="77.6" cy="64.0" r="2.6"/><circle cx="77.6" cy="53.6" r="2.6"/><circle cx="77.6" cy="43.2" r="2.6"/><circle cx="77.6" cy="32.8" r="2.6"/><circle cx="88.0" cy="64.0" r="2.6"/><circle cx="88.0" cy="53.6" r="2.6"/><circle cx="88.0" cy="43.2" r="2.6"/><circle cx="88.0" cy="32.8" r="2.6"/><circle cx="98.4" cy="53.6" r="2.6"/><circle cx="98.4" cy="43.2" r="2.6"/><circle cx="98.4" cy="32.8" r="2.6"/><circle cx="108.8" cy="43.2" r="2.6"/><circle cx="108.8" cy="32.8" r="2.6"/><circle cx="119.2" cy="32.8" r="2.6"/></g>
</svg>`,
    trace: "schema-trace",
    traceIntro: [
      "`schema-translate --emit-trace` writes what its front end saw and did as one JSON file: the source, the lexer's tokens, the AST with byte ranges, and the IR after import and after `--schema-canonicalize`, with each op tied back to the AST nodes it came from. This viewer draws that file and nothing else; the compiler does not run in your browser.",
      "The Person schema's `age` combines three `allOf` branches. In the IR pane they are separate checks after import, and one `validate_number` after canonicalization. Select that one, and every imported op it absorbed lights up, along with the six JSON keywords it came from.",
    ],
    tour: [
      {
        title: "Follow one schema through the front end",
        text: "examples/person/person.schema.json goes through the lexer, the parser and the importer. The trace viewer links the JSON source, its tokens, the AST and the IR, and shows canonicalization fusing the three allOf branches into one validate_number.",
        trace: true,
      },
      {
        title: "Start from a real test input",
        text: "Three validate_string checks on the same value, combined with arith.andi. This function comes verbatim from the repository's canonicalization tests.",
        artifacts: ["schema-input"],
      },
      {
        title: "Diagnostics point at the source",
        text: "A contradictory constraint (max_length below min_length) is rejected by the op verifier. The error carries file, line and column. This input file was written for the lab; the diagnostic is schema-opt's real output.",
        artifacts: ["schema-bad-input", "schema-verifier-diagnostic"],
      },
      {
        title: "Every pass in the pipeline",
        text: "--schema-to-std-pipeline runs the passes below. Rows marked unchanged left the IR exactly as they found it.",
        timeline: "schema-pass-",
      },
      {
        title: "Canonicalization fuses the constraint tree",
        text: "The three checks become one validate_string carrying the meet of the constraints: min_length 5 subsumes min_length 2. Both andi ops disappear.",
        artifacts: [
          "schema-ir-0-parsed",
          "schema-ir-2-schemacanonicalizerpass",
        ],
      },
      {
        title: "Lowering guards on the runtime type tag",
        text: "The validator becomes an scf.if on the JSON kind, so a length check never runs on a non-string. String length and regex matching go through the runtime ABI.",
        artifacts: ["schema-ir-7-symboldcepass"],
      },
      {
        title: "Down to the LLVM dialect",
        text: "--schema-to-llvm-pipeline continues through control flow and LLVM conversion.",
        artifacts: ["schema-llvm"],
      },
      {
        title: "The same lattice in Mojo",
        text: "The Mojo library repeats each canonicalization test case, then checks a grid of constraint pairs and values, including NaN and infinity: whenever two constraints merge, the merged one accepts exactly what both accepted.",
        artifacts: ["schema-mojo-tests"],
      },
    ],
  },

  vizmlir: {
    summary:
      "Browser-only MLIR graph viewer and structural diff, with a Rust parser compiled to WebAssembly.",
    purpose: [
      "VizMLIR parses MLIR in the browser with a Rust parser compiled to WebAssembly, draws the operation graph on a canvas, and diffs two IR snapshots with SSA names normalized. No backend is involved.",
      "In this lab it is the pass-inspection step: the IR captured from json-schema-mlir and nano-dsp-mlir is run through VizMLIR's own WASM parser and diff module at the pinned commit.",
    ],
    architecture: [
      {
        name: "Lexer and parser (Rust)",
        path: "wasm/src/parser/lexer.rs",
        text: "Tokenizes and parses MLIR into an arena-allocated AST with interned strings.",
      },
      {
        name: "WASM ABI",
        path: "wasm/src/abi.rs",
        text: "A fixed shared-memory header (ABI v3) exposing nodes, edges, layout and diagnostics.",
      },
      {
        name: "JS bridge",
        path: "src/wasm/bridge.js",
        text: "Reads the header through typed-array views; no copying or JSON.",
      },
      {
        name: "Diff and renderer",
        path: "src/diff.js",
        text: "SSA-normalized structural diff; canvas graph renderer.",
      },
    ],
    tests: ["viz-tests"],
    benchmarks: [],
    quickDemo:
      "Diff real compiler passes from the other projects with VizMLIR's own WASM parser, then open the app and try it yourself.",
    art: `<svg viewBox="0 0 176 128" role="img" aria-label="Two rows of the same ops joined by a permutation, the SSA renumbering; one op is gone and one is new">
<path d="M14.0 22C14.0 64 40.9 64 40.9 106M27.5 22C27.5 64 14.0 64 14.0 106M40.9 22C40.9 64 27.5 64 27.5 106M54.4 22C54.4 64 81.3 64 81.3 106M67.8 22C67.8 64 54.4 64 54.4 106M81.3 22C81.3 64 67.8 64 67.8 106M94.7 22C94.7 64 121.6 64 121.6 106M121.6 22C121.6 64 108.2 64 108.2 106M135.1 22C135.1 64 162.0 64 162.0 106M148.5 22C148.5 64 135.1 64 135.1 106M162.0 22C162.0 64 148.5 64 148.5 106" stroke="currentColor" fill="none" stroke-width=".8" opacity=".45"/>
<g fill="currentColor"><circle cx="14.0" cy="22" r="2.4"/><circle cx="27.5" cy="22" r="2.4"/><circle cx="40.9" cy="22" r="2.4"/><circle cx="54.4" cy="22" r="2.4"/><circle cx="67.8" cy="22" r="2.4"/><circle cx="81.3" cy="22" r="2.4"/><circle cx="94.7" cy="22" r="2.4"/><circle cx="121.6" cy="22" r="2.4"/><circle cx="135.1" cy="22" r="2.4"/><circle cx="148.5" cy="22" r="2.4"/><circle cx="162.0" cy="22" r="2.4"/><circle cx="14.0" cy="106" r="2.4"/><circle cx="27.5" cy="106" r="2.4"/><circle cx="40.9" cy="106" r="2.4"/><circle cx="54.4" cy="106" r="2.4"/><circle cx="67.8" cy="106" r="2.4"/><circle cx="81.3" cy="106" r="2.4"/><circle cx="108.2" cy="106" r="2.4"/><circle cx="121.6" cy="106" r="2.4"/><circle cx="135.1" cy="106" r="2.4"/><circle cx="148.5" cy="106" r="2.4"/><circle cx="162.0" cy="106" r="2.4"/></g>
<circle cx="108.2" cy="22" r="2.6" fill="none" stroke="var(--bad)" stroke-dasharray="1.5 1.5"/>
<circle cx="94.7" cy="106" r="3" fill="var(--accent)"/>
</svg>`,
    tour: [
      {
        title: "Diff json-schema-mlir's canonicalization",
        text: "VizMLIR matches operations by kind and SSA-normalized label. The fused validate_string keeps its op name, so it matches. The two absorbed checks and both andi ops are reported as removed.",
        artifacts: ["viz-schema-canonicalize-diff"],
      },
      {
        title: "A real finding: function arguments",
        text: "In the graph summaries above, VizMLIR reports each use of %arg0 as an undefined SSA value. At this commit the parser does not appear to register function block arguments as definitions. This is captured output, shown as-is, and a candidate upstream fix.",
      },
      {
        title: "Diff the lowering to standard dialects",
        text: "The larger diff after --lower-schema-to-std shows the runtime ABI declarations and the scf.if guard being introduced.",
        artifacts: ["viz-schema-lowering-diff"],
      },
      {
        title: "Diff nano-dsp-mlir's dsp → linalg conversion",
        text: "The same diff applied to the other compiler: dsp ops become linalg.generic with affine maps.",
        artifacts: ["viz-nano-linalg-diff"],
      },
    ],
  },

  "nano-dsp-mlir": {
    summary:
      "A small DSL dialect lowered to linalg and LLVM, verified by differential testing against independent reference implementations.",
    purpose: [
      "nano-dsp-mlir defines a `dsp` dialect (add, relu, matmul, conv2d) with shape verifiers, and lowers it to linalg.generic. From there the tests lower through stock MLIR passes to LLVM and execute with mlir-runner to check numeric results.",
      "Each dsp op is also implemented as a SIMD Mojo kernel (`mojo/nanodsp/`) and as a plain C++ loop nest (`reference/`). All three implementations are tested against the same expected values, and the Mojo kernels are benchmarked. The upstream README also describes pieces not in the tree yet: transform-dialect schedules, -nanodsp-optimize, the Python DSL and sweep scripts.",
    ],
    architecture: [
      {
        name: "dsp dialect",
        path: "include/nanodsp/Dialect/DSP/IR/DSPOps.td",
        text: "Value-semantics ops on static f32 tensors, with verifiers.",
      },
      {
        name: "-convert-dsp-to-linalg",
        path: "lib/Conversion/DSPToLinalg/DSPToLinalg.cpp",
        text: "Rewrites each op to linalg.generic in destination-passing style.",
      },
      {
        name: "Stock lowering (test oracle)",
        path: "test/lit.cfg.py",
        text: "Upstream bufferization and LLVM conversion, used only so the tests can execute.",
      },
      {
        name: "nanodsp-opt",
        path: "tools/nanodsp-opt/nanodsp-opt.cpp",
        text: "mlir-opt-style driver with the dialect and passes registered.",
      },
      {
        name: "Mojo kernels",
        path: "mojo/nanodsp/kernels.mojo",
        text: "Generic SIMD add, relu, matmul and conv2d with the dialect's semantics; the width comes from the target at compile time.",
      },
      {
        name: "C++ reference",
        path: "reference/nanodsp_ref.h",
        text: "Scalar loop nests used as an independent check on both of the above.",
      },
    ],
    tests: ["nano-tests", "nano-mojo-tests", "nano-reference-tests"],
    benchmarks: ["nano-pass-timing", "nano-benchmark", "nano-gpu-results"],
    quickDemo:
      "Follow relu(conv2d(image) + bias) from the dsp dialect through 19 passes to the LLVM dialect, execute it, and see where compile time goes.",
    art: `<svg viewBox="0 0 176 128" role="img" aria-label="A square wave built from four sine harmonics, then sampled: reference and kernel trace the same sum">
<path d="M8 64.0 10 57.2 12 50.6 14 44.3 16 38.6 18 33.4 20 29.0 22 25.4 24 22.8 26 21.2 28 20.7 30 21.2 32 22.8 34 25.4 36 29.0 38 33.4 40 38.6 42 44.3 44 50.6 46 57.2 48 64.0 50 70.8 52 77.4 54 83.7 56 89.4 58 94.6 60 99.0 62 102.6 64 105.2 66 106.8 68 107.3 70 106.8 72 105.2 74 102.6 76 99.0 78 94.6 80 89.4 82 83.7 84 77.4 86 70.8 88 64.0 90 57.2 92 50.6 94 44.3 96 38.6 98 33.4 100 29.0 102 25.4 104 22.8 106 21.2 108 20.7 110 21.2 112 22.8 114 25.4 116 29.0 118 33.4 120 38.6 122 44.3 124 50.6 126 57.2 128 64.0 130 70.8 132 77.4 134 83.7 136 89.4 138 94.6 140 99.0 142 102.6 144 105.2 146 106.8 148 107.3 150 106.8 152 105.2 154 102.6 156 99.0 158 94.6 160 89.4 162 83.7 164 77.4 166 70.8 168 64.0" stroke="currentColor" fill="none" stroke-width=".6" opacity=".35"/><path d="M8 64.0 10 57.4 12 52.3 14 49.7 16 50.3 18 53.8 20 59.5 22 66.3 24 72.5 26 76.9 28 78.4 30 76.9 32 72.5 34 66.3 36 59.5 38 53.8 40 50.3 42 49.7 44 52.3 46 57.4 48 64.0 50 70.6 52 75.7 54 78.3 56 77.7 58 74.2 60 68.5 62 61.7 64 55.5 66 51.1 68 49.6 70 51.1 72 55.5 74 61.7 76 68.5 78 74.2 80 77.7 82 78.3 84 75.7 86 70.6 88 64.0 90 57.4 92 52.3 94 49.7 96 50.3 98 53.8 100 59.5 102 66.3 104 72.5 106 76.9 108 78.4 110 76.9 112 72.5 114 66.3 116 59.5 118 53.8 120 50.3 122 49.7 124 52.3 126 57.4 128 64.0 130 70.6 132 75.7 134 78.3 136 77.7 138 74.2 140 68.5 142 61.7 144 55.5 146 51.1 148 49.6 150 51.1 152 55.5 154 61.7 156 68.5 158 74.2 160 77.7 162 78.3 164 75.7 166 70.6 168 64.0" stroke="currentColor" fill="none" stroke-width=".6" opacity=".35"/><path d="M8 64.0 10 57.9 12 55.3 14 57.9 16 64.0 18 70.1 20 72.7 22 70.1 24 64.0 26 57.9 28 55.3 30 57.9 32 64.0 34 70.1 36 72.7 38 70.1 40 64.0 42 57.9 44 55.3 46 57.9 48 64.0 50 70.1 52 72.7 54 70.1 56 64.0 58 57.9 60 55.3 62 57.9 64 64.0 66 70.1 68 72.7 70 70.1 72 64.0 74 57.9 76 55.3 78 57.9 80 64.0 82 70.1 84 72.7 86 70.1 88 64.0 90 57.9 92 55.3 94 57.9 96 64.0 98 70.1 100 72.7 102 70.1 104 64.0 106 57.9 108 55.3 110 57.9 112 64.0 114 70.1 116 72.7 118 70.1 120 64.0 122 57.9 124 55.3 126 57.9 128 64.0 130 70.1 132 72.7 134 70.1 136 64.0 138 57.9 140 55.3 142 57.9 144 64.0 146 70.1 148 72.7 150 70.1 152 64.0 154 57.9 156 55.3 158 57.9 160 64.0 162 70.1 164 72.7 166 70.1 168 64.0" stroke="currentColor" fill="none" stroke-width=".6" opacity=".35"/><path d="M8 64.0 10 58.5 12 59.0 14 65.0 16 69.9 18 68.4 20 62.1 22 57.9 24 60.4 26 66.8 28 70.2 30 66.8 32 60.4 34 57.9 36 62.1 38 68.4 40 69.9 42 65.0 44 59.0 46 58.5 48 64.0 50 69.5 52 69.0 54 63.0 56 58.1 58 59.6 60 65.9 62 70.1 64 67.6 66 61.2 68 57.8 70 61.2 72 67.6 74 70.1 76 65.9 78 59.6 80 58.1 82 63.0 84 69.0 86 69.5 88 64.0 90 58.5 92 59.0 94 65.0 96 69.9 98 68.4 100 62.1 102 57.9 104 60.4 106 66.8 108 70.2 110 66.8 112 60.4 114 57.9 116 62.1 118 68.4 120 69.9 122 65.0 124 59.0 126 58.5 128 64.0 130 69.5 132 69.0 134 63.0 136 58.1 138 59.6 140 65.9 142 70.1 144 67.6 146 61.2 148 57.8 150 61.2 152 67.6 154 70.1 156 65.9 158 59.6 160 58.1 162 63.0 164 69.0 166 69.5 168 64.0" stroke="currentColor" fill="none" stroke-width=".6" opacity=".35"/>
<path d="M8 64.0 10 39.0 12 25.3 14 24.9 16 30.7 18 33.7 20 31.3 22 27.7 24 27.7 26 30.8 28 32.7 30 30.8 32 27.7 34 27.7 36 31.3 38 33.7 40 30.7 42 24.9 44 25.3 46 39.0 48 64.0 50 89.0 52 102.7 54 103.1 56 97.3 58 94.3 60 96.7 62 100.3 64 100.3 66 97.2 68 95.3 70 97.2 72 100.3 74 100.3 76 96.7 78 94.3 80 97.3 82 103.1 84 102.7 86 89.0 88 64.0 90 39.0 92 25.3 94 24.9 96 30.7 98 33.7 100 31.3 102 27.7 104 27.7 106 30.8 108 32.7 110 30.8 112 27.7 114 27.7 116 31.3 118 33.7 120 30.7 122 24.9 124 25.3 126 39.0 128 64.0 130 89.0 132 102.7 134 103.1 136 97.3 138 94.3 140 96.7 142 100.3 144 100.3 146 97.2 148 95.3 150 97.2 152 100.3 154 100.3 156 96.7 158 94.3 160 97.3 162 103.1 164 102.7 166 89.0 168 64.0" stroke="var(--accent)" fill="none" stroke-width="1.1"/>
<g fill="currentColor"><rect x="6.7" y="62.7" width="2.6" height="2.6"/><rect x="14.7" y="29.4" width="2.6" height="2.6"/><rect x="22.7" y="26.4" width="2.6" height="2.6"/><rect x="30.7" y="26.4" width="2.6" height="2.6"/><rect x="38.7" y="29.4" width="2.6" height="2.6"/><rect x="46.7" y="62.7" width="2.6" height="2.6"/><rect x="54.7" y="96.0" width="2.6" height="2.6"/><rect x="62.7" y="99.0" width="2.6" height="2.6"/><rect x="70.7" y="99.0" width="2.6" height="2.6"/><rect x="78.7" y="96.0" width="2.6" height="2.6"/><rect x="86.7" y="62.7" width="2.6" height="2.6"/><rect x="94.7" y="29.4" width="2.6" height="2.6"/><rect x="102.7" y="26.4" width="2.6" height="2.6"/><rect x="110.7" y="26.4" width="2.6" height="2.6"/><rect x="118.7" y="29.4" width="2.6" height="2.6"/><rect x="126.7" y="62.7" width="2.6" height="2.6"/><rect x="134.7" y="96.0" width="2.6" height="2.6"/><rect x="142.7" y="99.0" width="2.6" height="2.6"/><rect x="150.7" y="99.0" width="2.6" height="2.6"/><rect x="158.7" y="96.0" width="2.6" height="2.6"/><rect x="166.7" y="62.7" width="2.6" height="2.6"/></g>
</svg>`,
    tour: [
      {
        title: "The program",
        text: "An integration test: a 3×3 box blur over a 4×4 image, plus a bias, through relu. The CHECK lines state the expected output.",
        artifacts: ["nano-input"],
      },
      {
        title: "Verifier diagnostics",
        text: "The invalid-op tests, run without -verify-diagnostics, so the raw errors and their locations are visible.",
        artifacts: ["nano-verifier-diagnostics"],
      },
      {
        title: "dsp → linalg",
        text: "The only pass this project owns. conv2d, add and relu become linalg.generic ops with explicit indexing maps.",
        artifacts: ["nano-ir-1-convertdsptolinalg"],
      },
      {
        title: "Every pass to the LLVM dialect",
        text: "The stock lowering chain the tests use. Unchanged rows are passes that found nothing to do.",
        timeline: "nano-pass-",
      },
      {
        title: "Execute and check",
        text: "The lowered module run with mlir-runner. The printed memref is compared with the test's CHECK lines.",
        artifacts: ["nano-execution"],
      },
      {
        title: "The same ops in Mojo and C++",
        text: "The Mojo kernels and the C++ reference are checked against the same expected values as the MLIR tests above. The Mojo tests also compare against a naive loop nest on odd sizes, so the code after each SIMD chunk runs too.",
        artifacts: ["nano-mojo-tests", "nano-reference-tests"],
      },
      {
        title: "Profiling",
        text: "Compile-time wall clock per pass, from one run on the capture host. It shows relative cost, not a benchmark. The kernel numbers are the SIMD Mojo kernels on one core. A benchmark of the tiled MLIR kernels against them is not done yet.",
        artifacts: ["nano-pass-timing", "nano-benchmark"],
      },
    ],
  },
  lozenge: {
    summary:
      "A small bitvector language in Haskell whose rewrite rules are proven with z3, checked for critical pairs, and run by both greedy rewriting and equality saturation.",
    purpose: [
      "lozenge is an expression language over fixed-width bitvectors, with an untyped and a typed IR and an evaluator for each. Its optimizer is a corpus of rewrite rules in `rules/bitvector.rules`.",
      "Every rule is checked before it is trusted: by brute force at small widths, and by z3 for all widths. The corpus deliberately includes wrong rules, and the verifier must produce a counterexample for each one.",
      "Critical-pair analysis finds where two rules overlap and can disagree. The same rules then run two ways, greedy rewriting and e-graph equality saturation, to show where the result depends on rule order.",
    ],
    architecture: [
      {
        name: "Rule language",
        path: "src/Lozenge/RuleParse.hs",
        text: "Parses the rule corpus into patterns over the expression IR.",
      },
      {
        name: "Verification",
        path: "src/Lozenge/VerifySmt.hs",
        text: "Proves each rule with z3; VerifyBrute.hs checks small widths exhaustively.",
      },
      {
        name: "Critical pairs",
        path: "src/Lozenge/Critical.hs",
        text: "Finds overlapping rule applications and whether they rejoin.",
      },
      {
        name: "Equality saturation",
        path: "src/Lozenge/Saturate.hs",
        text: "E-graph with union-find and e-matching, plus cost-based extraction.",
      },
    ],
    tests: [],
    benchmarks: [],
    quickDemo:
      "Read the rule corpus: 22 valid rules and 8 deliberately wrong ones.",
    art: `<svg viewBox="0 0 176 128" role="img" aria-label="x maps to 3x mod 96 around a circle: wrapping multiplication draws a nephroid, and its only fixed points are marked">
<path d="M88.0 10.0L88.0 10.0M91.5 10.1L98.5 11.0M95.0 10.5L108.7 14.1M98.5 11.0L118.0 19.1M102.0 11.8L126.2 25.8M105.4 12.9L132.9 34.0M108.7 14.1L137.9 43.3M111.9 15.6L141.0 53.5M115.0 17.2L142.0 64.0M118.0 19.1L141.0 74.5M120.9 21.2L137.9 84.7M123.6 23.4L132.9 94.0M126.2 25.8L126.2 102.2M128.6 28.4L118.0 108.9M130.8 31.1L108.7 113.9M132.9 34.0L98.5 117.0M134.8 37.0L88.0 118.0M136.4 40.1L77.5 117.0M137.9 43.3L67.3 113.9M139.1 46.6L58.0 108.9M140.2 50.0L49.8 102.2M141.0 53.5L43.1 94.0M141.5 57.0L38.1 84.7M141.9 60.5L35.0 74.5M142.0 64.0L34.0 64.0M141.9 67.5L35.0 53.5M141.5 71.0L38.1 43.3M141.0 74.5L43.1 34.0M140.2 78.0L49.8 25.8M139.1 81.4L58.0 19.1M137.9 84.7L67.3 14.1M136.4 87.9L77.5 11.0M134.8 91.0L88.0 10.0M132.9 94.0L98.5 11.0M130.8 96.9L108.7 14.1M128.6 99.6L118.0 19.1M126.2 102.2L126.2 25.8M123.6 104.6L132.9 34.0M120.9 106.8L137.9 43.3M118.0 108.9L141.0 53.5M115.0 110.8L142.0 64.0M111.9 112.4L141.0 74.5M108.7 113.9L137.9 84.7M105.4 115.1L132.9 94.0M102.0 116.2L126.2 102.2M98.5 117.0L118.0 108.9M95.0 117.5L108.7 113.9M91.5 117.9L98.5 117.0M88.0 118.0L88.0 118.0M84.5 117.9L77.5 117.0M81.0 117.5L67.3 113.9M77.5 117.0L58.0 108.9M74.0 116.2L49.8 102.2M70.6 115.1L43.1 94.0M67.3 113.9L38.1 84.7M64.1 112.4L35.0 74.5M61.0 110.8L34.0 64.0M58.0 108.9L35.0 53.5M55.1 106.8L38.1 43.3M52.4 104.6L43.1 34.0M49.8 102.2L49.8 25.8M47.4 99.6L58.0 19.1M45.2 96.9L67.3 14.1M43.1 94.0L77.5 11.0M41.2 91.0L88.0 10.0M39.6 87.9L98.5 11.0M38.1 84.7L108.7 14.1M36.9 81.4L118.0 19.1M35.8 78.0L126.2 25.8M35.0 74.5L132.9 34.0M34.5 71.0L137.9 43.3M34.1 67.5L141.0 53.5M34.0 64.0L142.0 64.0M34.1 60.5L141.0 74.5M34.5 57.0L137.9 84.7M35.0 53.5L132.9 94.0M35.8 50.0L126.2 102.2M36.9 46.6L118.0 108.9M38.1 43.3L108.7 113.9M39.6 40.1L98.5 117.0M41.2 37.0L88.0 118.0M43.1 34.0L77.5 117.0M45.2 31.1L67.3 113.9M47.4 28.4L58.0 108.9M49.8 25.8L49.8 102.2M52.4 23.4L43.1 94.0M55.1 21.2L38.1 84.7M58.0 19.1L35.0 74.5M61.0 17.2L34.0 64.0M64.1 15.6L35.0 53.5M67.3 14.1L38.1 43.3M70.6 12.9L43.1 34.0M74.0 11.8L49.8 25.8M77.5 11.0L58.0 19.1M81.0 10.5L67.3 14.1M84.5 10.1L77.5 11.0" stroke="currentColor" fill="none" stroke-width=".6" opacity=".35"/>
<circle cx="88" cy="64" r="54" stroke="currentColor" fill="none" stroke-width=".8" opacity=".5"/>
<path d="M88.0 10.0L88.0 118.0" stroke="var(--accent)" stroke-width="1.1"/>
<g fill="var(--accent)"><circle cx="88.0" cy="10.0" r="3.2"/><circle cx="88.0" cy="118.0" r="3.2"/></g>
</svg>`,
    tour: [
      {
        title: "The rule corpus",
        text: "Each rule is a left pattern and a right pattern. The wrong rules carry a comment naming the widths where they fail; the verifier has to find those counterexamples.",
        artifacts: ["lozenge-rules"],
      },
    ],
  },
};
