import { BALANCING } from '../data/balancing';
import {
  CREDIT_REWARDS,
  getBossDefeatCredits,
  getLevelCompleteCredits,
  getWaveClearCredits,
} from '../data/credits';
import type { LevelSummary } from '../types';

export interface KillReward {
  score: number;
  credits: number;
  combo: number;
  comboIncreased: boolean;
}

export interface WaveReward {
  score: number;
  credits: number;
}

export class EconomyManager {
  score = 0;
  credits = 0;
  combo = 1;
  private comboTimer = 0;
  private killStreak = 0;

  private levelStartScore = 0;
  private levelStartCredits = 0;
  private levelKills = 0;
  private levelKillCredits = 0;
  private levelWaveCredits = 0;
  private levelBossCredits = 0;
  private levelCompleteCredits = 0;
  private levelScoreBonus = 0;
  private accuracyBonus = 0;
  private breachBonus = 0;
  private shotsFired = 0;
  private shotsHit = 0;
  private lastLevelSummary: LevelSummary | null = null;
  private creditMultiplier = 1;
  private comboDecayBonus = 0;

  reset(): void {
    this.score = 0;
    this.credits = BALANCING.economy.startingCredits;
    this.creditMultiplier = 1;
    this.comboDecayBonus = 0;
    this.resetCombo();
    this.comboTimer = 0;
    this.lastLevelSummary = null;
    this.resetLevelTracking();
  }

  setCreditMultiplier(multiplier: number): void {
    this.creditMultiplier = Math.max(1, multiplier);
  }

  setComboDecayBonus(bonus: number): void {
    this.comboDecayBonus = Math.max(0, bonus);
  }

  spendCredits(amount: number): boolean {
    if (amount <= 0) return true;
    if (this.credits < amount) return false;
    this.credits -= amount;
    return true;
  }

  beginLevel(): void {
    this.resetLevelTracking();
    this.levelStartScore = this.score;
    this.levelStartCredits = this.credits;
    this.resetCombo();
    this.lastLevelSummary = null;
  }

  update(dt: number): void {
    if (this.comboTimer <= 0) return;
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) {
      this.resetCombo();
    }
  }

  recordShotFired(): void {
    this.shotsFired += 1;
  }

  recordShotHit(): void {
    this.shotsHit += 1;
  }

  registerKill(baseScore: number, creditReward: number): KillReward {
    const prevCombo = this.combo;
    this.killStreak += 1;
    this.comboTimer = BALANCING.combo.decayTime + this.comboDecayBonus;

    const step = BALANCING.combo.killsPerStep;
    this.combo = Math.min(
      BALANCING.combo.maxMultiplier,
      1 + Math.floor((this.killStreak - 1) / step),
    );

    const score = Math.floor(baseScore * this.combo);
    const credits = this.grantCredits(creditReward);
    this.score += score;
    this.levelKills += 1;
    this.levelKillCredits += credits;

    return {
      score,
      credits,
      combo: this.combo,
      comboIncreased: this.combo > prevCombo,
    };
  }

  awardBossDefeat(scoreBonus: number, levelId: number): KillReward {
    const credits = this.grantCredits(getBossDefeatCredits(levelId));
    this.score += scoreBonus;
    this.levelBossCredits += credits;
    return { score: scoreBonus, credits, combo: this.combo, comboIncreased: false };
  }

  awardWaveClear(clearBonus: number): WaveReward {
    const score = Math.floor(clearBonus * BALANCING.scoring.waveClearMultiplier);
    const credits = this.grantCredits(getWaveClearCredits(clearBonus));
    this.score += score;
    this.levelWaveCredits += credits;
    return { score, credits };
  }

  completeLevel(
    levelId: number,
    scoreBonus: number,
    breach: number,
    maxBreach: number,
  ): LevelSummary {
    this.levelScoreBonus = scoreBonus;
    this.score += scoreBonus;

    const levelCompleteCredits = this.grantCredits(getLevelCompleteCredits(levelId));
    this.levelCompleteCredits = levelCompleteCredits;

    const accuracyPercent = this.getAccuracyPercent();
    if (
      accuracyPercent !== null &&
      accuracyPercent >= CREDIT_REWARDS.performance.accuracyThreshold
    ) {
      this.accuracyBonus = this.grantCredits(CREDIT_REWARDS.performance.accuracyBonus);
    }

    const breachRatio = maxBreach > 0 ? breach / maxBreach : 0;
    if (breach <= 0) {
      this.breachBonus = this.grantCredits(CREDIT_REWARDS.performance.flawlessBreachBonus);
    } else if (breachRatio <= CREDIT_REWARDS.performance.lowBreachRatio) {
      this.breachBonus = this.grantCredits(CREDIT_REWARDS.performance.lowBreachBonus);
    }

    const summary: LevelSummary = {
      scoreGained: this.score - this.levelStartScore,
      creditsEarned: this.credits - this.levelStartCredits,
      enemiesDestroyed: this.levelKills,
      accuracyPercent,
      bossCreditReward: this.levelBossCredits,
      killCredits: this.levelKillCredits,
      waveCredits: this.levelWaveCredits,
      levelCompleteCredits: this.levelCompleteCredits,
      accuracyBonus: this.accuracyBonus,
      breachBonus: this.breachBonus,
      levelScoreBonus: this.levelScoreBonus,
    };

    this.lastLevelSummary = summary;
    return summary;
  }

  getCombo(): number {
    return this.combo;
  }

  getLastLevelSummary(): LevelSummary | null {
    return this.lastLevelSummary;
  }

  private getAccuracyPercent(): number | null {
    if (this.shotsFired < CREDIT_REWARDS.performance.minShotsForAccuracy) {
      return null;
    }
    return this.shotsHit / this.shotsFired;
  }

  private resetLevelTracking(): void {
    this.levelKills = 0;
    this.levelKillCredits = 0;
    this.levelWaveCredits = 0;
    this.levelBossCredits = 0;
    this.levelCompleteCredits = 0;
    this.levelScoreBonus = 0;
    this.accuracyBonus = 0;
    this.breachBonus = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
  }

  private grantCredits(baseAmount: number): number {
    const credits = Math.floor(baseAmount * this.creditMultiplier);
    this.credits += credits;
    return credits;
  }

  private resetCombo(): void {
    this.combo = 1;
    this.killStreak = 0;
  }
}
