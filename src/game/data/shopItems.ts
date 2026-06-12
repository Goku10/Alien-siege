import type { ShopEffect, UpgradeApplyTiming, UpgradeTierMeta } from './upgradeEffects';
import type { WeaponId } from './weapons';

export type ShopCategory =
  | 'weapons'
  | 'weapon_upgrades'
  | 'defense_upgrades'
  | 'special_systems';

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  weapons: 'Weapons',
  weapon_upgrades: 'Weapon Upgrades',
  defense_upgrades: 'Defense Upgrades',
  special_systems: 'Special Systems',
};

export type ShopItemId =
  | 'weapon_machine_gun'
  | 'weapon_laser_cannon'
  | 'weapon_missile_launcher'
  | 'weapon_flak_cannon'
  | 'weapon_plasma_blaster'
  | 'upgrade_damage_1' | 'upgrade_damage_2' | 'upgrade_damage_3'
  | 'upgrade_fire_rate_1' | 'upgrade_fire_rate_2' | 'upgrade_fire_rate_3'
  | 'upgrade_cooling_1' | 'upgrade_cooling_2' | 'upgrade_cooling_3'
  | 'upgrade_reload_1' | 'upgrade_reload_2'
  | 'upgrade_splash_1' | 'upgrade_splash_2'
  | 'defense_health_1' | 'defense_health_2' | 'defense_health_3'
  | 'defense_breach_1' | 'defense_breach_2' | 'defense_breach_3'
  | 'defense_shock_1' | 'defense_shock_2'
  | 'defense_shield_1' | 'defense_shield_2' | 'defense_shield_3'
  | 'special_combo_1' | 'special_combo_2'
  | 'special_salvage_drone'
  | 'special_repair_1' | 'special_repair_2'
  | 'special_cooldown_1' | 'special_cooldown_2';

export interface ShopItemDefinition {
  id: ShopItemId;
  category: ShopCategory;
  name: string;
  cost: number;
  description: string;
  statEffect: string;
  weaponId?: WeaponId;
  starter?: boolean;
  /** One-time purchase per item id (tier items are separate ids) */
  unique: boolean;
  requires?: ShopItemId[];
  tier?: UpgradeTierMeta;
  applyTiming?: UpgradeApplyTiming;
  effects: ShopEffect[];
}

function tier(
  group: string,
  tierNum: number,
  maxTier: number,
): UpgradeTierMeta {
  return { group, tier: tierNum, maxTier };
}

const WEAPON_ITEMS: ShopItemDefinition[] = [
  {
    id: 'weapon_machine_gun',
    category: 'weapons',
    name: 'Machine Gun',
    cost: 0,
    description: 'Reliable starter weapon with balanced rate of fire.',
    statEffect: '8 dmg · 10 rps',
    weaponId: 'machine_gun',
    starter: true,
    unique: true,
    effects: [],
  },
  {
    id: 'weapon_laser_cannon',
    category: 'weapons',
    name: 'Laser Cannon',
    cost: 200,
    description: 'Piercing beam cuts through several targets per shot.',
    statEffect: '26 dmg · pierce 4 · 2.4 rps',
    weaponId: 'laser_cannon',
    unique: true,
    effects: [],
  },
  {
    id: 'weapon_missile_launcher',
    category: 'weapons',
    name: 'Missile Launcher',
    cost: 280,
    description: 'Single heavy missile with reload and large blast radius.',
    statEffect: '48 dmg · 58 splash · 2.1s reload',
    weaponId: 'missile_launcher',
    unique: true,
    effects: [],
  },
  {
    id: 'weapon_flak_cannon',
    category: 'weapons',
    name: 'Flak Cannon',
    cost: 240,
    description: 'Shrapnel burst shreds swarms; magazine + reload cycle.',
    statEffect: '7×5 dmg · 22 splash · 4 round mag',
    weaponId: 'flak_cannon',
    unique: true,
    effects: [],
  },
  {
    id: 'weapon_plasma_blaster',
    category: 'weapons',
    name: 'Plasma Blaster',
    cost: 190,
    description: 'Balanced energy bolts with splash for clustered targets.',
    statEffect: '15 dmg · 30 splash · 4.2 rps',
    weaponId: 'plasma_blaster',
    unique: true,
    effects: [],
  },
];

