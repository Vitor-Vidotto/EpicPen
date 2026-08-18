import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { DrawingCanvas, ToolType, ShapeType } from './canvas';
import { RulerTool } from './ruler';
import { MediaRecorderTool } from './recorder';
import { SpotlightEngine } from './spotlight';
import { MagnifierLens } from './magnifier';
import { SettingsManager, HotkeyConfig } from './settings';

class EpicPenApp {
  private canvasEngine: DrawingCanvas;
  private ruler: RulerTool;
  private recorder: MediaRecorderTool;
  private spotlight: SpotlightEngine;
  private magnifier: MagnifierLens;
  private settings: SettingsManager;

  private isPassThroughMode: boolean = false;
  private isCollapsed: boolean = false;
  private isDocked: boolean = false;
  private isHoldModeActive: boolean = false;
  private boardState: 'transparent' | 'white' | 'black' = 'transparent';

  // Elementos da Interface
  private toolbar: HTMLElement;
  private toolbarHeader: HTMLElement;
  private toggleCollapseBtn: HTMLButtonElement;
  private settingsOpenBtn: HTMLButtonElement;
  private dockBtn: HTMLButtonElement;
  private modeDrawBtn: HTMLButtonElement;
  private modeInteractBtn: HTMLButtonElement;

  private toolPenBtn: HTMLButtonElement;
  private toolHighlighterBtn: HTMLButtonElement;
  private toolLaserBtn: HTMLButtonElement;
  private toolBadgeBtn: HTMLButtonElement;
  private toolSpotlightBtn: HTMLButtonElement;
  private toolMagnifierBtn: HTMLButtonElement;
  private toolRulerBtn: HTMLButtonElement;
  private toolTextBtn: HTMLButtonElement;
  private toolEraserBtn: HTMLButtonElement;

  private spotlightControls: HTMLElement;
  private spotlightOpacitySlider: HTMLInputElement;
  private spotlightRadiusSlider: HTMLInputElement;
  private spotlightOpacityVal: HTMLElement;
  private spotlightRadiusVal: HTMLElement;

  private badgeControls: HTMLElement;
  private badgeResetBtn: HTMLButtonElement;

  private shapesBtn: HTMLButtonElement;
  private shapesDropdown: HTMLElement;
  private currentShapeIcon: HTMLElement;

  private customColorPicker: HTMLInputElement;
  private boardTransparentBtn: HTMLButtonElement;
  private boardWhiteBtn: HTMLButtonElement;
  private boardBlackBtn: HTMLButtonElement;

  private btnUndo: HTMLButtonElement;
  private btnRedo: HTMLButtonElement;
  private btnClear: HTMLButtonElement;
  private btnScreenshot: HTMLButtonElement;
  private btnCropPrint: HTMLButtonElement;
  private btnRecordGif: HTMLButtonElement;
  private stopRecBtn: HTMLButtonElement;
  private micToggleCheckbox: HTMLInputElement;

  private toastElement: HTMLElement;
  private toastIcon: HTMLElement;
  private toastMessage: HTMLElement;
  private openFolderBtn: HTMLButtonElement;
  private toastTimeout: number | null = null;

  // Mode HUD Banner
  private modeHudElement: HTMLElement;
  private modeHudIcon: HTMLElement;
  private modeHudText: HTMLElement;
  private modeHudTimeout: number | null = null;

