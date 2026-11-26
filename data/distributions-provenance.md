# Interactive distribution provenance

All panels count the same released 660 single-defect instances: 163 real-world
and 497 controlled synthetic. Combined is their disjoint union, never an
unweighted average of percentages. Every dimension sums to these totals.

- Research domains: original `domain_audit.csv`, joined by exact released ID.
- Defect types/categories: `Data/real_benchmark_instance.jsonl` and
  `Data/syn_benchmark_instance.jsonl` from the released benchmark.
- Method components: original per-instance slot labels from `Eva_real/instances.jsonl`
  and the original `slot_category_mapping.json`; filtered by released subset IDs.
- Evidence sources: provenance fields of the released records.
- `distribution-audit.csv` provides the ID-level join for independent checking.
- The static source PDF is preserved unchanged at `assets/dataset-distributions.pdf`.

## Correction to the original component plotting input

The original component plotting script used all 660 released IDs as its Real
input, then added the 497 synthetic IDs again, giving 1,157 combined records.
The interactive component panel instead filters the same original slot annotations
by the published 163/497 subset membership. Its counts are therefore corrected,
not reverse-engineered from pixel heights or copied from the misgrouped summary.
The other original figure panels already use the correct 163/497 split.

Original corrected component counts:

- real: Algorithm 104, Model 1, Loss 0, Evaluation 19, Data 32, Training 7
- synthetic: Algorithm 273, Model 53, Loss 24, Evaluation 68, Data 57, Training 22
- combined: Algorithm 377, Model 54, Loss 24, Evaluation 87, Data 89, Training 29
