import { BALANCING } from '../data/balancing';
import type { BombState, DropPodState } from '../types';
import type { EffectsManager } from '../systems/EffectsManager';
import { getBaseLayout } from '../utils/baseLayout';

export class ThreatRenderer {
  drawBombs(
    ctx: CanvasRenderingContext2D,
    bombs: BombState[],
    canvasH: number,
    effects: EffectsManager,
  ): void {
    const layout = getBaseLayout(BALANCING.canvas.width, canvasH);
    const pulse = effects.getPulse(2.4);

    for (const b of bombs) {
      if (!b.active) continue;
      const flash = b.flashTimer > 0;
      const nearGround = b.y > layout.groundY - 150;
      const localPulse = nearGround ? pulse : 1;

      if (nearGround) {
        ctx.strokeStyle = `rgba(255, 68, 68, ${0.25 + 0.35 * localPulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, layout.groundY);
        ctx.stroke();
        ctx.setLineDash([]);

        const ringR = 16 + localPulse * 10;
        ctx.strokeStyle = `rgba(255, 100, 50, ${0.35 + 0.45 * localPulse})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(b.x, layout.groundY, ringR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 68, 68, ${0.08 * localPulse})`;
        ctx.beginPath();
        ctx.arc(b.x, layout.groundY, ringR + 6, 0, Math.PI * 2);
        ctx.fill();
      }

      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius * 2.8);
      grad.addColorStop(0, flash ? '#fff' : '#ffdd00');
      grad.addColorStop(0.45, '#ff6b35');
      grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 2.8, 0, Math.PI * 2);
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
    const pulse = effects.getPulse(1.6);

    if (breachDanger) {
      ctx.fillStyle = `rgba(255, 68, 68, ${0.06 + 0.1 * pulse})`;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = `rgba(255, 68, 102, ${0.35 + 0.45 * pulse})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 6]);
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
      const ring = 10 + (1 - t) * 14;
      ctx.strokeStyle = d.kind === 'bomb'
        ? `rgba(255, 120, 50, ${alpha * 0.9})`
        : `rgba(82, 183, 136, ${alpha * 0.9})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, ring, 0, Math.PI * 2);
      ctx.stroke();
      if (d.kind === 'bomb') {
        ctx.fillStyle = `rgba(255, 100, 50, ${alpha * 0.15})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, ring * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const m of effects.impactMarkers) {
      const t = m.life / m.maxLife;
      ctx.strokeStyle = `rgba(255, 140, 40, ${t * 0.85})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 20 * (1 - t) + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 220, 100, ${t * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 28 * (1 - t) + 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
