import { bombPool, spawnBomb, updateBomb } from '../entities/Bomb';
import { dropPodPool, spawnDropPod, updateDropPod } from '../entities/DropPod';
import {
  applyGroundModifiers,
  groundEnemyPool,
  spawnGroundEnemy,
  updateGroundEnemy,
} from '../entities/GroundEnemy';
import { applyEnemyModifiers, enemyPool, spawnEnemy, updateEnemy } from '../entities/Enemy';
import type { WeaponStats } from '../data/weapons';
import { projectilePool, spawnWeaponProjectiles, updateProjectile } from '../entities/Projectile';
import { getBaseLayout } from '../utils/baseLayout';
import type {
  BombState,
  DropPodState,
  EnemyState,
  EnemyTypeId,
  FlyerSpawnModifiers,
  GroundEnemyState,
  GroundEnemyTypeId,
  GroundSpawnModifiers,
  MuzzleFlash,
  ProjectileState,
  SpawnSide,
  SplashBurst,
} from '../types';

export class EntityManager {
  private weaponStats!: WeaponStats;
  private pendingSplashBursts: SplashBurst[] = [];
  projectiles: ProjectileState[] = [];
  enemies: EnemyState[] = [];
  bombs: BombState[] = [];
  dropPods: DropPodState[] = [];
  groundEnemies: GroundEnemyState[] = [];
  muzzleFlashes: MuzzleFlash[] = [];

  clear(): void {
    this.releaseAllProjectiles();
    this.releaseAllEnemies();
    this.releaseAllBombs();
    this.releaseAllDropPods();
    this.releaseAllGroundEnemies();
    this.muzzleFlashes.length = 0;
    this.pendingSplashBursts = [];
  }

  /** Remove combat entities between levels; releases pooled objects. */
  clearThreats(): void {
    this.releaseAllProjectiles();
    this.releaseAllEnemies();
    this.releaseAllBombs();
    this.releaseAllDropPods();
    this.releaseAllGroundEnemies();
    this.muzzleFlashes.length = 0;
    this.pendingSplashBursts = [];
  }

  setWeaponStats(stats: WeaponStats): void {
    this.weaponStats = stats;
  }

  spawnWeaponFire(x: number, y: number, angle: number): number {
    const shots = spawnWeaponProjectiles(x, y, angle, this.weaponStats);
    this.projectiles.push(...shots);
    return shots.length;
  }

  drainSplashBursts(): SplashBurst[] {
    const bursts = this.pendingSplashBursts;
    this.pendingSplashBursts = [];
    return bursts;
  }

  spawnEnemy(
    typeId: EnemyTypeId,
    side: SpawnSide,
    boundsW: number,
    y?: number,
    modifiers?: FlyerSpawnModifiers,
  ): EnemyState {
    const enemy = spawnEnemy(typeId, side, boundsW, y);
    if (modifiers) applyEnemyModifiers(enemy, modifiers);
    this.enemies.push(enemy);
    return enemy;
  }

  spawnBomb(x: number, y: number): BombState {
    const bomb = spawnBomb(x, y);
    this.bombs.push(bomb);
    return bomb;
  }

  spawnDropPod(x: number, y: number, payload: GroundEnemyTypeId): DropPodState {
    const pod = spawnDropPod(x, y, payload);
    this.dropPods.push(pod);
    return pod;
  }

  spawnGroundEnemy(
    typeId: GroundEnemyTypeId,
    x: number,
    y: number,
    boundsW: number,
    boundsH: number,
    modifiers?: GroundSpawnModifiers,
  ): GroundEnemyState {
    const layout = getBaseLayout(boundsW, boundsH);
    const g = spawnGroundEnemy(typeId, x, y, layout);
    if (modifiers) applyGroundModifiers(g, modifiers);
    this.groundEnemies.push(g);
    return g;
  }

  addMuzzleFlash(flash: MuzzleFlash): void {
    this.muzzleFlashes.push(flash);
  }

  getAliveFlyingCount(): number {
    return this.enemies.filter((e) => e.active && e.health > 0).length;
  }

  getGroundThreatCount(): number {
    return (
      this.groundEnemies.filter((g) => g.active && g.health > 0).length +
      this.bombs.filter((b) => b.active).length +
      this.dropPods.filter((p) => p.active).length
    );
  }

  updateBombEntity(b: BombState, dt: number, groundY: number): 'falling' | 'impact' | 'dead' {
    return updateBomb(b, dt, groundY);
  }

  updateDropPodEntity(p: DropPodState, dt: number, groundY: number): 'falling' | 'landed' | 'dead' {
    return updateDropPod(p, dt, groundY);
  }

  updateGroundEntity(
    g: GroundEnemyState,
    dt: number,
    layout: ReturnType<typeof getBaseLayout>,
  ) {
    return updateGroundEnemy(g, dt, layout);
  }

  update(dt: number, boundsW: number, boundsH: number): void {
    this.pendingSplashBursts = [];
    this.projectiles = this.projectiles.filter((p) => {
      if (!p.active) return false;
      const airburst =
        p.kind === 'missile' && p.splashRadius > 0
          ? {
              x: p.x,
              y: p.y,
              damage: p.damage,
              radius: p.splashRadius,
              kind: p.kind,
            }
          : null;
      const result = updateProjectile(p, dt, boundsW, boundsH);
      if (result === 'expired' && airburst) {
        this.pendingSplashBursts.push(airburst);
      }
      return result === 'alive';
    });

    this.enemies = this.enemies.filter((e) =>
      e.active && updateEnemy(e, dt, boundsW),
    );

    this.muzzleFlashes = this.muzzleFlashes.filter((f) => {
      f.life -= dt;
      if (f.life <= 0) {
        f.active = false;
        return false;
      }
      return true;
    });
  }

  pruneProjectiles(): void {
    this.projectiles = this.projectiles.filter((p) => p.active);
  }

  releaseBomb(b: BombState): void {
    b.active = false;
    bombPool.release(b);
  }

  releaseDropPod(p: DropPodState): void {
    p.active = false;
    dropPodPool.release(p);
  }

  releaseGroundEnemy(g: GroundEnemyState): void {
    g.active = false;
    groundEnemyPool.release(g);
  }

  private releaseAllProjectiles(): void {
    for (const p of this.projectiles) {
      p.active = false;
      projectilePool.release(p);
    }
    this.projectiles.length = 0;
  }

  private releaseAllEnemies(): void {
    for (const e of this.enemies) {
      e.active = false;
      enemyPool.release(e);
    }
    this.enemies.length = 0;
  }

  private releaseAllBombs(): void {
    for (const b of this.bombs) {
      b.active = false;
      bombPool.release(b);
    }
    this.bombs.length = 0;
  }

  private releaseAllDropPods(): void {
    for (const p of this.dropPods) {
      p.active = false;
      dropPodPool.release(p);
    }
    this.dropPods.length = 0;
  }

  private releaseAllGroundEnemies(): void {
    for (const g of this.groundEnemies) {
      g.active = false;
      groundEnemyPool.release(g);
    }
    this.groundEnemies.length = 0;
  }
}
