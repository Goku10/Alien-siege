import { BALANCING } from '../data/balancing';
import { TURRET_CONFIG } from '../data/turretConfig';
import type { WeaponStats } from '../data/weapons';
import type { InputState, MuzzleFlash, TurretState } from '../types';
import { angleBetween, clamp, lerpAngle, normalizeAngle, pointFromAngle } from '../../utils/math';

export class Turret {
  readonly state: TurretState;
  private weapon: WeaponStats;
  private keyboardAngle: number | null = null;

  constructor(canvasWidth: number, canvasHeight: number, weapon: WeaponStats) {
    this.weapon = weapon;
    this.state = {
      x: canvasWidth / 2,
      y: canvasHeight - BALANCING.turret.offsetY,
      angle: -Math.PI / 2,
      targetAngle: -Math.PI / 2,
      heat: 0,
      maxHeat: weapon.maxHeat,
      cooling: false,
      lastFireTime: 0,
      magazine: weapon.magazineSize > 0 ? weapon.magazineSize : 0,
      magazineSize: weapon.magazineSize,
      reloading: false,
      reloadTimer: 0,
      reloadDuration: 0,
    };
  }

  resetCombatState(): void {
    this.state.heat = 0;
    this.state.cooling = false;
    this.state.reloading = false;
    this.state.reloadTimer = 0;
    this.state.reloadDuration = 0;
    if (this.weapon.magazineSize > 0) {
      this.state.magazine = this.weapon.magazineSize;
    }
  }

  setWeapon(weapon: WeaponStats): void {
    this.weapon = weapon;
    this.state.maxHeat = weapon.maxHeat;
    this.state.heat = Math.min(this.state.heat, weapon.maxHeat);
    this.state.magazineSize = weapon.magazineSize;
    if (weapon.magazineSize > 0) {
      this.state.magazine = weapon.magazineSize;
    } else {
      this.state.magazine = 0;
    }
    this.state.reloading = false;
    this.state.reloadTimer = 0;
    this.state.reloadDuration = 0;
  }

  getWeapon(): WeaponStats {
    return this.weapon;
  }

  resize(canvasWidth: number, canvasHeight: number): void {
    this.state.x = canvasWidth / 2;
    this.state.y = canvasHeight - BALANCING.turret.offsetY;
  }

  update(dt: number, input: InputState, canAimWithMouse: boolean): void {
    if (this.state.reloading) {
      this.state.reloadTimer -= dt;
      if (this.state.reloadTimer <= 0) {
        this.state.reloading = false;
        this.state.magazine = this.state.magazineSize;
        this.state.reloadTimer = 0;
      }
    }

    if (canAimWithMouse) {
      this.keyboardAngle = null;
      const aimAngle = angleBetween(
        { x: this.state.x, y: this.state.y },
        { x: input.mouseX, y: input.mouseY },
      );
      this.state.targetAngle = clamp(
        aimAngle,
        TURRET_CONFIG.minAngle,
        TURRET_CONFIG.maxAngle,
      );
    } else if (input.rotateLeft || input.rotateRight) {
      if (this.keyboardAngle === null) {
        this.keyboardAngle = this.state.angle;
      }
      const dir = input.rotateRight ? 1 : -1;
      this.keyboardAngle = normalizeAngle(
        this.keyboardAngle + dir * TURRET_CONFIG.keyboardRotationSpeed * dt,
      );
      this.state.targetAngle = clamp(
        this.keyboardAngle,
        TURRET_CONFIG.minAngle,
        TURRET_CONFIG.maxAngle,
      );
    }

    const rotT = 1 - Math.exp(-TURRET_CONFIG.rotationSpeed * dt);
    this.state.angle = lerpAngle(this.state.angle, this.state.targetAngle, rotT);

    if (this.state.heat > 0 && !this.isOverheated()) {
      this.state.heat = Math.max(0, this.state.heat - this.weapon.coolRate * dt);
    }
    this.state.cooling = this.state.heat > this.weapon.maxHeat * 0.6;
  }

  getMuzzlePosition(): { x: number; y: number } {
    return pointFromAngle(
      { x: this.state.x, y: this.state.y },
      this.state.angle,
      TURRET_CONFIG.barrelLength,
    );
  }

  canFire(now: number): boolean {
    if (this.state.reloading) return false;
    if (this.isOverheated()) return false;
    if (this.state.magazineSize > 0 && this.state.magazine <= 0) {
      this.startReload();
      return false;
    }
    const interval = 1 / this.weapon.fireRate;
    return now - this.state.lastFireTime >= interval;
  }

  isOverheated(): boolean {
    return this.state.heat >= this.state.maxHeat;
  }

  applyHeat(): void {
    if (this.weapon.heatPerShot <= 0) return;
    this.state.heat = Math.min(
      this.state.maxHeat,
      this.state.heat + this.weapon.heatPerShot,
    );
  }

  consumeAmmo(): void {
    if (this.state.magazineSize <= 0) return;
    this.state.magazine = Math.max(0, this.state.magazine - 1);
    if (this.state.magazine <= 0) {
      this.startReload();
    }
  }

  markFired(now: number): void {
    this.state.lastFireTime = now;
  }

  getReloadProgress(): number {
    if (!this.state.reloading || this.state.reloadDuration <= 0) return 0;
    return 1 - this.state.reloadTimer / this.state.reloadDuration;
  }

  createMuzzleFlash(): MuzzleFlash {
    const muzzle = this.getMuzzlePosition();
    const flashScale =
      this.weapon.kind === 'missile' ? 1.35 :
      this.weapon.kind === 'flak' ? 1.2 :
      this.weapon.kind === 'laser' ? 0.9 : 1;
    return {
      x: muzzle.x,
      y: muzzle.y,
      angle: this.state.angle,
      life: this.weapon.muzzleFlashDuration,
      maxLife: this.weapon.muzzleFlashDuration,
      color: this.weapon.color,
      glowColor: this.weapon.glowColor,
      size: 18 * flashScale,
      active: true,
    };
  }

  wantsToFire(input: InputState): boolean {
    return input.mouseDown || input.space;
  }

  private startReload(): void {
    if (this.weapon.reloadTime <= 0 || this.state.magazineSize <= 0) return;
    if (this.state.reloading) return;
    this.state.reloading = true;
    this.state.reloadDuration = this.weapon.reloadTime;
    this.state.reloadTimer = this.weapon.reloadTime;
  }
}
