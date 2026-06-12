# Alien Siege — Project Memory

> **Purpose:** Persistent project history and context for future development sessions.
> Read this file first when resuming work on this repo (human or AI agent).

**Last updated:** 2026-06-12 (session closed — MVP complete)  
**Current phase:** Phase 12 complete (MVP)  
**Latest commit:** `848df14` on `main`  
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
| 7 | Between-level shop + upgrades | ✅ Done |
| 8 | Multi-weapon arsenal (5 weapon types) | ✅ Done |
| 9 | Tiered upgrade system (weapon/defense/special) | ✅ Done |
| 10 | Enemy variety, wave composition, level scaling | ✅ Done |
| 11 | Polish — HUD, VFX feedback, screen UX | ✅ Done |
| 12 | MVP stabilization — refactor, bugs, docs | ✅ Done |

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

### Phase 7 — Between-level shop
**Commit:** `8316102` — *Phase 7: Between-level armory shop for credits.*

**Built:**
- `ShopManager` — buy, equip, owned/equipped state, loadout stat resolution
- `shopItems.ts` — 12 data-driven items across 4 categories (weapons, weapon upgrades, defense, special)
- `weapons.ts` — Machine Gun, Plasma Rifle, Scatter Cannon catalogs
- `ShopScreen` — credits display, categorized cards, button states (buy / equip / owned / equipped / unaffordable)
- Flow: **level complete → summary → shop → next level** (shop skipped on campaign complete)
- Purchases wired to gameplay: weapon stats, max health, bomb reduction, breach slowdown, combo decay, credit multiplier, between-level heal
- `Turret` + `Projectile` + `EconomyManager` read effective loadout from shop

---

### Phase 8 — Multi-weapon arsenal
**Commit:** `f320e2b` — *Phase 8: Five distinct weapon types with unique mechanics.*

**Built:**
- `weapons.ts` — Machine Gun, Laser Cannon, Missile Launcher, Flak Cannon, Plasma Blaster
- Mechanics: pierce beams, missile airburst splash, flak pellet spread, plasma splash blobs, heat vs reload gating
- `CollisionSystem` splash + pierce; boss-compatible direct and splash hits
- HUD equipped weapon name, kind tag, ammo/reload or heat bar
- Shop weapon entries updated for all five types

---

### Phase 9 — Tiered upgrades
**Commit:** `c1217ed` — *Phase 9: Tiered upgrade system with stat previews.*

**Built:**
- `upgradeEffects.ts` — effect schema (damage, fire rate, cooling, reload, splash, health, breach, shield, cooldown)
- `LoadoutResolver` — central stat aggregation from owned upgrades
- `shopItems.ts` — 3-tier chains for damage/fire/cooling/health/breach/shield; 2-tier for reload/splash/shock/combo/repair/cooldown
- Tier gating via `requires` + duplicate prevention per tier id
- `ShopStatPreview` — before → after comparison in shop cards
- Defense HP/shield applies immediately on purchase; field repair applies on next deploy

---

### Phase 10 — Enemy variety & scaling
**Commit:** `dc9a092` — *Phase 10: Enemy variety, data-driven waves, and level scaling.*

**Built:**
- **3 new flying types** (`enemies.ts`):
  - Shielded Transport — front shield absorbs damage before hull; no drops
  - Drone Swarm Pod — fast hex pod; rapid pod drops (level 2+)
  - Elite Bio-Pod — drops Brood Guard ground units (level 3)
- **1 new ground type:** Brood Guard — tanky, high breach pressure
- `waveCompositions.ts` — blueprint-driven waves per level (11 compositions, distinct L1/L2/L3 profiles)
- `levelScaling.ts` — speed/health/drop interval/max drops/ground stats scale by level
- Shield damage pipeline in `damageEnemy()`; per-instance `dropInterval` / `maxDrops` on `EnemyState`
- `ThreatSystem.setLevelContext()` — level-weighted pod payloads + scaled ground spawns
- Renderers for new silhouettes; dual shield + hull health bars on shielded units
- Credit rewards for all new enemy types

**Intentionally deferred:** audio, extra particle polish, save/load.

---

### Phase 11 — Presentation polish
**Commit:** `5040149` — *Phase 11: HUD polish, VFX feedback, and screen UX.*

**Built:**
- HUD readability: vignettes for low health / breach danger, pulsing danger bars, combo tier highlight
- Kill feedback: score + credits + combo popups, color-coded variants, larger explosions on heavy kills
- Heavy-hit screen shake on high-HP enemies; boss phase screen flash + shake
- Weapon-colored muzzle flashes; tapered projectile trails; improved bomb/breach warning pulses (game-time synced)
- Pause overlay polish; expanded game-over stats; shop purchase/equip toast
- Title screen how-to-play: controls, objectives, progression (3-column grid)

**Intentionally deferred:** audio implementation, save/load.

---

### Phase 12 — MVP stabilization
**Commit:** `332b693` — *Phase 12: Refactor, bug fixes, and MVP documentation.*

