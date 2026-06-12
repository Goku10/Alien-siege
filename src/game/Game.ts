import { BALANCING } from './data/balancing';
import { MACHINE_GUN } from './data/turretConfig';
import { Turret } from './entities/Turret';
import { Renderer } from './rendering/Renderer';
import { CollisionSystem } from './systems/CollisionSystem';
import { EconomyManager } from './systems/EconomyManager';
import { EffectsManager } from './systems/EffectsManager';
import { EntityManager } from './systems/EntityManager';
import { GameLoop } from './systems/GameLoop';
import { InputManager } from './systems/InputManager';
import { WaveManager } from './systems/WaveManager';
import type { GameScreen, GameSnapshot } from './types';

export interface GameCallbacks {
  onScreenChange?: (screen: GameScreen) => void;
  onSnapshot?: (snapshot: GameSnapshot) => void;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;
  private loop: GameLoop;
  private renderer: Renderer;
  private entities: EntityManager;
  private collision: CollisionSystem;
  private economy: EconomyManager;
  private effects: EffectsManager;
  private waves: WaveManager;
  private turret: Turret;
  private callbacks: GameCallbacks;

  private screen: GameScreen = 'title';
  private elapsedTime = 0;
  private shakeIntensity = 0;
  private shakeX = 0;
  private shakeY = 0;

  private level = 1;
  private baseHealth = BALANCING.base.maxHealth;
  private breach = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;

    const { width, height } = BALANCING.canvas;
    canvas.width = width;
    canvas.height = height;

    this.input = new InputManager();
    this.renderer = new Renderer();
    this.entities = new EntityManager();
    this.collision = new CollisionSystem();
    this.economy = new EconomyManager();
    this.effects = new EffectsManager();
    this.waves = new WaveManager({
      onSpawn: (typeId, side, y) => {
        this.entities.spawnEnemy(typeId, side, width, y);
      },
      onWaveComplete: (_waveNum, clearBonus) => {
        const bonus = this.economy.awardWaveClear(clearBonus);
        this.effects.spawnScorePopup(width / 2, height * 0.35, `WAVE CLEAR +${bonus}`);
        this.addScreenShake(3);
      },
    });
    this.turret = new Turret(width, height);

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
    );
  }

  getScreen(): GameScreen {
    return this.screen;
  }

  start(): void {
    this.input.attach(this.canvas);
    this.loop.start();
  }

  destroy(): void {
    this.loop.stop();
    this.input.detach();
  }

  setScreen(screen: GameScreen): void {
    this.screen = screen;
    this.callbacks.onScreenChange?.(screen);

    if (screen === 'playing') {
      this.loop.setPaused(false);
    } else if (screen === 'paused') {
      this.loop.setPaused(true);
    }
  }

  beginPrototypeSession(): void {
    this.resetSession();
    this.setScreen('playing');
  }

  togglePause(): void {
    if (this.screen === 'playing') {
      this.setScreen('paused');
    } else if (this.screen === 'paused') {
      this.setScreen('playing');
    }
  }

  resetSession(): void {
    this.elapsedTime = 0;
    this.level = 1;
    this.baseHealth = BALANCING.base.maxHealth;
    this.breach = 0;
    this.shakeIntensity = 0;
    this.economy.reset();
    this.effects.clear();
    this.entities.clear();
    this.turret = new Turret(BALANCING.canvas.width, BALANCING.canvas.height);
    this.waves.start();
  }

  private update(dt: number): void {
    if (this.screen !== 'playing') {
      if (this.input.consumeEscape() && this.screen === 'paused') {
        this.setScreen('playing');
      }
      this.emitSnapshot();
      return;
    }

    this.elapsedTime += dt;
    this.renderer.update(dt);

    if (this.input.consumeEscape()) {
      this.setScreen('paused');
      return;
    }

    const input = this.input.getState();
    this.turret.update(dt, input, true);

    const now = this.elapsedTime;
    if (this.turret.wantsToFire(input) && this.turret.canFire(now)) {
      const muzzle = this.turret.getMuzzlePosition();
      this.entities.spawnBullet(muzzle.x, muzzle.y, this.turret.state.angle);
      this.entities.addMuzzleFlash(this.turret.createMuzzleFlash());
      this.turret.applyHeat();
      this.turret.markFired(now);
      this.addScreenShake(1.5);
    }

    this.waves.update(dt, this.entities.getAliveEnemyCount());

    this.collision.process(
      this.entities.projectiles,
      this.entities.enemies,
      this.effects,
      this.economy,
      {
        onScreenShake: (amount) => this.addScreenShake(amount),
        onHit: () => {
          // Audio hook: playHit()
        },
      },
    );
    this.entities.pruneProjectiles();

    this.entities.update(dt, BALANCING.canvas.width, BALANCING.canvas.height);
    this.effects.update(dt);
    this.economy.update(dt);
    this.decayShake(dt);
    this.emitSnapshot();
  }

  private addScreenShake(amount: number): void {
    this.shakeIntensity = Math.min(BALANCING.effects.maxShake, this.shakeIntensity + amount);
  }

  private decayShake(dt: number): void {
    if (this.shakeIntensity <= 0) {
      this.shakeX = 0;
      this.shakeY = 0;
      return;
    }
    this.shakeIntensity = Math.max(0, this.shakeIntensity - BALANCING.effects.shakeDecay * dt);
    this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
    this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
  }

  private render(): void {
    const { width, height } = BALANCING.canvas;
    this.renderer.draw(this.ctx, width, height, {
      turret: this.turret.state,
      projectiles: this.entities.projectiles,
      enemies: this.entities.enemies,
      muzzleFlashes: this.entities.muzzleFlashes,
      effects: this.effects,
      shakeX: this.shakeX,
      shakeY: this.shakeY,
    });
  }

  private emitSnapshot(): void {
    this.callbacks.onSnapshot?.({
      score: this.economy.score,
      credits: 0,
      level: this.level,
      wave: this.waves.getWaveNumber(),
      baseHealth: this.baseHealth,
      maxBaseHealth: BALANCING.base.maxHealth,
      breach: this.breach,
      maxBreach: BALANCING.base.maxBreach,
      combo: this.economy.getCombo(),
      weaponName: MACHINE_GUN.name,
      heat: this.turret.state.heat,
      maxHeat: this.turret.state.maxHeat,
      secondaryCooldown: 0,
      secondaryMaxCooldown: 1,
      isBossFight: false,
      bossHealth: 0,
      bossMaxHealth: 0,
      enemiesRemaining: this.entities.getAliveEnemyCount(),
    });
  }
}
