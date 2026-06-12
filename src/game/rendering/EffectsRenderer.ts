import type { EffectsManager } from '../systems/EffectsManager';
import type { ScorePopupVariant } from '../types';

const POPUP_STYLES: Record<
  ScorePopupVariant,
  { fill: string; fontSize: number; stroke: string }
> = {
  score: { fill: '#00e5c0', fontSize: 16, stroke: 'rgba(0,0,0,0.8)' },
  credits: { fill: '#7dd3fc', fontSize: 13, stroke: 'rgba(0,0,0,0.75)' },
  combo: { fill: '#ffba08', fontSize: 18, stroke: 'rgba(80,40,0,0.85)' },
  phase: { fill: '#ff6b6b', fontSize: 22, stroke: 'rgba(40,0,0,0.9)' },
  announce: { fill: '#e0e0e0', fontSize: 20, stroke: 'rgba(0,0,0,0.85)' },
};

function parseColorToRgb(color: string): [number, number, number] {
  if (color.startsWith('#') && color.length >= 7) {
    return [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
    ];
  }
  return [255, 107, 53];
}

export class EffectsRenderer {
  draw(ctx: CanvasRenderingContext2D, effects: EffectsManager, w: number, h: number): void {
    for (const e of effects.explosions) {
      const t = 1 - e.life / e.maxLife;
      const alpha = 1 - t * 0.85;
      const [r, g, b] = parseColorToRgb(e.color);

      const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius);
      grad.addColorStop(0, `rgba(255, 255, 230, ${alpha * 0.95})`);
      grad.addColorStop(0.25, `rgba(${r}, ${g}, ${b}, ${alpha * 0.75})`);
      grad.addColorStop(0.65, `rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.2)}, ${alpha * 0.35})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 220, 140, ${alpha * 0.55})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * 0.82, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const p of effects.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (0.6 + alpha * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const s of effects.scorePopups) {
      const style = POPUP_STYLES[s.variant];
      const lifeT = 1 - s.life / s.maxLife;
      const alpha = Math.min(1, s.life / (s.maxLife * 0.45));
      const scale = s.variant === 'combo'
        ? 1.1 + lifeT * 0.25
        : 1 + lifeT * 0.2;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${style.fontSize}px Orbitron, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = style.fill;
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 3;
      ctx.strokeText(s.text, 0, 0);
      ctx.fillText(s.text, 0, 0);
      ctx.restore();
    }

    for (const f of effects.screenFlashes) {
      const alpha = (f.life / f.maxLife) * 0.32;
      const [r, g, b] = parseColorToRgb(f.color);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fillRect(0, 0, w, h);
    }
  }
}
