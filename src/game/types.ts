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

export type GroundEnemyTypeId = 'crawler' | 'spitter' | 'leaper';

export type GroundEnemyBehavior = 'approaching' | 'breaching' | 'attacking';

export type GameOverReason = 'breach' | 'base_destroyed';

export type BossAttackId = 'drones' | 'bombSpread' | 'beam' | 'shield';

export interface BossWeakPoint {
  id: string;
  offsetX: number;
  offsetY: number;
  radius: number;
  active: boolean;
  destroyed: boolean;
  flashTimer: number;
}

export interface BossBeam {
  active: boolean;
  chargeTime: number;
  maxCharge: number;
  damage: number;
  targetX: number;
  width: number;
}

export interface BossState {
  active: boolean;
  x: number;
  y: number;
  baseX: number;
  movePhase: number;
  health: number;
  maxHealth: number;
  phase: 1 | 2 | 3;
  shieldActive: boolean;
  shieldTimer: number;
  attackTimer: number;
  attackIndex: number;
  flashTimer: number;
  enterProgress: number;
  weakPoints: BossWeakPoint[];
  beam: BossBeam;
  defeated: boolean;
  levelId: number;
}

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
  dropTimer: number;
  dropsReleased: number;
}

export interface BombState {
  id: number;
  x: number;
  y: number;
  vy: number;
  radius: number;
  health: number;
  maxHealth: number;
  damage: number;
  scoreValue: number;
  active: boolean;
  flashTimer: number;
}

export interface DropPodState {
  id: number;
  x: number;
  y: number;
  vy: number;
  radius: number;
  health: number;
  maxHealth: number;
  scoreValue: number;
  payload: GroundEnemyTypeId;
  active: boolean;
  flashTimer: number;
}

export interface GroundEnemyState {
  id: number;
  typeId: GroundEnemyTypeId;
  x: number;
  y: number;
  vx: number;
  health: number;
  maxHealth: number;
  radius: number;
  active: boolean;
  flashTimer: number;
  scoreValue: number;
  breachRate: number;
  breachBurst: number;
  attackDamage: number;
  attackInterval: number;
  attackRange: number;
  attackTimer: number;
  breachContributed: number;
  behavior: GroundEnemyBehavior;
  leapTimer: number;
  leapDuration: number;
  targetX: number;
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

export type ShopItemState =
  | 'equipped'
  | 'owned'
  | 'affordable'
  | 'unaffordable'
  | 'locked';

export type ShopCategory =
  | 'weapons'
  | 'weapon_upgrades'
  | 'defense_upgrades'
  | 'special_systems';

export interface ShopItemView {
  id: string;
  category: ShopCategory;
  categoryLabel: string;
  name: string;
  cost: number;
  description: string;
  statEffect: string;
  state: ShopItemState;
  canBuy: boolean;
  canEquip: boolean;
}

export interface LevelSummary {
  scoreGained: number;
  creditsEarned: number;
  enemiesDestroyed: number;
  accuracyPercent: number | null;
  bossCreditReward: number;
  killCredits: number;
  waveCredits: number;
  levelCompleteCredits: number;
  accuracyBonus: number;
  breachBonus: number;
  levelScoreBonus: number;
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
  groundThreats: number;
  breachDanger: boolean;
  bombWarning: boolean;
  gameOverReason: GameOverReason | null;
  finalScore: number;
  levelName: string;
  levelSubtitle: string;
  waveInLevel: number;
  totalWavesInLevel: number;
  showLevelIntro: boolean;
  levelIntroText: string;
  levelCompleteBonus: number;
  levelSummary: LevelSummary | null;
  isCampaignComplete: boolean;
  totalLevels: number;
  bossPhase: number;
  bossShieldActive: boolean;
  bossName: string;
  showShop: boolean;
  shopItems: ShopItemView[];
}
