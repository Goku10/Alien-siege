import { MOTHERSHIP_BOSS } from '../data/bossConfig';
import { getBaseLayout } from '../utils/baseLayout';
import type { BossState } from '../types';

export class BossRenderer {
  draw(ctx: CanvasRenderingContext2D, boss: BossState | null, canvasH: number): void {
    if (!boss || !boss.active) return;

    const flash = boss.flashTimer > 0;
    const entering = boss.enterProgress < 1;

    ctx.save();
    ctx.translate(boss.x, boss.y);

    if (boss.shieldActive) {
      const pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.01);
      ctx.strokeStyle = `rgba(0, 229, 192, ${0.35 * pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, MOTHERSHIP_BOSS.bodyRadius + 18, MOTHERSHIP_BOSS.bodyHeight * 0.65, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(0, 229, 192, ${0.08 * pulse})`;
      ctx.fill();
    }

    const bodyGrad = ctx.createLinearGradient(-MOTHERSHIP_BOSS.bodyRadius, 0, MOTHERSHIP_BOSS.bodyRadius, 0);
    bodyGrad.addColorStop(0, flash ? '#fff' : '#2d1b4e');
    bodyGrad.addColorStop(0.5, flash ? '#fff' : '#4c1d95');
    bodyGrad.addColorStop(1, flash ? '#fff' : '#2d1b4e');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, MOTHERSHIP_BOSS.bodyRadius, MOTHERSHIP_BOSS.bodyHeight * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#1e1b2e';
    ctx.beginPath();
    ctx.ellipse(0, -12, MOTHERSHIP_BOSS.bodyRadius * 0.55, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const wp of boss.weakPoints) {
      if (wp.destroyed) continue;
      const wpFlash = wp.flashTimer > 0;
      ctx.fillStyle = wpFlash ? '#fff' : '#ff6b35';
      ctx.shadowColor = '#ff6b35';
      ctx.shadowBlur = wpFlash ? 16 : 10;
      ctx.beginPath();
      ctx.arc(wp.offsetX, wp.offsetY, wp.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffdd00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    if (boss.beam.active) {
      this.drawBeam(ctx, boss, canvasH);
    }

    if (entering) {
      ctx.fillStyle = 'rgba(0, 229, 192, 0.06)';
      ctx.fillRect(0, 0, 1280, canvasH);
    }
  }

  private drawBeam(ctx: CanvasRenderingContext2D, boss: BossState, canvasH: number): void {
    const layout = getBaseLayout(1280, canvasH);
    const t = boss.beam.chargeTime / boss.beam.maxCharge;
    const alpha = 0.25 + t * 0.55;
    const width = boss.beam.width * (0.5 + t * 0.5);

    const grad = ctx.createLinearGradient(boss.beam.targetX, boss.y, boss.beam.targetX, layout.groundY);
    grad.addColorStop(0, `rgba(255, 100, 200, ${alpha * 0.5})`);
    grad.addColorStop(0.5, `rgba(255, 50, 100, ${alpha})`);
    grad.addColorStop(1, `rgba(255, 0, 0, ${alpha * 1.2})`);

    ctx.fillStyle = grad;
    ctx.fillRect(boss.beam.targetX - width / 2, boss.y, width, layout.groundY - boss.y);

    ctx.strokeStyle = `rgba(255, 200, 255, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(boss.beam.targetX, boss.y);
    ctx.lineTo(boss.beam.targetX, layout.groundY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(255, 68, 102, ${0.4 + t * 0.4})`;
    ctx.beginPath();
    ctx.arc(boss.beam.targetX, layout.groundY, 20 + t * 15, 0, Math.PI * 2);
    ctx.fill();
  }
}
