import { BALANCING } from '../data/balancing';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export class BackgroundRenderer {
  private stars: Star[] = [];
  private time = 0;

  constructor() {
    this.generateStars(120);
  }

  private generateStars(count: number): void {
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * BALANCING.canvas.width,
        y: Math.random() * BALANCING.canvas.height * 0.75,
        size: Math.random() * 1.8 + 0.4,
        brightness: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  update(dt: number): void {
    this.time += dt;
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, shakeX = 0, shakeY = 0): void {
    ctx.save();
    ctx.translate(shakeX, shakeY);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#0a0e1a');
    skyGrad.addColorStop(0.35, '#12182b');
    skyGrad.addColorStop(0.7, '#1a1530');
    skyGrad.addColorStop(1, '#2a1a20');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    this.drawDistantMountains(ctx, w, h);
    this.drawStars(ctx);
    this.drawHorizonGlow(ctx, w, h);
    this.drawGround(ctx, w, h);
    this.drawBase(ctx, w, h);

    ctx.restore();
  }

  private drawStars(ctx: CanvasRenderingContext2D): void {
    for (const star of this.stars) {
      const twinkle =
        0.5 +
        0.5 * Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset);
      ctx.fillStyle = `rgba(200, 220, 255, ${star.brightness * twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawDistantMountains(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const baseY = h * 0.72;
    ctx.fillStyle = '#0d1220';
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= w; x += 40) {
      const peak = baseY - 30 - Math.sin(x * 0.008) * 40 - Math.sin(x * 0.02) * 15;
      ctx.lineTo(x, peak);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#141a2e';
    ctx.beginPath();
    ctx.moveTo(0, baseY + 20);
    for (let x = 0; x <= w; x += 60) {
      const peak = baseY + 10 - Math.sin(x * 0.005 + 1) * 25;
      ctx.lineTo(x, peak);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }

  private drawHorizonGlow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.85, 0, w * 0.5, h * 0.85, w * 0.6);
    glow.addColorStop(0, 'rgba(255, 80, 40, 0.12)');
    glow.addColorStop(0.5, 'rgba(120, 40, 180, 0.06)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, h * 0.5, w, h * 0.5);
  }

  private drawGround(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const groundY = h - BALANCING.base.height - 20;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
    groundGrad.addColorStop(0, '#1a1f2e');
    groundGrad.addColorStop(1, '#0e1018');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, w, h - groundY);

    ctx.strokeStyle = 'rgba(0, 255, 200, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const y = groundY + 8 + i * 6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  private drawBase(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const baseW = BALANCING.base.width;
    const baseH = BALANCING.base.height;
    const baseX = w / 2 - baseW / 2;
    const baseY = h - baseH - 8;

    ctx.fillStyle = '#2a3040';
    ctx.fillRect(baseX, baseY, baseW, baseH);

    ctx.strokeStyle = '#00e5c0';
    ctx.lineWidth = 2;
    ctx.strokeRect(baseX, baseY, baseW, baseH);

    ctx.fillStyle = 'rgba(0, 229, 192, 0.2)';
    ctx.fillRect(baseX + 10, baseY + 10, baseW - 20, baseH - 20);

    const towerW = 24;
    const towerH = 36;
    ctx.fillStyle = '#3a4458';
    ctx.fillRect(w / 2 - towerW / 2, baseY - towerH + 8, towerW, towerH);
    ctx.strokeStyle = '#00e5c0';
    ctx.strokeRect(w / 2 - towerW / 2, baseY - towerH + 8, towerW, towerH);

    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.arc(w / 2, baseY - towerH + 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
