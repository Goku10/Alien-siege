import { BossRenderer } from './BossRenderer';
import { BackgroundRenderer } from './BackgroundRenderer';
import { EffectsRenderer } from './EffectsRenderer';
import { EnemyRenderer } from './EnemyRenderer';
import { GroundEnemyRenderer } from './GroundEnemyRenderer';
import { ProjectileRenderer } from './ProjectileRenderer';
import { ThreatRenderer } from './ThreatRenderer';
import { TurretRenderer } from './TurretRenderer';
import type { EffectsManager } from '../systems/EffectsManager';
import type {
  BombState,
  BossState,
  DropPodState,
  EnemyState,
  GroundEnemyState,
  MuzzleFlash,
  ProjectileState,
  TurretState,
} from '../types';

export interface RenderScene {
  turret: TurretState;
  projectiles: ProjectileState[];
  enemies: EnemyState[];
  bombs: BombState[];
  dropPods: DropPodState[];
  groundEnemies: GroundEnemyState[];
  muzzleFlashes: MuzzleFlash[];
  boss: BossState | null;
  effects: EffectsManager;
  shakeX: number;
  shakeY: number;
  breachDanger: boolean;
}

export class Renderer {
  private bg = new BackgroundRenderer();
  private enemyRenderer = new EnemyRenderer();
  private threatRenderer = new ThreatRenderer();
  private groundRenderer = new GroundEnemyRenderer();
  private turretRenderer = new TurretRenderer();
  private projectileRenderer = new ProjectileRenderer();
  private bossRenderer = new BossRenderer();
  private effectsRenderer = new EffectsRenderer();

  update(dt: number): void {
    this.bg.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, scene: RenderScene): void {
    ctx.clearRect(0, 0, w, h);
    this.bg.draw(ctx, w, h, scene.shakeX, scene.shakeY);

    ctx.save();
    ctx.translate(scene.shakeX, scene.shakeY);

    this.threatRenderer.drawWarnings(ctx, w, h, scene.effects, scene.breachDanger);
    this.bossRenderer.draw(ctx, scene.boss, h);
    this.enemyRenderer.draw(ctx, scene.enemies);
    this.threatRenderer.drawDropPods(ctx, scene.dropPods);
    this.threatRenderer.drawBombs(ctx, scene.bombs, h);
    this.groundRenderer.draw(ctx, scene.groundEnemies);
    this.projectileRenderer.drawProjectiles(ctx, scene.projectiles);
    this.effectsRenderer.draw(ctx, scene.effects);
    this.projectileRenderer.drawMuzzleFlashes(ctx, scene.muzzleFlashes);
    this.turretRenderer.draw(ctx, scene.turret);

    ctx.restore();
  }
}
