export class MagnifierLens {
  private lensElement: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private videoElement: HTMLVideoElement | null = null;

  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  public active: boolean = false;
  public zoom: number = 2.0; // 2x ou 3x
  public size: number = 240; // 240px de diâmetro

  private mouseX: number = window.innerWidth / 2;
  private mouseY: number = window.innerHeight / 2;
  private sourceCanvas: HTMLCanvasElement | null = null;
  private animFrameId: number | null = null;
  private snapshotTimer: number | null = null;

  constructor() {
    this.lensElement = document.createElement('div');
    this.lensElement.id = 'magnifierLens';
    this.lensElement.className = 'magnifier-lens hidden';
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.lensElement.appendChild(this.canvas);
    
    const zoomBadge = document.createElement('div');
    zoomBadge.id = 'magnifierZoomBadge';
    zoomBadge.innerText = `${this.zoom}x HD`;
    this.lensElement.appendChild(zoomBadge);

    document.body.appendChild(this.lensElement);
    this.ctx = this.canvas.getContext('2d')!;

    // Configurar Interpolação de Alta Fidelidade (Super-Resolução / Visão Computacional)
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Offscreen Canvas de dimensões fixas
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = window.innerWidth;
    this.offscreenCanvas.height = window.innerHeight;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    this.offscreenCtx.imageSmoothingEnabled = true;
    this.offscreenCtx.imageSmoothingQuality = 'high';

    this.initEvents();
  }

  public setSourceCanvas(sourceCanvas: HTMLCanvasElement) {
    this.sourceCanvas = sourceCanvas;
  }

  public async show() {
    this.active = true;

    if (!this.videoElement) {
      await this.initScreenCapture();
    }

    this.updateSnapshot();
    this.lensElement.classList.remove('hidden');
    this.startLoop();
  }

  public hide() {
    this.active = false;
    this.lensElement.classList.add('hidden');
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
      this.snapshotTimer = null;
    }
  }

  public async toggle() {
    if (this.active) {
      this.hide();
    } else {
      await this.show();
    }
  }

  public cycleZoom() {
    this.zoom = this.zoom === 2.0 ? 3.0 : 2.0;
    const zoomBadge = document.getElementById('magnifierZoomBadge');
    if (zoomBadge) zoomBadge.innerText = `${this.zoom}x HD`;
    this.render();
  }

  private async initScreenCapture() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: false
      });
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.muted = true;
      await this.videoElement.play();

      this.updateSnapshot();

      if (!this.snapshotTimer) {
        this.snapshotTimer = window.setInterval(() => {
          if (this.active) {
            this.updateSnapshot();
          }
        }, 1000);
      }
    } catch (err) {
      console.warn('Não foi possível iniciar captura de tela para a Lupa:', err);
    }
  }

  private updateSnapshot() {
    if (!this.videoElement || this.videoElement.readyState < 2) return;

    try {
      this.offscreenCtx.drawImage(
        this.videoElement,
        0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight,
        0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height
      );
    } catch (e) {
      console.warn('Erro ao atualizar snapshot:', e);
    }
  }

  private initEvents() {
    window.addEventListener('resize', () => {
      this.offscreenCanvas.width = window.innerWidth;
      this.offscreenCanvas.height = window.innerHeight;
      this.updateSnapshot();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (this.active) {
        this.updatePosition();
      }
    });

    this.lensElement.addEventListener('click', () => this.cycleZoom());
  }

  private updatePosition() {
    this.lensElement.style.left = `${this.mouseX - this.size / 2}px`;
    this.lensElement.style.top = `${this.mouseY - this.size / 2}px`;
  }

  private startLoop() {
    const loop = () => {
      if (this.active) {
        this.render();
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    loop();
  }

  public render() {
    if (!this.active) return;

    this.ctx.clearRect(0, 0, this.size, this.size);

    const cropW = this.size / this.zoom;
    const cropH = this.size / this.zoom;
    const cropX = Math.max(0, Math.min(window.innerWidth - cropW, this.mouseX - cropW / 2));
    const cropY = Math.max(0, Math.min(window.innerHeight - cropH, this.mouseY - cropH / 2));

    this.ctx.save();
    
    // Máscara Circular da Lente
    this.ctx.beginPath();
    this.ctx.arc(this.size / 2, this.size / 2, this.size / 2, 0, Math.PI * 2);
    this.ctx.clip();

    // Fundo escuro
    this.ctx.fillStyle = '#12121A';
    this.ctx.fillRect(0, 0, this.size, this.size);

    // Filtro de Nitidez e Visão Computacional (Edge Enhancement Filter)
    this.ctx.filter = 'contrast(1.18) brightness(1.04) saturate(1.05)';

    // 1. Ampliação do Snapshot de Tela com Interpolação de Alta Resolução
    this.ctx.drawImage(
      this.offscreenCanvas,
      cropX, cropY, cropW, cropH,
      0, 0, this.size, this.size
    );

    // 2. Ampliação dos Desenhos por cima
    if (this.sourceCanvas) {
      this.ctx.drawImage(
        this.sourceCanvas,
        cropX, cropY, cropW, cropH,
        0, 0, this.size, this.size
      );
    }

    // Reset de filtro para a mira e borda
    this.ctx.filter = 'none';

    // Cruz de mira central em ciano neon
    this.ctx.beginPath();
    this.ctx.moveTo(this.size / 2 - 12, this.size / 2);
    this.ctx.lineTo(this.size / 2 + 12, this.size / 2);
    this.ctx.moveTo(this.size / 2, this.size / 2 - 12);
    this.ctx.lineTo(this.size / 2, this.size / 2 + 10);
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();
  }
}
