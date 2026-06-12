# Alien Siege — Project Memory

> **Purpose:** Persistent project history and context for future development sessions.
> Read this file first when resuming work on this repo (human or AI agent).

**Last updated:** 2026-06-12  
**Current phase:** Phase 6 complete  
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
| 4 | Level structure, scaling waves, boss warning scaffold | ✅ Done |
| 5 | Mothership boss fight (3 phases) | ✅ Done |
| 6 | Credits economy + level-end summary | ✅ Done |
| 7 | Between-level shop + upgrades | ⏳ Next |
| 8 | Polish — particles, audio hooks, balance pass | Pending |

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
**Commit:** `e654341` — *Phase 3: Ground threats, breach system, game over.*

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

### Phase 4 — Level progression
**Commit:** `ecbdd61` — *Phase 4: Level manager, scaled waves, boss warning flow.*

**Built:**
- `LevelManager` — intro → combat → boss warning → level complete → next level
- 3 levels in `levels.ts` (4, 5, 5 waves) with intro text and level bonuses
- `levelScaling.ts` — per-level speed/health/spawn/bonus multipliers
- `WaveManager` refactor — no infinite loop; level-scoped waves with scaling
- UI: `LevelIntroOverlay`, `BossWarningScreen`, `LevelCompleteScreen`
- HUD: Level X/3, Wave Y/Z
- Wave start/complete popups; threats cleared on boss warning
- Campaign complete after Level 3

**Intentionally deferred:** actual mothership boss fight, shop.

---

### Phase 5 — Mothership boss
**Commit:** `5207bb4` — *Phase 5: Playable mothership boss fight.*

**Built:**
- `BossManager` + `Boss` entity + `bossConfig.ts`
- Mothership with entrance, hover movement, 900–1400 HP by level
- **3 phases** at 67% / 34% health with escalating attacks
- Attacks: drone release, bomb spread, charging beam, shield phase
- **2 weak-point cores** — 2× damage; body hits 0.35×; shield blocks body
- `BossRenderer` — hull, cores, shield bubble, beam telegraph
- `CollisionSystem` extended for boss hits (reuses projectiles)
- Flow: boss warning → fight → defeat → level complete + boss score bonus
- HUD boss health bar with phase + shield indicator

**Intentionally deferred:** shop, credits earning.

---

### Phase 6 — Credits economy
**Commit:** `1d04117` — *Phase 6: Credits economy separate from arcade score.*

**Built:**
- `src/game/data/credits.ts` — all credit payout tables (kills, waves, level, boss, performance bonuses)
- `EconomyManager` split: **score** (arcade + combo) vs **credits** (spendable currency)
- Credits earned from: enemy/threat kills, wave clear, boss defeat, level complete, accuracy + low-breach bonuses
- Per-level tracking: kills, shots fired/hit, credit breakdown for summary
- HUD shows live session credits (persists across levels in a run)
- `LevelCompleteScreen` → level-end **summary**: score gained, credits earned, enemies destroyed, accuracy, boss reward, performance bonuses, total credits
- Score popups remain score-only; wave/boss credit gains shown as separate popups

**Intentionally deferred:** shop, spending credits.

---

## Current state (after Phase 6)

### Playable loop
1. Title → Start Defense → Level intro (3.5s)
2. Waves spawn with level scaling; shoot flyers, bombs, pods, ground units
3. Wave clear bonus between waves; final wave → boss warning → mothership fight → level complete
4. Level complete bonus → Next Level (or Campaign Complete after L3)
5. **Game over** if breach fills or base health hits zero
6. Base health/breach persist across levels within a run

### Active systems
| System | File | Role |
|--------|------|------|
| Game | `src/game/Game.ts` | Orchestrates update/render, game over |
| BaseDefenseSystem | `src/game/systems/BaseDefenseSystem.ts` | Health, breach, defeat |
| ThreatSystem | `src/game/systems/ThreatSystem.ts` | Drops, bombs, pods, ground AI |
| EntityManager | `src/game/systems/EntityManager.ts` | All entity pools |
| CollisionSystem | `src/game/systems/CollisionSystem.ts` | Multi-layer bullet hits |
| LevelManager | `src/game/systems/LevelManager.ts` | intro → combat → bossWarning → bossFight → complete |
| BossManager | `src/game/systems/BossManager.ts` | Mothership phases, attacks, defeat |
| WaveManager | `src/game/systems/WaveManager.ts` | Per-level timed wave spawns |
| EconomyManager | `src/game/systems/EconomyManager.ts` | Score, combo, credits, level summary |
| EffectsManager | `src/game/systems/EffectsManager.ts` | VFX + warning markers |
| Renderer | `src/game/rendering/Renderer.ts` | Full layered draw |

### React UI
| Component | Role |
|-----------|------|
| `GameHUD` | Score, credits, health, breach, danger alerts |
| `LevelCompleteScreen` | Level-end score + credits summary |
| `GameOverScreen` | Defeat + restart |
| `PauseOverlay` | Resume / quit |
| `TitleScreen` | Start + how-to-play |

### Config / tuning files
| File | Tune here |
|------|-----------|
| `src/game/data/balancing.ts` | Base HP, breach, bomb damage, threat speeds |
| `src/game/data/credits.ts` | Credit rewards — kills, waves, level, boss, bonuses |
| `src/game/data/groundEnemies.ts` | Crawler/spitter/leaper stats |
| `src/game/data/enemies.ts` | Flyer drops (interval, max drops) |
| `src/game/utils/baseLayout.ts` | Base/breach zone geometry |

### HUD fields (placeholders until later phases)
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
levelManager.update → (if not combat: early return)
input → turret → firing → entities.update → flying drops
→ waves → collision → threats → effects → economy → defeat check → snapshot
```

---

## Git history

| Commit | Date | Summary |
|--------|------|---------|
| `162ad16` | 2026-06-12 | Phase 1 — scaffold + turret prototype |
| `8068770` | 2026-06-12 | Phase 2 — enemies, waves, scoring, VFX |
| `e942076` | 2026-06-12 | Project memory module + AGENTS.md |
| `2e6a144` | 2026-06-12 | Memory doc git log update |
| `e654341` | 2026-06-12 | Phase 3 — ground threats, breach, game over |
| `ecbdd61` | 2026-06-12 | Phase 4 — level manager, scaled waves, boss warning |
| `5207bb4` | 2026-06-12 | Phase 5 — mothership boss fight |
| `1d04117` | 2026-06-12 | Phase 6 — credits economy + level summary |

**Convention:** One commit per phase, pushed to `origin/main` immediately after. Update this file after every phase.

---

## Phase 7 preview (next work)

- [ ] Between-level shop screen
- [ ] Purchasable weapons and upgrades
- [ ] Spend credits earned in Phase 6

**Config:** `src/game/data/credits.ts` for earn rates; `shopItems.ts` for prices.

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

- Flyers exiting screen without kill causes no penalty.
- Ground threats persist across wave transitions (intentional pressure).
- `ShopManager` is still a stub.
- No brute/spore pod ground types yet.
- No tests.

---

## Contact / ownership

- **GitHub:** Goku10/Alien-siege
- **Local path:** `alien-siege/` under Cursor workspace
