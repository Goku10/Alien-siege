import { BALANCING } from '../data/balancing';
import { getScalingForLevel, type LevelScaling } from '../data/levelScaling';
import { LEVELS, type LevelConfig } from '../data/levels';

export type LevelPhase =
  | 'intro'
  | 'combat'
  | 'bossWarning'
  | 'bossFight'
  | 'levelComplete'
  | 'campaignComplete';

export interface LevelManagerCallbacks {
  onLevelIntro?: (level: LevelConfig) => void;
  onCombatStart?: (level: LevelConfig) => void;
  onBossWarning?: (level: LevelConfig) => void;
  onBossFightStart?: (level: LevelConfig) => void;
  onLevelComplete?: (level: LevelConfig, bonus: number) => void;
  onCampaignComplete?: () => void;
}

export class LevelManager {
  private levelIndex = 0;
  private phase: LevelPhase = 'intro';
  private phaseTimer = 0;
  private callbacks: LevelManagerCallbacks;
  private lastLevelBonus = 0;

  constructor(callbacks: LevelManagerCallbacks = {}) {
    this.callbacks = callbacks;
  }

  reset(skipIntro = false): void {
    this.levelIndex = 0;
    this.phase = 'intro';
    this.phaseTimer = BALANCING.levels.introDuration;
    this.lastLevelBonus = 0;
    if (!skipIntro) {
      this.callbacks.onLevelIntro?.(this.getCurrentLevel());
    }
  }

  getPhase(): LevelPhase {
    return this.phase;
  }

  getLevelNumber(): number {
    return this.levelIndex + 1;
  }

  getCurrentLevel(): LevelConfig {
    return LEVELS[this.levelIndex] ?? LEVELS[LEVELS.length - 1];
  }

  getScaling(): LevelScaling {
    return getScalingForLevel(this.getCurrentLevel().id);
  }

  getTotalLevels(): number {
    return LEVELS.length;
  }

  getLastLevelBonus(): number {
    return this.lastLevelBonus;
  }

  isCombatActive(): boolean {
    return this.phase === 'combat';
  }

  isBossFightActive(): boolean {
    return this.phase === 'bossFight';
  }

  isGameplayActive(): boolean {
    return this.phase === 'combat' || this.phase === 'bossFight';
  }

  /** Advance from level complete to next level or campaign end. */
  continueAfterLevel(): boolean {
    if (this.phase !== 'levelComplete') return false;

    this.levelIndex += 1;
    if (this.levelIndex >= LEVELS.length) {
      this.phase = 'campaignComplete';
      this.callbacks.onCampaignComplete?.();
      return false;
    }

    this.phase = 'intro';
    this.phaseTimer = BALANCING.levels.introDuration;
    this.callbacks.onLevelIntro?.(this.getCurrentLevel());
    return true;
  }

  /** Called by WaveManager when all waves in the level are cleared. */
  onAllWavesComplete(): void {
    if (this.phase !== 'combat') return;
    this.phase = 'bossWarning';
    this.phaseTimer = BALANCING.levels.bossWarningDuration;
    this.callbacks.onBossWarning?.(this.getCurrentLevel());
  }

  /** Boss warning timer expired — begin mothership fight. */
  finishBossWarning(): void {
    if (this.phase !== 'bossWarning') return;
    this.phase = 'bossFight';
    this.callbacks.onBossFightStart?.(this.getCurrentLevel());
  }

  /** Called when mothership is destroyed. */
  onBossDefeated(): void {
    if (this.phase !== 'bossFight') return;
    const level = this.getCurrentLevel();
    this.lastLevelBonus = Math.floor(
      level.levelCompleteBonus * getScalingForLevel(level.id).clearBonusScale,
    );
    this.phase = 'levelComplete';
    this.callbacks.onLevelComplete?.(level, this.lastLevelBonus);
  }

  update(dt: number): void {
    if (this.phase === 'intro') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.phase = 'combat';
        this.callbacks.onCombatStart?.(this.getCurrentLevel());
      }
      return;
    }

    if (this.phase === 'bossWarning') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.finishBossWarning();
      }
    }
  }
}
