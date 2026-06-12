import { BALANCING } from '../data/balancing';
import type { KillReward } from './EconomyManager';
import type { EffectsManager } from './EffectsManager';
import type { CollisionCallbacks } from './CollisionSystem';

export interface KillFeedbackOptions {
  x: number;
  y: number;
  reward: KillReward;
  accentColor: string;
  radius: number;
  large?: boolean;
  shakeOnDeath?: number;
}

export function applyKillFeedback(
  effects: EffectsManager,
  callbacks: CollisionCallbacks,
  options: KillFeedbackOptions,
): void {
  const { x, y, reward, accentColor, radius, large = false, shakeOnDeath = 0 } = options;
  effects.spawnKillFeedback(
    x,
    y,
    reward.score,
    reward.credits,
    reward.combo,
    reward.comboIncreased,
    accentColor,
    radius,
    large,
  );
  if (shakeOnDeath > 0) {
    callbacks.onScreenShake?.(shakeOnDeath);
  }
}

export function splashDamageAt(distance: number, radius: number, baseDamage: number): number {
  if (radius <= 0) return 0;
  const t = Math.min(1, distance / radius);
  const falloff = BALANCING.combat.splashDamageFalloff;
  return Math.max(1, Math.floor(baseDamage * (1 - t * falloff)));
}

export function isHeavyTarget(maxHealth: number): boolean {
  return maxHealth >= BALANCING.effects.heavyHitHealthThreshold;
}
