# 🖊️ EpicPenRedo (Pro Screen Drawing & Annotation Suite)

<div align="center">

```
  ____ ____ ___ ____ ____ ____ _  _ ____ ____ ___  ____ 
  |___ |___  |  |    |___ |___ |\ | |__/ |___ |  \ |  | 
  |___ |    _|_ |___ |___ |    | \| |  \ |___ |__/ |__| 
```

**Uma suíte moderna, ultra-leve e elegante de anotações sobre a tela para apresentadores, professores e criadores de conteúdo.**

![Tauri v2](https://img.shields.io/badge/Tauri-v2.0-24C8D5?style=for-the-badge&logo=tauri&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-1.75+-000000?style=for-the-badge&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License MIT](https://img.shields.io/badge/License-MIT-00FF66?style=for-the-badge)

</div>

---

## 🎨 O Conceito da Arquitetura (SVG Banner)

<div align="center">

<svg width="780" height="240" viewBox="0 0 780 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="780" height="240" rx="16" fill="#0F0F18" stroke="#1E1E2E" stroke-width="2"/>
  
  <!-- Grid Lines -->
  <path d="M0 40H780M0 80H780M0 120H780M0 160H780M0 200H780" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
  <path d="M130 0V240M260 0V240M390 0V240M520 0V240M650 0V240" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>

  <!-- Core Box 1: Windows OS / Desktop -->
  <g transform="translate(40, 50)">
    <rect width="180" height="140" rx="12" fill="#161626" stroke="#2A2A40" stroke-width="2"/>
    <text x="90" y="40" fill="#8A8AAB" font-family="Inter, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">SISTEMA OPERACIONAL</text>
    <rect x="25" y="60" width="130" height="30" rx="6" fill="#000000" stroke="#00F0FF" stroke-opacity="0.4"/>
    <text x="90" y="80" fill="#00F0FF" font-family="Inter, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Windows Pass-Through</text>
    <text x="90" y="115" fill="#626280" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">Transparência Total (0% Lag)</text>
  </g>

  <!-- Arrow 1 -->
  <path d="M230 120H280" stroke="#00F0FF" stroke-width="2" stroke-dasharray="4 4"/>
  <polygon points="285,120 275,115 275,125" fill="#00F0FF"/>

  <!-- Core Box 2: Rust Engine (Tauri v2) -->
  <g transform="translate(290, 50)">
    <rect width="200" height="140" rx="12" fill="#161626" stroke="#FF5555" stroke-width="2"/>
    <text x="100" y="40" fill="#FF8888" font-family="Inter, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">RUST NATIVE ENGINE</text>
    <rect x="20" y="58" width="160" height="28" rx="6" fill="#261616" stroke="#FF5555" stroke-opacity="0.5"/>
    <text x="100" y="76" fill="#FF8888" font-family="Inter, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Global Hotkeys & Tray</text>
    <text x="100" y="105" fill="#AAAAAA" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">set_ignore_cursor_events</text>
    <text x="100" y="122" fill="#626280" font-family="Inter, sans-serif" font-size="9" text-anchor="middle">Ultra leve (&lt; 25MB RAM)</text>
  </g>

  <!-- Arrow 2 -->
  <path d="M500 120H550" stroke="#00FF66" stroke-width="2" stroke-dasharray="4 4"/>
  <polygon points="555,120 545,115 545,125" fill="#00FF66"/>

  <!-- Core Box 3: Canvas 2D + UI Suite -->
  <g transform="translate(560, 50)">
    <rect width="180" height="140" rx="12" fill="#161626" stroke="#00FF66" stroke-width="2"/>
    <text x="90" y="35" fill="#88FFBB" font-family="Inter, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">CANVAS 2D &amp; PIE UI</text>
    <text x="90" y="60" fill="#FFFFFF" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">⭕ Menu Radial (Ctrl+Espaço)</text>
    <text x="90" y="78" fill="#FFFFFF" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">✨ Auto-Formas Inteligentes</text>
    <text x="90" y="96" fill="#FFFFFF" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">⏱️ Temporizador Flutuante</text>
    <text x="90" y="114" fill="#FFFFFF" font-family="Inter, sans-serif" font-size="10" text-anchor="middle">📏 Régua &amp; Gravação Vídeo</text>
  </g>
</svg>

</div>

---

## ✨ Principais Funcionalidades

- ⭕ **Menu Radial sob o Cursor (Pie Menu):** Pressione `Ctrl + Espaço` ou clique com o botão direito para abrir um menu circular neon ao redor do mouse e selecionar ferramentas ou cores instantaneamente sem mover a mão até a toolbar.
- ✨ **Reconhecimento Automático de Formas (Smart Auto-Shape):** Rabisque um quadrado, círculo ou linha reta à mão livre e o algoritmo converte o traço automaticamente em vetores geométricos perfeitos.
- ⏱️ **Temporizador & Cronômetro Flutuante:** Widget arrastável com contagem regressiva, cronômetro, atalhos rápidos de tempo (`+1m`, `+5m`) e alarme sonoro sintetizado ao finalizar.
- 📌 **Gaveta Lateral Retrátil Inteligente (Edge Docking Drawer):** O aplicativo inicia minimizado na borda da tela. Passe o mouse para expandir ou clique no botão de fixar (`📌`) para travá-lo permanentemente na tela.
- 🖊️ **Caneta Libre, Marca-Texto e Laser Neon:** Traço fluido sub-pixel com paleta de cores neon, variância de espessura e rastro de laser com núcleo brilhante.
- 📏 **Régua Magnética Interativa:** Ajuste de tamanho, rotação livre de 0° a 360° com o scroll do mouse e guia de atração magnética automática para linhas perfeitamente retas.
- ① **Carimbos Numerados Sequenciais:** Adicione marcadores numerados (`1`, `2`, `3`...) com um clique para explicações passo a passo.
- 💡 **Modo Holofote (Spotlight Focus):** Escurecimento ajustável da tela com foco iluminado centralizado no ponteiro do mouse.
- 🔍 **Lupa de Tela HD 2x/3x:** Ampliação de alta fidelidade para destacar trechos de código, tabelas ou gráficos pequenos.
- 🎙️ **Gravação de Miniaulas (Vídeo + Microfone):** Gravação de tela com áudio de voz diretamente em `.webm`.
- 📸 **Print Screen & Recorte Selecionado (Crop Snipping):** Salve capturas da tela inteira ou de recortes retangulares diretamente na pasta `Imagens/EpicPenCaptures`.

---

## ⌨️ Atalhos de Teclado Padrão

| Ação | Atalho Padrão |
| :--- | :--- |
| **Alternar Modo Desenho / Interagir** | `Ctrl + Alt + D` |
| **Abrir Menu Radial (Pie Menu)** | `Ctrl + Espaço` ou `Botão Direito` |
| **Modo Hold Temporário (Segurar)** | `Espaço` (Hold) |
| **Limpar Tela** | `Alt + C` |
| **Régua Magnética** | `Alt + R` |
| **Print Screen Tela Cheia** | `Alt + S` |
| **Gravar Miniaula / Vídeo** | `Alt + G` |
| **Modo Holofote (Spotlight)** | `Alt + L` |
| **Lupa de Tela (Magnifier)** | `Alt + M` |
| **Fundo Quadro Negro / Branco / Tela** | `Alt + B` |
| **Minimizar / Expandir Barra** | `Alt + H` |
| **Desfazer / Refazer** | `Ctrl + Z` / `Ctrl + Y` |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v18+)
- [Rust Toolchain](https://www.rust-lang.org/)

### Passos:
1. Clone o repositório:
   ```bash
   git clone https://github.com/Vitor-Vidotto/EpicPen.git
   cd EpicPen
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute em modo de desenvolvimento:
   ```bash
   npm run tauri dev
   ```

4. Gerar o executável / instalador de produção:
   ```bash
   npm run tauri build
   ```

---

## 📜 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais detalhes.
