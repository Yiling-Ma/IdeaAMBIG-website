# IdeaAMBIG Project Website

Project page for **IdeaAMBIG: Benchmarking Implementation-Critical Gaps in Research-Idea Specifications**.

- Website: https://yiling-ma.github.io/IdeaAMBIG-website/
- Paper: https://arxiv.org/abs/2609.10539
- Code and full dataset: https://github.com/Yiling-Ma/IdeaAMBIG

## Local preview

```bash
python3 -m http.server 8765
```

Open http://localhost:8765. Use an HTTP server so the example and result JSON
files load correctly. No installation or build step is required.

## Content

- `index.html`: paper information, tasks, construction, taxonomy, results, findings, conclusions, resources, and citation.
- `style.css`: responsive layout using the project's brick-red, orange, olive, and powder-blue palette.
- `app.js`: example explorer, scroll-aware contents navigation, mobile drawer, and copy controls.
- `results-explorer.js`: model rankings, subset comparison, and sortable results.
- `distribution-explorer.js`: interactive dataset coverage and defect distributions.
- `findings.js`: paper-grounded readiness and localization charts with animated subset switching.
- `data/examples.json`: six curated released records, one per subset and Level-1 type, with complete source specifications, full READY references, and gold clarification actions. Every record retains its original ID and a direct link to its JSONL line.
- `data/results.json`: all 78 main-result values for the 13 models, transcribed from the latest paper.
- `assets/`: original IdeaAMBIG logo, paper construction figure, and locally hosted font.

GitHub Pages serves `main` from the repository root. `.nojekyll` keeps the
website buildless. All paths are relative, so the site works under the
`/IdeaAMBIG-website/` project path.

The left contents rail scrolls independently on desktop and highlights the
current section. Its ten entries match the numbered content headings. On
smaller screens, the header menu opens the same contents in a keyboard-accessible
drawer, with Escape and backdrop dismissal.

## Design references

The academic project-page structure takes inspiration from
[PhyCoVE](https://phycove.github.io/) and
[SciCoQA](https://ukplab.github.io/scicoqa/). Website implementation, copy,
and visual identity are specific to IdeaAMBIG. No reference-site code or
artwork is copied.

## Data provenance

Paper source: `Yiling-Ma/-ARR-Aug--AmbIdea`, commit
`30519dda90aa33acbc46e82d36382be0834c2129`.
Benchmark release: `Yiling-Ma/IdeaAMBIG`, commit
`ac81622`.

Example panels display gold annotations; they do not call an LLM.
Selection criteria, rejected alternatives, and per-case rationales are documented
in `data/example-selection.md`. All six underspecified specifications are displayed in full, without excerpt
markers or omitted context. User-facing labels use spaces; raw IDs and executable code are preserved.
Reported Task 3 results receive the annotated defect. Oracle-utility studies
supply the gold resolution and are labeled separately.

## Overview video

The Overview section embeds the approved v11 film (3:19), served directly
from `assets/ideaambig-overview-v11-clean.mp4`, with a local WebP poster and
optional English WebVTT captions. Playback is user-initiated, uses native accessible
controls, and stays inline on mobile. Video metadata is preloaded; the movie
does not autoplay. The website uses a clean render without burned-in subtitles, so the CC menu
can turn captions fully off. Desktop exports retain their on-screen subtitles.

## Interactive distributions

Section 04 uses `distribution-explorer.js` and `data/distributions.json` for
five views: research domains, Level-1 types, Level-2 categories, method
components, and evidence sources. Subset comparison, counts/shares, sorting,
hover/focus, and pinned category details are supported. All dimensions sum to
163 real-world, 497 synthetic, and 660 combined records. The Combined share
is computed from its counts, not averaged across subset percentages.

`data/distribution-audit.csv` records the ID-level joins; see
`data/distributions-provenance.md` for source definitions and the correction
to the original component plotting input. The downloadable figure is synchronized with these corrected counts at
`assets/dataset-distributions-corrected.pdf`; only panel (d) is recalculated,
while panels (a)–(c) and the shared legend preserve the supplied artwork.

## Interactive subset comparison

`results-explorer.js` renders a paired Synthetic / Real-world rank comparison
for each of the three primary task metrics. It reuses all 78 published values
in `data/results.json`; no cross-task aggregate is computed. Model-group presets
and individual chips select the comparison cohort. Hover/focus traces a model;
click/Enter pins it. Ranks use competition ranking among the selected models,
with ties at the published precision. Rank change is synthetic rank minus real
rank. Score differences are always real minus synthetic, in percentage points.
Single-subset views retain the sortable three-metric score table.

Interaction reference: [GRAPE-Bench](https://zhangce01.github.io/grape-bench/).
The code and visual styling are specific to IdeaAMBIG.

## Final page structure

01 Overview → 02 Data construction → 03 Benchmark tasks → 04 Defect taxonomy →
05 Dataset examples → 06 Benchmark results → 07 Key findings → 08 Conclusions →
09 Get started → 10 Citation.

Results contains the complete interactive model comparison. Findings explains four
paper-grounded observations with their evidence; Conclusions states the implications.
The first two findings switch between real-world and synthetic results for
GPT-5.6-Sol (paper Tables 15–16). Oracle utility remains explicitly identified.

Unused static distribution SVG and uncropped pipeline PNG have been removed.
The pipeline SVG embeds its own image and requires no external PNG. The corrected
distribution PDF remains linked alongside the interactive explorer.
