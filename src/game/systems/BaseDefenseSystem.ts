import { BALANCING } from '../data/balancing';
import type { GameOverReason } from '../types';

export class BaseDefenseSystem {
  health: number;
  breach: number;
  readonly maxHealth: number;
  readonly maxBreach: number;

  constructor() {
    this.maxHealth = BALANCING.base.maxHealth;
    this.maxBreach = BALANCING.base.maxBreach;
    this.health = this.maxHealth;
    this.breach = 0;
  }

  reset(): void {
    this.health = this.maxHealth;
    this.breach = 0;
  }

  applyBombDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage);
  }

  applyBaseDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage);
  }

  addBreach(amount: number): void {
    this.breach = Math.min(this.maxBreach, this.breach + amount);
  }

  isBreachDanger(): boolean {
    return this.breach / this.maxBreach >= BALANCING.base.breachDangerThreshold;
  }

  isDefeated(): boolean {
    return this.health <= 0 || this.breach >= this.maxBreach;
  }

  getDefeatReason(): GameOverReason {
    if (this.breach >= this.maxBreach) return 'breach';
    return 'base_destroyed';
  }
}
