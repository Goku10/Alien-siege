import { BALANCING } from '../data/balancing';
import type { BombState, DropPodState } from '../types';
import type { EffectsManager } from '../systems/EffectsManager';
import { getBaseLayout } from '../utils/baseLayout';

export class ThreatRenderer {
  drawBombs(ctx: CanvasRenderingContext2D, bombs: BombState[], canvasH: number): void {
    const layout = getBaseLayout(BALANCING.canvas.width, canvasH);
    for (const b of bombs) {
      if (!b.active) continue;
      const flash = b.flashTimer > 0;
      const nearGround = b.y > layout.groundY - 160;
      const pulse = nearGround ? 0.5 + 0.5 * Math.sin(Date.now() * 0.012) : 1;

      if (nearGround) {
        ctx.strokeStyle = `rgba(255, 68, 68, ${0.35 * pulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, layout.groundY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = `rgba(255, 68, 68, ${0.5 * pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, layout.groundY, 18 + pulse * 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius * 2.5);
      grad.addColorStop(0, flash ? '#fff' : '#ffdd00');
      grad.addColorStop(0.5, '#ff6b35');
      grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = flash ? '#fff' : '#ff2200';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawDropPods(ctx: CanvasRenderingContext2D, pods: DropPodState[]): void {
    for (const p of pods) {
      if (!p.active) continue;
      const flash = p.flashTimer > 0;

      ctx.fillStyle = flash ? '#fff' : '#1b4332';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.radius * 0.8, p.radius, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#52b788';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(82, 183, 136, 0.5)';
      ctx.beginPath();
      ctx.arc(p.x, p.y + p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawWarnings(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    effects: EffectsManager,
    breachDanger: boolean,
  ): void {
    const layout = getBaseLayout(w, h);

    if (breachDanger) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
      ctx.fillStyle = `rgba(255, 68, 68, ${0.08 * pulse})`;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = `rgba(255, 68, 68, ${0.4 * pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(
        layout.centerX - layout.breachHalfWidth * 0.55,
        layout.baseY,
        layout.breachHalfWidth * 1.1,
        layout.baseH,
      );
      ctx.setLineDash([]);
    }

    for (const d of effects.dropIndicators) {
      const t = d.life / d.maxLife;
      const alpha = t;
      ctx.strokeStyle = d.kind === 'bomb'
        ? `rgba(255, 100, 50, ${alpha})`
        : `rgba(82, 183, 136, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 12 + (1 - t) * 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const m of effects.impactMarkers) {
      const t = m.life / m.maxLife;
      ctx.strokeStyle = `rgba(255, 100, 0, ${t})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 24 * (1 - t) + 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
