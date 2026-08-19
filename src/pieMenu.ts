import { ToolType } from './canvas';

export interface PieMenuItem {
  id: string;
  icon: string;
  label: string;
  type: 'tool' | 'color' | 'action';
  tool?: ToolType;
  color?: string;
  action?: () => void;
}

export class PieMenu {
  private container: HTMLElement;
  private isOpen: boolean = false;
  private centerX: number = 0;
  private centerY: number = 0;
  private items: PieMenuItem[] = [];
  private activeIndex: number = -1;

  public onSelectTool: ((tool: ToolType) => void) | null = null;
  public onSelectColor: ((color: string) => void) | null = null;
  public onAction: ((actionId: string) => void) | null = null;

  constructor() {
    this.container = document.getElementById('pieMenu') as HTMLElement;

    this.items = [
      { id: 'pen', icon: '🖊️', label: 'Caneta', type: 'tool', tool: 'pen' },
      { id: 'highlighter', icon: '🖍️', label: 'Marca-Texto', type: 'tool', tool: 'highlighter' },
      { id: 'laser', icon: '🔴', label: 'Laser', type: 'tool', tool: 'laser' },
      { id: 'eraser', icon: '🧹', label: 'Borracha', type: 'tool', tool: 'eraser' },
      { id: 'spotlight', icon: '💡', label: 'Holofote', type: 'action', action: () => this.triggerAction('spotlight') },
      { id: 'magnifier', icon: '🔍', label: 'Lupa', type: 'action', action: () => this.triggerAction('magnifier') },
      { id: 'ruler', icon: '📏', label: 'Régua', type: 'action', action: () => this.triggerAction('ruler') },
      { id: 'shape', icon: '↗️', label: 'Forma', type: 'tool', tool: 'shape' },
      { id: 'color_yellow', icon: '🟡', label: 'Amarelo', type: 'color', color: '#FFDE59' },
      { id: 'color_red', icon: '🔴', label: 'Vermelho', type: 'color', color: '#FF3131' },
      { id: 'color_cyan', icon: '🔵', label: 'Ciano', type: 'color', color: '#00F0FF' },
      { id: 'color_green', icon: '🟢', label: 'Verde', type: 'color', color: '#00FF66' }
    ];

    this.renderDOM();
    this.initEvents();
  }

  private renderDOM() {
    this.container.innerHTML = '';
    const radius = 115;

    // Botão central de fechar
    const centerBtn = document.createElement('div');
    centerBtn.className = 'pie-center-btn';
    centerBtn.innerHTML = '<span>✖</span>';
    centerBtn.title = 'Fechar Menu Radial';
    
    const handleClose = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      this.close();
    };
    centerBtn.addEventListener('mousedown', handleClose);
    centerBtn.addEventListener('click', handleClose);
    this.container.appendChild(centerBtn);

    const total = this.items.length;
    this.items.forEach((item, idx) => {
      const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const itemEl = document.createElement('div');
      itemEl.className = 'pie-item';
      itemEl.setAttribute('data-index', `${idx}`);
      itemEl.style.transform = `translate(${x}px, ${y}px)`;

      itemEl.innerHTML = `
        <span class="pie-icon">${item.icon}</span>
        <span class="pie-tooltip">${item.label}</span>
      `;

      const handleSelect = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        this.selectItem(idx);
      };

      itemEl.addEventListener('mousedown', handleSelect);
      itemEl.addEventListener('click', handleSelect);

      itemEl.addEventListener('mouseenter', () => {
        this.setActiveIndex(idx);
      });

      this.container.appendChild(itemEl);
    });
  }

  private initEvents() {
    // Rastreamento dinâmico de mouse e clique no setor ativo
    window.addEventListener('mousemove', (e) => {
      if (!this.isOpen) return;

      const dx = e.clientX - this.centerX;
      const dy = e.clientY - this.centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 25) {
        this.setActiveIndex(-1);
        return;
      }

      if (dist > 30 && dist < 180) {
        let angle = Math.atan2(dy, dx) + Math.PI / 2;
        if (angle < 0) angle += Math.PI * 2;

        const total = this.items.length;
        const sliceAngle = (Math.PI * 2) / total;
        const index = Math.floor((angle + sliceAngle / 2) % (Math.PI * 2) / sliceAngle);

        if (index >= 0 && index < total) {
          this.setActiveIndex(index);
        }
      }
    });

    // Clique no container do Pie Menu aciona o item ativo em destaque
    this.container.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (e.target === this.container || (e.target as HTMLElement).classList.contains('pie-menu')) {
        if (this.activeIndex >= 0) {
          this.selectItem(this.activeIndex);
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.close();
      }
    });

    // Clique fora fecha o pie menu
    window.addEventListener('mousedown', (e) => {
      if (!this.isOpen) return;
      if (!this.container.contains(e.target as Node)) {
        this.close();
      }
    });
  }

  public open(x: number, y: number) {
    const margin = 160;
    this.centerX = Math.max(margin, Math.min(window.innerWidth - margin, x));
    this.centerY = Math.max(margin, Math.min(window.innerHeight - margin, y));

    this.container.style.left = `${this.centerX}px`;
    this.container.style.top = `${this.centerY}px`;
    this.container.classList.remove('hidden');
    this.isOpen = true;
    this.setActiveIndex(-1);
  }

  public close() {
    this.container.classList.add('hidden');
    this.isOpen = false;
    this.setActiveIndex(-1);
  }

  public toggle(x: number, y: number) {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(x, y);
    }
  }

  public active(): boolean {
    return this.isOpen;
  }

  private setActiveIndex(idx: number) {
    this.activeIndex = idx;
    const pieItems = this.container.querySelectorAll('.pie-item');
    pieItems.forEach((el, index) => {
      if (index === idx) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  private selectItem(idx: number) {
    if (idx < 0 || idx >= this.items.length) return;
    const item = this.items[idx];

    if (item.type === 'tool' && item.tool && this.onSelectTool) {
      this.onSelectTool(item.tool);
    } else if (item.type === 'color' && item.color && this.onSelectColor) {
      this.onSelectColor(item.color);
    } else if (item.type === 'action' && item.action) {
      item.action();
    }

    this.close();
  }

  private triggerAction(actionId: string) {
    if (this.onAction) {
      this.onAction(actionId);
    }
  }
}
