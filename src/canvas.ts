import { RulerTool } from './ruler';
import { AutoShapeDetector } from './autoShape';
import type { PieMenu } from './pieMenu';

export type ToolType = 'pen' | 'highlighter' | 'laser' | 'ruler' | 'text' | 'eraser' | 'shape' | 'badge' | 'crop';
export type ShapeType = 'arrow' | 'line' | 'rect' | 'circle';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  tool: ToolType;
  shapeType?: ShapeType;
  color: string;
  size: number;
  points: Point[];
  text?: string;
  textPos?: Point;
  badgeNumber?: number;
}

export class DrawingCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rulerRef: RulerTool | null = null;
  private pieMenuRef: PieMenu | null = null;
  
  public currentTool: ToolType = 'pen';
  public currentShape: ShapeType = 'arrow';
  public currentColor: string = '#FFDE59';
  public currentSize: number = 7;
  public badgeCount: number = 1;
  public autoShapeEnabled: boolean = false;

  private isDrawing: boolean = false;
  private currentPoints: Point[] = [];
  
  private strokes: Stroke[] = [];
  private undoStack: Stroke[] = [];

  // Crop Snipping Selection Box
  private isCropping: boolean = false;
  private cropStart: Point | null = null;
  private cropEnd: Point | null = null;
  public onCropComplete: ((x: number, y: number, w: number, h: number) => void) | null = null;

  // Laser Pointer Trail Points
  private laserTrail: { point: Point; timestamp: number }[] = [];

  constructor() {
    this.canvas = document.getElementById('drawCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.resizeCanvas();
    this.initEvents();
    this.startAnimationLoop();
  }

  public setRuler(ruler: RulerTool) {
    this.rulerRef = ruler;
  }

  public setPieMenu(pieMenu: PieMenu) {
    this.pieMenuRef = pieMenu;
  }

  public resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.redrawAll();
  }

  public resetBadgeCount() {
    this.badgeCount = 1;
    const badgeBtnText = document.getElementById('badgeCountText');
    if (badgeBtnText) badgeBtnText.innerText = `${this.badgeCount}`;
  }

  private initEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    this.canvas.addEventListener('mouseup', () => this.handlePointerUp());
    this.canvas.addEventListener('mouseleave', () => this.handlePointerUp());
  }

  private handlePointerDown(e: MouseEvent) {
    if (this.pieMenuRef && this.pieMenuRef.active()) {
      return;
    }

    let pt: Point = { x: e.clientX, y: e.clientY };

    if (this.rulerRef && this.rulerRef.active) {
      const snapped = this.rulerRef.snapPoint(e.clientX, e.clientY);
      if (snapped) pt = snapped;
    }

    if (this.currentTool === 'crop') {
      this.isCropping = true;
      this.cropStart = pt;
      this.cropEnd = pt;
      this.redrawAll();
      return;
    }

    if (this.currentTool === 'text') {
      this.spawnTextInput(e.clientX, e.clientY);
      return;
    }

    if (this.currentTool === 'badge') {
      this.strokes.push({
        tool: 'badge',
        color: this.currentColor,
        size: this.currentSize,
        points: [pt],
        badgeNumber: this.badgeCount
      });
      this.badgeCount++;
      const badgeBtnText = document.getElementById('badgeCountText');
      if (badgeBtnText) badgeBtnText.innerText = `${this.badgeCount}`;
      this.redrawAll();
      return;
    }

    if (this.currentTool === 'laser') {
      this.addLaserPoint(pt);
      return;
    }

    this.isDrawing = true;
    this.currentPoints = [pt];
  }

  private handlePointerMove(e: MouseEvent) {
    let pt: Point = { x: e.clientX, y: e.clientY };

    if (this.currentTool === 'crop' && this.isCropping) {
      this.cropEnd = pt;
      this.redrawAll();
      return;
    }

    // Snap magnético com a régua (caso ativa)
    if (this.rulerRef && this.rulerRef.active && (this.currentTool === 'pen' || this.currentTool === 'highlighter' || this.currentTool === 'shape')) {
      const snapped = this.rulerRef.snapPoint(e.clientX, e.clientY);
      if (snapped) pt = snapped;
    }

    if (this.currentTool === 'laser') {
      this.addLaserPoint(pt);
      return;
    }

    if (!this.isDrawing) return;

    if (this.currentTool === 'eraser') {
      this.eraseStrokesNear(pt);
      this.redrawAll();
      return;
    }

    this.currentPoints.push(pt);
    this.redrawAll();
    
    // Renderizar o traço/forma atual em progresso
    this.renderStroke({
      tool: this.currentTool,
      shapeType: this.currentShape,
      color: this.currentColor,
      size: this.currentSize,
      points: this.currentPoints
    });
  }

  private addLaserPoint(pt: Point) {
    const now = Date.now();
    if (this.laserTrail.length > 0) {
      const prev = this.laserTrail[this.laserTrail.length - 1];
      const dist = Math.hypot(pt.x - prev.point.x, pt.y - prev.point.y);
      if (dist > 4) {
        const steps = Math.ceil(dist / 3);
        for (let i = 1; i <= steps; i++) {
          const interpX = prev.point.x + (pt.x - prev.point.x) * (i / steps);
          const interpY = prev.point.y + (pt.y - prev.point.y) * (i / steps);
          const interpTime = prev.timestamp + (now - prev.timestamp) * (i / steps);
          this.laserTrail.push({ point: { x: interpX, y: interpY }, timestamp: interpTime });
        }
        return;
      }
    }
    this.laserTrail.push({ point: pt, timestamp: now });
  }

  private handlePointerUp() {
    if (this.currentTool === 'crop' && this.isCropping && this.cropStart && this.cropEnd) {
      this.isCropping = false;
      const x = Math.min(this.cropStart.x, this.cropEnd.x);
      const y = Math.min(this.cropStart.y, this.cropEnd.y);
      const w = Math.abs(this.cropEnd.x - this.cropStart.x);
      const h = Math.abs(this.cropEnd.y - this.cropStart.y);

      this.cropStart = null;
      this.cropEnd = null;
      this.redrawAll();

      if (w > 10 && h > 10 && this.onCropComplete) {
        this.onCropComplete(x, y, w, h);
      }
      return;
    }

    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.currentPoints.length > 0 && this.currentTool !== 'eraser' && this.currentTool !== 'laser' && this.currentTool !== 'crop') {
      if (this.currentTool === 'pen' && this.autoShapeEnabled) {
        const recognized = AutoShapeDetector.detect(this.currentPoints);
        if (recognized) {
          const stroke: Stroke = {
            tool: 'shape',
            shapeType: recognized.shapeType,
            color: this.currentColor,
            size: this.currentSize,
            points: [recognized.start, recognized.end]
          };
          this.strokes.push(stroke);
          this.undoStack = [];
          this.currentPoints = [];
          this.redrawAll();
          return;
        }
      }

      const stroke: Stroke = {
        tool: this.currentTool,
        shapeType: this.currentShape,
        color: this.currentColor,
        size: this.currentSize,
        points: [...this.currentPoints]
      };
      this.strokes.push(stroke);
      this.undoStack = [];
    }

    this.currentPoints = [];
    this.redrawAll();
  }

  public undo() {
    if (this.strokes.length > 0) {
      const popped = this.strokes.pop()!;
      this.undoStack.push(popped);
      this.redrawAll();
    }
  }

  public redo() {
    if (this.undoStack.length > 0) {
      const restored = this.undoStack.pop()!;
      this.strokes.push(restored);
      this.redrawAll();
    }
  }

  public clear() {
    this.strokes = [];
    this.undoStack = [];
    this.laserTrail = [];
    this.resetBadgeCount();
    this.redrawAll();
  }

  private eraseStrokesNear(pt: Point) {
    const threshold = this.currentSize * 2 + 10;
    this.strokes = this.strokes.filter(stroke => {
      return !stroke.points.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < threshold);
    });
  }

  private redrawAll() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const stroke of this.strokes) {
      this.renderStroke(stroke);
    }

    // Renderizar a caixa de seleção do Crop Snipping
    if (this.isCropping && this.cropStart && this.cropEnd) {
      const x = Math.min(this.cropStart.x, this.cropEnd.x);
      const y = Math.min(this.cropStart.y, this.cropEnd.y);
      const w = Math.abs(this.cropEnd.x - this.cropStart.x);
      const h = Math.abs(this.cropEnd.y - this.cropStart.y);

      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.clearRect(x, y, w, h);

      this.ctx.strokeStyle = '#00F0FF';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([6, 6]);
      this.ctx.strokeRect(x, y, w, h);

      this.ctx.fillStyle = '#00F0FF';
      this.ctx.font = 'bold 12px Inter, sans-serif';
      this.ctx.fillText(`${Math.round(w)} x ${Math.round(h)} px`, x + 6, y - 8 > 14 ? y - 8 : y + 20);

      this.ctx.restore();
    }
  }

  private renderStroke(stroke: Stroke) {
    const { tool, shapeType, color, size, points, text, textPos, badgeNumber } = stroke;
    if (points.length === 0 && !text) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (tool === 'pen') {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = size;
      this.ctx.globalAlpha = 1.0;
      this.drawSmoothLine(points);
    } else if (tool === 'highlighter') {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = size * 2.5;
      this.ctx.globalAlpha = 0.45;
      this.drawSmoothLine(points);
    } else if (tool === 'badge' && points.length > 0 && badgeNumber !== undefined) {
      const pt = points[0];
      const radius = size + 12;

      // Círculo com fundo neon
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 15;
      this.ctx.globalAlpha = 0.95;
      this.ctx.fill();

      // Borda interna branca
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Número central em branco ou contraste escuro
      this.ctx.fillStyle = (color === '#FFFFFF' || color === '#FFDE59' || color === '#00F0FF') ? '#12121A' : '#FFFFFF';
      this.ctx.font = `bold ${radius * 1.1}px 'Inter', sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.shadowBlur = 0;
      this.ctx.fillText(`${badgeNumber}`, pt.x, pt.y);
    } else if (tool === 'shape' && points.length >= 2) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = size;
      this.ctx.globalAlpha = 1.0;
      const start = points[0];
      const end = points[points.length - 1];
      this.drawShape(shapeType || 'line', start, end);
    } else if (tool === 'text' && text && textPos) {
      this.ctx.fillStyle = color;
      this.ctx.font = `600 ${size * 2 + 14}px 'Inter', sans-serif`;
      this.ctx.globalAlpha = 1.0;
      
      const lines = text.split('\n');
      lines.forEach((line, idx) => {
        this.ctx.fillText(line, textPos.x, textPos.y + idx * (size * 2 + 18));
      });
    }

    this.ctx.restore();
  }

  private drawSmoothLine(points: Point[]) {
    if (points.length < 2) {
      const p = points[0];
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, this.ctx.lineWidth / 2, 0, Math.PI * 2);
      this.ctx.fill();
      return;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    this.ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    this.ctx.stroke();
  }

  private drawShape(shape: ShapeType, start: Point, end: Point) {
    this.ctx.beginPath();
    if (shape === 'line') {
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    } else if (shape === 'arrow') {
      this.drawArrow(start, end);
    } else if (shape === 'rect') {
      const w = end.x - start.x;
      const h = end.y - start.y;
      this.ctx.strokeRect(start.x, start.y, w, h);
    } else if (shape === 'circle') {
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  private drawArrow(start: Point, end: Point) {
    const headlen = 16 + this.currentSize;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
    this.ctx.closePath();
    this.ctx.fillStyle = this.currentColor;
    this.ctx.fill();
  }

  private spawnTextInput(x: number, y: number) {
    const textOverlay = document.getElementById('textOverlay') as HTMLElement;
    const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
    const textCommitBtn = document.getElementById('textCommitBtn') as HTMLButtonElement;
    const textCancelBtn = document.getElementById('textCancelBtn') as HTMLButtonElement;

    textOverlay.style.left = `${Math.min(x, window.innerWidth - 300)}px`;
    textOverlay.style.top = `${Math.min(y, window.innerHeight - 150)}px`;
    textInput.value = '';
    textOverlay.classList.remove('hidden');
    
    setTimeout(() => textInput.focus(), 50);

    const commit = () => {
      const val = textInput.value.trim();
      if (val) {
        this.strokes.push({
          tool: 'text',
          color: this.currentColor,
          size: this.currentSize,
          points: [],
          text: val,
          textPos: { x, y: y + 24 }
        });
        this.redrawAll();
      }
      textOverlay.classList.add('hidden');
      cleanup();
    };

    const cancel = () => {
      textOverlay.classList.add('hidden');
      cleanup();
    };

    const onKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === 'Enter' && !evt.shiftKey) {
        evt.preventDefault();
        commit();
      } else if (evt.key === 'Escape') {
        evt.preventDefault();
        cancel();
      }
    };

    const cleanup = () => {
      textCommitBtn.removeEventListener('click', commit);
      textCancelBtn.removeEventListener('click', cancel);
      textInput.removeEventListener('keydown', onKeyDown);
    };

    textCommitBtn.addEventListener('click', commit);
    textCancelBtn.addEventListener('click', cancel);
    textInput.addEventListener('keydown', onKeyDown);
  }

  private startAnimationLoop() {
    const renderFrame = () => {
      const now = Date.now();
      const duration = 600; // ms
      this.laserTrail = this.laserTrail.filter(pt => now - pt.timestamp < duration);

      if (this.laserTrail.length > 0) {
        this.redrawAll();
        this.renderLaserTrail(now, duration);
      }

      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }

  private renderLaserTrail(now: number, duration: number) {
    if (this.laserTrail.length === 0) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    const laserColor = this.currentColor === '#1E1E2E' ? '#FF3131' : this.currentColor;

    // Renderizar o rastro de forma contínua em múltiplos segmentos com fading
    if (this.laserTrail.length > 1) {
      for (let i = 1; i < this.laserTrail.length; i++) {
        const p1 = this.laserTrail[i - 1];
        const p2 = this.laserTrail[i];
        const age = now - p2.timestamp;
        const alpha = Math.max(0, 1 - age / duration);

        const strokeWidth = (this.currentSize * 1.8 + 4) * (0.3 + 0.7 * alpha);

        // Pass 1: Aura Neon Externa
        this.ctx.beginPath();
        this.ctx.moveTo(p1.point.x, p1.point.y);
        this.ctx.lineTo(p2.point.x, p2.point.y);
        this.ctx.strokeStyle = laserColor;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.globalAlpha = alpha * 0.75;
        this.ctx.shadowColor = laserColor;
        this.ctx.shadowBlur = 16;
        this.ctx.stroke();

        // Pass 2: Núcleo Quente Interno (Branco)
        this.ctx.beginPath();
        this.ctx.moveTo(p1.point.x, p1.point.y);
        this.ctx.lineTo(p2.point.x, p2.point.y);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = Math.max(2, strokeWidth * 0.4);
        this.ctx.globalAlpha = alpha * 0.95;
        this.ctx.shadowColor = laserColor;
        this.ctx.shadowBlur = 8;
        this.ctx.stroke();
      }
    }

    // Renderizar a Cabeça do Apontador (Cursor Ponto Brilhante)
    const head = this.laserTrail[this.laserTrail.length - 1];
    if (head) {
      // Glow Externo
      this.ctx.beginPath();
      this.ctx.arc(head.point.x, head.point.y, this.currentSize + 6, 0, Math.PI * 2);
      this.ctx.fillStyle = laserColor;
      this.ctx.shadowColor = laserColor;
      this.ctx.shadowBlur = 24;
      this.ctx.globalAlpha = 0.9;
      this.ctx.fill();

      // Núcleo Branco Super Brilhante
      this.ctx.beginPath();
      this.ctx.arc(head.point.x, head.point.y, Math.max(3, this.currentSize * 0.5), 0, Math.PI * 2);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.shadowColor = '#FFFFFF';
      this.ctx.shadowBlur = 12;
      this.ctx.globalAlpha = 1.0;
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
