# Alien Siege: Turret Defense

A modern arcade turret defense shooter inspired by the fixed-turret loop of *Paratrooper*, reskinned as an alien invasion defense game.

> **Resuming development?** Read [`docs/PROJECT_MEMORY.md`](docs/PROJECT_MEMORY.md) for phase history, architecture, and current state. AI agents should also read [`AGENTS.md`](AGENTS.md).

## Quick Start

```bash
cd alien-siege
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

## Controls (Phase 1)

| Action | Desktop |
|--------|---------|
| Aim | Mouse (or `A`/`D`, arrow keys) |
| Fire | Left click or `Space` |
| Pause | `Esc` |
| Menu confirm | `Enter` |

## Project Structure

```
src/
├── components/       # React UI (menus, HUD, overlays)
├── game/
│   ├── data/         # Balancing & config (turretConfig.ts, balancing.ts)
│   ├── entities/     # Turret, Projectile, enemies (future)
│   ├── rendering/    # Canvas draw layers
│   ├── systems/      # Input, loop, entities, waves (future)
│   ├── Game.ts       # Main game orchestrator
│   └── types.ts      # Shared TypeScript interfaces
├── hooks/            # React hooks (useGameCanvas)
├── styles/           # Global & game CSS
└── utils/            # Math helpers, object pooling
```

## Architecture Summary (Phase 1)

- **React** owns the app shell: title screen, pause overlay, HUD containers.
- **HTML5 Canvas** renders all gameplay via a fixed logical resolution (1280×720), scaled to fit the viewport.
- **`Game`** class orchestrates update/render, owns session state, and communicates with React through callbacks.
- **`GameLoop`** uses `requestAnimationFrame` with delta-time updates (capped at 30 FPS minimum step).
- **`InputManager`** normalizes mouse/keyboard into a single `InputState`.
- **`Turret`** rotates toward aim target with clamped firing arc; **`EntityManager`** + object pool handle projectiles.
- **`Renderer`** composes background, projectiles, muzzle flashes, and turret layers.

## Balancing Files

| File | Purpose |
|------|---------|
| `src/game/data/balancing.ts` | Global constants (canvas size, base health, combo, waves) |
| `src/game/data/turretConfig.ts` | Turret rotation + Machine Gun weapon stats |
| `src/game/data/enemies.ts` | Enemy type definitions (HP, speed, patterns, score) |
| `src/game/data/levels.ts` | Level 1 wave spawn schedules |

## Current Status — Phase 4 Complete

- [x] Phases 1–3: Combat, ground threats, breach, game over
- [x] 3 levels with 4–5 waves each (data-driven in `levels.ts`)
- [x] Level scaling: speed, health, spawn rate, bonuses (`levelScaling.ts`)
- [x] Level intro overlay, wave announcements, wave/level clear flow
- [x] Boss warning transition after final wave (mothership scaffold)
- [x] Level complete screen + campaign complete after Level 3
- [x] HUD shows Level X/3 and Wave Y/Z

### Next Phases

- Phase 5: Mothership boss fight + credits economy
- Phase 4: Boss fights
- Phase 5: Score/credits economy
- Phase 6: Shop + upgrades
- Phase 7: Polish (particles, combos, audio hooks)

## License

Private / MVP prototype.
