import { BALANCING } from '../data/balancing';
import { ENEMY_DEFINITIONS, getPodPayloadForEnemy } from '../data/enemies';
import { pickPodPayload } from '../data/groundEnemies';
import type { LevelScaling } from '../data/levelScaling';
import { canEnemyDrop, tickEnemyDrop } from '../entities/Enemy';
import type { GroundSpawnModifiers } from '../entities/GroundEnemy';
import type { EntityManager } from './EntityManager';
import type { BaseDefenseSystem } from './BaseDefenseSystem';
import type { EffectsManager } from './EffectsManager';
import { getBaseLayout } from '../utils/baseLayout';
import type { EnemyState } from '../types';

export class ThreatSystem {
  bombWarningActive = false;
  private bombDamageReduction = 0;
  private breachRateMultiplier = 1;
  private levelId = 1;
  private groundMods: GroundSpawnModifiers = {
    speedMultiplier: 1,
    healthMultiplier: 1,
  };

  setDefenseModifiers(bombDamageReduction: number, breachRateMultiplier: number): void {
    this.bombDamageReduction = Math.max(0, Math.min(0.9, bombDamageReduction));
    this.breachRateMultiplier = Math.max(0.1, breachRateMultiplier);
  }

  setLevelContext(levelId: number, scaling: LevelScaling): void {
    this.levelId = levelId;
    this.groundMods = {
      speedMultiplier: scaling.groundSpeedMultiplier,
      healthMultiplier: scaling.groundHealthMultiplier,
    };
  }

  private resolvePodPayload(enemy: EnemyState) {
    return getPodPayloadForEnemy(enemy.typeId) ?? pickPodPayload(this.levelId);
  }

  updateFlyingDrops(
    enemies: EnemyState[],
    entities: EntityManager,
    boundsW: number,
    _boundsH: number,
    dt: number,
    effects: EffectsManager,
  ): void {
    for (const enemy of enemies) {
      if (!enemy.active || enemy.health <= 0) continue;
      if (!canEnemyDrop(enemy, boundsW)) continue;
      if (!tickEnemyDrop(enemy, dt)) continue;

      const def = ENEMY_DEFINITIONS[enemy.typeId];
      if (def.dropKind === 'bomb') {
        entities.spawnBomb(enemy.x, enemy.y + enemy.radius);
        effects.spawnDropIndicator(enemy.x, enemy.y + enemy.radius, 'bomb');
      } else if (def.dropKind === 'pod') {
        entities.spawnDropPod(
          enemy.x,
          enemy.y + enemy.radius,
          this.resolvePodPayload(enemy),
        );
        effects.spawnDropIndicator(enemy.x, enemy.y + enemy.radius, 'pod');
      }
    }
  }

  updateThreats(
    entities: EntityManager,
    base: BaseDefenseSystem,
    effects: EffectsManager,
    boundsW: number,
    boundsH: number,
    dt: number,
    onShake: (n: number) => void,
  ): void {
    const layout = getBaseLayout(boundsW, boundsH);
    this.bombWarningActive = false;

    entities.bombs = entities.bombs.filter((b) => {
      if (!b.active) return false;
      const state = entities.updateBombEntity(b, dt, layout.groundY);
      if (state === 'impact') {
        base.applyBombDamage(b.damage, this.bombDamageReduction);
        effects.spawnExplosion(b.x, layout.groundY, b.radius * 2.5, '#ff6b35');
        effects.addBombImpactMarker(b.x, layout.groundY);
        onShake(8);
        entities.releaseBomb(b);
        return false;
      }
      if (b.y > layout.groundY - 150) this.bombWarningActive = true;
      return state === 'falling';
    });

    const landedPods: typeof entities.dropPods = [];
    entities.dropPods = entities.dropPods.filter((p) => {
      if (!p.active) return false;
      const state = entities.updateDropPodEntity(p, dt, layout.groundY);
      if (state === 'landed') {
        landedPods.push(p);
        return false;
      }
      return state === 'falling';
    });

    for (const pod of landedPods) {
      entities.spawnGroundEnemy(
        pod.payload,
        pod.x,
        layout.walkY,
        boundsW,
        boundsH,
        this.groundMods,
      );
      effects.spawnExplosion(pod.x, pod.y, pod.radius, '#52b788');
      pod.active = false;
    }

    entities.groundEnemies = entities.groundEnemies.filter((g) => {
      if (!g.active || g.health <= 0) {
        if (g.active) entities.releaseGroundEnemy(g);
        return false;
      }
      const result = entities.updateGroundEntity(g, dt, layout);
      const breachAmount = (result.breachDelta + result.breachBurst) * this.breachRateMultiplier;
      this.applyGroundBreach(g, breachAmount, base);
      if (result.baseDamage > 0) {
        base.applyBaseDamage(result.baseDamage);
        effects.spawnBaseHitEffect(layout.centerX, layout.baseY + layout.baseH * 0.3);
      }
      if (g.health <= 0) {
        entities.releaseGroundEnemy(g);
        return false;
      }
      return true;
    });
  }

  private applyGroundBreach(
    g: { breachContributed: number },
    amount: number,
    base: BaseDefenseSystem,
  ): void {
    if (amount <= 0) return;

    const perEnemyCap =
      base.maxBreach / BALANCING.base.groundUnitsRequiredForFullBreach;
    const room = perEnemyCap - g.breachContributed;
    if (room <= 0) return;

    const applied = Math.min(amount, room);
    g.breachContributed += applied;
    base.addBreach(applied);
  }
}
