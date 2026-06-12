import { BALANCING } from '../data/balancing';

export interface BaseLayout {
  centerX: number;
  baseX: number;
  baseY: number;
  baseW: number;
  baseH: number;
  groundY: number;
  walkY: number;
  breachHalfWidth: number;
}

export function getBaseLayout(canvasW: number, canvasH: number): BaseLayout {
  const baseW = BALANCING.base.width;
  const baseH = BALANCING.base.height;
  const baseY = canvasH - baseH - BALANCING.base.offsetFromBottom;
  const centerX = canvasW / 2;
  const groundY = baseY + baseH;

  return {
    centerX,
    baseX: centerX - baseW / 2,
    baseY,
    baseW,
    baseH,
    groundY,
    walkY: groundY - 12,
    breachHalfWidth: baseW / 2 + 30,
  };
}

export function isInBreachZone(x: number, layout: BaseLayout): boolean {
  return Math.abs(x - layout.centerX) <= layout.breachHalfWidth * 0.55;
}
