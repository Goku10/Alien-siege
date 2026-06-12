import { BALANCING } from '../data/balancing';
import { getPhaseConfig, MOTHERSHIP_BOSS } from '../data/bossConfig';
import { NEUTRAL_FLYER_MODIFIERS } from '../data/spawnModifiers';
import { createBoss, damageBoss } from '../entities/Boss';
import { getBaseLayout } from '../utils/baseLayout';
import type { BossState } from '../types';
import type { BaseDefenseSystem } from './BaseDefenseSystem';
import type { EffectsManager } from './EffectsManager';
import type { EntityManager } from './EntityManager';

export interface BossCallbacks {
  onDefeated?: (scoreBonus: number) => void;
  onPhaseChange?: (phase: 1 | 2 | 3) => void;
  onScreenShake?: (amount: number) => void;
}

export class BossManager {
  boss: BossState | null = null;
  private callbacks: BossCallbacks;
  private lastPhase: 1 | 2 | 3 = 1;

  constructor(callbacks: BossCallbacks = {}) {
    this.callbacks = callbacks;
  }

  reset(): void {
    this.boss = null;
    this.lastPhase = 1;
  }

  isActive(): boolean {
    return this.boss !== null && this.boss.active && !this.boss.defeated;
  }

  spawn(levelId: number, canvasW: number): BossState {
    this.boss = createBoss(levelId, canvasW);
    this.lastPhase = 1;
    return this.boss;
  }

  update(
    dt: number,
    entities: EntityManager,
    base: BaseDefenseSystem,
    effects: EffectsManager,
    canvasW: number,
    canvasH: number,
  ): void {
    const boss = this.boss;
    if (!boss || !boss.active || boss.defeated) return;

    if (boss.enterProgress < 1) {
      boss.enterProgress = Math.min(1, boss.enterProgress + dt * 0.55);
      boss.y = -120 + (MOTHERSHIP_BOSS.enterY + 120) * boss.enterProgress;
      return;
    }

    boss.movePhase += dt;
    boss.x = boss.baseX + Math.sin(boss.movePhase * 0.7) * MOTHERSHIP_BOSS.moveAmplitude * 0.5;

    if (boss.flashTimer > 0) boss.flashTimer -= dt;
    for (const wp of boss.weakPoints) {
      if (wp.flashTimer > 0) wp.flashTimer -= dt;
    }

    if (boss.phase !== this.lastPhase) {
      this.lastPhase = boss.phase;
      this.callbacks.onPhaseChange?.(boss.phase);
      effects.spawnScreenFlash('#ff4466', 0.32);
      effects.spawnScorePopup(boss.x, boss.y + 40, `PHASE ${boss.phase}`, 'phase');
      this.callbacks.onScreenShake?.(7);
    }

    if (boss.shieldActive) {
      boss.shieldTimer -= dt;
      if (boss.shieldTimer <= 0) boss.shieldActive = false;
    }

    this.updateBeam(dt, boss, base, effects, canvasW, canvasH);

    boss.attackTimer -= dt;
    if (boss.attackTimer <= 0 && !boss.beam.active) {
      this.executeAttack(boss, entities, effects, canvasW);
      const phaseCfg = getPhaseConfig(boss.phase);
      boss.attackTimer = phaseCfg.attackInterval;
    }

    if (boss.health <= 0 && !boss.defeated) {
      boss.defeated = true;
      boss.active = false;
      effects.spawnExplosion(boss.x, boss.y, MOTHERSHIP_BOSS.bodyRadius * 2, '#ff6b35');
      effects.spawnExplosion(boss.x - 40, boss.y, 50, '#a78bfa');
      effects.spawnExplosion(boss.x + 40, boss.y, 50, '#00e5c0');
      this.callbacks.onScreenShake?.(MOTHERSHIP_BOSS.shakeOnDefeat);
      const bonus = Math.floor(MOTHERSHIP_BOSS.defeatScore * (1 + boss.levelId * 0.15));
      this.callbacks.onDefeated?.(bonus);
    }
  }

  private updateBeam(
    dt: number,
    boss: BossState,
    base: BaseDefenseSystem,
    effects: EffectsManager,
    canvasW: number,
    canvasH: number,
  ): void {
    const beam = boss.beam;
    if (!beam.active) return;

    beam.chargeTime += dt;
    const layout = getBaseLayout(canvasW, canvasH);

    if (beam.chargeTime >= beam.maxCharge) {
      const hitBase = Math.abs(layout.centerX - beam.targetX) < beam.width * 2.5;
      if (hitBase) {
        base.applyBaseDamage(beam.damage);
        effects.spawnBaseHitEffect(layout.centerX, layout.baseY);
        this.callbacks.onScreenShake?.(10);
      }
      effects.spawnExplosion(beam.targetX, layout.groundY - 20, 40, '#ff4466');
      beam.active = false;
      beam.chargeTime = 0;
    }
  }

