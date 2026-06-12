import type { MuzzleFlash, ProjectileState } from '../types';

export class ProjectileRenderer {
  drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: ProjectileState[]): void {
    for (const p of projectiles) {
      if (!p.active) continue;

      if (p.kind === 'laser' && p.trail.length > 1) {
        ctx.strokeStyle = p.glowColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else if (p.trail.length > 1) {
        ctx.strokeStyle = p.glowColor.replace(/[\d.]+\)$/, '0.45)');
        ctx.lineWidth = p.kind === 'missile' ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.stroke();
      }

      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
      glow.addColorStop(0, p.color);
      glow.addColorStop(0.45, p.glowColor);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawMuzzleFlashes(ctx: CanvasRenderingContext2D, flashes: MuzzleFlash[]): void {
    for (const f of flashes) {
      if (!f.active) continue;
      const t = f.life / f.maxLife;
      const alpha = 1 - t;
      const size = 18 * alpha + 6;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angle);

      const grad = ctx.createRadialGradient(0, 0, 0, size, 0, size * 2);
      grad.addColorStop(0, `rgba(255, 255, 220, ${alpha})`);
      grad.addColorStop(0.3, `rgba(255, 200, 80, ${alpha * 0.8})`);
      grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(size * 0.5, 0, size, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
