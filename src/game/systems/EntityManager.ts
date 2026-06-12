import type { MuzzleFlash, ProjectileState } from '../types';
import { spawnProjectile, updateProjectile } from '../entities/Projectile';

export class EntityManager {
  projectiles: ProjectileState[] = [];
  muzzleFlashes: MuzzleFlash[] = [];

  clear(): void {
    for (const p of this.projectiles) {
      p.active = false;
    }
    this.projectiles.length = 0;
    this.muzzleFlashes.length = 0;
  }

  spawnBullet(x: number, y: number, angle: number): ProjectileState {
    const bullet = spawnProjectile(x, y, angle);
    this.projectiles.push(bullet);
    return bullet;
  }

  addMuzzleFlash(flash: MuzzleFlash): void {
    this.muzzleFlashes.push(flash);
  }

  update(dt: number, boundsW: number, boundsH: number): void {
    this.projectiles = this.projectiles.filter((p) =>
      updateProjectile(p, dt, boundsW, boundsH),
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
}