  private executeAttack(
    boss: BossState,
    entities: EntityManager,
    effects: EffectsManager,
    canvasW: number,
  ): void {
    const phaseCfg = getPhaseConfig(boss.phase);
    const attack = phaseCfg.attacks[boss.attackIndex % phaseCfg.attacks.length];
    boss.attackIndex += 1;

    switch (attack) {
      case 'drones':
        this.releaseDrones(boss, entities, phaseCfg.droneCount);
        break;
      case 'bombSpread':
        this.bombSpread(boss, entities, phaseCfg.bombCount);
        break;
      case 'beam':
        this.startBeam(boss, canvasW, phaseCfg.beamDamage);
        break;
      case 'shield':
        boss.shieldActive = true;
        boss.shieldTimer = phaseCfg.shieldDuration;
        effects.spawnScorePopup(boss.x, boss.y - 30, 'SHIELDS UP', 'announce');
        break;
      default:
        break;
    }
  }

  private releaseDrones(boss: BossState, entities: EntityManager, count: number): void {
    const w = BALANCING.canvas.width;
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? 'left' : 'right';
      const y = boss.y + 30 + i * 12;
      const enemy = entities.spawnEnemy('scout_saucer', side, w, y, {
        ...NEUTRAL_FLYER_MODIFIERS,
        speedMultiplier: 1.1 + boss.phase * 0.08,
      });
      enemy.x = boss.x + (i - count / 2) * 30;
    }
  }

  private bombSpread(boss: BossState, entities: EntityManager, count: number): void {
    const spread = 120;
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const x = boss.x - spread / 2 + spread * t;
      entities.spawnBomb(x, boss.y + MOTHERSHIP_BOSS.bodyRadius * 0.6);
    }
  }

  private startBeam(boss: BossState, canvasW: number, damage: number): void {
    boss.beam.active = true;
    boss.beam.chargeTime = 0;
    boss.beam.damage = damage;
    boss.beam.targetX = canvasW / 2 + (Math.random() - 0.5) * 80;
    boss.beam.maxCharge = 1.5 - boss.phase * 0.1;
  }

  applyProjectileHit(
    boss: BossState,
    projX: number,
    projY: number,
    projRadius: number,
    damage: number,
    effects: EffectsManager,
    onShake?: (n: number) => void,
  ): { hit: boolean; damageDealt: number } {
    if (!boss.active || boss.defeated || boss.enterProgress < 1) {
      return { hit: false, damageDealt: 0 };
    }

    for (const wp of boss.weakPoints) {
      if (wp.destroyed) continue;
      const pos = { x: boss.x + wp.offsetX, y: boss.y + wp.offsetY };
      const dx = projX - pos.x;
      const dy = projY - pos.y;
      const r = projRadius + wp.radius;
      if (dx * dx + dy * dy <= r * r) {
        const dealt = damage * MOTHERSHIP_BOSS.weakPointDamageMultiplier;
        damageBoss(boss, dealt);
        wp.flashTimer = 0.1;
        effects.spawnHitSparks(projX, projY, 'bomber_ship');
        onShake?.(MOTHERSHIP_BOSS.shakeOnHit);
        return { hit: true, damageDealt: dealt };
      }
    }

    if (!boss.shieldActive) {
      const dx = projX - boss.x;
      const dy = projY - boss.y;
      const r = projRadius + MOTHERSHIP_BOSS.bodyRadius * 0.75;
      if (dx * dx + dy * dy <= r * r) {
        const dealt = damage * MOTHERSHIP_BOSS.bodyDamageMultiplier;
        damageBoss(boss, dealt);
        effects.spawnHitSparks(projX, projY, 'drop_carrier');
        onShake?.(MOTHERSHIP_BOSS.shakeOnHit * 0.7);
        return { hit: true, damageDealt: dealt };
      }
    } else {
      const dx = projX - boss.x;
      const dy = projY - boss.y;
      const r = projRadius + MOTHERSHIP_BOSS.bodyRadius;
      if (dx * dx + dy * dy <= r * r) {
        effects.spawnHitSparks(projX, projY, 'scout_saucer');
        return { hit: true, damageDealt: 0 };
      }
    }

    return { hit: false, damageDealt: 0 };
  }
}
