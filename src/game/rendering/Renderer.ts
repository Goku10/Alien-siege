import { BackgroundRenderer } from './BackgroundRenderer';
import { EffectsRenderer } from './EffectsRenderer';
import { EnemyRenderer } from './EnemyRenderer';
import { ProjectileRenderer } from './ProjectileRenderer';
import { TurretRenderer } from './TurretRenderer';
import type { EffectsManager } from '../systems/EffectsManager';
import type { EnemyState, MuzzleFlash, ProjectileState, TurretState } from '../types';

export interface RenderScene {
  turret: TurretState;
  projectiles: ProjectileState[];
  enemies: EnemyState[];
  muzzleFlashes: MuzzleFlash[];
  effects: EffectsManager;
  shakeX: number;
  shakeY: number;
}

export class Renderer {
  private bg = new BackgroundRenderer();
  private enemyRenderer = new EnemyRenderer();
  private turretRenderer = new TurretRenderer();
  private projectileRenderer = new ProjectileRenderer();
  private effectsRenderer = new EffectsRenderer();

  update(dt: number): void {
    this.bg.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, scene: RenderScene): void {
    ctx.clearRect(0, 0, w, h);
    this.bg.draw(ctx, w, h, scene.shakeX, scene.shakeY);

    ctx.save();
    ctx.translate(scene.shakeX, scene.shakeY);

    this.enemyRenderer.draw(ctx, scene.enemies);
    this.projectileRenderer.drawProjectiles(ctx, scene.projectiles);
    this.effectsRenderer.draw(ctx, scene.effects);
    this.projectileRenderer.drawMuzzleFlashes(ctx, scene.muzzleFlashes);
    this.turretRenderer.draw(ctx, scene.turret);

    ctx.restore();
  }
}
