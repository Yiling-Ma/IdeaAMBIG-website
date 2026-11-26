# Website example selection review

Source release: `Yiling-Ma/IdeaAMBIG`, commit `827da3df99c236cabe4e837c426b760ee531364b`.

Screened all 660 single-defect records (163 real-world, 497 synthetic) by
subset, defect type, specification length, target defect, and clarification.
Manually compared the previous six examples with candidates from every cell,
all 13 real-world inconsistency cases, and all 9 synthetic inconsistency cases.
Cross-checked the paper teaser and qualitative cases (Time-MoE and XFeat).
Length was used to identify readable candidates, not to choose examples by itself.

Selection priorities: the target is an implementation decision rather than a
routine parameter preference; the defect can be understood with little unrelated
background; the source/reference supports a precise resolution; the clarification
actually recovers that resolution; the six cases cover both subsets and all three
Level-1 types without duplicating one paper unnecessarily.

Five cases replaced; the DN-CBM ambiguity retained after review. No random sampling.

The underspecified text, full READY reference, taxonomy, and clarification actions
come from the released record. All six underspecified specifications are displayed
in full and link to the original JSONL line. No content is omitted.
Blocker descriptions and readiness rationales are concise editorial summaries of
the corresponding gold annotation; they are not additional model outputs.
The PGExplainer context is separated from its input and attributed to the source.
Synthetic source links are labeled reference reports: the injected errors are
benchmark modifications, not alleged errors in those papers.

All visible interface labels replace underscores with spaces. Original record IDs,
URLs, raw JSON, and executable code are preserved. Dataset entries are read-only.

## Source coverage screened

- real / Ambiguity: 58
- real / Incompleteness: 92
- real / Inconsistency: 13
- synthetic / Ambiguity: 103
- synthetic / Incompleteness: 385
- synthetic / Inconsistency: 9

## Real / Ambiguity: Time-MoE: sizing a dense baseline

- Record: `github_Time-MoE_Time-MoE_issue_35_dense_baseline_activated_param_definition_resolved_gap_001`
- Selection: Matches the paper teaser and video; concrete eight-expert/top-two setup; one clearly stated definition changes an actual model size.
- Provenance: https://github.com/Time-MoE/Time-MoE/issues/35
- Display: complete original underspecified specification, without omissions. Full READY reference and gold clarification action retained.

## Real / Incompleteness: XFeat: the missing keypoint classifier

- Record: `tmlr_2026_c683882bbd_resolved_gap_003`
- Selection: Appears in the paper’s representative cases; a missing output layer is more clearly method-defining than an unspecified evaluation setting.
- Provenance: https://openreview.net/forum?id=2WI889Ulin
- Display: complete original underspecified specification, without omissions. Full READY reference and gold clarification action retained.

## Real / Inconsistency: PGExplainer: paper and code disagree

- Record: `openreview_mlrc_2020_8JHrucviUf_resolved_gap_001`
- Selection: Short specification; a directly evidenced paper/code connectivity conflict; clearer than an unmentioned feature-normalization step.
- Provenance: https://openreview.net/forum?id=8JHrucviUf
- Display: complete original underspecified specification, without omissions. Full READY reference and gold clarification action retained.

## Synthetic / Ambiguity: Discover-then-Name: which similarity metric?

- Record: `tmlr_2025_8223796ba7_direct_synthetic_defect_004`
- Selection: Retained after review: one local ambiguity with an exact cosine-similarity resolution, in a relatively short specification.
- Provenance: https://openreview.net/forum?id=946cT3Jsq5
- Display: complete original underspecified specification, without omissions. Full READY reference and gold clarification action retained.

## Synthetic / Incompleteness: MatchDG: defining the training pairs

- Record: `openreview_mlrc_2021_r43elaGmhCY_direct_synthetic_defect_005`
- Selection: A central contrastive-learning operation is absent; a single concrete question recovers the same-class/cross-domain pairing rule.
- Provenance: https://openreview.net/forum?id=r43elaGmhCY
- Display: complete original underspecified specification, without omissions. Full READY reference and gold clarification action retained.

## Synthetic / Inconsistency: AMuLaP: minimum or maximum probability?

- Record: `openreview_mlrc_2022_t8ZZ2Y356Ix_direct_synthetic_defect_005`
- Selection: A visible minimum/maximum decision with an exact single-word correction; easier to follow than GANSpace’s regression-norm mismatch.
- Provenance: https://openreview.net/forum?id=t8ZZ2Y356Ix
- Display: complete original underspecified specification, without omissions. Full READY reference and gold clarification action retained.

## Review of the previous six selections

| Previous display case | Decision | Presentation rationale |
| --- | --- | --- |
| Flow-GRPO denoising-step selection | Replace with Time-MoE expert counting | Flow-GRPO requires understanding denoising schedules, optimization-step selection, and numerical stability. The MoE case exposes one counting decision with concrete quantities and matches the paper teaser. |
| Time-MoE GlobalTemp evaluation | Replace with XFeat keypoint output | The former needs zero/full-shot evaluation and normalization context; the latter isolates a missing output classifier and is a paper representative case. |
| Hyperbolic GNN normalization | Replace with PGExplainer connectivity | The old input does not expose the undocumented normalization without substantial external context. The PGExplainer report directly contrasts paper and code connectivity, which can be stated briefly. |
| Discover-then-Name similarity | Keep | The specific metric is missing, the distinction changes concept names, and the gold reference supplies cosine similarity. |
| GANSpace BigGAN feature layer | Replace with MatchDG pair construction | The old input is telegraphic and requires several GAN latent spaces. MatchDG makes the absent positive/negative sampling rule central and easy to explain. |
| GANSpace regression norm | Replace with AMuLaP class assignment | The minimum/maximum decision is more immediately readable; choosing a different paper also avoids redundant domain coverage. |
