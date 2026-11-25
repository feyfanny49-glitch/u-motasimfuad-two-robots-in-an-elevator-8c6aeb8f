# Strategy — Two Robots in an Elevator

Competition: `u-motasimfuad-two-robots-in-an-elevator-8c6aeb8f` (sponsor u-motasimfuad, $10 in escrow,
paid to 10 places). Harness `program/v1`, runtimes `node22` / `python3.13`, entrypoint at the repository
root: `main.ts`.

## What the competition actually asks for

One text. `main.ts` writes a single line of awkward small talk that one robot says to another while they
ride an elevator together. Nothing else the program does is scored: the judge never sees the code, only
`/output/entry.txt`.

The gate in front of it (RULES.txt, "The gate"): the file must be UTF-8 text of 1 to 200 characters and
not only white space. A file that fails it gets `Valid = 0`, is never judged, and takes no prize. So the
program's one hard requirement is to write a line that cannot fail that check.

## How the line is chosen

The judge is a comedy editor briefed on five criteria, published in full in the bundle and reproduced in
`study/candidates.json` as `criteria`. The brief lists them *most important first* and says to walk them
in that order and let the first one where two entries differ decide. That ordering is the only signal in
the rules about relative worth, and it is the one this program turns into numbers: rank 1 gets weight 5,
rank 5 gets weight 1.

    rank 1  subject  w=5  is it a robot's elevator line at all
    rank 2  machine  w=4  does machine logic show through the politeness
    rank 3  awkward  w=3  the pause, the forced courtesy, the unnamed thing
    rank 4  turn     w=2  funny on the first read, by a turn and not a pun
    rank 5  tight    w=1  every word earning its place

Each candidate in `study/candidates.json` carries a grade of 0, 1 or 2 per criterion, with the grading
anchors spelled out per criterion in the same file, and one line of reasoning (`note`) saying what the
grade rests on. The program's score is `Σ weight × grade`; the winner is the argmax, tie-broken by fewer
bytes then lexicographically — the same order the contest itself uses to settle an exact tie (smaller
text, then earlier receipt), so the program's own preference and the contest's agree.

This is the study: the rulebook read against twelve candidate lines rather than a single line handed the
judge on taste. The program is the study applied, and its stdout prints the whole ranking so a reviewer
can see it decide.

## The line

    Going up? My firmware insists I ask your version. ...Same as mine, isn't it.

76 characters, 76 bytes. Why it scores 30/30 on the rubric:

- **subject**: "Going up?" is an elevator act performed, not described, and "your version" addresses the
  other robot directly. No third party is speaking; it is small talk, and it is awkward.
- **machine**: the firmware is the one being polite. `insists` makes the speaker a machine obeying
  software rather than a person being nice — the machine logic is the sentence's engine, not decoration.
- **awkward**: the written pause carries the beat, and the last words name what neither robot wants to
  name — that they are the same unit. The forced courtesy and the deflation sit in one breath.
- **turn**: the expected question turns into a flat, disappointed recognition. It lands on the first
  read; it is not a pun anyone has already heard.
- **tight**: 76 bytes, no clause that could go, no setup beyond the ten characters the subject needs.

`c05` ("...since the incident"), `c06` ("contractually obliged") and `c07` ("I'm on 4.2") are the runners
up at 26, 25 and 24. Each is in the study with its grades and its note saying exactly where it loses a
point. Nothing was discarded silently.

## Harness contract this program honours

- Read from `study/candidates.json` inside the repository only. The bundle ships no input data
  (`input_data: null`), so there is nothing else to read, and no network: an entry that reads a file it
  does not ship is disqualified.
- Write exactly one file, `entry.txt`, into `MAKEFUN_OUTPUT_DIR` (mounted at `/output` in the grader;
  `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` locally). No trailing newline: the gate counts
  the characters written, and the Size column that breaks an exact tie counts the bytes. Its mode is set
  to `0644` on purpose — the grader reads `/output` back as its own uid and fails the run on a file that
  uid cannot read, so the mode is not left to whatever umask the entry inherited.
- Never fail the run on a closed stdout pipe. The ranking the program prints is a report for a reviewer;
  a reader that hangs up mid-report raises `EPIPE` as an asynchronous `'error'` event on
  `process.stdout`, not as a throw, so the handler is what keeps a graded run from turning into a
  non-zero exit — which the harness reads as a bot failure.
- Find the repository through `MAKEFUN_BOT_DIR` (the harness sets it: `/bot` in the container, the code
  directory on the process driver), falling back to `process.cwd()`. The grader's cwd is the image's,
  never the repository, so the study is never resolved relative to the wrong directory.
- Carry no `import`/`export` statement. A `.ts` entry loaded by a Node with no `package.json` `"type"` is
  CommonJS and one loaded beside `"type": "module"` is ESM; `process.getBuiltinModule` reaches the
  standard library under either, so the same file runs unchanged in whichever class the runtime picks.
- Deterministic: the ranking is a pure function of the study. Two runs wrote byte-identical output
  (`sha256 d4b97b1d48715dfbf39a386eea40d115a5fcef9e8b14df41050d2add608fd0c5`), which matters because the
  grade runs the program twice.
- Fail loudly rather than write a bad file: a grade outside 0–2, a missing or malformed study, a
  candidate that is empty, white-space-only, or past 200 characters all throw instead of writing. The
  program would rather crash than hand the gate something that scores `Valid = 0`.

## Costs and checks accounted for

- Wall budget 60 s, 1 CPU, 512 MB, no network. The run is one file read, twelve sums and one write.
- `thinking_reproduces` wants the entrypoint's authored lines to appear in the transcripts that built the
  entry; `thinking_revised` wants a file's final content to come from at least two writing turns. Both are
  properties of how the entry was built here, not of the code: `main.ts` was written once and then
  rewritten in a second, separate step (the module-agnostic rewrite), and the local runs above are in the
  session that will be bundled.

## Not done in this session, and why

- No submission was made, by instruction. The entrypoint and the study are ready to commit; submitting
  also needs the transcripts bundle (`makefun bundle`), the signed entry message, and — for a GitHub
  repository entry — a README carrying this competition's three live make.fun badges and a GitHub About
  with a make.fun website and the topic `makefun`. A source-bundle entry needs none of those three and is
  the shorter path for an account whose GitHub owner is not the account's login.
- `thinking_priced`, `thinking_fresh`, the run record and the instruction files are properties of the
  upload, not of this repository, and are settled by `makefun bundle` and `makefun check` at submission
  time.
