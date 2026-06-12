import type { GameSnapshot, ShopCategory, ShopItemView } from '../game/types';

interface ShopScreenProps {
  snapshot: GameSnapshot;
  onContinue: () => void;
  onBuy: (itemId: string) => void;
  onEquip: (itemId: string) => void;
}

const CATEGORY_ORDER: ShopCategory[] = [
  'weapons',
  'weapon_upgrades',
  'defense_upgrades',
  'special_systems',
];

function groupItems(items: ShopItemView[]): Record<ShopCategory, ShopItemView[]> {
  const grouped: Record<ShopCategory, ShopItemView[]> = {
    weapons: [],
    weapon_upgrades: [],
    defense_upgrades: [],
    special_systems: [],
  };
  for (const item of items) {
    grouped[item.category].push(item);
  }
  return grouped;
}

function buttonLabel(item: ShopItemView): string {
  if (item.canEquip) return 'Equip';
  if (item.canBuy) return `Buy · ${item.cost} CR`;
  switch (item.state) {
    case 'equipped':
      return 'Equipped';
    case 'owned':
      return 'Owned';
    case 'unaffordable':
      return 'Not enough credits';
    case 'locked':
      return 'Locked';
    default:
      return 'Unavailable';
  }
}

export function ShopScreen({ snapshot, onContinue, onBuy, onEquip }: ShopScreenProps) {
  const grouped = groupItems(snapshot.shopItems);

  return (
    <div className="overlay overlay--shop">
      <div className="panel panel--shop">
        <div className="shop__header">
          <div>
            <p className="panel__eyebrow">Between Levels</p>
            <h2>Armory Shop</h2>
            <p className="panel__reason">
              Spend credits on weapons and upgrades before the next assault.
            </p>
          </div>
          <div className="shop__credits">
            <span className="hud__label">CREDITS</span>
            <span className="shop__credits-value">{snapshot.credits.toLocaleString()}</span>
          </div>
        </div>

        <div className="shop__sections">
          {CATEGORY_ORDER.map((category) => {
            const items = grouped[category];
            if (items.length === 0) return null;
            return (
              <section key={category} className="shop__section">
                <h3 className="shop__section-title">{items[0].categoryLabel}</h3>
                <div className="shop__grid">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className={`shop-card shop-card--${item.state}`}
                    >
                      <div className="shop-card__header">
                        <h4 className="shop-card__name">{item.name}</h4>
                        {item.cost > 0 && (
                          <span className="shop-card__cost">{item.cost} CR</span>
                        )}
                      </div>
                      <p className="shop-card__desc">{item.description}</p>
                      <p className="shop-card__stat">{item.statEffect}</p>
                      <button
                        type="button"
                        className={`btn shop-card__btn shop-card__btn--${item.state}`}
                        disabled={!item.canBuy && !item.canEquip}
                        onClick={() => {
                          if (item.canBuy) onBuy(item.id);
                          else if (item.canEquip) onEquip(item.id);
                        }}
                      >
                        {buttonLabel(item)}
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="panel__actions shop__actions">
          <button type="button" className="btn btn--primary" onClick={onContinue}>
            Deploy Next Level
          </button>
        </div>
      </div>
    </div>
  );
}
