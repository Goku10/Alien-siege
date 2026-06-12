import { BackgroundRenderer } from './BackgroundRenderer';
import { ProjectileRenderer } from './ProjectileRenderer';
import { TurretRenderer } from './TurretRenderer';
import type { MuzzleFlash, ProjectileState, TurretState } from '../types';

export interface RenderScene {
  turret: TurretState;
  projectiles: ProjectileState[];
  muzzleFlashes: MuzzleFlash[];
  shakeX: number;
  shakeY: number;
}

export class Renderer {
  private bg = new BackgroundRenderer();
  private turretRenderer = new TurretRenderer();
  private projectileRenderer = new ProjectileRenderer();

  update(dt: number): void {
    this.bg.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, scene: RenderScene): void {
    ctx.clearRect(0, 0, w, h);
    this.bg.draw(ctx, w, h, scene.shakeX, scene.shakeY);

    ctx.save();
    ctx.translate(scene.shakeX, scene.shakeY);
    this.projectileRenderer.drawProjectiles(ctx, scene.projectiles);
    this.projectileRenderer.drawMuzzleFlashes(ctx, scene.muzzleFlashes);
    this.turretRenderer.draw(ctx, scene.turret);
    ctx.restore();
  }
}
