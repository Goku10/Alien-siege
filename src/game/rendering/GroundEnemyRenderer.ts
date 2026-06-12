import { GROUND_ENEMY_DEFINITIONS } from '../data/groundEnemies';
import type { GroundEnemyState } from '../types';

export class GroundEnemyRenderer {
  draw(ctx: CanvasRenderingContext2D, enemies: GroundEnemyState[]): void {
    for (const g of enemies) {
      if (!g.active) continue;
      const def = GROUND_ENEMY_DEFINITIONS[g.typeId];
      const flash = g.flashTimer > 0;

      ctx.save();
      ctx.translate(g.x, g.y);

      switch (g.typeId) {
        case 'crawler':
          this.drawCrawler(ctx, g.radius, def.color, def.accentColor, flash);
          break;
        case 'spitter':
          this.drawSpitter(ctx, g.radius, def.color, def.accentColor, flash, g.behavior === 'attacking');
          break;
        case 'leaper':
          this.drawLeaper(ctx, g.radius, def.color, def.accentColor, flash);
          break;
      }

      if (g.health < g.maxHealth) {
        const barW = g.radius * 2.2;
        const pct = g.health / g.maxHealth;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-barW / 2, -g.radius - 10, barW, 3);
        ctx.fillStyle = '#52b788';
        ctx.fillRect(-barW / 2, -g.radius - 10, barW * pct, 3);
      }

      ctx.restore();
    }
  }

  private drawCrawler(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    accent: string,
    flash: boolean,
  ): void {
    ctx.fillStyle = flash ? '#fff' : color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.ellipse(i * r * 0.7, r * 0.3, r * 0.25, r * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawSpitter(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    accent: string,
    flash: boolean,
    attacking: boolean,
  ): void {
    ctx.fillStyle = flash ? '#fff' : color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0, -r * 0.3, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    if (attacking) {
      ctx.fillStyle = 'rgba(224, 170, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(0, -r * 1.2, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawLeaper(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    accent: string,
    flash: boolean,
  ): void {
    ctx.fillStyle = flash ? '#fff' : color;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, r * 0.5);
    ctx.lineTo(0, r * 0.2);
    ctx.lineTo(-r, r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
}
