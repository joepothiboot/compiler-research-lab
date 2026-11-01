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
 * @property {string[]} run
 * @property {string} runNote
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
    run: [
      "git clone https://github.com/joepothiboot/json-schema-mlir && cd json-schema-mlir",
      "git checkout {commit}",
      'MLIR_INSTALL="$(brew --prefix llvm)" ./build.sh   # configures, builds schema-opt, runs check-schema',
      "./build/bin/schema-opt test/Dialect/Schema/schema-canonicalize.mlir --schema-canonicalize --split-input-file",
      "pixi run test-mojo   # Mojo lattice tests; pixi installs the pinned Mojo",
    ],
    runNote:
      "Needs LLVM/MLIR with FileCheck and lit (captured with the toolchain listed below). Clone into a path without spaces, because lit's %s substitution breaks on them.",
    tests: ["schema-tests", "schema-mojo-tests"],
    benchmarks: ["schema-pass-timing"],
    quickDemo:
      "Follow one real test function from the dialect, through canonicalization and lowering, to the LLVM dialect, plus one verifier diagnostic.",
    art: `<svg viewBox="0 0 176 128" role="img" aria-label="Three overlapping constraints whose shared region is filled: many rules, one meaning">
<defs><clipPath id="art-schema-a"><circle cx="72" cy="50" r="34"/></clipPath><clipPath id="art-schema-b"><circle cx="104" cy="50" r="34"/></clipPath></defs>
<g stroke="currentColor" fill="none" stroke-width="1.2" opacity=".45"><circle cx="72" cy="50" r="34"/><circle cx="104" cy="50" r="34"/><circle cx="88" cy="78" r="34"/></g>
<g clip-path="url(#art-schema-a)"><g clip-path="url(#art-schema-b)"><circle cx="88" cy="78" r="34" fill="var(--accent)"/></g></g>
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
    run: [
      "git clone https://github.com/joepothiboot/vizmlir && cd vizmlir",
      "git checkout {commit}",
      "rustup target add wasm32-unknown-unknown",
      "npm ci && npm run dev",
    ],
    runNote:
      "Needs Node 20+ and Rust with the wasm32-unknown-unknown target. wasm-opt (binaryen) is optional.",
    tests: ["viz-tests"],
    benchmarks: [],
    quickDemo:
      "Diff real compiler passes from the other projects with VizMLIR's own WASM parser, then open the app and try it yourself.",
    art: `<svg viewBox="0 0 176 128" role="img" aria-label="The same graph twice: one node fades out, one appears, everything else holds">
