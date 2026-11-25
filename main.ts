// The One-Line Exit — writes one funny resignation letter to entry.txt.
// The line: a salesperson quits to sell sunscreen in Alaska, of all places,
// and the punchline is that even those impossible sales targets still sound
// more achievable than the ones at the job being left. The specific sales
// voice and the absurd new job set up the turn in a single sendable line.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LINE =
  "Dear Boss, I hereby resign to sell sunscreen in Alaska; the sales targets there still sound more achievable than yours.";

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;
  return "/output";
}

function main(): void {
  // The gate accepts exactly 1-140 characters of non-blank UTF-8 text.
  if (LINE.length < 1 || LINE.length > 140 || LINE.trim().length === 0) {
    throw new Error(`line is ${LINE.length} chars, outside the 1-140 gate`);
  }
  // The entry is one line: a stray newline would hand the judge two.
  if (LINE.includes("\n") || LINE.includes("\r")) {
    throw new Error("line must be a single line, with no newline characters");
  }

  const dir = outputDir();
  mkdirSync(dir, { recursive: true });

  // Clear the output directory's contents entry by entry; the directory
  // itself is never removed, so a mounted /output stays mounted.
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }

  writeFileSync(join(dir, "entry.txt"), LINE, "utf8");

  // Read the file back and compare it byte for byte with the line: a short
  // or mangled write must fail here, not slip past the gate as a bad entry.
  const onDisk = readFileSync(join(dir, "entry.txt"), "utf8");
  if (onDisk !== LINE) {
    throw new Error("entry.txt on disk does not match the line exactly");
  }
  // The gate counts characters in UTF-8 text, so also confirm the bytes on
  // disk decode back to exactly the same character count as the line.
  const byteCount = Buffer.byteLength(onDisk, "utf8");
  if (byteCount < 1 || [...onDisk].length !== LINE.length) {
    throw new Error(`entry.txt holds ${byteCount} bytes, not the line as UTF-8`);
  }

  const here = dirname(fileURLToPath(import.meta.url));
  console.log(`wrote ${LINE.length} chars from ${here} to ${join(dir, "entry.txt")}`);
}

main();
