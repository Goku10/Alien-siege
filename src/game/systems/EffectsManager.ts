import { ENEMY_DEFINITIONS } from '../data/enemies';
import { GROUND_ENEMY_DEFINITIONS } from '../data/groundEnemies';
import type { EnemyTypeId, Explosion, GroundEnemyTypeId, Particle, ScorePopup } from '../types';
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
  return { x: 0, y: 0, text: '', life: 0, maxLife: 0.8, active: false };
}

function resetPopup(p: ScorePopup): void {
  p.active = true;
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
  dropIndicators: DropIndicator[] = [];
  impactMarkers: ImpactMarker[] = [];

  private particlePool = new ObjectPool(createParticle, resetParticle, 80);
  private explosionPool = new ObjectPool(createExplosion, resetExplosion, 16);
  private popupPool = new ObjectPool(createPopup, resetPopup, 12);

  clear(): void {
    this.particles.length = 0;
    this.explosions.length = 0;
    this.scorePopups.length = 0;
    this.dropIndicators.length = 0;
    this.impactMarkers.length = 0;
  }

  spawnGroundHitSparks(x: number, y: number, typeId: GroundEnemyTypeId): void {
    const def = GROUND_ENEMY_DEFINITIONS[typeId];
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      const p = this.particlePool.acquire();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0.12 + Math.random() * 0.12;
      p.maxLife = p.life;
      p.radius = 1.5 + Math.random() * 1.5;
      p.color = def.accentColor;
      this.particles.push(p);
    }
  }

  spawnDropIndicator(x: number, y: number, kind: 'bomb' | 'pod'): void {
    this.dropIndicators.push({ x, y, life: 0.5, maxLife: 0.5, kind });
  }

  addBombImpactMarker(x: number, y: number): void {
    this.impactMarkers.push({ x, y, life: 0.6, maxLife: 0.6 });
  }

  spawnBaseHitEffect(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const p = this.particlePool.acquire();
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 80;
      p.vy = -60 - Math.random() * 80;
      p.life = 0.25;
      p.maxLife = 0.25;
      p.radius = 2;
      p.color = '#ff4466';
      this.particles.push(p);
    }
  }

  spawnHitSparks(x: number, y: number, enemyType: EnemyTypeId): void {
    const def = ENEMY_DEFINITIONS[enemyType];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      const p = this.particlePool.acquire();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0.15 + Math.random() * 0.15;
      p.maxLife = p.life;
      p.radius = 1.5 + Math.random() * 2;
      p.color = def.accentColor;
      this.particles.push(p);
    }
  }

  spawnExplosion(x: number, y: number, enemyRadius: number, color: string): void {
    const e = this.explosionPool.acquire();
    e.x = x;
    e.y = y;
    e.radius = enemyRadius * 0.5;
    e.maxRadius = enemyRadius * 2.5;
    e.life = 0.45;
    e.maxLife = 0.45;
    e.color = color;
    this.explosions.push(e);

    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
      const speed = 100 + Math.random() * 200;
      const p = this.particlePool.acquire();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0.3 + Math.random() * 0.35;
      p.maxLife = p.life;
      p.radius = 2 + Math.random() * 3;
      p.color = i % 2 === 0 ? color : '#fff8e0';
      this.particles.push(p);
    }
    // Audio hook: playExplosion()
  }

  spawnScorePopup(x: number, y: number, text: string): void {
    const popup = this.popupPool.acquire();
    popup.x = x;
    popup.y = y;
    popup.text = text;
    popup.life = 0.9;
    popup.maxLife = 0.9;
    this.scorePopups.push(popup);
  }

  update(dt: number): void {
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
      e.radius = e.maxRadius * t;
      if (e.life <= 0) {
        e.active = false;
        this.explosionPool.release(e);
        return false;
      }
      return true;
    });

    this.scorePopups = this.scorePopups.filter((s) => {
      s.y -= 40 * dt;
      s.life -= dt;
      if (s.life <= 0) {
        s.active = false;
        this.popupPool.release(s);
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