**Built:**
- Unified `FlyerSpawnModifiers` / `spawnModifiers.ts`; `killResolver.ts` deduplicates kill feedback
- `BaseDefenseSystem` shield pool (shop shield upgrades work correctly)
- Entity pool releases in `clear()` / `clearThreats()`; level transition cleanup
- `startNewRun()` session API; pause during intro/boss warning; `resumeGame` uses `togglePause`
- Splash kills award rewards for bombs/pods; boss defeat popup deduplicated
- Final-level shop before campaign complete; game-over restart clarity
- Expanded `balancing.ts` (combat, ui, fire shake); README architecture guide

---

## Current state (after Phase 12 — MVP)

### Playable loop
1. Title → Start Defense → Level intro (3.5s)
2. Waves spawn with level scaling; shoot flyers, bombs, pods, ground units
3. Wave clear bonus between waves; final wave → boss warning → mothership fight → level complete
4. Level complete → summary → shop → next level (or Campaign Complete after L3)
5. **Game over** if breach fills or base health + shields hit zero
6. Base health, shields, and breach persist across levels within a run
7. Shop purchases persist for the full run; **restart / quit to title** resets everything

### Active systems
| System | File | Role |
|--------|------|------|
| Game | `src/game/Game.ts` | Orchestrates update/render, game over |
| BaseDefenseSystem | `src/game/systems/BaseDefenseSystem.ts` | Health, shield pool, breach, defeat |
| killResolver | `src/game/systems/killResolver.ts` | Shared kill feedback + splash damage |
| ThreatSystem | `src/game/systems/ThreatSystem.ts` | Drops, bombs, pods, ground AI |
| EntityManager | `src/game/systems/EntityManager.ts` | All entity pools |
| CollisionSystem | `src/game/systems/CollisionSystem.ts` | Multi-layer bullet hits |
| LevelManager | `src/game/systems/LevelManager.ts` | intro → combat → bossWarning → bossFight → complete |
| BossManager | `src/game/systems/BossManager.ts` | Mothership phases, attacks, defeat |
| WaveManager | `src/game/systems/WaveManager.ts` | Per-level timed wave spawns |
| EconomyManager | `src/game/systems/EconomyManager.ts` | Score, combo, credits, level summary |
| ShopManager | `src/game/systems/ShopManager.ts` | Buy/equip, loadout bonuses |
| EffectsManager | `src/game/systems/EffectsManager.ts` | VFX + warning markers |
| Renderer | `src/game/rendering/Renderer.ts` | Full layered draw |

### React UI
| Component | Role |
|-----------|------|
| `GameHUD` | Score, credits, health, breach, danger alerts |
| `LevelCompleteScreen` | Level-end score + credits summary |
| `ShopScreen` | Between-level armory (buy / equip) |
| `GameOverScreen` | Defeat + restart |
| `PauseOverlay` | Resume / quit |
| `TitleScreen` | Start + how-to-play |

### Config / tuning files
| File | Tune here |
|------|-----------|
| `src/game/data/balancing.ts` | Base HP, combo, combat, shake, UI popup positions |
| `src/game/data/spawnModifiers.ts` | Level scaling → spawn modifier helpers |
| `src/game/data/bossConfig.ts` | Mothership boss phases and attacks |
| `src/game/data/credits.ts` | Credit rewards — kills, waves, level, boss, bonuses |
| `src/game/data/shopItems.ts` | Shop catalog — costs, effects, categories |
| `src/game/data/weapons.ts` | Weapon stat definitions |
| `src/game/data/waveCompositions.ts` | Per-level wave blueprints and enemy mix |
| `src/game/data/levelScaling.ts` | Per-level spawn stat multipliers |
| `src/game/data/groundEnemies.ts` | Ground stats + pod payload weights |
| `src/game/data/enemies.ts` | Flyer stats, shields, drops, pod payloads |
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
| `8316102` | 2026-06-12 | Phase 7 — between-level armory shop |
| `f320e2b` | 2026-06-12 | Phase 8 — multi-weapon arsenal |
| `c1217ed` | 2026-06-12 | Phase 9 — tiered upgrade system |
| `dc9a092` | 2026-06-12 | Phase 10 — enemy variety, wave composition, scaling |
| `a0b277c` | 2026-06-12 | Project memory update for Phase 10 |
| `5040149` | 2026-06-12 | Phase 11 — presentation polish |
| `6ac30b9` | 2026-06-12 | Project memory update for Phase 11 |
| `332b693` | 2026-06-12 | Phase 12 — MVP stabilization |
| `848df14` | 2026-06-12 | Project memory update for Phase 12 |

**Convention:** One commit per phase, pushed to `origin/main` immediately after. Update this file after every phase.

### Session note (2026-06-12)

Phases 10–12 completed in one day: enemy variety + scaling, presentation polish, then MVP stabilization. Game is playable end-to-end on `main`. Next session should pick from **Post-MVP ideas** below.

---

## Post-MVP ideas

- [ ] Audio hooks wired to a sound library
- [ ] Save/load (localStorage)
- [ ] Additional levels or endless mode
- [ ] Balance pass on wave compositions and shop economy

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
- Secondary weapon / cooldown HUD fields are placeholders (not implemented).
- No audio library wired yet (hook comments only).
- No save/load — in-memory session only.
- No automated tests.

---

## Contact / ownership

- **GitHub:** Goku10/Alien-siege
- **Local path:** `alien-siege/` under Cursor workspace
