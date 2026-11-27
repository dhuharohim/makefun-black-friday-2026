# LedgerDrop — Verified Black Friday 2026 Deal Finder

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/dhuharohim/makefun-black-friday-2026/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/dhuharohim/makefun-black-friday-2026/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

A static, zero-network-at-runtime Black Friday & Cyber Monday 2026 deal finder built for the [make.fun `black-friday-deal-finder-01` bounty](https://make.fun/bounty/black-friday-deal-finder-01).

## Highlights

- 24 real, checked Black Friday 2026 deals across Amazon, Best Buy, and Walmart (verified 2026-11-27 UTC)
- Live search, category, store, minimum-discount, and verdict filters with URL-hash state
- Honest 4-tier "Is It Really a Deal?" signal (`All-Time Low`, `Strong Deal`, `Routine Sale`, `Inflated MSRP`) and cross-store price comparisons
- Lean vanilla ES modules + responsive desktop & mobile layout

## Run

```bash
node serve.ts
# Build submission dossier:
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
