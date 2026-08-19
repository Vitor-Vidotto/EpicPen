export class FloatingTimerWidget {
  private widgetEl: HTMLElement;
  private headerEl: HTMLElement;
  private displayEl: HTMLElement;
  private startPauseBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;
  private add1mBtn: HTMLButtonElement;
  private add5mBtn: HTMLButtonElement;
  private sub1mBtn: HTMLButtonElement;
  private closeBtn: HTMLButtonElement;
  private modeBtnTimer: HTMLButtonElement;
  private modeBtnStopwatch: HTMLButtonElement;

  private mode: 'timer' | 'stopwatch' = 'timer';
  private isRunning: boolean = false;
  private remainingSeconds: number = 300; // 5 minutos padrão
  private stopwatchSeconds: number = 0;
  private timerInterval: number | null = null;

  // Draggable properties
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  public active: boolean = false;

  constructor() {
    this.widgetEl = document.getElementById('timerWidget') as HTMLElement;
    this.headerEl = document.getElementById('timerHeader') as HTMLElement;
    this.displayEl = document.getElementById('timerDisplay') as HTMLElement;
    this.startPauseBtn = document.getElementById('timerStartBtn') as HTMLButtonElement;
    this.resetBtn = document.getElementById('timerResetBtn') as HTMLButtonElement;
    this.add1mBtn = document.getElementById('timerAdd1mBtn') as HTMLButtonElement;
    this.add5mBtn = document.getElementById('timerAdd5mBtn') as HTMLButtonElement;
    this.sub1mBtn = document.getElementById('timerSub1mBtn') as HTMLButtonElement;
    this.closeBtn = document.getElementById('timerCloseBtn') as HTMLButtonElement;
    this.modeBtnTimer = document.getElementById('timerModeTimer') as HTMLButtonElement;
    this.modeBtnStopwatch = document.getElementById('timerModeStopwatch') as HTMLButtonElement;

    this.initEvents();
    this.updateDisplay();
  }

  private initEvents() {
    this.startPauseBtn.addEventListener('click', () => this.toggleStart());
    this.resetBtn.addEventListener('click', () => this.reset());

    this.add1mBtn.addEventListener('click', () => this.addTime(60));
    this.add5mBtn.addEventListener('click', () => this.addTime(300));
    this.sub1mBtn.addEventListener('click', () => this.addTime(-60));

    this.closeBtn.addEventListener('click', () => this.hide());

    this.modeBtnTimer.addEventListener('click', () => this.setMode('timer'));
    this.modeBtnStopwatch.addEventListener('click', () => this.setMode('stopwatch'));

    // Draggable Widget
    this.headerEl.addEventListener('mousedown', (e) => {
      if (e.target === this.closeBtn || e.target === this.modeBtnTimer || e.target === this.modeBtnStopwatch) return;
      this.isDragging = true;
      const rect = this.widgetEl.getBoundingClientRect();
      this.dragStartX = e.clientX - rect.left;
      this.dragStartY = e.clientY - rect.top;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      let x = e.clientX - this.dragStartX;
      let y = e.clientY - this.dragStartY;

      x = Math.max(10, Math.min(window.innerWidth - 220, x));
      y = Math.max(10, Math.min(window.innerHeight - 150, y));

      this.widgetEl.style.left = `${x}px`;
      this.widgetEl.style.top = `${y}px`;
      this.widgetEl.style.right = 'auto';
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  public show() {
    this.active = true;
    this.widgetEl.classList.remove('hidden');

    // Centralizar na tela se não possuir posição customizada
    if (!this.widgetEl.style.left) {
      this.widgetEl.style.left = `${window.innerWidth / 2 - 110}px`;
      this.widgetEl.style.top = '80px';
    }
  }

  public hide() {
    this.active = false;
    this.widgetEl.classList.add('hidden');
  }

  public toggle() {
    if (this.active) {
      this.hide();
    } else {
      this.show();
    }
  }

  private setMode(mode: 'timer' | 'stopwatch') {
    if (this.mode === mode) return;
    this.pause();
    this.mode = mode;

    this.modeBtnTimer.classList.toggle('active', mode === 'timer');
    this.modeBtnStopwatch.classList.toggle('active', mode === 'stopwatch');

    const presetsContainer = document.getElementById('timerPresets') as HTMLElement;
    if (mode === 'timer') {
      if (presetsContainer) presetsContainer.classList.remove('hidden');
    } else {
      if (presetsContainer) presetsContainer.classList.add('hidden');
    }

    this.reset();
  }

  private toggleStart() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  private start() {
    if (this.isRunning) return;
    if (this.mode === 'timer' && this.remainingSeconds <= 0) return;

    this.isRunning = true;
    this.startPauseBtn.innerHTML = '<span>⏸</span> Pausar';
    this.startPauseBtn.classList.add('active');

    this.timerInterval = window.setInterval(() => {
      if (this.mode === 'timer') {
        if (this.remainingSeconds > 0) {
          this.remainingSeconds--;
          this.updateDisplay();
          if (this.remainingSeconds === 0) {
            this.handleTimerFinished();
          }
        }
      } else {
        this.stopwatchSeconds++;
        this.updateDisplay();
      }
    }, 1000);
  }

  private pause() {
    this.isRunning = false;
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.startPauseBtn.innerHTML = '<span>▶</span> Iniciar';
    this.startPauseBtn.classList.remove('active');
  }

  private reset() {
    this.pause();
    if (this.mode === 'timer') {
      this.remainingSeconds = 300; // Resetar para 5 minutos
    } else {
      this.stopwatchSeconds = 0;
    }
    this.displayEl.classList.remove('timer-alert');
    this.updateDisplay();
  }

  private addTime(seconds: number) {
    if (this.mode !== 'timer') return;
    this.remainingSeconds = Math.max(0, this.remainingSeconds + seconds);
    this.displayEl.classList.remove('timer-alert');
    this.updateDisplay();
  }

  private updateDisplay() {
    const totalSecs = this.mode === 'timer' ? this.remainingSeconds : this.stopwatchSeconds;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.displayEl.innerText = formatted;
  }

  private handleTimerFinished() {
    this.pause();
    this.displayEl.classList.add('timer-alert');
    this.playAlarmSound();
  }

  private playAlarmSound() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Emitir 3 bips neon agradáveis
      const now = ctx.currentTime;
      [0, 0.25, 0.5].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now + delay); // Nota A5
        osc.frequency.exponentialRampToValueAtTime(1760, now + delay + 0.15);

        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.2);
      });
    } catch (err) {
      console.warn('Não foi possível tocar o alarme do temporizador:', err);
    }
  }
}
