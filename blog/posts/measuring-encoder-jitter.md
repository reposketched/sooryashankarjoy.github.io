# Measuring encoder jitter without guessing

When an encoder-decoding loop feels “unstable”, the failure mode is often timing: latency spikes, jitter, or missed edges.
Instead of adjusting code blindly, I like to add **one** piece of instrumentation and collect a small dataset.

## A simple pattern

- Toggle a GPIO at ISR entry and exit (or use a spare pin around a critical section).
- Capture the waveform on a scope/logic analyzer.
- Measure latency and jitter directly before changing the controller or filtering.

```text
GPIO high  -> ISR entry
GPIO low   -> ISR exit
scope view -> latency + jitter distribution
```

## What I look for

- **Long tails**: occasional spikes usually mean contention or a higher-priority interrupt path.
- **Periodic jitter**: often a timer interaction or a background task.
- **“Random” jitter**: frequently measurement setup, probe reference, or noise coupling.

If you can’t explain the waveform, don’t tune the controller yet.