  // Variáveis de arraste da toolbar
  private isDraggingToolbar: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor() {
    this.canvasEngine = new DrawingCanvas();
    this.ruler = new RulerTool();
    this.recorder = new MediaRecorderTool(this.canvasEngine.getCanvas());
    this.spotlight = new SpotlightEngine();
    this.magnifier = new MagnifierLens();
    this.settings = new SettingsManager();

    this.canvasEngine.setRuler(this.ruler);
    this.magnifier.setSourceCanvas(this.canvasEngine.getCanvas());

    this.toolbar = document.getElementById('toolbar') as HTMLElement;
    this.toolbarHeader = document.getElementById('toolbarHeader') as HTMLElement;
    this.toggleCollapseBtn = document.getElementById('toggleCollapseBtn') as HTMLButtonElement;
    this.settingsOpenBtn = document.getElementById('settingsOpenBtn') as HTMLButtonElement;
    this.dockBtn = document.getElementById('dockBtn') as HTMLButtonElement;

    this.modeDrawBtn = document.getElementById('modeDrawBtn') as HTMLButtonElement;
    this.modeInteractBtn = document.getElementById('modeInteractBtn') as HTMLButtonElement;

    this.toolPenBtn = document.getElementById('toolPen') as HTMLButtonElement;
    this.toolHighlighterBtn = document.getElementById('toolHighlighter') as HTMLButtonElement;
    this.toolLaserBtn = document.getElementById('toolLaser') as HTMLButtonElement;
    this.toolBadgeBtn = document.getElementById('toolBadge') as HTMLButtonElement;
    this.toolSpotlightBtn = document.getElementById('toolSpotlight') as HTMLButtonElement;
    this.toolMagnifierBtn = document.getElementById('toolMagnifier') as HTMLButtonElement;
    this.toolRulerBtn = document.getElementById('toolRuler') as HTMLButtonElement;
    this.toolTextBtn = document.getElementById('toolText') as HTMLButtonElement;
    this.toolEraserBtn = document.getElementById('toolEraser') as HTMLButtonElement;

    this.spotlightControls = document.getElementById('spotlightControls') as HTMLElement;
    this.spotlightOpacitySlider = document.getElementById('spotlightOpacitySlider') as HTMLInputElement;
    this.spotlightRadiusSlider = document.getElementById('spotlightRadiusSlider') as HTMLInputElement;
    this.spotlightOpacityVal = document.getElementById('spotlightOpacityVal') as HTMLElement;
    this.spotlightRadiusVal = document.getElementById('spotlightRadiusVal') as HTMLElement;

    this.badgeControls = document.getElementById('badgeControls') as HTMLElement;
    this.badgeResetBtn = document.getElementById('badgeResetBtn') as HTMLButtonElement;

    this.shapesBtn = document.getElementById('shapesBtn') as HTMLButtonElement;
    this.shapesDropdown = document.getElementById('shapesDropdown') as HTMLElement;
    this.currentShapeIcon = document.getElementById('currentShapeIcon') as HTMLElement;

    this.customColorPicker = document.getElementById('customColorPicker') as HTMLInputElement;
    this.boardTransparentBtn = document.getElementById('boardTransparentBtn') as HTMLButtonElement;
    this.boardWhiteBtn = document.getElementById('boardWhiteBtn') as HTMLButtonElement;
    this.boardBlackBtn = document.getElementById('boardBlackBtn') as HTMLButtonElement;

    this.btnUndo = document.getElementById('btnUndo') as HTMLButtonElement;
    this.btnRedo = document.getElementById('btnRedo') as HTMLButtonElement;
    this.btnClear = document.getElementById('btnClear') as HTMLButtonElement;
    this.btnScreenshot = document.getElementById('btnScreenshot') as HTMLButtonElement;
    this.btnCropPrint = document.getElementById('btnCropPrint') as HTMLButtonElement;
    this.btnRecordGif = document.getElementById('btnRecordGif') as HTMLButtonElement;
    this.stopRecBtn = document.getElementById('stopRecBtn') as HTMLButtonElement;
    this.micToggleCheckbox = document.getElementById('micToggleCheckbox') as HTMLInputElement;

    this.toastElement = document.getElementById('toast') as HTMLElement;
    this.toastIcon = document.getElementById('toastIcon') as HTMLElement;
    this.toastMessage = document.getElementById('toastMessage') as HTMLElement;
    this.openFolderBtn = document.getElementById('openFolderBtn') as HTMLButtonElement;

    this.modeHudElement = document.getElementById('modeHud') as HTMLElement;
    this.modeHudIcon = document.getElementById('modeHudIcon') as HTMLElement;
    this.modeHudText = document.getElementById('modeHudText') as HTMLElement;

    this.initUIEvents();
    this.initHotkeys();
    this.initTauriGlobalEvents();
    this.updatePassThroughState();
  }

