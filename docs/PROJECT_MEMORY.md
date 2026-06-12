# Alien Siege — Project Memory

> **Purpose:** Persistent project history and context for future development sessions.
> Read this file first when resuming work on this repo (human or AI agent).

**Last updated:** 2026-06-12  
**Current phase:** Phase 2 complete  
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
| 3 | Ground enemies, breach system | ⏳ Next |
| 4 | Mothership boss fights | Pending |
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

## Current state (after Phase 2)

### Playable loop
1. Title screen → Start Defense
2. 1s delay → Wave 1 spawns scouts from left/right
3. Player shoots enemies; score + combo increase on kills
4. Wave clears when all spawned enemies destroyed or exited → bonus points → 2.5s → next wave
5. After wave 6, loops back to wave 4 composition
6. Esc pauses; quit returns to title (full session reset)

### Active systems
| System | File | Role |
|--------|------|------|
| Game | `src/game/Game.ts` | Orchestrates update/render, wires all managers |
| GameLoop | `src/game/systems/GameLoop.ts` | rAF loop, pause, dt cap |
| InputManager | `src/game/systems/InputManager.ts` | Mouse + keyboard state |
| EntityManager | `src/game/systems/EntityManager.ts` | Projectiles, enemies, muzzle flashes |
| CollisionSystem | `src/game/systems/CollisionSystem.ts` | Bullet hits |
| WaveManager | `src/game/systems/WaveManager.ts` | Timed spawns, wave progression |
| EconomyManager | `src/game/systems/EconomyManager.ts` | Score, combo |
| EffectsManager | `src/game/systems/EffectsManager.ts` | Particles, explosions, popups |
| Renderer | `src/game/rendering/Renderer.ts` | Layered canvas draw |

### React UI
| Component | Role |
|-----------|------|
| `GameShell` / `GameCanvas` | Canvas + overlay stack |
| `TitleScreen` | Start + how-to-play |
| `GameHUD` | Score, credits (0), level, wave, combo, bars |
| `PauseOverlay` | Resume / quit |
| `useGameCanvas` | Bridges Game ↔ React state |

### Config / tuning files
| File | Tune here |
|------|-----------|
| `src/game/data/balancing.ts` | Canvas, base stats, combo, wave timing, screen shake |
| `src/game/data/turretConfig.ts` | Turret rotation, Machine Gun stats |
| `src/game/data/enemies.ts` | Enemy HP, speed, patterns, score, colors |
| `src/game/data/levels.ts` | Wave spawn schedules (delays, sides, types) |

### HUD fields (some placeholders until later phases)
- **Score** — live from EconomyManager
- **Credits** — always 0 (Phase 5+)
- **Breach** — bar shown, never increases (Phase 3)
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
input → turret → firing → waves → collision → prune projectiles
→ entities.update → effects.update → economy.update → shake decay → snapshot
```

---

## Git history

| Commit | Date | Summary |
|--------|------|---------|
| `162ad16` | 2026-06-12 | Phase 1 — scaffold + turret prototype |
| `8068770` | 2026-06-12 | Phase 2 — enemies, waves, scoring, VFX |

**Convention:** One commit per phase, pushed to `origin/main` immediately after.

---

## Phase 3 preview (next work)

When implementing Phase 3, expect to add:

- [ ] Ground enemy types (crawler, spitter, brute, leaper, spore pod)
- [ ] Drop Carrier / Bomber actually dropping payloads
- [ ] Breach meter increases when ground enemies land / reach base zone
- [ ] Base health damage from bombs and ranged ground units
- [ ] Shoot ground targets before they breach
- [ ] Game over when base HP = 0 or breach meter full
- [ ] `CollisionSystem` extended for ground layer
- [ ] New renderers for ground entities and falling bombs/pods

**Do not start in Phase 3:** shop, boss fights, credits spending.

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
- Breach bar is visual-only until Phase 3.
- Enemies that fly off-screen exit without penalty.
- Bomber/Carrier drop behavior is visual-only (no payloads yet).
- `ShopManager`, `BossManager` are still stubs.
- No game over screen yet.
- No tests.

---

## Contact / ownership

- **GitHub:** Goku10/Alien-siege
- **Local path:** `alien-siege/` under Cursor workspace
