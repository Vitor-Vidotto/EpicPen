export interface HotkeyConfig {
  drawMode: string;
  clearCanvas: string;
  toggleRuler: string;
  takeScreenshot: string;
  recordGif: string;
  toggleSpotlight: string;
  toggleMagnifier: string;
  toggleBoard: string;
  toggleCollapse: string;
}

export const DEFAULT_HOTKEYS: HotkeyConfig = {
  drawMode: 'Alt+D',
  clearCanvas: 'Alt+C',
  toggleRuler: 'Alt+R',
  takeScreenshot: 'Alt+S',
  recordGif: 'Alt+G',
  toggleSpotlight: 'Alt+L',
  toggleMagnifier: 'Alt+M',
  toggleBoard: 'Alt+B',
  toggleCollapse: 'Alt+H'
};

export class SettingsManager {
  private hotkeys: HotkeyConfig;
  private modalElement: HTMLElement;
  private closeBtn: HTMLButtonElement;
  private saveBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;

  private onUpdateCallback: ((config: HotkeyConfig) => void) | null = null;

  constructor() {
    this.hotkeys = this.loadHotkeys();
    this.modalElement = document.getElementById('settingsModal') as HTMLElement;
    this.closeBtn = document.getElementById('settingsCloseBtn') as HTMLButtonElement;
    this.saveBtn = document.getElementById('settingsSaveBtn') as HTMLButtonElement;
    this.resetBtn = document.getElementById('settingsResetBtn') as HTMLButtonElement;

    this.initEvents();
  }

  public setOnUpdate(callback: (config: HotkeyConfig) => void) {
    this.onUpdateCallback = callback;
  }

  public getHotkeys(): HotkeyConfig {
    return { ...this.hotkeys };
  }

  public openModal() {
    this.populateModal();
    this.modalElement.classList.remove('hidden');
  }

  public closeModal() {
    this.modalElement.classList.add('hidden');
  }

  private loadHotkeys(): HotkeyConfig {
    try {
      const saved = localStorage.getItem('epic_pen_hotkeys');
      if (saved) {
        return { ...DEFAULT_HOTKEYS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Erro ao carregar atalhos:', e);
    }
    return { ...DEFAULT_HOTKEYS };
  }

  private saveHotkeys() {
    try {
      localStorage.setItem('epic_pen_hotkeys', JSON.stringify(this.hotkeys));
    } catch (e) {
      console.warn('Erro ao salvar atalhos:', e);
    }
  }

  private initEvents() {
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.resetBtn.addEventListener('click', () => {
      this.hotkeys = { ...DEFAULT_HOTKEYS };
      this.saveHotkeys();
      this.populateModal();
      if (this.onUpdateCallback) this.onUpdateCallback(this.hotkeys);
    });

    this.saveBtn.addEventListener('click', () => {
      this.readModalInputs();
      this.saveHotkeys();
      this.closeModal();
      if (this.onUpdateCallback) this.onUpdateCallback(this.hotkeys);
    });
  }

  private populateModal() {
    const fields: (keyof HotkeyConfig)[] = [
      'drawMode', 'clearCanvas', 'toggleRuler', 'takeScreenshot',
      'recordGif', 'toggleSpotlight', 'toggleMagnifier', 'toggleBoard', 'toggleCollapse'
    ];

    fields.forEach(field => {
      const input = document.getElementById(`hk_${field}`) as HTMLInputElement;
      if (input) {
        input.value = this.hotkeys[field];
      }
    });
  }

  private readModalInputs() {
    const fields: (keyof HotkeyConfig)[] = [
      'drawMode', 'clearCanvas', 'toggleRuler', 'takeScreenshot',
      'recordGif', 'toggleSpotlight', 'toggleMagnifier', 'toggleBoard', 'toggleCollapse'
    ];

    fields.forEach(field => {
      const input = document.getElementById(`hk_${field}`) as HTMLInputElement;
      if (input && input.value.trim()) {
        this.hotkeys[field] = input.value.trim();
      }
    });
  }
}
