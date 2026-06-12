import {
  SHOP_CATEGORY_LABELS,
  SHOP_ITEM_MAP,
  SHOP_ITEMS,
  type ShopCategory,
  type ShopItemDefinition,
  type ShopItemId,
} from '../data/shopItems';
import { WEAPONS, type WeaponId, type WeaponStats } from '../data/weapons';
import type { ShopItemState, ShopItemView } from '../types';
import type { BaseDefenseSystem } from './BaseDefenseSystem';
import type { EconomyManager } from './EconomyManager';

export interface DefenseModifiers {
  maxHealthBonus: number;
  bombDamageReduction: number;
  breachRateMultiplier: number;
}

export interface SpecialModifiers {
  comboDecayBonus: number;
  creditMultiplier: number;
  betweenLevelHeal: number;
}

export type ShopActionResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'already_owned' | 'cannot_afford' | 'locked' | 'not_owned' | 'already_equipped' };

export class ShopManager {
  private owned = new Set<ShopItemId>();
  private equippedWeaponId: WeaponId = 'machine_gun';
  private appliedDefenseBonuses = new Set<ShopItemId>();

  constructor() {
    this.reset();
  }

  reset(): void {
    this.owned.clear();
    this.equippedWeaponId = 'machine_gun';
    this.appliedDefenseBonuses.clear();
    for (const item of SHOP_ITEMS) {
      if (item.starter) this.owned.add(item.id);
    }
  }

  getEquippedWeaponId(): WeaponId {
    return this.equippedWeaponId;
  }

  getWeaponStats(): WeaponStats {
    const base = { ...WEAPONS[this.equippedWeaponId] };
    for (const itemId of this.owned) {
      const item = SHOP_ITEM_MAP[itemId];
      if (!item || item.category !== 'weapon_upgrades') continue;
      for (const effect of item.effects) {
        if (effect.type !== 'weapon' || effect.op !== 'add') continue;
        base[effect.field] += effect.value;
      }
    }
    return base;
  }

  getDefenseModifiers(): DefenseModifiers {
    const mods: DefenseModifiers = {
      maxHealthBonus: 0,
      bombDamageReduction: 0,
      breachRateMultiplier: 1,
    };
    for (const itemId of this.owned) {
      const item = SHOP_ITEM_MAP[itemId];
      if (!item || item.category !== 'defense_upgrades') continue;
      this.applyDefenseEffects(mods, item.effects);
    }
    return mods;
  }

  getSpecialModifiers(): SpecialModifiers {
    const mods: SpecialModifiers = {
      comboDecayBonus: 0,
      creditMultiplier: 1,
      betweenLevelHeal: 0,
    };
    for (const itemId of this.owned) {
      const item = SHOP_ITEM_MAP[itemId];
      if (!item || item.category !== 'special_systems') continue;
      for (const effect of item.effects) {
        if (effect.type !== 'special') continue;
        if (effect.op === 'add') {
          mods[effect.field] += effect.value;
        } else {
          mods[effect.field] *= effect.value;
        }
      }
    }
    return mods;
  }

  getShopItems(credits: number): ShopItemView[] {
    return SHOP_ITEMS.map((item) => this.toView(item, credits));
  }

  getShopItemsByCategory(credits: number): Record<ShopCategory, ShopItemView[]> {
    const grouped: Record<ShopCategory, ShopItemView[]> = {
      weapons: [],
      weapon_upgrades: [],
      defense_upgrades: [],
      special_systems: [],
    };
    for (const item of this.getShopItems(credits)) {
      grouped[item.category].push(item);
    }
    return grouped;
  }

  purchase(itemId: ShopItemId, economy: EconomyManager): ShopActionResult {
    const item = SHOP_ITEM_MAP[itemId];
    if (!item) return { ok: false, reason: 'not_found' };
    if (item.unique && this.owned.has(itemId)) return { ok: false, reason: 'already_owned' };
    if (!this.meetsRequirements(item)) return { ok: false, reason: 'locked' };
    if (item.cost > 0 && !economy.spendCredits(item.cost)) {
      return { ok: false, reason: 'cannot_afford' };
    }

    this.owned.add(itemId);
    if (item.weaponId) {
      this.equippedWeaponId = item.weaponId;
    }
    return { ok: true };
  }

  equip(itemId: ShopItemId): ShopActionResult {
    const item = SHOP_ITEM_MAP[itemId];
    if (!item?.weaponId) return { ok: false, reason: 'not_found' };
    if (!this.owned.has(itemId)) return { ok: false, reason: 'not_owned' };
    if (this.equippedWeaponId === item.weaponId) {
      return { ok: false, reason: 'already_equipped' };
    }
    this.equippedWeaponId = item.weaponId;
    return { ok: true };
  }

  applyNewDefenseBonuses(base: BaseDefenseSystem): void {
    for (const itemId of this.owned) {
      if (this.appliedDefenseBonuses.has(itemId)) continue;
      const item = SHOP_ITEM_MAP[itemId];
      if (!item || item.category !== 'defense_upgrades') continue;
      for (const effect of item.effects) {
        if (effect.type === 'defense' && effect.field === 'maxHealthBonus' && effect.op === 'add') {
          base.addMaxHealth(effect.value);
        }
      }
      this.appliedDefenseBonuses.add(itemId);
    }
  }

  applyBetweenLevelEffects(base: BaseDefenseSystem): void {
    const heal = this.getSpecialModifiers().betweenLevelHeal;
    if (heal > 0) base.heal(heal);
  }

  private toView(item: ShopItemDefinition, credits: number): ShopItemView {
    const owned = this.owned.has(item.id);
    const locked = !this.meetsRequirements(item);
    const equipped = Boolean(item.weaponId && this.equippedWeaponId === item.weaponId);
    const affordable = !locked && (!item.unique || !owned) && credits >= item.cost;

    let state: ShopItemState;
    if (equipped) state = 'equipped';
    else if (owned && item.unique) state = 'owned';
    else if (locked) state = 'locked';
    else if (affordable || item.cost === 0) state = 'affordable';
    else state = 'unaffordable';

    const canBuy = !owned && !locked && item.cost > 0 && credits >= item.cost;
    const canEquip = Boolean(item.weaponId && owned && !equipped);

    return {
      id: item.id,
      category: item.category,
      categoryLabel: SHOP_CATEGORY_LABELS[item.category],
      name: item.name,
      cost: item.cost,
      description: item.description,
      statEffect: item.statEffect,
      state,
      canBuy,
      canEquip,
    };
  }

  private meetsRequirements(item: ShopItemDefinition): boolean {
    if (!item.requires?.length) return true;
    return item.requires.every((id) => this.owned.has(id));
  }

  private applyDefenseEffects(
    mods: DefenseModifiers,
    effects: ShopItemDefinition['effects'],
  ): void {
    for (const effect of effects) {
      if (effect.type !== 'defense') continue;
      if (effect.op === 'add') {
        mods[effect.field] += effect.value;
      } else {
        mods[effect.field] *= effect.value;
      }
    }
  }
}
