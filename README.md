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
| `src/game/data/levels.ts` | Level wave schedules and bonuses |
| `src/game/data/credits.ts` | Credit earn rates (kills, waves, boss, bonuses) |
| `src/game/data/shopItems.ts` | Shop catalog (costs, categories, stat effects) |
| `src/game/data/weapons.ts` | Weapon definitions for shop loadout |

## Current Status — Phase 7 Complete

- [x] Phases 1–6: Combat, defense, levels, boss, credits economy
- [x] **Between-level shop** — spend credits on weapons and upgrades
- [x] Four shop categories: Weapons, Weapon Upgrades, Defense, Special Systems
- [x] Buy and equip flow with affordable / owned / equipped button states
- [x] Level complete → summary → shop → next level

### Next Phases

- Phase 8: Polish (particles, audio hooks, balance pass)

## License

Private / MVP prototype.