<g stroke="currentColor" stroke-width="1.2" opacity=".5"><path d="M30 24 18 64 30 104M30 24 46 64 30 104"/><path d="M130 24 118 64 146 64 130 104M130 24 146 64"/></g>
<g fill="currentColor"><circle cx="30" cy="24" r="5"/><circle cx="18" cy="64" r="5"/><circle cx="30" cy="104" r="5"/><circle cx="130" cy="24" r="5"/><circle cx="118" cy="64" r="5"/><circle cx="130" cy="104" r="5"/></g>
<circle cx="46" cy="64" r="5" fill="none" stroke="var(--bad)" stroke-dasharray="2 2"/>
<circle cx="146" cy="64" r="5" fill="var(--accent)"/>
<path d="M66 64h32" stroke="currentColor" stroke-width="1" opacity=".35" stroke-dasharray="1 4"/>
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
    run: [
      "git clone https://github.com/joepothiboot/nano-dsp-mlir && cd nano-dsp-mlir",
      "git checkout {commit}",
      "./test.sh   # finds Homebrew LLVM/MLIR or $MLIR_DIR, builds, runs check-nanodsp",
      "pixi run test-mojo && pixi run test-reference && pixi run bench",
    ],
    runNote:
      "Needs LLVM/MLIR with mlir-runner, FileCheck and lit. Clone into a path without spaces. The Mojo and C++ steps need only pixi, which installs the pinned Mojo.",
    tests: ["nano-tests", "nano-mojo-tests", "nano-reference-tests"],
    benchmarks: ["nano-pass-timing", "nano-benchmark", "nano-gpu-results"],
    quickDemo:
      "Follow relu(conv2d(image) + bias) from the dsp dialect through 19 passes to the LLVM dialect, execute it, and see where compile time goes.",
    art: `<svg viewBox="0 0 176 128" role="img" aria-label="A smooth wave and a sampled one tracing it exactly: two independent implementations that agree">
<path d="M8 64.0 10 60.3 12 56.6 14 53.0 16 49.5 18 46.1 20 42.9 22 39.9 24 37.1 26 34.5 28 32.2 30 30.2 32 28.5 34 27.1 36 26.1 38 25.4 40 25.0 42 25.0 44 25.4 46 26.1 48 27.1 50 28.5 52 30.2 54 32.2 56 34.5 58 37.1 60 39.9 62 42.9 64 46.1 66 49.5 68 53.0 70 56.6 72 60.3 74 64.0 76 67.7 78 71.4 80 75.0 82 78.5 84 81.9 86 85.1 88 88.1 90 90.9 92 93.5 94 95.8 96 97.8 98 99.5 100 100.9 102 101.9 104 102.6 106 103.0 108 103.0 110 102.6 112 101.9 114 100.9 116 99.5 118 97.8 120 95.8 122 93.5 124 90.9 126 88.1 128 85.1 130 81.9 132 78.5 134 75.0 136 71.4 138 67.7 140 64.0 142 60.3 144 56.6 146 53.0 148 49.5 150 46.1 152 42.9 154 39.9 156 37.1 158 34.5 160 32.2 162 30.2 164 28.5 166 27.1 168 26.1" stroke="currentColor" fill="none" stroke-width="1.2" opacity=".45"/>
<g fill="var(--accent)"><rect x="6.5" y="62.5" width="3" height="3"/><rect x="16.5" y="44.6" width="3" height="3"/><rect x="26.5" y="30.7" width="3" height="3"/><rect x="36.5" y="23.9" width="3" height="3"/><rect x="46.5" y="25.6" width="3" height="3"/><rect x="56.5" y="35.6" width="3" height="3"/><rect x="66.5" y="51.5" width="3" height="3"/><rect x="76.5" y="69.9" width="3" height="3"/><rect x="86.5" y="86.6" width="3" height="3"/><rect x="96.5" y="98.0" width="3" height="3"/><rect x="106.5" y="101.5" width="3" height="3"/><rect x="116.5" y="96.3" width="3" height="3"/><rect x="126.5" y="83.6" width="3" height="3"/><rect x="136.5" y="66.2" width="3" height="3"/><rect x="146.5" y="48.0" width="3" height="3"/><rect x="156.5" y="33.0" width="3" height="3"/><rect x="166.5" y="24.6" width="3" height="3"/></g>
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
    run: [
      "git clone https://github.com/joepothiboot/lozenge && cd lozenge",
      "git checkout {commit}",
      "stack test   # z3 on PATH for the SMT tests; otherwise they are skipped",
      "stack run lozenge -- verify rules/bitvector.rules --json",
    ],
    runNote: "Needs GHC via stack, and z3 for the SMT checks.",
    tests: [],
    benchmarks: [],
    quickDemo:
      "Read the rule corpus: 22 valid rules and 8 deliberately wrong ones.",
    art: `<svg viewBox="0 0 176 128" role="img" aria-label="A lozenge holding equal terms, one chosen; a wrong rule outside it, struck out">
<path d="M88 12 136 64 88 116 40 64Z" stroke="currentColor" fill="none" stroke-width="1.2" opacity=".45"/>
<g stroke="currentColor" stroke-width="1" opacity=".35" stroke-dasharray="2 3"><path d="M72 50 104 50 88 84Z"/><path d="M72 50 88 64 104 50M88 64 88 84"/></g>
<g fill="currentColor"><circle cx="72" cy="50" r="4"/><circle cx="104" cy="50" r="4"/><circle cx="88" cy="84" r="4"/></g>
<circle cx="88" cy="64" r="6" fill="var(--accent)"/>
<g stroke="var(--bad)" stroke-width="1.4"><circle cx="156" cy="28" r="5" fill="none" stroke-dasharray="2 2"/><path d="M150 22 162 34M162 22 150 34"/></g>
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
