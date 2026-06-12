import type { ResolvedLoadout } from './LoadoutResolver';
import type { StatPreview } from '../types';

function pushIfChanged(
  deltas: StatPreview[],
  label: string,
  before: number,
  after: number,
  format: (n: number) => string = (n) => String(Math.round(n * 10) / 10),
): void {
  if (Math.abs(before - after) < 0.001) return;
  deltas.push({ label, before: format(before), after: format(after) });
}

export function buildLoadoutStatPreview(
  before: ResolvedLoadout,
  after: ResolvedLoadout,
): StatPreview[] {
  const deltas: StatPreview[] = [];

  pushIfChanged(deltas, 'Damage', before.weapon.damage, after.weapon.damage);
  pushIfChanged(deltas, 'Fire rate', before.weapon.fireRate, after.weapon.fireRate);
  pushIfChanged(deltas, 'Cool rate', before.weapon.coolRate, after.weapon.coolRate);
  pushIfChanged(deltas, 'Max heat', before.weapon.maxHeat, after.weapon.maxHeat);
  pushIfChanged(deltas, 'Splash', before.weapon.splashRadius, after.weapon.splashRadius);
  if (before.weapon.reloadTime > 0 || after.weapon.reloadTime > 0) {
    pushIfChanged(
      deltas,
      'Reload',
      before.weapon.reloadTime,
      after.weapon.reloadTime,
      (n) => `${n.toFixed(2)}s`,
    );
  }

  pushIfChanged(
    deltas,
    'Max HP bonus',
    before.defense.maxHealthBonus,
    after.defense.maxHealthBonus,
    (n) => `+${Math.round(n)}`,
  );
  pushIfChanged(
    deltas,
    'Shield capacity',
    before.defense.shieldCapacityBonus,
    after.defense.shieldCapacityBonus,
    (n) => `+${Math.round(n)}`,
  );

  pushIfChanged(
    deltas,
    'Bomb resist',
    before.defense.bombDamageReduction * 100,
    after.defense.bombDamageReduction * 100,
    (n) => `${Math.round(n)}%`,
  );

  pushIfChanged(
    deltas,
    'Breach resist',
    (1 - before.defense.breachRateMultiplier) * 100,
    (1 - after.defense.breachRateMultiplier) * 100,
    (n) => `${Math.round(n)}%`,
  );

  pushIfChanged(
    deltas,
    'Combo window',
    before.special.comboDecayBonus,
    after.special.comboDecayBonus,
    (n) => `+${n.toFixed(1)}s`,
  );

  pushIfChanged(
    deltas,
    'Credits',
    before.special.creditMultiplier * 100,
    after.special.creditMultiplier * 100,
    (n) => `${Math.round(n)}%`,
  );

  pushIfChanged(
    deltas,
    'Shop heal',
    before.special.betweenLevelHeal,
    after.special.betweenLevelHeal,
    (n) => `+${Math.round(n)} HP`,
  );

  pushIfChanged(
    deltas,
    'Cooldown',
    before.special.cooldownReduction * 100,
    after.special.cooldownReduction * 100,
    (n) => `${Math.round(n)}%`,
  );

  return deltas.slice(0, 5);
}
