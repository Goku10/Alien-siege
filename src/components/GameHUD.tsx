import type { GameSnapshot } from '../game/types';

interface GameHUDProps {
  snapshot: GameSnapshot;
  visible: boolean;
}

export function GameHUD({ snapshot, visible }: GameHUDProps) {
  if (!visible) return null;

  const healthPct = (snapshot.baseHealth / snapshot.maxBaseHealth) * 100;
  const breachPct = (snapshot.breach / snapshot.maxBreach) * 100;
  const heatPct = (snapshot.heat / snapshot.maxHeat) * 100;
  const healthLow = healthPct <= 30;
  const breachHigh = snapshot.breachDanger;

  return (
    <div className="hud" aria-live="polite">
      {snapshot.bombWarning && (
        <div className="hud__alert hud__alert--bomb" role="alert">
          INCOMING BOMB — SHOOT IT DOWN!
        </div>
      )}
      {breachHigh && (
        <div className="hud__alert hud__alert--breach" role="alert">
          BREACH CRITICAL — STOP GROUND THREATS!
        </div>
      )}

      <div className="hud__top">
        <div className="hud__stat">
          <span className="hud__label">SCORE</span>
          <span className="hud__value">{snapshot.score.toLocaleString()}</span>
        </div>
        <div className="hud__stat">
          <span className="hud__label">CREDITS</span>
          <span className="hud__value hud__value--credits">{snapshot.credits}</span>
        </div>
        <div className="hud__stat hud__stat--level">
          <span className="hud__label">LEVEL</span>
          <span className="hud__value">
            {snapshot.level}/{snapshot.totalLevels}
          </span>
        </div>
        <div className="hud__stat hud__stat--wave">
          <span className="hud__label">WAVE</span>
          <span className="hud__value">
            {snapshot.wave > 0
              ? `${snapshot.wave}/${snapshot.totalWavesInLevel}`
              : '—'}
          </span>
        </div>
        {snapshot.combo > 1 && (
          <div className="hud__stat hud__stat--combo">
            <span className="hud__label">COMBO</span>
            <span className="hud__value hud__value--combo">×{snapshot.combo}</span>
          </div>
        )}
      </div>

      <div className="hud__bottom">
        <div className={`hud__bar-group ${healthLow ? 'hud__bar-group--danger' : ''}`}>
          <span className="hud__label">BASE HEALTH</span>
          <span className="hud__bar-value">{Math.ceil(snapshot.baseHealth)}</span>
          <div className="hud__bar">
            <div
              className="hud__bar-fill hud__bar-fill--health"
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>

        <div className={`hud__bar-group ${breachHigh ? 'hud__bar-group--danger' : ''}`}>
          <span className="hud__label">BREACH</span>
          <span className="hud__bar-value">{Math.ceil(snapshot.breach)}%</span>
          <div className="hud__bar">
            <div
              className="hud__bar-fill hud__bar-fill--breach"
              style={{ width: `${breachPct}%` }}
            />
          </div>
        </div>

        <div className="hud__weapon">
          <span className="hud__label">WEAPON</span>
          <span className="hud__weapon-name">{snapshot.weaponName}</span>
          <div className="hud__bar hud__bar--heat">
            <div
              className="hud__bar-fill hud__bar-fill--heat"
              style={{ width: `${heatPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
