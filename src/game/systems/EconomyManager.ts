import { BALANCING } from '../data/balancing';

export class EconomyManager {
  score = 0;
  combo = 1;
  private comboTimer = 0;
  private killStreak = 0;

  reset(): void {
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.killStreak = 0;
  }

  update(dt: number): void {
    if (this.comboTimer <= 0) return;
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) {
      this.resetCombo();
    }
  }

  registerKill(baseScore: number): number {
    this.killStreak += 1;
    this.comboTimer = BALANCING.combo.decayTime;

    const step = BALANCING.combo.killsPerStep;
    this.combo = Math.min(
      BALANCING.combo.maxMultiplier,
      1 + Math.floor((this.killStreak - 1) / step),
    );

    const points = Math.floor(baseScore * this.combo);
    this.score += points;
    return points;
  }

  awardWaveClear(bonus: number): number {
    const points = Math.floor(bonus * BALANCING.scoring.waveClearMultiplier);
    this.score += points;
    return points;
  }

  getCombo(): number {
    return this.combo;
  }

  private resetCombo(): void {
    this.combo = 1;
    this.killStreak = 0;
  }
}
