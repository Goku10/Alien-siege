import { BALANCING } from '../data/balancing';
import type { GameOverReason } from '../types';

export class BaseDefenseSystem {
  health: number;
  breach: number;
  readonly baseMaxHealth: number;
  readonly maxBreach: number;
  private maxHealthBonus = 0;

  constructor() {
    this.baseMaxHealth = BALANCING.base.maxHealth;
    this.maxBreach = BALANCING.base.maxBreach;
    this.health = this.maxHealth;
    this.breach = 0;
  }

  get maxHealth(): number {
    return this.baseMaxHealth + this.maxHealthBonus;
  }

  reset(): void {
    this.maxHealthBonus = 0;
    this.health = this.maxHealth;
    this.breach = 0;
  }

  addMaxHealth(amount: number): void {
    this.maxHealthBonus += amount;
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  applyBombDamage(damage: number, reduction = 0): void {
    const mitigated = damage * Math.max(0, 1 - reduction);
    this.health = Math.max(0, this.health - mitigated);
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
