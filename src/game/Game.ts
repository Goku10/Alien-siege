import { BALANCING } from './data/balancing';
import { MOTHERSHIP_BOSS } from './data/bossConfig';
import type { ShopItemId } from './data/shopItems';
import { Turret } from './entities/Turret';
import { Renderer } from './rendering/Renderer';
import { BaseDefenseSystem } from './systems/BaseDefenseSystem';
import { BossManager } from './systems/BossManager';
import { CollisionSystem } from './systems/CollisionSystem';
import { EconomyManager } from './systems/EconomyManager';
import { EffectsManager } from './systems/EffectsManager';
import { EntityManager } from './systems/EntityManager';
import { GameLoop } from './systems/GameLoop';
import { InputManager } from './systems/InputManager';
import { LevelManager } from './systems/LevelManager';
import { ShopManager } from './systems/ShopManager';
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
  private bosses: BossManager;
  private threats: ThreatSystem;
  private base: BaseDefenseSystem;
  private shop: ShopManager;
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
    this.shop = new ShopManager();
    this.threats = new ThreatSystem();
    this.bosses = new BossManager({
      onDefeated: (scoreBonus) => {
        const levelId = this.levels.getLevelNumber();
        const reward = this.economy.awardBossDefeat(scoreBonus, levelId);
        const { width, height } = BALANCING.canvas;
        this.effects.spawnScorePopup(
          width / 2,
          height * 0.38,
          `BOSS DOWN +${reward.score}`,
        );
        this.effects.spawnScorePopup(
          width / 2,
          height * 0.44,
          `+${reward.credits} CREDITS`,
        );
        this.levels.onBossDefeated();
      },
      onPhaseChange: () => {
        this.addScreenShake(5);
      },
      onScreenShake: (amount) => this.addScreenShake(amount),
    });

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
        const reward = this.economy.awardWaveClear(clearBonus);
        this.effects.spawnScorePopup(
          width / 2,
          height * 0.35,
          `WAVE CLEAR +${reward.score}`,
        );
        this.effects.spawnScorePopup(
          width / 2,
          height * 0.41,
          `+${reward.credits} CREDITS`,
        );
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
        this.economy.beginLevel();
        this.waves.startLevel(level, this.levels.getScaling());
      },
      onBossWarning: () => {
        this.entities.clearThreats();
        this.setScreen('bossWarning');
      },
      onBossFightStart: (level) => {
        this.bosses.spawn(level.id, width);
        this.effects.spawnScorePopup(width / 2, height * 0.3, 'ENGAGE MOTHERSHIP');
        this.setScreen('playing');
      },
      onLevelComplete: (level, scoreBonus) => {
        this.levelCompleteBonus = scoreBonus;
        this.economy.completeLevel(
          level.id,
          scoreBonus,
          this.base.breach,
          this.base.maxBreach,
        );
        if (this.levels.getLevelNumber() >= this.levels.getTotalLevels()) {
          this.campaignComplete = true;
        }
        this.bosses.reset();
        this.effects.spawnScorePopup(
          width / 2,
          height * 0.32,
          `LEVEL CLEAR +${scoreBonus}`,
        );
        this.setScreen('levelComplete');
      },
      onCampaignComplete: () => {
        this.campaignComplete = true;
      },
    });

    this.turret = new Turret(width, height, this.shop.getWeaponStats());
    this.syncLoadout();

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
      screen === 'levelComplete' ||
      screen === 'shop';
    this.loop.setPaused(paused);
  }

  openShop(): void {
    this.setScreen('shop');
  }

  leaveShopAndContinue(): void {
    this.shop.applyBetweenLevelEffects(this.base);
    this.continueToNextLevel();
  }

  purchaseShopItem(itemId: string): void {
    const result = this.shop.purchase(itemId as ShopItemId, this.economy);
    if (result.ok) {
      this.shop.applyNewDefenseBonuses(this.base);
      this.syncLoadout();
    }
    this.emitSnapshot();
  }

  equipShopItem(itemId: string): void {
    const result = this.shop.equip(itemId as ShopItemId);
    if (result.ok) {
      this.syncLoadout();
    }
    this.emitSnapshot();
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
      this.bosses.reset();
      this.setScreen('playing');
    } else {
      this.campaignComplete = true;
      this.setScreen('levelComplete');
    }
  }

  togglePause(): void {
    if (this.screen === 'playing' && this.levels.isGameplayActive()) {
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
    this.bosses.reset();
    this.levels.reset();
    this.shop.reset();
    this.turret = new Turret(
      BALANCING.canvas.width,
      BALANCING.canvas.height,
      this.shop.getWeaponStats(),
    );
    this.syncLoadout();
  }

  private syncLoadout(): void {
    const weapon = this.shop.getWeaponStats();
    this.turret.setWeapon(weapon);
    this.entities.setWeaponStats(weapon);
    const special = this.shop.getSpecialModifiers();
    this.economy.setCreditMultiplier(special.creditMultiplier);
    this.economy.setComboDecayBonus(special.comboDecayBonus);
    const defense = this.shop.getDefenseModifiers();
    this.threats.setDefenseModifiers(
      defense.bombDamageReduction,
      defense.breachRateMultiplier,
    );
  }

  private triggerGameOver(): void {
    this.finalScore = this.economy.score;
    this.gameOverReason = this.base.getDefeatReason();
    this.bosses.reset();
    this.setScreen('gameOver');
    this.addScreenShake(10);
  }

  private update(dt: number): void {
    const passiveScreens: GameScreen[] = [
      'paused',
      'gameOver',
      'levelComplete',
      'shop',
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

    if (this.screen === 'playing' && !this.levels.isGameplayActive()) {
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
      this.economy.recordShotFired();
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

    if (this.levels.isBossFightActive()) {
      this.bosses.update(
        dt,
        this.entities,
        this.base,
        this.effects,
        width,
        height,
      );
    }

    this.collision.process(
      this.entities,
      this.effects,
      this.economy,
      this.bosses,
      {
        onScreenShake: (amount) => this.addScreenShake(amount),
        onHit: () => this.economy.recordShotHit(),
      },
    );
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
      boss: this.bosses.boss,
      effects: this.effects,
      shakeX: this.shakeX,
      shakeY: this.shakeY,
      breachDanger: this.base.isBreachDanger(),
    });
  }

  private emitSnapshot(): void {
    const level = this.levels.getCurrentLevel();
    const phase = this.levels.getPhase();
    const boss = this.bosses.boss;
    const isBossFight = this.levels.isBossFightActive() && this.bosses.isActive();

    this.callbacks.onSnapshot?.({
      score: this.economy.score,
      credits: this.economy.credits,
      level: this.levels.getLevelNumber(),
      wave: this.waves.getWaveNumber(),
      baseHealth: this.base.health,
      maxBaseHealth: this.base.maxHealth,
      breach: this.base.breach,
      maxBreach: this.base.maxBreach,
      combo: this.economy.getCombo(),
      weaponName: this.turret.getWeapon().name,
      heat: this.turret.state.heat,
      maxHeat: this.turret.state.maxHeat,
      secondaryCooldown: 0,
      secondaryMaxCooldown: 1,
      isBossFight,
      bossHealth: boss?.health ?? 0,
      bossMaxHealth: boss?.maxHealth ?? 0,
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
      levelSummary: this.economy.getLastLevelSummary(),
      isCampaignComplete: this.campaignComplete,
      totalLevels: this.levels.getTotalLevels(),
      bossPhase: boss?.phase ?? 0,
      bossShieldActive: boss?.shieldActive ?? false,
      bossName: MOTHERSHIP_BOSS.name,
      showShop: this.screen === 'shop',
      shopItems: this.shop.getShopItems(this.economy.credits),
    });
  }
}
