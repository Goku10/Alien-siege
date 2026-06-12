/**
 * Upgrade effect schema — extend fields here when adding new modifier types.
 */

export type WeaponEffectField =
  | 'damage'
  | 'fireRate'
  | 'maxHeat'
  | 'coolRate'
  | 'reloadTime'
  | 'splashRadius'
  | 'projectileSpeed';

export type DefenseEffectField =
  | 'maxHealthBonus'
  | 'shieldCapacityBonus'
  | 'bombDamageReduction'
  | 'breachRateMultiplier';

export type SpecialEffectField =
  | 'comboDecayBonus'
  | 'creditMultiplier'
  | 'betweenLevelHeal'
  | 'cooldownReduction'
  | 'reloadSpeedMultiplier';

export type ShopEffect =
  | { type: 'weapon'; field: WeaponEffectField; op: 'add' | 'multiply'; value: number }
  | { type: 'defense'; field: DefenseEffectField; op: 'add' | 'multiply'; value: number }
  | { type: 'special'; field: SpecialEffectField; op: 'add' | 'multiply'; value: number };

/** When the upgrade takes effect */
export type UpgradeApplyTiming = 'immediate' | 'next_level';

export interface UpgradeTierMeta {
  group: string;
  tier: number;
  maxTier: number;
}
