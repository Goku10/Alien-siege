import { ENEMY_DEFINITIONS } from '../data/enemies';
import type { EnemyState } from '../types';

export class EnemyRenderer {
  draw(ctx: CanvasRenderingContext2D, enemies: EnemyState[]): void {
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const def = ENEMY_DEFINITIONS[enemy.typeId];
      const hitFlash = enemy.flashTimer > 0;

      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.radius * 1.8);
      glow.addColorStop(0, def.glowColor);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      switch (enemy.typeId) {
        case 'scout_saucer':
          this.drawScout(ctx, enemy.radius, def.color, def.accentColor, hitFlash);
          break;
        case 'drop_carrier':
          this.drawCarrier(ctx, enemy.radius, def.color, def.accentColor, hitFlash);
          break;
        case 'bomber_ship':
          this.drawBomber(ctx, enemy.radius, def.color, def.accentColor, hitFlash, enemy.vx);
          break;
        case 'shielded_transport':
          this.drawShieldedTransport(ctx, enemy.radius, def.color, def.accentColor, hitFlash);
          break;
        case 'drone_swarm_pod':
          this.drawSwarmPod(ctx, enemy.radius, def.color, def.accentColor, hitFlash);
          break;
        case 'elite_bio_pod':
          this.drawEliteBioPod(ctx, enemy.radius, def.color, def.accentColor, hitFlash);
          break;
      }

      if (enemy.shieldHealth > 0) {
        this.drawShieldRing(ctx, enemy);
      }

      if (enemy.maxHealth > 30 || enemy.maxShieldHealth > 0) {
        this.drawHealthBar(ctx, enemy);
      }

      ctx.restore();
    }
  }

  private drawScout(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    accent: string,
    flash: boolean,
  ): void {
    ctx.fillStyle = flash ? '#ffffff' : color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.4, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.5, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCarrier(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    accent: string,
    flash: boolean,
  ): void {
    ctx.fillStyle = flash ? '#ffffff' : color;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(-r * 0.3, -r * 0.7);
    ctx.lineTo(r * 0.3, -r * 0.7);
    ctx.lineTo(r, 0);
    ctx.lineTo(r * 0.3, r * 0.5);
    ctx.lineTo(-r * 0.3, r * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.fillRect(-r * 0.15, r * 0.3, r * 0.3, r * 0.35);
  }

  private drawBomber(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    accent: string,
    flash: boolean,
    vx: number,
  ): void {
    const dir = vx >= 0 ? 1 : -1;
    ctx.fillStyle = flash ? '#ffffff' : color;
    ctx.beginPath();
    ctx.moveTo(dir * r * 1.1, 0);
    ctx.lineTo(-dir * r * 0.6, -r * 0.55);
    ctx.lineTo(-dir * r * 0.8, 0);
    ctx.lineTo(-dir * r * 0.6, r * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(-dir * r * 0.2, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.arc(dir * r * 0.7, r * 0.35, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawShieldedTransport(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    accent: string,
    flash: boolean,
  ): void {
    ctx.fillStyle = flash ? '#ffffff' : color;
    ctx.beginPath();
    ctx.roundRect(-r * 1.1, -r * 0.55, r * 2.2, r * 1.1, r * 0.2);
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(-r * 0.9, -r * 0.4, r * 1.8, r * 0.8);

    ctx.fillStyle = accent;
    ctx.fillRect(-r * 0.25, -r * 0.15, r * 0.5, r * 0.3);
  }

  private drawSwarmPod(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    accent: string,
    flash: boolean,
  ): void {
    ctx.fillStyle = flash ? '#ffffff' : color;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * 0.85;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accent;
    for (let i = 0; i < 3; i += 1) {
      const ox = (i - 1) * r * 0.35;
      ctx.beginPath();
      ctx.arc(ox, 0, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawEliteBioPod(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    accent: string,
    flash: boolean,
  ): void {
    ctx.fillStyle = flash ? '#ffffff' : color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.7, r * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = -1; i <= 1; i += 2) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(i * r * 0.3, r * 0.5);
      ctx.quadraticCurveTo(i * r * 0.9, r * 0.9, i * r * 0.5, r * 1.2);
      ctx.stroke();
    }
  }

  private drawShieldRing(ctx: CanvasRenderingContext2D, enemy: EnemyState): void {
    const pct = enemy.maxShieldHealth > 0 ? enemy.shieldHealth / enemy.maxShieldHealth : 0;
    ctx.strokeStyle = `rgba(100, 180, 255, ${0.35 + pct * 0.45})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius * 1.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawHealthBar(ctx: CanvasRenderingContext2D, enemy: EnemyState): void {
    const barW = enemy.radius * 2;
    const barH = 4;
    let y = -enemy.radius - 10;

    if (enemy.maxShieldHealth > 0) {
      const shieldPct = Math.max(0, enemy.shieldHealth / enemy.maxShieldHealth);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2, y - 6, barW, barH);
      ctx.fillStyle = '#64b5f6';
      ctx.fillRect(-barW / 2, y - 6, barW * shieldPct, barH);
    }

    const pct = Math.max(0, enemy.health / enemy.maxHealth);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(-barW / 2, y, barW, barH);
    ctx.fillStyle = pct > 0.5 ? '#52b788' : pct > 0.25 ? '#ffaa00' : '#ff4466';
    ctx.fillRect(-barW / 2, y, barW * pct, barH);
  }
}
