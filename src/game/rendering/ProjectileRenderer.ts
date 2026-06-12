import type { MuzzleFlash, ProjectileState } from '../types';

export class ProjectileRenderer {
  drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: ProjectileState[]): void {
    for (const p of projectiles) {
      if (!p.active) continue;

      if (p.trail.length > 1) {
        if (p.kind === 'laser') {
          const grad = ctx.createLinearGradient(
            p.trail[0].x, p.trail[0].y, p.x, p.y,
          );
          grad.addColorStop(0, 'rgba(0, 229, 192, 0.05)');
          grad.addColorStop(0.5, p.glowColor);
          grad.addColorStop(1, '#ffffff');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          for (let i = 1; i < p.trail.length; i++) {
            const t = i / p.trail.length;
            const alpha = 0.12 + t * 0.45;
            ctx.strokeStyle = p.glowColor.replace(/[\d.]+\)$/, `${alpha})`);
            ctx.lineWidth = p.kind === 'missile' ? 2 + t * 2 : 1 + t * 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.stroke();
          }
        }
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
      const size = f.size * alpha + f.size * 0.35;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angle);

      const grad = ctx.createRadialGradient(0, 0, 0, size, 0, size * 2.2);
      grad.addColorStop(0, `rgba(255, 255, 240, ${alpha})`);
      grad.addColorStop(0.3, f.glowColor.includes('rgba')
        ? f.glowColor.replace(/[\d.]+\)$/, `${alpha * 0.85})`)
        : `rgba(255, 200, 80, ${alpha * 0.85})`);
      grad.addColorStop(0.65, f.color.startsWith('#')
        ? `rgba(${parseInt(f.color.slice(1, 3), 16)}, ${parseInt(f.color.slice(3, 5), 16)}, ${parseInt(f.color.slice(5, 7), 16)}, ${alpha * 0.5})`
        : `rgba(255, 120, 40, ${alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(size * 0.55, 0, size, size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
