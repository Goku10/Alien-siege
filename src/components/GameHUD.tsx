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
  const hasMagazine = snapshot.magazineSize > 0;
  const magPct = hasMagazine
    ? (snapshot.magazine / snapshot.magazineSize) * 100
    : 0;
  const reloadPct = snapshot.reloading ? snapshot.reloadProgress * 100 : 0;
  const healthLow = healthPct <= 30;
  const breachHigh = snapshot.breachDanger;
  const bossPct =
    snapshot.bossMaxHealth > 0
      ? (snapshot.bossHealth / snapshot.bossMaxHealth) * 100
      : 0;

  return (
    <div className="hud" aria-live="polite">
      {snapshot.isBossFight && (
        <div className="hud__boss-bar" role="meter" aria-label="Boss health">
          <div className="hud__boss-header">
            <span className="hud__boss-name">{snapshot.bossName}</span>
            <span className="hud__boss-phase">
              PHASE {snapshot.bossPhase}
              {snapshot.bossShieldActive && ' · SHIELDED'}
            </span>
          </div>
          <div className="hud__boss-track">
            <div
              className="hud__boss-fill"
              style={{ width: `${bossPct}%` }}
            />
          </div>
          <span className="hud__boss-hp">
            {Math.ceil(snapshot.bossHealth)} / {snapshot.bossMaxHealth}
          </span>
        </div>
      )}

      {snapshot.bombWarning && !snapshot.isBossFight && (
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
          <span className="hud__value hud__value--credits">
            {snapshot.credits.toLocaleString()}
          </span>
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
            {snapshot.isBossFight
              ? 'BOSS'
              : snapshot.wave > 0
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
          <span className="hud__weapon-name hud__weapon-name--equipped">
            {snapshot.weaponName}
            <span className="hud__weapon-kind">{snapshot.weaponKind}</span>
          </span>
          {hasMagazine ? (
            <div className="hud__bar-group hud__bar-group--compact">
              <span className="hud__label">
                {snapshot.reloading ? 'RELOADING' : 'AMMO'}
              </span>
              <span className="hud__bar-value">
                {snapshot.reloading
                  ? `${Math.round(reloadPct)}%`
                  : `${snapshot.magazine}/${snapshot.magazineSize}`}
              </span>
              <div className="hud__bar hud__bar--mag">
                <div
                  className={`hud__bar-fill ${snapshot.reloading ? 'hud__bar-fill--reload' : 'hud__bar-fill--mag'}`}
                  style={{
                    width: `${snapshot.reloading ? reloadPct : magPct}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="hud__bar hud__bar--heat">
              <div
                className="hud__bar-fill hud__bar-fill--heat"
                style={{ width: `${heatPct}%` }}
              />
            </div>
          )}
          {hasMagazine && (
            <div className="hud__bar hud__bar--heat hud__bar--secondary">
              <div
                className="hud__bar-fill hud__bar-fill--heat"
                style={{ width: `${heatPct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
