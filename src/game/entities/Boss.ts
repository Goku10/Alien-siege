import { getBossHealthForLevel, MOTHERSHIP_BOSS } from '../data/bossConfig';
import type { BossState, BossWeakPoint } from '../types';

export function createBoss(levelId: number, canvasW: number): BossState {
  const maxHealth = getBossHealthForLevel(levelId);
  const weakPoints: BossWeakPoint[] = MOTHERSHIP_BOSS.weakPoints.map((wp) => ({
    id: wp.id,
    offsetX: wp.offsetX,
    offsetY: wp.offsetY,
    radius: MOTHERSHIP_BOSS.weakPointRadius,
    active: true,
    destroyed: false,
    flashTimer: 0,
  }));

  return {
    active: true,
    x: canvasW / 2,
    y: -120,
    baseX: canvasW / 2,
    movePhase: 0,
    health: maxHealth,
    maxHealth,
    phase: 1,
    shieldActive: false,
    shieldTimer: 0,
    attackTimer: 2.5,
    attackIndex: 0,
    flashTimer: 0,
    enterProgress: 0,
    weakPoints,
    beam: {
      active: false,
      chargeTime: 0,
      maxCharge: 1.6,
      damage: 0,
      targetX: canvasW / 2,
      width: 28,
    },
    defeated: false,
    levelId,
  };
}

export function getBossPhase(healthRatio: number): 1 | 2 | 3 {
  if (healthRatio > 0.67) return 1;
  if (healthRatio > 0.34) return 2;
  return 3;
}

export function damageBoss(boss: BossState, amount: number): void {
  boss.health = Math.max(0, boss.health - amount);
  boss.flashTimer = 0.12;
  boss.phase = getBossPhase(boss.health / boss.maxHealth);
}

export function getWeakPointWorldPos(boss: BossState, wp: BossWeakPoint): { x: number; y: number } {
  return { x: boss.x + wp.offsetX, y: boss.y + wp.offsetY };
}
