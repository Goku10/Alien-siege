import { ENEMY_DEFINITIONS } from '../data/enemies';
import { pickPodPayload } from '../data/groundEnemies';
import { canEnemyDrop, tickEnemyDrop } from '../entities/Enemy';
import type { EntityManager } from './EntityManager';
import type { BaseDefenseSystem } from './BaseDefenseSystem';
import type { EffectsManager } from './EffectsManager';
import { getBaseLayout } from '../utils/baseLayout';
import type { EnemyState } from '../types';

export class ThreatSystem {
  bombWarningActive = false;

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
        entities.spawnDropPod(enemy.x, enemy.y + enemy.radius, pickPodPayload());
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
        base.applyBombDamage(b.damage);
        effects.spawnExplosion(b.x, layout.groundY, b.radius * 2.5, '#ff6b35');
        effects.addBombImpactMarker(b.x, layout.groundY);
        onShake(8);
        entities.releaseBomb(b);
        return false;
      }
      if (b.y > layout.groundY - 140) this.bombWarningActive = true;
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
      entities.spawnGroundEnemy(pod.payload, pod.x, layout.walkY, boundsW, boundsH);
      effects.spawnExplosion(pod.x, pod.y, pod.radius, '#52b788');
      pod.active = false;
    }

    entities.groundEnemies = entities.groundEnemies.filter((g) => {
      if (!g.active || g.health <= 0) {
        if (g.active) entities.releaseGroundEnemy(g);
        return false;
      }
      const result = entities.updateGroundEntity(g, dt, layout);
      if (result.breachBurst > 0) base.addBreach(result.breachBurst);
      if (result.breachDelta > 0) base.addBreach(result.breachDelta);
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
}