const WEAPON_UPGRADES: ShopItemDefinition[] = [
  {
    id: 'upgrade_damage_1',
    category: 'weapon_upgrades',
    name: 'Hardened Rounds I',
    cost: 85,
    description: 'Improved kinetic cores for all equipped weapons.',
    statEffect: '+2 damage',
    unique: true,
    tier: tier('damage', 1, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'weapon', field: 'damage', op: 'add', value: 2 }],
  },
  {
    id: 'upgrade_damage_2',
    category: 'weapon_upgrades',
    name: 'Hardened Rounds II',
    cost: 135,
    description: 'Tungsten-capped rounds punch through thicker armor.',
    statEffect: '+3 damage',
    unique: true,
    requires: ['upgrade_damage_1'],
    tier: tier('damage', 2, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'weapon', field: 'damage', op: 'add', value: 3 }],
  },
  {
    id: 'upgrade_damage_3',
    category: 'weapon_upgrades',
    name: 'Hardened Rounds III',
    cost: 195,
    description: 'Alien-alloy penetrators for maximum impact.',
    statEffect: '+4 damage',
    unique: true,
    requires: ['upgrade_damage_2'],
    tier: tier('damage', 3, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'weapon', field: 'damage', op: 'add', value: 4 }],
  },
  {
    id: 'upgrade_fire_rate_1',
    category: 'weapon_upgrades',
    name: 'Cyclone Feed I',
    cost: 100,
    description: 'Faster ammunition cycle for sustained pressure.',
    statEffect: '+1.5 fire rate',
    unique: true,
    tier: tier('fire_rate', 1, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'weapon', field: 'fireRate', op: 'add', value: 1.5 }],
  },
  {
    id: 'upgrade_fire_rate_2',
    category: 'weapon_upgrades',
    name: 'Cyclone Feed II',
    cost: 155,
    description: 'High-speed feeder assembly.',
    statEffect: '+2 fire rate',
    unique: true,
    requires: ['upgrade_fire_rate_1'],
    tier: tier('fire_rate', 2, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'weapon', field: 'fireRate', op: 'add', value: 2 }],
  },
  {
    id: 'upgrade_fire_rate_3',
    category: 'weapon_upgrades',
    name: 'Cyclone Feed III',
    cost: 220,
    description: 'Overclocked feed — watch heat buildup.',
    statEffect: '+2.5 fire rate',
    unique: true,
    requires: ['upgrade_fire_rate_2'],
    tier: tier('fire_rate', 3, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'weapon', field: 'fireRate', op: 'add', value: 2.5 }],
  },
  {
    id: 'upgrade_cooling_1',
    category: 'weapon_upgrades',
    name: 'Thermal Sink I',
    cost: 80,
    description: 'Better heat dissipation for longer bursts.',
    statEffect: '+10 cool rate · +10 max heat',
    unique: true,
    tier: tier('cooling', 1, 3),
    applyTiming: 'immediate',
    effects: [
      { type: 'weapon', field: 'coolRate', op: 'add', value: 10 },
      { type: 'weapon', field: 'maxHeat', op: 'add', value: 10 },
    ],
  },
  {
    id: 'upgrade_cooling_2',
    category: 'weapon_upgrades',
    name: 'Thermal Sink II',
    cost: 125,
    description: 'Liquid cooling loops around the barrel.',
    statEffect: '+12 cool rate · +12 max heat',
    unique: true,
    requires: ['upgrade_cooling_1'],
    tier: tier('cooling', 2, 3),
    applyTiming: 'immediate',
    effects: [
      { type: 'weapon', field: 'coolRate', op: 'add', value: 12 },
      { type: 'weapon', field: 'maxHeat', op: 'add', value: 12 },
    ],
  },
  {
    id: 'upgrade_cooling_3',
    category: 'weapon_upgrades',
    name: 'Thermal Sink III',
    cost: 175,
    description: 'Cryo vents dump heat almost instantly.',
    statEffect: '+15 cool rate · +15 max heat',
    unique: true,
    requires: ['upgrade_cooling_2'],
    tier: tier('cooling', 3, 3),
    applyTiming: 'immediate',
    effects: [
      { type: 'weapon', field: 'coolRate', op: 'add', value: 15 },
      { type: 'weapon', field: 'maxHeat', op: 'add', value: 15 },
    ],
  },
  {
    id: 'upgrade_reload_1',
    category: 'weapon_upgrades',
    name: 'Quick Loader I',
    cost: 110,
    description: 'Servo-assisted reload for magazine weapons.',
    statEffect: '-10% reload time',
    unique: true,
    tier: tier('reload', 1, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'special', field: 'reloadSpeedMultiplier', op: 'multiply', value: 0.9 }],
  },
  {
    id: 'upgrade_reload_2',
    category: 'weapon_upgrades',
    name: 'Quick Loader II',
    cost: 165,
    description: 'Auto-racking cuts downtime between volleys.',
    statEffect: '-18% reload time',
    unique: true,
    requires: ['upgrade_reload_1'],
    tier: tier('reload', 2, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'special', field: 'reloadSpeedMultiplier', op: 'multiply', value: 0.82 }],
  },
  {
    id: 'upgrade_splash_1',
    category: 'weapon_upgrades',
    name: 'Blast Radius I',
    cost: 120,
    description: 'High-explosive tips widen impact area.',
    statEffect: '+8 splash radius',
    unique: true,
    tier: tier('splash', 1, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'weapon', field: 'splashRadius', op: 'add', value: 8 }],
  },
  {
    id: 'upgrade_splash_2',
    category: 'weapon_upgrades',
    name: 'Blast Radius II',
    cost: 180,
    description: 'Fragmentation sleeves amplify AoE damage.',
    statEffect: '+12 splash radius',
    unique: true,
    requires: ['upgrade_splash_1'],
    tier: tier('splash', 2, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'weapon', field: 'splashRadius', op: 'add', value: 12 }],
  },
];

