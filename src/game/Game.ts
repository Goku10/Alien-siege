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
import { LevelManager } from './systems/LevelManager';
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
  private levels: LevelManager;
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
  private gameOverReason: GameOverReason | null = null;
  private finalScore = 0;
  private levelCompleteBonus = 0;
  private campaignComplete = false;

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
      onSpawn: (typeId, side, y, mods) => {
        this.entities.spawnEnemy(typeId, side, width, y, mods);
      },
      onWaveStart: (waveNum, totalWaves) => {
        this.effects.spawnScorePopup(
          width / 2,
          height * 0.28,
          `WAVE ${waveNum} / ${totalWaves}`,
        );
      },
      onWaveComplete: (_waveNum, clearBonus) => {
        const bonus = this.economy.awardWaveClear(clearBonus);
        this.effects.spawnScorePopup(width / 2, height * 0.35, `WAVE CLEAR +${bonus}`);
        this.addScreenShake(3);
      },
      onLevelWavesComplete: () => {
        this.levels.onAllWavesComplete();
      },
    });

    this.levels = new LevelManager({
      onLevelIntro: () => {
        this.setScreen('playing');
      },
      onCombatStart: (level) => {
        this.waves.startLevel(level, this.levels.getScaling());
      },
      onBossWarning: () => {
        this.entities.clearThreats();
        this.setScreen('bossWarning');
      },
      onLevelComplete: (_level, bonus) => {
        this.levelCompleteBonus = bonus;
        this.economy.score += bonus;
        if (this.levels.getLevelNumber() >= this.levels.getTotalLevels()) {
          this.campaignComplete = true;
        }
        this.effects.spawnScorePopup(
          width / 2,
          height * 0.32,
          `LEVEL CLEAR +${bonus}`,
        );
        this.setScreen('levelComplete');
      },
      onCampaignComplete: () => {
        this.campaignComplete = true;
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

    const paused =
      screen === 'paused' ||
      screen === 'gameOver' ||
      screen === 'levelComplete';
    this.loop.setPaused(paused);
  }

  beginPrototypeSession(): void {
    this.resetSession();
    this.setScreen('playing');
  }

  restartSession(): void {
    this.resetSession();
    this.setScreen('playing');
  }

  continueToNextLevel(): void {
    const hasNext = this.levels.continueAfterLevel();
    if (hasNext) {
      this.waves.reset();
      this.setScreen('playing');
    } else {
      this.campaignComplete = true;
      this.setScreen('levelComplete');
    }
  }

  togglePause(): void {
    if (this.screen === 'playing' && this.levels.isCombatActive()) {
      this.setScreen('paused');
    } else if (this.screen === 'paused') {
      this.setScreen('playing');
    }
  }

  resetSession(): void {
    this.elapsedTime = 0;
    this.gameOverReason = null;
    this.finalScore = 0;
    this.levelCompleteBonus = 0;
    this.campaignComplete = false;
    this.shakeIntensity = 0;
    this.base.reset();
    this.economy.reset();
    this.effects.clear();
    this.entities.clear();
    this.waves.reset();
    this.levels.reset();
    this.turret = new Turret(BALANCING.canvas.width, BALANCING.canvas.height);
  }

  private triggerGameOver(): void {
    this.finalScore = this.economy.score;
    this.gameOverReason = this.base.getDefeatReason();
    this.setScreen('gameOver');
    this.addScreenShake(10);
  }

  private update(dt: number): void {
    const passiveScreens: GameScreen[] = [
      'paused',
      'gameOver',
      'levelComplete',
    ];

    if (passiveScreens.includes(this.screen)) {
      if (this.input.consumeEscape() && this.screen === 'paused') {
        this.setScreen('playing');
      }
      this.emitSnapshot();
      return;
    }

    this.elapsedTime += dt;
    this.renderer.update(dt);
    this.levels.update(dt);

    if (this.screen === 'bossWarning') {
      this.effects.update(dt);
      this.decayShake(dt);
      this.emitSnapshot();
      return;
    }

    if (this.screen === 'playing' && !this.levels.isCombatActive()) {
      this.effects.update(dt);
      this.decayShake(dt);
      this.emitSnapshot();
      return;
    }

    if (this.screen !== 'playing') {
      this.emitSnapshot();
      return;
    }

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

    if (this.levels.isCombatActive()) {
      this.waves.update(dt, this.entities.getAliveFlyingCount());
    }

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
    const level = this.levels.getCurrentLevel();
    const phase = this.levels.getPhase();

    this.callbacks.onSnapshot?.({
      score: this.economy.score,
      credits: 0,
      level: this.levels.getLevelNumber(),
      wave: this.waves.getWaveNumber(),
      baseHealth: this.base.health,
      maxBaseHealth: this.base.maxHealth,
      breach: this.base.breach,
      maxBreach: this.base.maxBreach,
      combo: this.economy.getCombo(),
      weaponName: MACHINE_GUN.name,
      heat: this.turret.state.heat,
      maxHeat: this.turret.state.maxHeat,
      secondaryCooldown: 0,
      secondaryMaxCooldown: 1,
      isBossFight: this.screen === 'bossWarning',
      bossHealth: 0,
      bossMaxHealth: 0,
      enemiesRemaining: this.entities.getAliveFlyingCount(),
      groundThreats: this.entities.getGroundThreatCount(),
      breachDanger: this.base.isBreachDanger(),
      bombWarning: this.threats.bombWarningActive,
      gameOverReason: this.gameOverReason,
      finalScore: this.finalScore,
      levelName: level.name,
      levelSubtitle: level.subtitle,
      waveInLevel: this.waves.getWaveNumber(),
      totalWavesInLevel: this.waves.getTotalWaves() || level.waves.length,
      showLevelIntro: phase === 'intro',
      levelIntroText: level.introText,
      levelCompleteBonus: this.levelCompleteBonus,
      isCampaignComplete: this.campaignComplete,
      totalLevels: this.levels.getTotalLevels(),
    });
  }
}
