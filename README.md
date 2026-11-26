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

- `index.html`: paper information, tasks, construction, taxonomy, results, resources, and citation.
- `style.css`: responsive layout using the project's brick-red, orange, olive, and powder-blue palette.
- `app.js`: example explorer, sortable results, scroll-aware contents navigation, mobile drawer, and copy controls.
- `data/examples.json`: six unchanged example excerpts and annotations from the released benchmark, one per subset and Level-1 type; every record retains its original ID and source evidence URL.
- `data/results.json`: all 78 main-result values for the 13 models, transcribed from the latest paper.
- `assets/`: original IdeaAMBIG logo, paper construction figure, and locally hosted font.

GitHub Pages serves `main` from the repository root. `.nojekyll` keeps the
website buildless. All paths are relative, so the site works under the
`/IdeaAMBIG-website/` project path.

The left contents rail scrolls independently on desktop and highlights the
current section. Its nine entries match the numbered content headings. On
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
Reported Task 3 results receive the annotated defect. Oracle-utility studies
supply the gold resolution and are labeled separately.

## Overview video

The Overview section embeds the approved v11 film (3:19), served directly
from `assets/ideaambig-overview-v11-clean.mp4`, with a local WebP poster and
optional English WebVTT captions. Playback is user-initiated, uses native accessible
controls, and stays inline on mobile. Video metadata is preloaded; the movie
does not autoplay. The website uses a clean render without burned-in subtitles, so the CC menu
can turn captions fully off. Desktop exports retain their on-screen subtitles.
