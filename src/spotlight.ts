export class SpotlightEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public active: boolean = false;
  public opacity: number = 0.75; // 0.3 a 0.9
  public radius: number = 200; // 100px a 400px
  
  private mouseX: number = window.innerWidth / 2;
  private mouseY: number = window.innerHeight / 2;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'spotlightCanvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.zIndex = '3'; // Acima do canvas de desenho, abaixo da toolbar
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.display = 'none';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();
    this.initEvents();
  }

  public resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public show() {
    this.active = true;
    this.canvas.style.display = 'block';
    this.render();
  }

  public hide() {
    this.active = false;
    this.canvas.style.display = 'none';
  }

  public toggle() {
    if (this.active) {
      this.hide();
    } else {
      this.show();
    }
  }

  private initEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (this.active) {
        this.render();
      }
    });
  }

  public render() {
    if (!this.active) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Pass 1: Fundo escuro com opacidade customizada
    this.ctx.save();
    this.ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Pass 2: Recorte do Holofote com gradiente suave
    this.ctx.globalCompositeOperation = 'destination-out';
    const gradient = this.ctx.createRadialGradient(
      this.mouseX, this.mouseY, Math.max(0, this.radius * 0.7),
      this.mouseX, this.mouseY, this.radius
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.mouseX, this.mouseY, this.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Pass 3: Anel luminoso neon sutil ao redor do holofote
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.beginPath();
    this.ctx.arc(this.mouseX, this.mouseY, this.radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = '#00F0FF';
    this.ctx.shadowBlur = 15;
    this.ctx.stroke();

    this.ctx.restore();
  }
}
