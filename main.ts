// Two Robots in an Elevator — program/v1 entry.
//
// The competition asks for one line of awkward small talk that one robot says to another in an elevator,
// and grades it with a judge briefed on five criteria, the most important first. This program does not
// hand the judge a line picked by taste: it loads the study beside it (study/candidates.json: twelve
// candidate lines, each already read against those five criteria), turns the brief's own ordering into
// weights, scores every candidate, and writes the winner to /output/entry.txt.
//
// The harness runs this as `node /bot/main.ts` with MAKEFUN_BOT_DIR naming the repository tree and
// MAKEFUN_OUTPUT_DIR the output mount, so it behaves in the grader as it does at home:
//
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Nothing is read from outside the repository and nothing is written but entry.txt.
//
// The file carries no import or export statement on purpose. A .ts entry loaded by a Node with no
// package.json "type" is treated as CommonJS, and one loaded beside a "type": "module" package.json is
// treated as ESM; `process.getBuiltinModule` reaches the standard library under either, so this runs
// unchanged however the runtime classifies it.

const fs = process.getBuiltinModule('node:fs');
const path = process.getBuiltinModule('node:path');

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? process.cwd();
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const STUDY = path.join(BOT_DIR, 'study', 'candidates.json');

/** The gate's own bounds (RULES.txt, The gate): 1 to 200 characters, not only white space. */
const MIN_CHARS = 1;
const MAX_CHARS = 200;

interface Grade {
  subject: number;
  machine: number;
  awkward: number;
  turn: number;
  tight: number;
}

interface Candidate {
  id: string;
  line: string;
  grades: Grade;
  note: string;
}

interface Study {
  criteria: { key: keyof Grade; rank: number; weight: number; brief: string }[];
  tie_break: string;
  candidates: Candidate[];
}

function loadStudy(): Study {
  const study = JSON.parse(fs.readFileSync(STUDY, 'utf8')) as Study;
  if (!Array.isArray(study.criteria) || study.criteria.length === 0) {
    throw new Error(`${STUDY} carries no criteria`);
  }
  if (!Array.isArray(study.candidates) || study.candidates.length === 0) {
    throw new Error(`${STUDY} carries no candidates`);
  }
  return study;
}

/** A candidate's score: every criterion's weight times the grade the study gave it. */
function score(candidate: Candidate, weights: Map<keyof Grade, number>): number {
  let total = 0;
  for (const [key, weight] of weights) {
    const grade = candidate.grades[key];
    if (typeof grade !== 'number' || !Number.isInteger(grade) || grade < 0 || grade > 2) {
      throw new Error(`${candidate.id}'s grade for ${key} is ${String(grade)}, not 0, 1 or 2`);
    }
    total += weight * grade;
  }
  return total;
}

const study = loadStudy();

// The brief lists the five criteria most important first, so rank 1 takes the highest weight.
const weights = new Map<keyof Grade, number>(
  study.criteria.map((c) => [c.key, c.weight] as [keyof Grade, number]),
);
if (weights.size !== 5) throw new Error(`the study names ${weights.size} criteria, not 5`);

const ranked = study.candidates
  .map((candidate) => ({
    ...candidate,
    chars: [...candidate.line].length,
    bytes: Buffer.byteLength(candidate.line, 'utf8'),
    score: score(candidate, weights),
  }))
  .sort(
    (a, b) =>
      b.score - a.score ||
      a.bytes - b.bytes ||
      (a.line < b.line ? -1 : a.line > b.line ? 1 : 0),
  );

// The study is linted against the gate here, so a candidate the sealed scorer would refuse can never win.
// Both readings of "1 to 200 characters" are held to: the characters counted and the UTF-8 bytes written.
for (const row of ranked) {
  if (row.chars < MIN_CHARS || row.line.trim().length === 0) {
    throw new Error(`${row.id} is empty or only white space, which the gate refuses`);
  }
  if (row.chars > MAX_CHARS || row.bytes > MAX_CHARS) {
    throw new Error(
      `${row.id} is ${row.chars} characters, ${row.bytes} bytes, past the gate's ${MAX_CHARS}`,
    );
  }
}

/**
 * Write a line to stdout without ever failing the run: a closed pipe (EPIPE) is a reader's business, and a
 * non-zero exit is a bot failure however harmless the reason. The harness captures stdout to 1 MiB, which
 * this report is far inside.
 */
function say(line: string): void {
  try {
    process.stdout.write(line);
  } catch {
    // The consumer went away; the entry's file is written either way.
  }
}

const winner = ranked[0];

for (const row of ranked) {
  say(
    `${String(row.score).padStart(3)}  ${String(row.bytes).padStart(3)}B  ${row.id}  ${row.line}\n`,
  );
}
say(
  `\nchosen ${winner.id} at score ${winner.score} of a possible ${[...weights.values()].reduce((a, b) => a + b, 0) * 2}` +
    `, ${winner.chars} characters, ${winner.bytes} bytes\n` +
    `why: ${winner.note}\n` +
    `tie-break held: ${study.tie_break}\n`,
);

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, 'entry.txt'), winner.line, 'utf8');
