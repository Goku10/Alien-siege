import {
  SHOP_CATEGORY_LABELS,
  SHOP_ITEM_MAP,
  SHOP_ITEMS,
  type ShopItemDefinition,
  type ShopItemId,
} from '../data/shopItems';
import type { WeaponId } from '../data/weapons';
import type { ShopItemState, ShopItemView } from '../types';
import type { BaseDefenseSystem } from './BaseDefenseSystem';
import type { EconomyManager } from './EconomyManager';
import { LoadoutResolver } from './LoadoutResolver';
import { buildLoadoutStatPreview } from './ShopStatPreview';

export interface DefenseModifiers {
  maxHealthBonus: number;
  shieldCapacityBonus: number;
  bombDamageReduction: number;
  breachRateMultiplier: number;
}

export interface SpecialModifiers {
  comboDecayBonus: number;
  creditMultiplier: number;
  betweenLevelHeal: number;
  cooldownReduction: number;
  reloadSpeedMultiplier: number;
}

export type ShopActionResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'already_owned' | 'cannot_afford' | 'locked' | 'not_owned' | 'already_equipped' | 'tier_blocked' };

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

  getOwnedIds(): ShopItemId[] {
    return [...this.owned];
  }

  getWeaponStats() {
    return LoadoutResolver.resolve(this.equippedWeaponId, this.owned).weapon;
  }

  getDefenseModifiers(): DefenseModifiers {
    const { defense } = LoadoutResolver.resolve(this.equippedWeaponId, this.owned);
    return defense;
  }

  getSpecialModifiers(): SpecialModifiers {
    const { special } = LoadoutResolver.resolve(this.equippedWeaponId, this.owned);
    return special;
  }

  getShopItems(credits: number): ShopItemView[] {
    return SHOP_ITEMS.map((item) => this.toView(item, credits));
  }

  purchase(itemId: ShopItemId, economy: EconomyManager): ShopActionResult {
    const item = SHOP_ITEM_MAP[itemId];
    if (!item) return { ok: false, reason: 'not_found' };
    if (this.owned.has(itemId)) return { ok: false, reason: 'already_owned' };
    if (!this.meetsRequirements(item)) return { ok: false, reason: 'locked' };
    if (this.isTierBlocked(item)) return { ok: false, reason: 'tier_blocked' };
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
        if (effect.type !== 'defense' || effect.op !== 'add') continue;
        if (effect.field === 'maxHealthBonus' || effect.field === 'shieldCapacityBonus') {
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
    const tierBlocked = this.isTierBlocked(item);
    const equipped = Boolean(item.weaponId && this.equippedWeaponId === item.weaponId);
    const isMaxTier = Boolean(item.tier && owned && item.tier.tier === item.tier.maxTier);

    const canBuyWeapon =
      Boolean(item.weaponId) &&
      !owned &&
      !locked &&
      item.cost > 0 &&
      credits >= item.cost;

    const canBuyUpgrade =
      !item.weaponId &&
      !owned &&
      !locked &&
      !tierBlocked &&
      item.cost > 0 &&
      credits >= item.cost;

    const canEquip = Boolean(item.weaponId && owned && !equipped);

    let state: ShopItemState;
    if (equipped) state = 'equipped';
    else if (owned && isMaxTier) state = 'maxed';
    else if (owned) state = 'owned';
    else if (locked || tierBlocked) state = 'locked';
    else if ((item.weaponId ? canBuyWeapon : canBuyUpgrade)) state = 'affordable';
    else if (item.cost > 0) state = 'unaffordable';
    else state = 'affordable';

    const before = LoadoutResolver.resolve(this.equippedWeaponId, this.owned);
    let statPreview: import('../types').StatPreview[] = [];
    if (canBuyUpgrade) {
      const after = LoadoutResolver.simulatePurchase(
        this.equippedWeaponId,
        this.owned,
        item.id,
      );
      statPreview = buildLoadoutStatPreview(before, after);
    } else if (canBuyWeapon && item.weaponId) {
      const after = LoadoutResolver.resolve(item.weaponId, this.owned);
      statPreview = buildLoadoutStatPreview(before, after);
    }

    return {
      id: item.id,
      category: item.category,
      categoryLabel: SHOP_CATEGORY_LABELS[item.category],
      name: item.name,
      cost: item.cost,
      description: item.description,
      statEffect: item.statEffect,
      tierLabel: item.tier ? `Tier ${item.tier.tier}/${item.tier.maxTier}` : undefined,
      applyTiming: item.applyTiming,
      state,
      canBuy: canBuyWeapon || canBuyUpgrade,
      canEquip,
      statPreview,
    };
  }

  private meetsRequirements(item: ShopItemDefinition): boolean {
    if (!item.requires?.length) return true;
    return item.requires.every((id) => this.owned.has(id));
  }

  /** Block buying a lower tier when a higher tier in the same group is already owned */
  private isTierBlocked(item: ShopItemDefinition): boolean {
    if (!item.tier) return false;
    for (const ownedId of this.owned) {
      const ownedItem = SHOP_ITEM_MAP[ownedId];
      if (
        ownedItem?.tier?.group === item.tier.group &&
        ownedItem.tier.tier > item.tier.tier
      ) {
        return true;
      }
    }
    return false;
  }
}
