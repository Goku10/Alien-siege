import { BALANCING } from '../data/balancing';
import type { GameOverReason } from '../types';

export class BaseDefenseSystem {
  health: number;
  breach: number;
  shield: number;
  readonly baseMaxHealth: number;
  readonly maxBreach: number;
  private maxHealthBonus = 0;
  private shieldCapacityBonus = 0;

  constructor() {
    this.baseMaxHealth = BALANCING.base.maxHealth;
    this.maxBreach = BALANCING.base.maxBreach;
    this.health = this.maxHealth;
    this.shield = 0;
    this.breach = 0;
  }

  get maxHealth(): number {
    return this.baseMaxHealth + this.maxHealthBonus;
  }

  get maxShield(): number {
    return this.shieldCapacityBonus;
  }

  reset(): void {
    this.maxHealthBonus = 0;
    this.shieldCapacityBonus = 0;
    this.health = this.maxHealth;
    this.shield = 0;
    this.breach = 0;
  }

  addMaxHealth(amount: number): void {
    this.maxHealthBonus += amount;
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  addShieldCapacity(amount: number): void {
    this.shieldCapacityBonus += amount;
    this.shield = Math.min(this.maxShield, this.shield + amount);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  applyBombDamage(damage: number, reduction = 0): void {
    this.applyDamage(damage, reduction);
  }

  applyBaseDamage(damage: number): void {
    this.applyDamage(damage, 0);
  }

  private applyDamage(amount: number, reduction: number): void {
    const mitigated = amount * Math.max(0, 1 - reduction);
    let remaining = mitigated;

    if (this.shield > 0 && remaining > 0) {
      const absorbed = Math.min(this.shield, remaining);
      this.shield -= absorbed;
      remaining -= absorbed;
    }

    if (remaining > 0) {
      this.health = Math.max(0, this.health - remaining);
    }
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
