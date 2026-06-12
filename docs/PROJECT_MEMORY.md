# Alien Siege — Project Memory

> **Purpose:** Persistent project history and context for future development sessions.
> Read this file first when resuming work on this repo (human or AI agent).

**Last updated:** 2026-06-12  
**Current phase:** Phase 3 complete  
**Remote:** https://github.com/Goku10/Alien-siege  
**Branch:** `main`

---

## How to use this file

1. Read **Current state** and **Phase history** before making changes.
2. After completing a phase, append to **Phase history**, update **Current state**, and **Git history**.
3. Commit and push to GitHub after every phase (project convention).
4. Keep balancing in `src/game/data/*` — avoid hardcoding gameplay numbers in systems.

---

## Project snapshot

| Item | Value |
|------|-------|
| Name | Alien Siege: Turret Defense |
| Stack | Vite + React 19 + TypeScript + HTML5 Canvas |
| Genre | Fixed-turret arcade defense (Paratrooper-inspired) |
| Resolution | 1280×720 logical canvas, scaled to viewport |
| Persistence | In-memory session only (no save/load yet) |
| Backend | None |

### High-level goal

Defend a planetary base with a stationary turret. Destroy flying aliens, ground threats, and mothership bosses. Earn score + credits, upgrade between levels via shop.

### MVP roadmap (original plan)

| Phase | Scope | Status |
|-------|--------|--------|
| 1 | Scaffold, turret prototype, canvas, HUD shell | ✅ Done |
| 2 | Flying enemies, collisions, waves, score, combo | ✅ Done |
| 3 | Ground enemies, breach system | ✅ Done |
| 4 | Mothership boss fights | ⏳ Next |
| 5 | Credits economy (separate from score) | Pending |
| 6 | Between-level shop, weapons, upgrades | Pending |
| 7 | Polish — particles, audio hooks, balance pass | Pending |

---

## Phase history

### Phase 1 — Turret prototype
**Commit:** `162ad16` — *Initial commit: Alien Siege Phase 1 turret prototype.*

**Built:**
- Vite + React + TypeScript scaffold with modular folder structure
- `Game` orchestrator + `GameLoop` (delta time, rAF)
- `InputManager` — mouse aim, keyboard fallback (A/D, Space, Esc)
- Fixed turret at bottom center with clamped firing arc
- Machine Gun — fire rate, heat/overheat, projectile pool, trails, muzzle flash
- `BackgroundRenderer` — parallax night sky, mountains, base silhouette
- React shell: title screen, pause overlay, HUD containers
- Config: `balancing.ts`, `turretConfig.ts`
- Stub systems for future phases (Collision, Wave, Boss, Economy, Shop, Effects)

**Not yet in Phase 1:** enemies, scoring, waves, shop, boss.

---

### Phase 2 — Combat loop
**Commit:** `8068770` — *Phase 2: Add combat loop with enemies, waves, and scoring.*

**Built:**
- **3 flying enemy types** (`src/game/data/enemies.ts`):
  - Scout Saucer — fast, sine pattern, 18 HP, 100 pts
  - Drop Carrier — medium, bob pattern, 55 HP, 250 pts
  - Bomber Ship — slow, arc pattern, 90 HP, 400 pts
- `Enemy` entity with object pooling + movement patterns
- `EnemyRenderer` — distinct silhouettes per type, health bars on larger enemies
- `CollisionSystem` — circle projectile vs enemy, damage, kill handling
- `EffectsManager` + `EffectsRenderer` — hit sparks, explosions, score popups
- `EconomyManager` — score + combo multiplier (×2–×5, 2.8s decay)
- `WaveManager` — 6 timed waves in `levels.ts`, loops from wave 4
- Wave clear bonuses (150–500 pts) with on-screen popup
- HUD: live score, wave number, combo badge when ×2+
- Screen shake scaled to kill size

**Intentionally deferred:** ground enemies, breach meter fill, bombs, shop, credits earning, bosses.

---

### Phase 3 — Base defense
**Commit:** *(pending push)* — *Phase 3: Ground threats, breach system, game over.*

**Built:**
- **Drop Carriers** drop alien pods (shootable mid-air) → spawn ground enemies on landing
- **Bomber Ships** drop plasma bombs (shootable) → damage base health on impact
- **3 ground enemy types** (`src/game/data/groundEnemies.ts`):
  - Crawler — slow, steady breach pressure at base lane
  - Spitter — stops in range, damages base health + light breach
  - Leaper — fast with leap bursts, high breach burst on arrival
- `BaseDefenseSystem` — base health + breach meter, defeat detection
- `ThreatSystem` — flying drops, falling bombs/pods, ground movement, base damage
- Extended `CollisionSystem` — hit flying, ground, bombs, and pods
- `Bomb`, `DropPod`, `GroundEnemy` entities with object pooling
- Renderers: `GroundEnemyRenderer`, `ThreatRenderer` (bomb warnings, breach zone)
- HUD: live base health + breach values, danger alerts, bomb/breach warnings
- `GameOverScreen` — defeat reason, final score, waves survived, restart/title
- Lose when **breach ≥ 100** or **base health ≤ 0**

