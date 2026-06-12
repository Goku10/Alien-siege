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

export type EnemyTypeId = 'scout_saucer' | 'drop_carrier' | 'bomber_ship';

export type MovementPattern = 'straight' | 'sine' | 'arc' | 'bob';

export type SpawnSide = 'left' | 'right';

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

export interface EnemyState {
  id: number;
  typeId: EnemyTypeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  radius: number;
  active: boolean;
  side: SpawnSide;
  pattern: MovementPattern;
  patternPhase: number;
  patternAmplitude: number;
  patternFrequency: number;
  baseY: number;
  scoreValue: number;
  flashTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  active: boolean;
}

export interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
  active: boolean;
}

export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  active: boolean;
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
  enemiesRemaining: number;
}