  private initTauriGlobalEvents() {
    listen('global-toggle-draw', () => {
      if (this.isCollapsed) {
        this.toggleCollapse();
      }
      this.setPassThroughMode(false);
      this.showModeHud('MODO DESENHO', '✏️', 'Ativado via Atalho Global Ctrl+Alt+D');
    }).catch(err => {
      console.warn('Erro ao escutar evento global do Tauri:', err);
    });
  }

  private initUIEvents() {
    // Alternar Modos
    this.modeDrawBtn.addEventListener('click', () => this.setPassThroughMode(false));
    this.modeInteractBtn.addEventListener('click', () => this.setPassThroughMode(true));

    // Configurações Modal & Dock Button
    this.settingsOpenBtn.addEventListener('click', () => this.settings.openModal());
    this.dockBtn.addEventListener('click', () => this.toggleDockDrawer());

    // Seleção de Ferramentas
    this.toolPenBtn.addEventListener('click', () => this.selectTool('pen', this.toolPenBtn));
    this.toolHighlighterBtn.addEventListener('click', () => this.selectTool('highlighter', this.toolHighlighterBtn));
    this.toolLaserBtn.addEventListener('click', () => this.selectTool('laser', this.toolLaserBtn));
    this.toolBadgeBtn.addEventListener('click', () => {
      this.selectTool('badge', this.toolBadgeBtn);
      this.badgeControls.classList.remove('hidden');
    });

    this.badgeResetBtn.addEventListener('click', () => {
      this.canvasEngine.resetBadgeCount();
      this.showToast('🔄', 'Contagem dos carimbos zerada para 1!');
    });

    // Holofote (Spotlight)
    this.toolSpotlightBtn.addEventListener('click', () => {
      this.spotlight.toggle();
      if (this.spotlight.active) {
        this.toolSpotlightBtn.classList.add('active');
        this.spotlightControls.classList.remove('hidden');
        this.showToast('💡', 'Modo Holofote Ativado!');
      } else {
        this.toolSpotlightBtn.classList.remove('active');
        this.spotlightControls.classList.add('hidden');
      }
    });

    this.spotlightOpacitySlider.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      this.spotlight.opacity = val / 100;
      this.spotlightOpacityVal.innerText = `${val}%`;
      this.spotlight.render();
    });

    this.spotlightRadiusSlider.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      this.spotlight.radius = val;
      this.spotlightRadiusVal.innerText = `${val}px`;
      this.spotlight.render();
    });

    // Lupa de Tela (Magnifier)
    this.toolMagnifierBtn.addEventListener('click', async () => {
      this.setIgnoreMouse(false);
      await this.magnifier.toggle();
      if (this.magnifier.active) {
        this.toolMagnifierBtn.classList.add('active');
        this.showToast('🔍', 'Lupa de Tela Ativada! Ampliando tela em 2x/3x');
      } else {
        this.toolMagnifierBtn.classList.remove('active');
      }
      this.updatePassThroughState();
    });

    this.toolRulerBtn.addEventListener('click', () => this.toggleRuler());
    this.toolTextBtn.addEventListener('click', () => this.selectTool('text', this.toolTextBtn));
    this.toolEraserBtn.addEventListener('click', () => this.selectTool('eraser', this.toolEraserBtn));

    // Abrir pasta de capturas
    this.openFolderBtn.addEventListener('click', () => {
      try {
        invoke('open_captures_folder');
      } catch (err) {
        console.error('Erro ao abrir pasta:', err);
      }
    });

    // Toggle Microfone
    this.micToggleCheckbox.addEventListener('change', (e) => {
      this.recorder.recordAudio = (e.target as HTMLInputElement).checked;
    });

    // Submenu de Formas
    this.shapesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.shapesDropdown.classList.toggle('hidden');
    });

    document.querySelectorAll('.shape-opt').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const shape = (e.currentTarget as HTMLElement).getAttribute('data-shape') as ShapeType;
        const icon = (e.currentTarget as HTMLElement).innerText.split(' ')[0];
        
        this.canvasEngine.currentShape = shape;
        this.currentShapeIcon.innerText = icon;
        this.selectTool('shape', this.shapesBtn);
        this.shapesDropdown.classList.add('hidden');
      });
    });

    document.addEventListener('click', () => {
      this.shapesDropdown.classList.add('hidden');
    });

    // Swatches de Cores
    document.querySelectorAll('.color-swatch').forEach((swatch) => {
      swatch.addEventListener('click', (e) => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        const color = target.getAttribute('data-color')!;
        this.canvasEngine.currentColor = color;
      });
    });

    this.customColorPicker.addEventListener('input', (e) => {
      const color = (e.target as HTMLInputElement).value;
      this.canvasEngine.currentColor = color;
    });

    // Presets de Espessura
    document.querySelectorAll('.size-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        const size = parseInt(target.getAttribute('data-size')!, 10);
        this.canvasEngine.currentSize = size;
      });
    });

    // Modo Quadro (Whiteboard / Blackboard)
    this.boardTransparentBtn.addEventListener('click', () => this.setBoardMode('transparent'));
    this.boardWhiteBtn.addEventListener('click', () => this.setBoardMode('white'));
    this.boardBlackBtn.addEventListener('click', () => this.setBoardMode('black'));

    // Ações
    this.btnUndo.addEventListener('click', () => this.canvasEngine.undo());
    this.btnRedo.addEventListener('click', () => this.canvasEngine.redo());
    this.btnClear.addEventListener('click', () => {
      this.canvasEngine.clear();
      this.showToast('🗑️', 'Tela limpa com sucesso!');
    });

    this.btnScreenshot.addEventListener('click', () => this.handleScreenshot());
    
    // Crop Snipping Button
    this.btnCropPrint.addEventListener('click', () => {
      this.canvasEngine.currentTool = 'crop';
      this.setPassThroughMode(false);
      this.showToast('✂️', 'Arrastre o mouse para selecionar a área do recorte!');
    });

    this.canvasEngine.onCropComplete = async (x, y, w, h) => {
      this.showToast('✂️', 'Processando recorte...');
      const savedPath = await this.recorder.takeCropScreenshot(x, y, w, h);
      this.showToast('✨', `Recorte salvo em Imagens/EpicPenCaptures!`, true, savedPath);
      this.selectTool('pen', this.toolPenBtn);
    };

    this.btnRecordGif.addEventListener('click', () => this.handleRecordGif());
    this.stopRecBtn.addEventListener('click', () => this.handleRecordGif());

    // Arraste & Acoplamento Lateral (Docking Drawer) da Toolbar
    this.toolbarHeader.addEventListener('mousedown', (e) => {
      if (e.target === this.toggleCollapseBtn || e.target === this.settingsOpenBtn || e.target === this.dockBtn) return;
      this.isDraggingToolbar = true;
      const rect = this.toolbar.getBoundingClientRect();
      this.dragStartX = e.clientX - rect.left;
      this.dragStartY = e.clientY - rect.top;
    });

    window.addEventListener('mousemove', (e) => {
      // Detecção dinâmica de mouse sobre a aba da gaveta lateral mesmo durante o modo pass-through!
      if (this.isPassThroughMode) {
        const toolbarRect = this.toolbar.getBoundingClientRect();
        const isOverToolbar = (
          e.clientX >= toolbarRect.left - 10 &&
          e.clientX <= toolbarRect.right + 10 &&
          e.clientY >= toolbarRect.top - 10 &&
          e.clientY <= toolbarRect.bottom + 10
        ) || (this.isDocked && e.clientX >= window.innerWidth - 50);

        if (isOverToolbar) {
          this.setIgnoreMouse(false);
        } else {
          this.setIgnoreMouse(true);
        }
      }

      if (!this.isDraggingToolbar) return;
      let x = e.clientX - this.dragStartX;
      let y = e.clientY - this.dragStartY;

      if (x > window.innerWidth - 60) {
        this.dockToEdge('right');
        x = window.innerWidth - 290;
      } else if (x < 30) {
        this.dockToEdge('left');
        x = 0;
      } else {
        this.toolbar.classList.remove('docked-right', 'docked-left');
        this.isDocked = false;
        this.dockBtn.classList.remove('active');
      }

      this.toolbar.style.left = `${x}px`;
      this.toolbar.style.top = `${y}px`;
      this.toolbar.style.right = 'auto';
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingToolbar = false;
    });

    // Clique na Toolbar Minimizada / Aba Lateral: Re-ativa o Modo Desenho e Expande!
    this.toolbar.addEventListener('click', () => {
      if (this.isCollapsed) {
        this.toggleCollapse();
      }
      if (this.isPassThroughMode) {
        this.setPassThroughMode(false);
      }
    });

    // Hover Expand/Collapse no Modo Gaveta Lateral Acoplada
    this.toolbar.addEventListener('mouseenter', () => {
      this.setIgnoreMouse(false);
      if (this.isDocked && this.isCollapsed) {
        this.toggleCollapse();
        if (this.isPassThroughMode) {
          this.setPassThroughMode(false);
        }
      }
    });

    this.toolbar.addEventListener('mouseleave', () => {
      if (this.isPassThroughMode) {
        this.setIgnoreMouse(true);
      }
      if (this.isDocked && !this.isCollapsed) {
        this.toggleCollapse();
      }
    });

    // Recolher / Expandir Toolbar
    this.toggleCollapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCollapse();
    });

    const rulerWidget = document.getElementById('rulerWidget');
    if (rulerWidget) {
      rulerWidget.addEventListener('mouseenter', () => this.setIgnoreMouse(false));
      rulerWidget.addEventListener('mouseleave', () => {
        if (this.isPassThroughMode) {
          this.setIgnoreMouse(true);
        }
      });
    }

    const textOverlay = document.getElementById('textOverlay');
    if (textOverlay) {
      textOverlay.addEventListener('mouseenter', () => this.setIgnoreMouse(false));
      textOverlay.addEventListener('mouseleave', () => {
        if (this.isPassThroughMode) {
          this.setIgnoreMouse(true);
        }
      });
    }
  }

  private toggleDockDrawer() {
    this.isDocked = !this.isDocked;
    if (this.isDocked) {
      this.dockToEdge('right');
      if (!this.isCollapsed) this.toggleCollapse();
      this.showToast('📌', 'Gaveta Lateral Acoplada!');
    } else {
      this.toolbar.classList.remove('docked-right', 'docked-left');
      this.dockBtn.classList.remove('active');
      if (this.isCollapsed) this.toggleCollapse();
      this.showToast('📌', 'Modo Flutuante Ativado!');
    }
  }

  private dockToEdge(side: 'left' | 'right') {
    this.isDocked = true;
    this.dockBtn.classList.add('active');
    if (side === 'right') {
      this.toolbar.classList.add('docked-right');
      this.toolbar.classList.remove('docked-left');
      this.toolbar.style.left = 'auto';
      this.toolbar.style.right = '0';
    } else {
      this.toolbar.classList.add('docked-left');
      this.toolbar.classList.remove('docked-right');
      this.toolbar.style.left = '0';
      this.toolbar.style.right = 'auto';
    }
  }

  private selectTool(tool: ToolType, btnElement: HTMLElement) {
    this.canvasEngine.currentTool = tool;
    document.querySelectorAll('.tool-btn, .tool-btn-wide').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    if (tool !== 'badge') this.badgeControls.classList.add('hidden');

    if (this.isPassThroughMode) {
      this.setPassThroughMode(false);
    }
  }

  private toggleRuler() {
    this.ruler.toggle();
    if (this.ruler.active) {
      this.toolRulerBtn.classList.add('active');
      this.showToast('📏', 'Régua ativada! Guia magnética pronta.');
    } else {
      this.toolRulerBtn.classList.remove('active');
    }
  }

  private setPassThroughMode(passThrough: boolean, showBanner: boolean = true) {
    this.isPassThroughMode = passThrough;
    if (passThrough) {
      this.modeInteractBtn.classList.add('active');
      this.modeDrawBtn.classList.remove('active');
      if (showBanner) {
        this.showModeHud('MODO INTERATIVO (Clicando atrás)', '👆', 'Segure Ctrl ou Espaço para rabiscar na hora');
      }
    } else {
      this.modeDrawBtn.classList.add('active');
      this.modeInteractBtn.classList.remove('active');
      if (showBanner) {
        this.showModeHud('MODO DESENHO (Rabiscando)', '✏️', 'Segure Ctrl ou Espaço para clicar no app atrás');
      }
    }
    this.updatePassThroughState();
  }

  private showModeHud(text: string, icon: string, subText: string = '') {
    if (this.modeHudTimeout) clearTimeout(this.modeHudTimeout);
    this.modeHudIcon.innerText = icon;
    this.modeHudText.innerText = text;

    const subElement = this.modeHudElement.querySelector('.mode-hud-sub') as HTMLElement;
    if (subElement) {
      subElement.innerText = subText || 'Segure Ctrl ou Espaço para alternar temporariamente';
    }

    this.modeHudElement.classList.remove('hidden');

    this.modeHudTimeout = window.setTimeout(() => {
      this.modeHudElement.classList.add('hidden');
    }, 1200);
  }

  private setBoardMode(mode: 'transparent' | 'white' | 'black') {
    this.boardState = mode;
    const boardOverlay = document.getElementById('boardOverlay')!;
    boardOverlay.className = `board-${mode}`;

    this.boardTransparentBtn.classList.toggle('active', mode === 'transparent');
    this.boardWhiteBtn.classList.toggle('active', mode === 'white');
    this.boardBlackBtn.classList.toggle('active', mode === 'black');
  }

  private toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.toolbar.classList.toggle('collapsed', this.isCollapsed);
    this.toggleCollapseBtn.innerText = this.isCollapsed ? '+' : '−';
  }

  private async handleScreenshot() {
    this.showToast('📸', 'Capturando tela com anotações...');
    const savedPath = await this.recorder.takeScreenshot();
    this.showToast('✨', `Print salvo em Imagens/EpicPenCaptures!`, true, savedPath);
  }

  private handleRecordGif() {
    this.setIgnoreMouse(false);
    this.recorder.toggleGifRecording((savedPath) => {
      this.showToast('🎬', `Gravação salva em Imagens/EpicPenCaptures!`, true, savedPath);
    });
    this.updatePassThroughState();
  }

  private setIgnoreMouse(ignore: boolean) {
    try {
      invoke('set_ignore_cursor_events', { ignore });
    } catch (e) {
      console.warn('IPC set_ignore_cursor_events não disponível:', e);
    }
  }

  private updatePassThroughState() {
    this.setIgnoreMouse(this.isPassThroughMode);
  }

  private initHotkeys() {
    // Tecla Mestra Hold-To-Toggle (Segurar Ctrl, Alt ou Espaço para alternar temporariamente em ambas as direções!)
    window.addEventListener('keydown', (e) => {
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        return;
      }

      // Suporte Bidirecional a Hold-to-Interact & Hold-to-Draw
      if ((e.key === 'Control' || e.key === ' ' || e.key === 'Alt') && !this.isHoldModeActive) {
        this.isHoldModeActive = true;
        // Inverter modo atual temporariamente!
        this.setPassThroughMode(!this.isPassThroughMode, false);
        return;
      }

      const hotkeys: HotkeyConfig = this.settings.getHotkeys();
      const pressedCombo = this.getPressedCombo(e);

      if (pressedCombo === hotkeys.drawMode.toUpperCase()) {
        e.preventDefault();
        this.setPassThroughMode(!this.isPassThroughMode);
      } else if (pressedCombo === hotkeys.clearCanvas.toUpperCase()) {
        e.preventDefault();
        this.canvasEngine.clear();
        this.showToast('🗑️', 'Tela limpa com sucesso!');
      } else if (pressedCombo === hotkeys.toggleRuler.toUpperCase()) {
        e.preventDefault();
        this.toggleRuler();
      } else if (pressedCombo === hotkeys.takeScreenshot.toUpperCase()) {
        e.preventDefault();
        this.handleScreenshot();
      } else if (pressedCombo === hotkeys.recordGif.toUpperCase()) {
        e.preventDefault();
        this.handleRecordGif();
      } else if (pressedCombo === hotkeys.toggleSpotlight.toUpperCase()) {
        e.preventDefault();
        this.spotlight.toggle();
        this.toolSpotlightBtn.classList.toggle('active', this.spotlight.active);
      } else if (pressedCombo === hotkeys.toggleMagnifier.toUpperCase()) {
        e.preventDefault();
        this.setIgnoreMouse(false);
        this.magnifier.toggle().then(() => this.updatePassThroughState());
        this.toolMagnifierBtn.classList.toggle('active', this.magnifier.active);
      } else if (pressedCombo === hotkeys.toggleBoard.toUpperCase()) {
        e.preventDefault();
        const modes: ('transparent' | 'white' | 'black')[] = ['transparent', 'white', 'black'];
        const next = modes[(modes.indexOf(this.boardState) + 1) % modes.length];
        this.setBoardMode(next);
      } else if (pressedCombo === hotkeys.toggleCollapse.toUpperCase()) {
        e.preventDefault();
        this.toggleCollapse();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.canvasEngine.undo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.canvasEngine.redo();
      }
    });

    // Soltar Tecla Mestra para Reverter o Modo Original
    window.addEventListener('keyup', (e) => {
      if ((e.key === 'Control' || e.key === ' ' || e.key === 'Alt') && this.isHoldModeActive) {
        this.isHoldModeActive = false;
        // Reverter ao modo original!
        this.setPassThroughMode(!this.isPassThroughMode, false);
      }
    });
  }

  private getPressedCombo(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('CTRL');
    if (e.altKey) parts.push('ALT');
    if (e.shiftKey) parts.push('SHIFT');

    const key = e.key.toUpperCase();
    if (!['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) {
      parts.push(key);
    }
    return parts.join('+');
  }

  private showToast(icon: string, message: string, showOpenFolder: boolean = false, pathInfo?: string) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastIcon.innerText = icon;
    this.toastMessage.innerText = message;
    
    if (showOpenFolder) {
      this.openFolderBtn.classList.remove('hidden');
      if (pathInfo) {
        this.toastMessage.innerText = `${message} (${pathInfo.split('\\').pop()})`;
      }
    } else {
      this.openFolderBtn.classList.add('hidden');
    }

    this.toastElement.classList.remove('hidden');

    this.toastTimeout = window.setTimeout(() => {
      this.toastElement.classList.add('hidden');
    }, 5000);
  }
}

// Inicializar Aplicação
window.addEventListener('DOMContentLoaded', () => {
  new EpicPenApp();
});
