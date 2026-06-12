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
  | 'weapon_plasma_rifle'
  | 'weapon_scatter_cannon'
  | 'upgrade_hardened_rounds'
  | 'upgrade_cyclone_feed'
  | 'upgrade_thermal_sink'
  | 'defense_reinforced_plating'
  | 'defense_shock_absorbers'
  | 'defense_perimeter_foam'
  | 'special_targeting_computer'
  | 'special_salvage_drone'
  | 'special_emergency_repairs';

export interface ShopItemDefinition {
  id: ShopItemId;
  category: ShopCategory;
  name: string;
  cost: number;
  description: string;
  statEffect: string;
  /** Grants a weapon loadout swap */
  weaponId?: WeaponId;
  /** Starts owned at run start (starter gear) */
  starter?: boolean;
  /** Only purchasable once */
  unique: boolean;
  requires?: ShopItemId[];
  effects: ShopEffect[];
}

export type ShopEffect =
  | { type: 'weapon'; field: 'damage' | 'fireRate' | 'maxHeat' | 'coolRate'; op: 'add'; value: number }
  | { type: 'defense'; field: 'maxHealthBonus' | 'bombDamageReduction' | 'breachRateMultiplier'; op: 'add' | 'multiply'; value: number }
  | { type: 'special'; field: 'comboDecayBonus' | 'creditMultiplier' | 'betweenLevelHeal'; op: 'add' | 'multiply'; value: number };

export const SHOP_ITEMS: ShopItemDefinition[] = [
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
    id: 'weapon_plasma_rifle',
    category: 'weapons',
    name: 'Plasma Rifle',
    cost: 180,
    description: 'Heavy energy bolts that punch through armored flyers.',
    statEffect: '14 dmg · 6.5 rps',
    weaponId: 'plasma_rifle',
    unique: true,
    effects: [],
  },
  {
    id: 'weapon_scatter_cannon',
    category: 'weapons',
    name: 'Scatter Cannon',
    cost: 220,
    description: 'Rapid-fire spread ideal for swarms and pods.',
    statEffect: '5 dmg · 14 rps',
    weaponId: 'scatter_cannon',
    unique: true,
    effects: [],
  },
  {
    id: 'upgrade_hardened_rounds',
    category: 'weapon_upgrades',
    name: 'Hardened Rounds',
    cost: 95,
    description: 'Ammunition tuned for thicker alien hull plating.',
    statEffect: '+2 projectile damage',
    unique: true,
    effects: [{ type: 'weapon', field: 'damage', op: 'add', value: 2 }],
  },
  {
    id: 'upgrade_cyclone_feed',
    category: 'weapon_upgrades',
    name: 'Cyclone Feed',
    cost: 120,
    description: 'Faster belt cycle keeps pressure on incoming waves.',
    statEffect: '+2 shots per second',
    unique: true,
    effects: [{ type: 'weapon', field: 'fireRate', op: 'add', value: 2 }],
  },
  {
    id: 'upgrade_thermal_sink',
    category: 'weapon_upgrades',
    name: 'Thermal Sink',
    cost: 85,
    description: 'Dissipates barrel heat for longer sustained fire.',
    statEffect: '+15 max heat · +10 cool rate',
    unique: true,
    effects: [
      { type: 'weapon', field: 'maxHeat', op: 'add', value: 15 },
      { type: 'weapon', field: 'coolRate', op: 'add', value: 10 },
    ],
  },
  {
    id: 'defense_reinforced_plating',
    category: 'defense_upgrades',
    name: 'Reinforced Plating',
    cost: 130,
    description: 'Bolsters base shielding against bomb impacts.',
    statEffect: '+25 max base health',
    unique: true,
    effects: [{ type: 'defense', field: 'maxHealthBonus', op: 'add', value: 25 }],
  },
  {
    id: 'defense_shock_absorbers',
    category: 'defense_upgrades',
    name: 'Shock Absorbers',
    cost: 100,
    description: 'Dampens kinetic shock from direct bomb hits.',
    statEffect: '-20% bomb damage taken',
    unique: true,
    effects: [{ type: 'defense', field: 'bombDamageReduction', op: 'add', value: 0.2 }],
  },
  {
    id: 'defense_perimeter_foam',
    category: 'defense_upgrades',
    name: 'Perimeter Foam',
    cost: 110,
    description: 'Slows ground units chewing through the breach line.',
    statEffect: '-15% ground breach rate',
    unique: true,
    effects: [{ type: 'defense', field: 'breachRateMultiplier', op: 'multiply', value: 0.85 }],
  },
  {
    id: 'special_targeting_computer',
    category: 'special_systems',
    name: 'Targeting Computer',
    cost: 140,
    description: 'Tracks kill chains longer for higher combo windows.',
    statEffect: '+1.0s combo decay time',
    unique: true,
    effects: [{ type: 'special', field: 'comboDecayBonus', op: 'add', value: 1.0 }],
  },
  {
    id: 'special_salvage_drone',
    category: 'special_systems',
    name: 'Salvage Drone',
    cost: 125,
    description: 'Recovers extra scrap from destroyed hostiles.',
    statEffect: '+15% credits earned',
    unique: true,
    effects: [{ type: 'special', field: 'creditMultiplier', op: 'multiply', value: 1.15 }],
  },
  {
    id: 'special_emergency_repairs',
    category: 'special_systems',
    name: 'Emergency Repairs',
    cost: 150,
    description: 'Field crew patches the base between deployments.',
    statEffect: '+30 base health after each shop visit',
    unique: true,
    effects: [{ type: 'special', field: 'betweenLevelHeal', op: 'add', value: 30 }],
  },
];

export const SHOP_ITEM_MAP = Object.fromEntries(
  SHOP_ITEMS.map((item) => [item.id, item]),
) as Record<ShopItemId, ShopItemDefinition>;