const DEFENSE_UPGRADES: ShopItemDefinition[] = [
  {
    id: 'defense_health_1',
    category: 'defense_upgrades',
    name: 'Reinforced Plating I',
    cost: 110,
    description: 'Structural bracing for the base perimeter.',
    statEffect: '+20 max base health',
    unique: true,
    tier: tier('health', 1, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'maxHealthBonus', op: 'add', value: 20 }],
  },
  {
    id: 'defense_health_2',
    category: 'defense_upgrades',
    name: 'Reinforced Plating II',
    cost: 160,
    description: 'Composite armor panels.',
    statEffect: '+25 max base health',
    unique: true,
    requires: ['defense_health_1'],
    tier: tier('health', 2, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'maxHealthBonus', op: 'add', value: 25 }],
  },
  {
    id: 'defense_health_3',
    category: 'defense_upgrades',
    name: 'Reinforced Plating III',
    cost: 220,
    description: 'Bunker-grade fortification.',
    statEffect: '+30 max base health',
    unique: true,
    requires: ['defense_health_2'],
    tier: tier('health', 3, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'maxHealthBonus', op: 'add', value: 30 }],
  },
  {
    id: 'defense_breach_1',
    category: 'defense_upgrades',
    name: 'Perimeter Foam I',
    cost: 95,
    description: 'Slows ground units at the breach line.',
    statEffect: '-10% breach fill rate',
    unique: true,
    tier: tier('breach', 1, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'breachRateMultiplier', op: 'multiply', value: 0.9 }],
  },
  {
    id: 'defense_breach_2',
    category: 'defense_upgrades',
    name: 'Perimeter Foam II',
    cost: 140,
    description: 'Expanding sealant retards alien tunneling.',
    statEffect: '-12% breach fill rate',
    unique: true,
    requires: ['defense_breach_1'],
    tier: tier('breach', 2, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'breachRateMultiplier', op: 'multiply', value: 0.88 }],
  },
  {
    id: 'defense_breach_3',
    category: 'defense_upgrades',
    name: 'Perimeter Foam III',
    cost: 190,
    description: 'Full breach-line containment mesh.',
    statEffect: '-15% breach fill rate',
    unique: true,
    requires: ['defense_breach_2'],
    tier: tier('breach', 3, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'breachRateMultiplier', op: 'multiply', value: 0.85 }],
  },
  {
    id: 'defense_shock_1',
    category: 'defense_upgrades',
    name: 'Shock Absorbers I',
    cost: 100,
    description: 'Dampens bomb impact shock.',
    statEffect: '-12% bomb damage',
    unique: true,
    tier: tier('shock', 1, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'bombDamageReduction', op: 'add', value: 0.12 }],
  },
  {
    id: 'defense_shock_2',
    category: 'defense_upgrades',
    name: 'Shock Absorbers II',
    cost: 150,
    description: 'Hydraulic mounts absorb heavy ordnance.',
    statEffect: '-15% bomb damage',
    unique: true,
    requires: ['defense_shock_1'],
    tier: tier('shock', 2, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'bombDamageReduction', op: 'add', value: 0.15 }],
  },
  {
    id: 'defense_shield_1',
    category: 'defense_upgrades',
    name: 'Shield Capacitor I',
    cost: 125,
    description: 'Auxiliary energy shields around the base.',
    statEffect: '+18 shield capacity',
    unique: true,
    tier: tier('shield', 1, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'shieldCapacityBonus', op: 'add', value: 18 }],
  },
  {
    id: 'defense_shield_2',
    category: 'defense_upgrades',
    name: 'Shield Capacitor II',
    cost: 175,
    description: 'Expanded capacitor banks.',
    statEffect: '+22 shield capacity',
    unique: true,
    requires: ['defense_shield_1'],
    tier: tier('shield', 2, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'shieldCapacityBonus', op: 'add', value: 22 }],
  },
  {
    id: 'defense_shield_3',
    category: 'defense_upgrades',
    name: 'Shield Capacitor III',
    cost: 235,
    description: 'Maximum shield lattice output.',
    statEffect: '+28 shield capacity',
    unique: true,
    requires: ['defense_shield_2'],
    tier: tier('shield', 3, 3),
    applyTiming: 'immediate',
    effects: [{ type: 'defense', field: 'shieldCapacityBonus', op: 'add', value: 28 }],
  },
];

