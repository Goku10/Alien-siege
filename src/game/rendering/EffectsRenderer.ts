import type { EffectsManager } from '../systems/EffectsManager';

export class EffectsRenderer {
  draw(ctx: CanvasRenderingContext2D, effects: EffectsManager): void {
    for (const e of effects.explosions) {
      const t = 1 - e.life / e.maxLife;
      const alpha = 1 - t;
      const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius);
      grad.addColorStop(0, `rgba(255, 255, 220, ${alpha * 0.9})`);
      grad.addColorStop(0.3, `rgba(255, 107, 53, ${alpha * 0.7})`);
      grad.addColorStop(1, 'rgba(255, 80, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.6})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const p of effects.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const s of effects.scorePopups) {
      const alpha = Math.min(1, s.life / (s.maxLife * 0.5));
      const scale = 1 + (1 - s.life / s.maxLife) * 0.3;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 16px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00e5c0';
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 3;
      ctx.strokeText(s.text, 0, 0);
      ctx.fillText(s.text, 0, 0);
      ctx.restore();
    }
  }
}
