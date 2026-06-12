import { SHOP_ITEM_MAP, type ShopItemId } from '../data/shopItems';
import type { DefenseEffectField, ShopEffect, SpecialEffectField, WeaponEffectField } from '../data/upgradeEffects';
import { WEAPONS, type WeaponId, type WeaponStats } from '../data/weapons';
import type { DefenseModifiers, SpecialModifiers } from './ShopManager';

export interface ResolvedLoadout {
  weapon: WeaponStats;
  defense: DefenseModifiers;
  special: SpecialModifiers;
}

const DEFAULT_DEFENSE: DefenseModifiers = {
  maxHealthBonus: 0,
  shieldCapacityBonus: 0,
  bombDamageReduction: 0,
  breachRateMultiplier: 1,
};

const DEFAULT_SPECIAL: SpecialModifiers = {
  comboDecayBonus: 0,
  creditMultiplier: 1,
  betweenLevelHeal: 0,
  cooldownReduction: 0,
  reloadSpeedMultiplier: 1,
};

export class LoadoutResolver {
  static resolve(weaponId: WeaponId, purchasedIds: Iterable<ShopItemId>): ResolvedLoadout {
    const weapon: WeaponStats = { ...WEAPONS[weaponId] };
    const defense: DefenseModifiers = { ...DEFAULT_DEFENSE };
    const special: SpecialModifiers = { ...DEFAULT_SPECIAL };

    for (const id of purchasedIds) {
      const item = SHOP_ITEM_MAP[id];
      if (!item || item.category === 'weapons') continue;
      for (const effect of item.effects) {
        this.applyEffect(effect, weapon, defense, special);
      }
    }

    this.finalizeWeapon(weapon, special);
    this.clampDefense(defense);

    return { weapon, defense, special };
  }

  static simulatePurchase(
    weaponId: WeaponId,
    purchasedIds: Iterable<ShopItemId>,
    newItemId: ShopItemId,
  ): ResolvedLoadout {
    const ids = [...purchasedIds];
    if (!ids.includes(newItemId)) ids.push(newItemId);
    return this.resolve(weaponId, ids);
  }

  private static applyEffect(
    effect: ShopEffect,
    weapon: WeaponStats,
    defense: DefenseModifiers,
    special: SpecialModifiers,
  ): void {
    if (effect.type === 'weapon') {
      this.applyWeapon(weapon, effect.field, effect.op, effect.value);
      return;
    }
    if (effect.type === 'defense') {
      this.applyDefense(defense, effect.field, effect.op, effect.value);
      return;
    }
    this.applySpecial(special, effect.field, effect.op, effect.value);
  }

  private static applyWeapon(
    weapon: WeaponStats,
    field: WeaponEffectField,
    op: 'add' | 'multiply',
    value: number,
  ): void {
    if (op === 'add') weapon[field] += value;
    else weapon[field] *= value;
  }

  private static applyDefense(
    defense: DefenseModifiers,
    field: DefenseEffectField,
    op: 'add' | 'multiply',
    value: number,
  ): void {
    if (op === 'add') defense[field] += value;
    else defense[field] *= value;
  }

  private static applySpecial(
    special: SpecialModifiers,
    field: SpecialEffectField,
    op: 'add' | 'multiply',
    value: number,
  ): void {
    if (op === 'add') special[field] += value;
    else special[field] *= value;
  }

  private static finalizeWeapon(weapon: WeaponStats, special: SpecialModifiers): void {
    if (weapon.reloadTime > 0) {
      weapon.reloadTime *= special.reloadSpeedMultiplier;
      weapon.reloadTime *= Math.max(0.5, 1 - special.cooldownReduction);
      weapon.reloadTime = Math.max(0.35, weapon.reloadTime);
    }
    special.cooldownReduction = Math.min(0.35, Math.max(0, special.cooldownReduction));

    weapon.fireRate = Math.max(0.5, weapon.fireRate);
    weapon.damage = Math.max(1, weapon.damage);
    weapon.splashRadius = Math.max(0, weapon.splashRadius);
    weapon.coolRate = Math.max(1, weapon.coolRate);
    weapon.maxHeat = Math.max(20, weapon.maxHeat);
  }

  private static clampDefense(defense: DefenseModifiers): void {
    defense.bombDamageReduction = Math.min(0.75, Math.max(0, defense.bombDamageReduction));
    defense.breachRateMultiplier = Math.max(0.45, defense.breachRateMultiplier);
  }
}
