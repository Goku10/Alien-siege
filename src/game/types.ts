/** Core game type definitions shared across modules */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameBounds {
  width: number;
  height: number;
}

export type GameScreen =
  | 'title'
  | 'instructions'
  | 'playing'
  | 'paused'
  | 'levelComplete'
  | 'shop'
  | 'bossWarning'
  | 'gameOver';

export interface InputState {
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
  rightMouseDown: boolean;
  space: boolean;
  shift: boolean;
  escape: boolean;
  rotateLeft: boolean;
  rotateRight: boolean;
  confirm: boolean;
}

export interface TurretState {
  x: number;
  y: number;
  angle: number;
  targetAngle: number;
  heat: number;
  maxHeat: number;
  cooling: boolean;
  lastFireTime: number;
}

export interface ProjectileState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  life: number;
  maxLife: number;
  active: boolean;
  trail: Vector2[];
}

export interface MuzzleFlash {
  x: number;
  y: number;
  angle: number;
  life: number;
  maxLife: number;
  active: boolean;
}

export interface GameSnapshot {
  score: number;
  credits: number;
  level: number;
  wave: number;
  baseHealth: number;
  maxBaseHealth: number;
  breach: number;
  maxBreach: number;
  combo: number;
  weaponName: string;
  heat: number;
  maxHeat: number;
  secondaryCooldown: number;
  secondaryMaxCooldown: number;
  isBossFight: boolean;
  bossHealth: number;
  bossMaxHealth: number;
}