const SPECIAL_UPGRADES: ShopItemDefinition[] = [
  {
    id: 'special_combo_1',
    category: 'special_systems',
    name: 'Targeting Computer I',
    cost: 120,
    description: 'Extended kill-chain tracking window.',
    statEffect: '+0.7s combo decay',
    unique: true,
    tier: tier('combo', 1, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'special', field: 'comboDecayBonus', op: 'add', value: 0.7 }],
  },
  {
    id: 'special_combo_2',
    category: 'special_systems',
    name: 'Targeting Computer II',
    cost: 175,
    description: 'Predictive targeting extends combo chains.',
    statEffect: '+0.9s combo decay',
    unique: true,
    requires: ['special_combo_1'],
    tier: tier('combo', 2, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'special', field: 'comboDecayBonus', op: 'add', value: 0.9 }],
  },
  {
    id: 'special_salvage_drone',
    category: 'special_systems',
    name: 'Salvage Drone',
    cost: 125,
    description: 'Recovers extra scrap from destroyed hostiles.',
    statEffect: '+15% credits earned',
    unique: true,
    applyTiming: 'immediate',
    effects: [{ type: 'special', field: 'creditMultiplier', op: 'multiply', value: 1.15 }],
  },
  {
    id: 'special_repair_1',
    category: 'special_systems',
    name: 'Field Repair I',
    cost: 130,
    description: 'Crew patches the base between deployments.',
    statEffect: '+22 HP after each shop',
    unique: true,
    tier: tier('repair', 1, 2),
    applyTiming: 'next_level',
    effects: [{ type: 'special', field: 'betweenLevelHeal', op: 'add', value: 22 }],
  },
  {
    id: 'special_repair_2',
    category: 'special_systems',
    name: 'Field Repair II',
    cost: 185,
    description: 'Mobile repair rigs restore more integrity.',
    statEffect: '+30 HP after each shop',
    unique: true,
    requires: ['special_repair_1'],
    tier: tier('repair', 2, 2),
    applyTiming: 'next_level',
    effects: [{ type: 'special', field: 'betweenLevelHeal', op: 'add', value: 30 }],
  },
  {
    id: 'special_cooldown_1',
    category: 'special_systems',
    name: 'Combat Coolant I',
    cost: 115,
    description: 'Global cooldown reduction for all systems.',
    statEffect: '-8% reload & cooldown',
    unique: true,
    tier: tier('cooldown', 1, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'special', field: 'cooldownReduction', op: 'add', value: 0.08 }],
  },
  {
    id: 'special_cooldown_2',
    category: 'special_systems',
    name: 'Combat Coolant II',
    cost: 170,
    description: 'Cryo injectors speed every weapon cycle.',
    statEffect: '-12% reload & cooldown',
    unique: true,
    requires: ['special_cooldown_1'],
    tier: tier('cooldown', 2, 2),
    applyTiming: 'immediate',
    effects: [{ type: 'special', field: 'cooldownReduction', op: 'add', value: 0.12 }],
  },
];

export const SHOP_ITEMS: ShopItemDefinition[] = [
  ...WEAPON_ITEMS,
  ...WEAPON_UPGRADES,
  ...DEFENSE_UPGRADES,
  ...SPECIAL_UPGRADES,
];

export const SHOP_ITEM_MAP = Object.fromEntries(
  SHOP_ITEMS.map((item) => [item.id, item]),
) as Record<ShopItemId, ShopItemDefinition>;

/** All item ids in a tier group, sorted by tier */
export function getTierChain(group: string): ShopItemDefinition[] {
  return SHOP_ITEMS
    .filter((item) => item.tier?.group === group)
    .sort((a, b) => (a.tier?.tier ?? 0) - (b.tier?.tier ?? 0));
}
