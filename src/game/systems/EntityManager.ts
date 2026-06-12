import { spawnEnemy, updateEnemy } from '../entities/Enemy';
import { spawnProjectile, updateProjectile } from '../entities/Projectile';
import type { EnemyState, EnemyTypeId, MuzzleFlash, ProjectileState, SpawnSide } from '../types';

export class EntityManager {
  projectiles: ProjectileState[] = [];
  enemies: EnemyState[] = [];
  muzzleFlashes: MuzzleFlash[] = [];

  clear(): void {
    for (const p of this.projectiles) p.active = false;
    for (const e of this.enemies) e.active = false;
    this.projectiles.length = 0;
    this.enemies.length = 0;
    this.muzzleFlashes.length = 0;
  }

  spawnBullet(x: number, y: number, angle: number): ProjectileState {
    const bullet = spawnProjectile(x, y, angle);
    this.projectiles.push(bullet);
    return bullet;
  }

  spawnEnemy(typeId: EnemyTypeId, side: SpawnSide, boundsW: number, y?: number): EnemyState {
    const enemy = spawnEnemy(typeId, side, boundsW, y);
    this.enemies.push(enemy);
    return enemy;
  }

  addMuzzleFlash(flash: MuzzleFlash): void {
    this.muzzleFlashes.push(flash);
  }

  getAliveEnemyCount(): number {
    return this.enemies.filter((e) => e.active && e.health > 0).length;
  }

  update(dt: number, boundsW: number, boundsH: number): void {
    this.projectiles = this.projectiles.filter((p) =>
      p.active && updateProjectile(p, dt, boundsW, boundsH),
    );

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

  /** Remove inactive projectiles after collision pass */
  pruneProjectiles(): void {
    this.projectiles = this.projectiles.filter((p) => p.active);
  }
}
