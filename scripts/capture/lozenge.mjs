import fs from "node:fs";
import path from "node:path";
import { srcDir } from "./common.mjs";

/** @typedef {import("../../src/model.js").Artifact} Artifact */

/** @returns {Artifact[]} */
export function captureLozenge() {
  const rel = "rules/bitvector.rules";

  return [
    {
      id: "lozenge-rules",
      kind: "source",
      title: "The bitvector rule corpus",
      language: "lisp",
      text: fs.readFileSync(path.join(srcDir("lozenge"), rel), "utf8"),
      location: { file: rel, line: 1 },
      provenance: { mode: "static", path: rel },
    },
  ];
}
