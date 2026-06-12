import type { InputState } from '../types';

const DEFAULT_INPUT: InputState = {
  mouseX: 0,
  mouseY: 0,
  mouseDown: false,
  rightMouseDown: false,
  space: false,
  shift: false,
  escape: false,
  rotateLeft: false,
  rotateRight: false,
  confirm: false,
};

export class InputManager {
  private state: InputState = { ...DEFAULT_INPUT };
  private canvas: HTMLCanvasElement | null = null;
  private bound = false;
  private escapePressed = false;
  private confirmPressed = false;

  attach(canvas: HTMLCanvasElement): void {
    if (this.bound) return;
    this.canvas = canvas;
    this.bound = true;

    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('mouseleave', this.onMouseLeave);
  }

  detach(): void {
    if (!this.bound || !this.canvas) return;
    const canvas = this.canvas;
    canvas.removeEventListener('mousemove', this.onMouseMove);
    canvas.removeEventListener('mousedown', this.onMouseDown);
    canvas.removeEventListener('mouseup', this.onMouseUp);
    canvas.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas = null;
    this.bound = false;
  }

  updateCanvasCoords(clientX: number, clientY: number): { x: number; y: number } {
    if (!this.canvas) return { x: clientX, y: clientY };
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  getState(): Readonly<InputState> {
    return this.state;
  }

  consumeEscape(): boolean {
    const pressed = this.escapePressed;
    this.escapePressed = false;
    return pressed;
  }

  consumeConfirm(): boolean {
    const pressed = this.confirmPressed;
    this.confirmPressed = false;
    return pressed;
  }

  private onMouseMove = (e: MouseEvent): void => {
    const coords = this.updateCanvasCoords(e.clientX, e.clientY);
    this.state.mouseX = coords.x;
    this.state.mouseY = coords.y;
  };

  private onMouseDown = (e: MouseEvent): void => {
    const coords = this.updateCanvasCoords(e.clientX, e.clientY);
    this.state.mouseX = coords.x;
    this.state.mouseY = coords.y;
    if (e.button === 0) this.state.mouseDown = true;
    if (e.button === 2) this.state.rightMouseDown = true;
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) this.state.mouseDown = false;
    if (e.button === 2) this.state.rightMouseDown = false;
  };

  private onMouseLeave = (): void => {
    this.state.mouseDown = false;
    this.state.rightMouseDown = false;
  };

  private onContextMenu = (e: Event): void => {
    e.preventDefault();
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'Space':
        this.state.space = true;
        e.preventDefault();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.state.shift = true;
        break;
      case 'Escape':
        this.state.escape = true;
        this.escapePressed = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.state.rotateLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.state.rotateRight = true;
        break;
      case 'Enter':
        this.state.confirm = true;
        this.confirmPressed = true;
        break;
      default:
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'Space':
        this.state.space = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.state.shift = false;
        break;
      case 'Escape':
        this.state.escape = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.state.rotateLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.state.rotateRight = false;
        break;
      case 'Enter':
        this.state.confirm = false;
        break;
      default:
        break;
    }
  };
}