**Intentionally deferred:** shop, bosses, credits earning, shield/brute/spore pod enemies.

---

## Current state (after Phase 3)

### Playable loop
1. Title screen → Start Defense
2. Waves spawn flying enemies; carriers/bombers drop pods and bombs
3. Shoot everything — flyers, bombs, pods (before landing), ground aliens
4. Ground enemies reach base lane → breach meter rises; spitter also damages base HP
5. Bombs impact base → base health drops
6. **Game over** if breach fills or base health hits zero
7. Try Again restarts session; Esc pauses during play

### Active systems
| System | File | Role |
|--------|------|------|
| Game | `src/game/Game.ts` | Orchestrates update/render, game over |
| BaseDefenseSystem | `src/game/systems/BaseDefenseSystem.ts` | Health, breach, defeat |
| ThreatSystem | `src/game/systems/ThreatSystem.ts` | Drops, bombs, pods, ground AI |
| EntityManager | `src/game/systems/EntityManager.ts` | All entity pools |
| CollisionSystem | `src/game/systems/CollisionSystem.ts` | Multi-layer bullet hits |
| WaveManager | `src/game/systems/WaveManager.ts` | Flying wave spawns only |
| EconomyManager | `src/game/systems/EconomyManager.ts` | Score, combo |
| EffectsManager | `src/game/systems/EffectsManager.ts` | VFX + warning markers |
| Renderer | `src/game/rendering/Renderer.ts` | Full layered draw |

### React UI
| Component | Role |
|-----------|------|
| `GameHUD` | Score, health, breach, danger alerts |
| `GameOverScreen` | Defeat + restart |
| `PauseOverlay` | Resume / quit |
| `TitleScreen` | Start + how-to-play |

### Config / tuning files
| File | Tune here |
|------|-----------|
| `src/game/data/balancing.ts` | Base HP, breach, bomb damage, threat speeds |
| `src/game/data/groundEnemies.ts` | Crawler/spitter/leaper stats |
| `src/game/data/enemies.ts` | Flyer drops (interval, max drops) |
| `src/game/utils/baseLayout.ts` | Base/breach zone geometry |

### HUD fields (placeholders until later phases)
- **Credits** — always 0 (Phase 5+)
- **Level** — fixed at 1
- **Secondary cooldown** — not implemented

---

## Architecture decisions

1. **React for shell, Canvas for gameplay** — menus/HUD in DOM; all action rendered on canvas.
2. **Single `Game` class** owns session state; React receives snapshots via callbacks.
3. **Data-driven enemies and waves** — new types added in config, not scattered magic numbers.
4. **Object pooling** — projectiles, enemies, particles use `src/utils/objectPool.ts`.
5. **Delta time** — all movement/effects scaled by `dt`; loop caps max dt at 1/30s.
6. **Audio** — hook comments only (`// Audio hook: playGunFire()` etc.); no audio lib yet.
7. **No persistence** — `resetSession()` clears everything; no localStorage.

### Update order in `Game.update()` (important when extending)
```
input → turret → firing → entities.update (flyers move)
→ flying drops → waves → collision → prune projectiles
→ threats (bombs, pods, ground, base damage) → effects → economy
→ defeat check → shake decay → snapshot
```

---

## Git history

| Commit | Date | Summary |
|--------|------|---------|
| `162ad16` | 2026-06-12 | Phase 1 — scaffold + turret prototype |
| `8068770` | 2026-06-12 | Phase 2 — enemies, waves, scoring, VFX |
| `e942076` | 2026-06-12 | Project memory module + AGENTS.md |

**Convention:** One commit per phase, pushed to `origin/main` immediately after. Update this file after every phase.

---

## Phase 4 preview (next work)

- [ ] Mothership boss at end of each level
- [ ] Boss intro warning, multi-phase patterns
- [ ] Boss health bar in HUD
- [ ] Level complete flow (before shop in Phase 6)

**Do not start in Phase 4:** shop, credits spending.

---

## Session checklist (for AI agents)

When opening this repo:

- [ ] Read this file (`docs/PROJECT_MEMORY.md`)
- [ ] Check `git log -5` for commits after this doc was last updated
- [ ] Run `npm install` if needed, `npm run dev` to verify
- [ ] Confirm current phase in README matches this file
- [ ] After work: update this file, commit, push to GitHub

When finishing a phase:

- [ ] Update **Phase history** section with commit hash and bullet list
- [ ] Update **Current state** and roadmap table
- [ ] Update README status section
- [ ] `git commit` + `git push origin main`

---

## Known issues / tech debt

- Credits shown in HUD but never earned (by design until Phase 5).
- Flyers exiting screen without kill causes no penalty.
- Ground threats persist across wave transitions (intentional pressure).
- `ShopManager`, `BossManager` are still stubs.
- No brute/spore pod ground types yet.
- No tests.

---

## Contact / ownership

- **GitHub:** Goku10/Alien-siege
- **Local path:** `alien-siege/` under Cursor workspace
