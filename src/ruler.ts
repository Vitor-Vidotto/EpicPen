export class RulerTool {
  private container: HTMLElement;
  private rotateBtn: HTMLButtonElement;
  private closeBtn: HTMLButtonElement;
  private rotateHandle: HTMLElement;
  private resizeHandle: HTMLElement;
  private ticksContainer: HTMLElement;
  private angleText: HTMLElement;
  private titleText: HTMLElement;

  public active: boolean = false;
  public rotation: number = 0; // 0° a 360°
  public width: number = 450;
  public height: number = 65;

  private centerX: number = 400;
  private centerY: number = 200;

  private isDragging: boolean = false;
  private isRotating: boolean = false;
  private isResizing: boolean = false;

  private dragStartMouseX: number = 0;
  private dragStartMouseY: number = 0;
  private dragStartCenterX: number = 0;
  private dragStartCenterY: number = 0;

  constructor() {
    this.container = document.getElementById('rulerWidget') as HTMLElement;
    this.rotateBtn = document.getElementById('rulerRotateBtn') as HTMLButtonElement;
    this.closeBtn = document.getElementById('rulerCloseBtn') as HTMLButtonElement;
    this.rotateHandle = document.getElementById('rulerRotateHandle') as HTMLElement;
    this.resizeHandle = document.getElementById('rulerResizeHandle') as HTMLElement;
    this.ticksContainer = document.getElementById('rulerTicks') as HTMLElement;
    this.angleText = document.getElementById('rulerAngleText') as HTMLElement;
    this.titleText = document.getElementById('rulerTitle') as HTMLElement;

    this.updatePosition();
    this.initEvents();
    this.renderTicks();
  }

  public show() {
    this.active = true;
    this.container.classList.remove('hidden');
  }

  public hide() {
    this.active = false;
    this.container.classList.add('hidden');
  }

  public toggle() {
    if (this.active) {
      this.hide();
    } else {
      this.show();
    }
  }

  private updatePosition() {
    this.container.style.left = `${this.centerX - this.width / 2}px`;
    this.container.style.top = `${this.centerY - this.height / 2}px`;
  }

  private initEvents() {
    // Girar 45° por clique no botão
    this.rotateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.rotation = (this.rotation + 45) % 360;
      this.updateTransform();
    });

    // Rotação Fluida pelo Scroll do Mouse sobre a régua
    this.container.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const step = e.shiftKey ? 1 : 5;
      const delta = e.deltaY < 0 ? step : -step;
      this.rotation = (this.rotation + delta + 360) % 360;
      this.updateTransform();
    }, { passive: false });

    // Iniciar Rotação Arrastando a Alça de Rotação com o Mouse
    this.rotateHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.isRotating = true;
    });

    // Iniciar Redimensionamento Arrastando a Borda Lateral da Régua
    this.resizeHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.isResizing = true;
    });

    // Fechar Régua
    this.closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hide();
    });

    // Arraste da Posição da Régua baseado no centro de rotação (Livre de saltos em qualquer ângulo!)
    this.container.addEventListener('mousedown', (e) => {
      if (this.isRotating || this.isResizing) return;
      if (e.target instanceof HTMLButtonElement || (e.target as HTMLElement).closest('.ruler-controls') || e.target === this.rotateHandle || e.target === this.resizeHandle) {
        return;
      }
      this.isDragging = true;
      this.dragStartMouseX = e.clientX;
      this.dragStartMouseY = e.clientY;
      this.dragStartCenterX = this.centerX;
      this.dragStartCenterY = this.centerY;
    });

    window.addEventListener('mousemove', (e) => {
      // Caso esticar / encolher a régua pela borda lateral
      if (this.isResizing) {
        const rad = (this.rotation * Math.PI) / 180;
        const localX = (e.clientX - this.centerX) * Math.cos(-rad) - (e.clientY - this.centerY) * Math.sin(-rad);

        const newWidth = Math.max(200, Math.min(1600, Math.round(localX * 2)));
        this.width = newWidth;
        this.updateDimensions();
        this.updatePosition();
        return;
      }

      // Caso rotacionar a régua
      if (this.isRotating) {
        const rad = Math.atan2(e.clientY - this.centerY, e.clientX - this.centerX);
        let deg = Math.round((rad * 180) / Math.PI);
        if (deg < 0) deg += 360;

        this.rotation = deg;
        this.updateTransform();
        return;
      }

      // Caso mover a régua na tela (Matematicamente invariante ao ângulo de rotação!)
      if (this.isDragging) {
        this.centerX = this.dragStartCenterX + (e.clientX - this.dragStartMouseX);
        this.centerY = this.dragStartCenterY + (e.clientY - this.dragStartMouseY);
        this.updatePosition();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.isRotating = false;
      this.isResizing = false;
    });
  }

  private updateTransform() {
    this.container.style.transform = `rotate(${this.rotation}deg)`;
    this.angleText.innerText = `${this.rotation}°`;
  }

  private updateDimensions() {
    this.container.style.width = `${this.width}px`;
    this.titleText.innerText = `📏 Régua (${this.width}px)`;
    this.renderTicks();
  }

  private renderTicks() {
    this.ticksContainer.innerHTML = '';
    for (let i = 0; i <= this.width - 20; i += 10) {
      const tick = document.createElement('div');
      tick.style.position = 'absolute';
      tick.style.left = `${i}px`;
      tick.style.top = '0';
      tick.style.width = '1px';
      tick.style.backgroundColor = 'rgba(0, 240, 255, 0.7)';

      if (i % 50 === 0) {
        tick.style.height = '18px';
        const label = document.createElement('span');
        label.innerText = `${i}`;
        label.style.position = 'absolute';
        label.style.left = `${i + 3}px`;
        label.style.top = '18px';
        label.style.fontSize = '9px';
        label.style.color = '#FFDE59';
        label.style.fontWeight = 'bold';
        this.ticksContainer.appendChild(label);
      } else if (i % 10 === 0) {
        tick.style.height = '10px';
      }
      this.ticksContainer.appendChild(tick);
    }
  }

  // Snap magnético do ponto na borda da régua usando o centro exato
  public snapPoint(px: number, py: number): { x: number; y: number } | null {
    if (!this.active) return null;

    const cx = this.centerX;
    const cy = this.centerY;

    const rad = (this.rotation * Math.PI) / 180;
    const cos = Math.cos(-rad);
    const sin = Math.sin(-rad);

    // Converter para coordenadas locais da régua em relação ao centro
    const lx = (px - cx) * cos - (py - cy) * sin;
    const ly = (px - cx) * sin + (py - cy) * cos;

    const halfW = this.width / 2;
    const halfH = this.height / 2;

    // Distância da borda superior local (-halfH)
    const targetLy = -halfH;
    const distToTopEdge = Math.abs(ly - targetLy);

    if (distToTopEdge < 45 && lx >= -halfW - 30 && lx <= halfW + 30) {
      const clampedLx = Math.max(-halfW, Math.min(halfW, lx));
      const snappedRad = (this.rotation * Math.PI) / 180;
      
      const snappedX = clampedLx * Math.cos(snappedRad) - targetLy * Math.sin(snappedRad) + cx;
      const snappedY = clampedLx * Math.sin(snappedRad) + targetLy * Math.cos(snappedRad) + cy;

      return { x: snappedX, y: snappedY };
    }

    return null;
  }
}
