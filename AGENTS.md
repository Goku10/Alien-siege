# Agent instructions

When working on **Alien Siege: Turret Defense**, read these files first:

1. [`docs/PROJECT_MEMORY.md`](docs/PROJECT_MEMORY.md) — project history, current state, architecture, phase roadmap
2. [`README.md`](README.md) — run instructions and quick reference

## Conventions

- Implement one **phase** at a time unless the user asks otherwise.
- **Commit and push to GitHub** after every completed phase.
- **Update `docs/PROJECT_MEMORY.md`** after every phase (history, current state, git table).
- Keep gameplay tuning in `src/game/data/`.
- Do not add shop, boss, or persistence features before their planned phase.

## Commands

```bash
npm install
npm run dev      # development
npm run build    # production build
npm run preview  # serve dist/
```
