import { ENEMY_DEFINITIONS } from '../data/enemies';
import { GROUND_ENEMY_DEFINITIONS } from '../data/groundEnemies';
import type {
  EnemyTypeId,
  Explosion,
  GroundEnemyTypeId,
  Particle,
  ScorePopup,
  ScorePopupVariant,
  ScreenFlash,
} from '../types';
import { ObjectPool } from '../../utils/objectPool';

function createParticle(): Particle {
  return { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, radius: 2, color: '#fff', active: false };
}

function resetParticle(p: Particle): void {
  p.active = true;
}

function createExplosion(): Explosion {
  return {
    x: 0, y: 0, radius: 0, maxRadius: 40, life: 0, maxLife: 0.4,
    color: '#ff6b35', active: false,
  };
}

function resetExplosion(e: Explosion): void {
  e.active = true;
}

function createPopup(): ScorePopup {
  return {
    x: 0, y: 0, text: '', life: 0, maxLife: 0.8, variant: 'score', active: false,
  };
}

function resetPopup(p: ScorePopup): void {
  p.active = true;
}

function createScreenFlash(): ScreenFlash {
  return { color: '#fff', life: 0, maxLife: 0.3, active: false };
}

function resetScreenFlash(f: ScreenFlash): void {
  f.active = true;
}

interface DropIndicator {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  kind: 'bomb' | 'pod';
}

interface ImpactMarker {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export class EffectsManager {
  particles: Particle[] = [];
  explosions: Explosion[] = [];
  scorePopups: ScorePopup[] = [];
  screenFlashes: ScreenFlash[] = [];
  dropIndicators: DropIndicator[] = [];
  impactMarkers: ImpactMarker[] = [];
  pulseTime = 0;

  private particlePool = new ObjectPool(createParticle, resetParticle, 96);
  private explosionPool = new ObjectPool(createExplosion, resetExplosion, 20);
  private popupPool = new ObjectPool(createPopup, resetPopup, 16);
  private flashPool = new ObjectPool(createScreenFlash, resetScreenFlash, 4);

  clear(): void {
    this.particles.length = 0;
    this.explosions.length = 0;
    this.scorePopups.length = 0;
    this.screenFlashes.length = 0;
    this.dropIndicators.length = 0;
    this.impactMarkers.length = 0;
    this.pulseTime = 0;
  }

  getPulse(speed = 2): number {
    return 0.5 + 0.5 * Math.sin(this.pulseTime * speed);
  }

  spawnGroundHitSparks(x: number, y: number, typeId: GroundEnemyTypeId): void {
    const def = GROUND_ENEMY_DEFINITIONS[typeId];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      const p = this.particlePool.acquire();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0.12 + Math.random() * 0.14;
      p.maxLife = p.life;
      p.radius = 1.5 + Math.random() * 1.5;
      p.color = def.accentColor;
      this.particles.push(p);
    }
  }

  spawnDropIndicator(x: number, y: number, kind: 'bomb' | 'pod'): void {
    this.dropIndicators.push({ x, y, life: 0.65, maxLife: 0.65, kind });
  }

  addBombImpactMarker(x: number, y: number): void {
    this.impactMarkers.push({ x, y, life: 0.75, maxLife: 0.75 });
  }

  spawnBaseHitEffect(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const p = this.particlePool.acquire();
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 90;
      p.vy = -60 - Math.random() * 90;
      p.life = 0.28;
      p.maxLife = 0.28;
      p.radius = 2 + Math.random();
      p.color = i % 2 === 0 ? '#ff4466' : '#ffaa00';
      this.particles.push(p);
    }
  }

  spawnHitSparks(x: number, y: number, enemyType: EnemyTypeId, heavy = false): void {
    const def = ENEMY_DEFINITIONS[enemyType];
    const count = heavy ? 8 : 5;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (heavy ? 100 : 80) + Math.random() * (heavy ? 180 : 160);
      const p = this.particlePool.acquire();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0.14 + Math.random() * 0.16;
      p.maxLife = p.life;
      p.radius = heavy ? 2 + Math.random() * 2.5 : 1.5 + Math.random() * 2;
      p.color = def.accentColor;
      this.particles.push(p);
    }
  }

  spawnExplosion(x: number, y: number, enemyRadius: number, color: string, large = false): void {
    const e = this.explosionPool.acquire();
    e.x = x;
    e.y = y;
    e.radius = enemyRadius * 0.4;
    e.maxRadius = enemyRadius * (large ? 3.2 : 2.5);
    e.life = large ? 0.55 : 0.45;
    e.maxLife = e.life;
    e.color = color;
    this.explosions.push(e);

    const particleCount = large ? 16 : 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
      const speed = 100 + Math.random() * (large ? 240 : 200);
      const p = this.particlePool.acquire();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0.3 + Math.random() * 0.35;
      p.maxLife = p.life;
      p.radius = 2 + Math.random() * (large ? 4 : 3);
      p.color = i % 2 === 0 ? color : '#fff8e0';
      this.particles.push(p);
    }
    // Audio hook: playExplosion()
  }

  spawnScreenFlash(color: string, duration = 0.28): void {
    const flash = this.flashPool.acquire();
    flash.color = color;
    flash.life = duration;
    flash.maxLife = duration;
    this.screenFlashes.push(flash);
  }

  spawnScorePopup(
    x: number,
    y: number,
    text: string,
    variant: ScorePopupVariant = 'score',
  ): void {
    const popup = this.popupPool.acquire();
    popup.x = x;
    popup.y = y;
    popup.text = text;
    popup.variant = variant;
    popup.life = variant === 'announce' ? 1.1 : variant === 'phase' ? 1.0 : 0.9;
    popup.maxLife = popup.life;
    this.scorePopups.push(popup);
  }

  spawnKillFeedback(
    x: number,
    y: number,
    score: number,
    credits: number,
    combo: number,
    comboIncreased: boolean,
    accentColor: string,
    radius: number,
    large = false,
  ): void {
    this.spawnExplosion(x, y, radius, accentColor, large);
    this.spawnScorePopup(x, y - 18, `+${score}`, 'score');
    if (credits > 0) {
      this.spawnScorePopup(x + 28, y - 8, `+${credits} CR`, 'credits');
    }
    if (comboIncreased && combo > 1) {
      this.spawnScorePopup(x, y - 36, `COMBO ×${combo}`, 'combo');
    }
  }

  update(dt: number): void {
    this.pulseTime += dt;

    this.particles = this.particles.filter((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        this.particlePool.release(p);
        return false;
      }
      return true;
    });

    this.explosions = this.explosions.filter((e) => {
      e.life -= dt;
      const t = 1 - e.life / e.maxLife;
      e.radius = e.maxRadius * Math.min(1, t * 1.15);
      if (e.life <= 0) {
        e.active = false;
        this.explosionPool.release(e);
        return false;
      }
      return true;
    });

    this.scorePopups = this.scorePopups.filter((s) => {
      s.y -= (s.variant === 'announce' ? 28 : 42) * dt;
      s.life -= dt;
      if (s.life <= 0) {
        s.active = false;
        this.popupPool.release(s);
        return false;
      }
      return true;
    });

    this.screenFlashes = this.screenFlashes.filter((f) => {
      f.life -= dt;
      if (f.life <= 0) {
        f.active = false;
        this.flashPool.release(f);
        return false;
      }
      return true;
    });

    this.dropIndicators = this.dropIndicators.filter((d) => {
      d.life -= dt;
      return d.life > 0;
    });

    this.impactMarkers = this.impactMarkers.filter((m) => {
      m.life -= dt;
      return m.life > 0;
    });
  }
}
