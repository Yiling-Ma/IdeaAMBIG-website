# Canonical IdeaAMBIG taxonomy

The following three Level-1 types and ten Level-2 labels are the final taxonomy.
`taxonomy.json` is its machine-readable registry and is identical in the website,
ARR paper, and arXiv paper repositories. Table numbers vary between paper formats;
the taxonomy does not.

| Level 1 | Level 2 |
|---|---|
| Ambiguity | Ambiguous Definition |
| Ambiguity | Ambiguous Procedure |
| Incompleteness | Missing Method Procedure |
| Incompleteness | Missing Model Structure |
| Incompleteness | Missing Data Specification |
| Incompleteness | Missing Configuration Protocol |
| Incompleteness | Missing Evaluation Specification |
| Inconsistency | Conflicting Objective |
| Inconsistency | Conflicting Model Design |
| Inconsistency | Conflicting Formal Definition |

## Presentation policy

- Use these exact names and capitalization in category fields, tables, prompts,
  figures, website examples, and distribution data.
- Figure-axis abbreviations are allowed only when they map unambiguously to the
  final labels; the accepted mappings are in `taxonomy.json`.
- The qualitative Case B table displays normalized taxonomy names. Its model
  diagnosis and clarification action retain their original wording. The caption
  explicitly identifies the taxonomy-name normalization.
- Raw model outputs and original source records remain unchanged. Historical names
  are recorded only in the registry's `legacy_display_aliases`, rather than shown
  as additional current categories. This is a display-name normalization, not
  relabeling the experiment or recomputing any score.
- `codification_slot`, method-component groupings (Algorithm, Model, Loss, etc.),
  action types, field names, record IDs, and quoted specifications are separate
  concepts. Do not rename these into Level-2 taxonomy categories.

## Verification

Run `python3 scripts/check_taxonomy.py --pdf` from the repository root.
The PDF check needs Poppler's `pdftotext`. The check validates current labels,
legacy-name residues, figure labels, and any website category data present.
The taxonomy construction graphic uses a real final-category example rather than
placeholder text. The archived ARR teaser uses Ambiguous Definition for the
undefined activated-parameter quantity, matching the active teaser. An unreferenced
legacy raster illustration with superseded category text was removed from the
ARR repository; the active vector case study remains unchanged.
