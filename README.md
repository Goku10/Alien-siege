# Alien Siege: Turret Defense

A browser-based arcade turret defense game. Defend a planetary base across three levels, earn credits, upgrade between levels, and defeat the mothership boss.

> **Resuming development?** See [`docs/PROJECT_MEMORY.md`](docs/PROJECT_MEMORY.md) for phase history and [`AGENTS.md`](AGENTS.md) for agent conventions.

## Quick Start

```bash
cd alien-siege
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

## Controls

| Action | Desktop |
|--------|---------|
| Aim | Mouse or `A` / `D` / arrow keys |
| Fire | Left click or `Space` |
| Pause | `Esc` (works during combat, level intro, and boss warning) |
| Menu confirm | `Enter` |

## Campaign Flow

1. **Title** → Start Defense
2. **Level intro** (3.5s) → timed waves with scaling enemy mix
3. **Boss warning** → mothership fight
4. **Level complete** → score/credits summary
5. **Shop** → buy weapons and tiered upgrades (persists for the rest of the run)
6. Repeat for levels 2–3, then **campaign complete**

**Lose** if breach reaches 100% or base health (and shields) hits zero.

**Session persistence:** Progress is in-memory only. Refreshing the page or choosing *Try Again* / *Quit to Title* starts a new run with no upgrades.

## Architecture

```
React shell (menus, HUD, overlays)
        ↕ callbacks / GameSnapshot
Game.ts orchestrator
        ↕
Systems: LevelManager, WaveManager, CollisionSystem, ThreatSystem,
         EconomyManager, ShopManager, BossManager, EffectsManager
        ↕
Entities (pooled) + Canvas Renderer layers
        ↕
Data configs (balancing, enemies, waves, shop, weapons)
```

- **React** owns DOM overlays; **Canvas** renders all gameplay at 1280×720 (scaled to viewport).
- **`Game`** runs the update loop and emits snapshots to React each frame.
- **Object pooling** for projectiles, enemies, and particles keeps GC pressure low.
- **Data-driven** enemies, waves, shop items, and level scaling — tune in `src/game/data/`.

### Key files

| File | Role |
|------|------|
| `src/game/Game.ts` | Session lifecycle, screen state, update order |
| `src/hooks/useGameCanvas.ts` | React bridge to Game |
| `src/game/systems/LevelManager.ts` | Campaign FSM (intro → combat → boss → complete) |
| `src/game/systems/CollisionSystem.ts` | Projectile hits, splash, kill rewards |
| `src/game/systems/ShopManager.ts` | Purchases, loadout, defense bonuses |
| `src/game/systems/EntityManager.ts` | Entity pools and spawn helpers |

## Balancing & Config

All gameplay tuning lives under `src/game/data/`:

| File | Tune here |
|------|-----------|
| `balancing.ts` | Canvas, base HP, combo, shake, combat falloff, UI popup positions |
| `enemies.ts` | Flying enemy stats, shields, drops |
| `groundEnemies.ts` | Ground unit stats, pod payload weights |
| `waveCompositions.ts` | Per-level wave blueprints |
| `levelScaling.ts` | Per-level difficulty multipliers |
| `levels.ts` | Level metadata and wave bindings |
| `credits.ts` | Credit earn rates |
| `weapons.ts` | Weapon stat definitions |
| `shopItems.ts` | Shop catalog and upgrade chains |
| `bossConfig.ts` | Mothership boss phases and attacks |
| `spawnModifiers.ts` | Helpers mapping level scaling → spawn modifiers |

## Shop (within a run)

- **Credits** are earned from kills, wave clears, boss defeats, and performance bonuses.
- **Purchases persist** across levels until game over or quit to title.
- **Defense upgrades:** HP bonuses raise max health; shield upgrades add a separate shield pool that absorbs damage first.
- **Weapons** can be bought and equipped; stat upgrades stack via tiered chains.
- **Final level:** shop is still available before the campaign complete screen.

## Current Status — MVP (Phase 12)

Complete playable campaign:

- 3 levels with distinct wave compositions and scaling
- 6 flying + 4 ground enemy types
- 5 weapons with tiered upgrades
- Between-level shop with loadout previews
- Boss fight with 3 phases
- Polished HUD, combat feedback, and screen UX

## License

Private / MVP prototype.
