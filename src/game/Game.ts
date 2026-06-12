import { BALANCING } from './data/balancing';
import { MACHINE_GUN } from './data/turretConfig';
import { Turret } from './entities/Turret';
import { Renderer } from './rendering/Renderer';
import { BaseDefenseSystem } from './systems/BaseDefenseSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { EconomyManager } from './systems/EconomyManager';
import { EffectsManager } from './systems/EffectsManager';
import { EntityManager } from './systems/EntityManager';
import { GameLoop } from './systems/GameLoop';
import { InputManager } from './systems/InputManager';
import { ThreatSystem } from './systems/ThreatSystem';
import { WaveManager } from './systems/WaveManager';
import type { GameOverReason, GameScreen, GameSnapshot } from './types';

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
  private threats: ThreatSystem;
  private base: BaseDefenseSystem;
  private turret: Turret;
  private callbacks: GameCallbacks;

  private screen: GameScreen = 'title';
  private elapsedTime = 0;
  private shakeIntensity = 0;
  private shakeX = 0;
  private shakeY = 0;
  private level = 1;
  private gameOverReason: GameOverReason | null = null;
  private finalScore = 0;

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
    this.base = new BaseDefenseSystem();
    this.threats = new ThreatSystem();
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
    } else if (screen === 'paused' || screen === 'gameOver') {
      this.loop.setPaused(true);
    }
  }

  beginPrototypeSession(): void {
    this.resetSession();
    this.setScreen('playing');
  }

  restartSession(): void {
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
    this.gameOverReason = null;
    this.finalScore = 0;
    this.shakeIntensity = 0;
    this.base.reset();
    this.economy.reset();
    this.effects.clear();
    this.entities.clear();
    this.turret = new Turret(BALANCING.canvas.width, BALANCING.canvas.height);
    this.waves.start();
  }

  private triggerGameOver(): void {
    this.finalScore = this.economy.score;
    this.gameOverReason = this.base.getDefeatReason();
    this.setScreen('gameOver');
    this.addScreenShake(10);
    // Audio hook: playGameOver()
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

    const { width, height } = BALANCING.canvas;
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

    this.entities.update(dt, width, height);

    this.threats.updateFlyingDrops(
      this.entities.enemies,
      this.entities,
      width,
      height,
      dt,
      this.effects,
    );

    this.waves.update(dt, this.entities.getAliveFlyingCount());

    this.collision.process(this.entities, this.effects, this.economy, {
      onScreenShake: (amount) => this.addScreenShake(amount),
    });
    this.entities.pruneProjectiles();

    this.threats.updateThreats(
      this.entities,
      this.base,
      this.effects,
      width,
      height,
      dt,
      (amount) => this.addScreenShake(amount),
    );

    this.effects.update(dt);
    this.economy.update(dt);
    this.decayShake(dt);

    if (this.base.isDefeated()) {
      this.triggerGameOver();
    }

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
      bombs: this.entities.bombs,
      dropPods: this.entities.dropPods,
      groundEnemies: this.entities.groundEnemies,
      muzzleFlashes: this.entities.muzzleFlashes,
      effects: this.effects,
      shakeX: this.shakeX,
      shakeY: this.shakeY,
      breachDanger: this.base.isBreachDanger(),
    });
  }

  private emitSnapshot(): void {
    this.callbacks.onSnapshot?.({
      score: this.economy.score,
      credits: 0,
      level: this.level,
      wave: this.waves.getWaveNumber(),
      baseHealth: this.base.health,
      maxBaseHealth: this.base.maxHealth,
      breach: this.breach,
      maxBreach: this.base.maxBreach,
      combo: this.economy.getCombo(),
      weaponName: MACHINE_GUN.name,
      heat: this.turret.state.heat,
      maxHeat: this.turret.state.maxHeat,
      secondaryCooldown: 0,
      secondaryMaxCooldown: 1,
      isBossFight: false,
      bossHealth: 0,
      bossMaxHealth: 0,
      enemiesRemaining: this.entities.getAliveFlyingCount(),
      groundThreats: this.entities.getGroundThreatCount(),
      breachDanger: this.base.isBreachDanger(),
      bombWarning: this.threats.bombWarningActive,
      gameOverReason: this.gameOverReason,
      finalScore: this.finalScore,
    });
  }

  private get breach(): number {
    return this.base.breach;
  }
}
