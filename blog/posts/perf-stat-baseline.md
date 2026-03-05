# perf stat: a baseline I reuse

Perf is most useful when the runs are comparable. My default approach is boring on purpose.

## Checklist

- Warm up once before measuring.
- Run multiple trials; report median.
- Use a small set of counters you can interpret:
  - `cycles`, `instructions`
  - `cache-misses` (and sometimes `branches`, `branch-misses`)

```bash
perf stat -e cycles,instructions,cache-misses ./kernel_bench
```

## Notes

- If performance changes but `instructions` doesn’t, the story is usually memory.
- If `instructions` changes, verify you didn’t accidentally change work.
- Prefer small, reversible code changes so you can attribute effects.

