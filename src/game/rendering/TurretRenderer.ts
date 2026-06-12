import { TURRET_CONFIG } from '../data/turretConfig';
import type { TurretState } from '../types';

export class TurretRenderer {
  draw(ctx: CanvasRenderingContext2D, turret: TurretState): void {
    const { x, y, angle, heat, maxHeat } = turret;
    const heatRatio = heat / maxHeat;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#1e2433';
    ctx.beginPath();
    ctx.arc(0, 0, TURRET_CONFIG.bodyRadius + 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 229, 192, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.rotate(angle);

    ctx.fillStyle = '#3a4458';
    ctx.fillRect(-8, -12, 16, 24);

    const barrelGrad = ctx.createLinearGradient(0, -4, TURRET_CONFIG.barrelLength, 4);
    barrelGrad.addColorStop(0, '#4a5568');
    barrelGrad.addColorStop(1, '#6a7a90');
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(0, -5, TURRET_CONFIG.barrelLength, 10);

    ctx.fillStyle = '#00e5c0';
    ctx.fillRect(TURRET_CONFIG.barrelLength - 6, -3, 4, 6);

    ctx.restore();

    this.drawHeatIndicator(ctx, x, y + TURRET_CONFIG.bodyRadius + 14, heatRatio);
    this.drawAimLine(ctx, x, y, angle);
  }

  private drawHeatIndicator(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    ratio: number,
  ): void {
    const barW = 50;
    const barH = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - barW / 2, y, barW, barH);

    const color =
      ratio > 0.85 ? '#ff4444' : ratio > 0.6 ? '#ffaa00' : '#00e5c0';
    ctx.fillStyle = color;
    ctx.fillRect(x - barW / 2, y, barW * Math.min(1, ratio), barH);
  }

  private drawAimLine(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
  ): void {
    const len = 600;
    ctx.strokeStyle = 'rgba(0, 229, 192, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
