# 🖊️ EpicPenRedo (Pro Screen Drawing & Annotation Suite)

Um aplicativo moderno, ultra-leve e elegante de **desenho e anotação sobre a tela** feito em **Tauri v2 + Rust + Vanilla TypeScript**, com transparência completa, clique pass-through instantâneo, gravação de miniaulas e gaveta retrátil.

![Tauri v2](https://img.shields.io/badge/Tauri-v2-blue?style=for-the-badge&logo=tauri)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Rust](https://img.shields.io/badge/Rust-1.75+-000000?style=for-the-badge&logo=rust)

---

## ✨ Principais Funcionalidades

- 🖊️ **Caneta Livre & Marca-Texto:** Traço suave e marca-texto semi-transparente com paleta de cores neon e seletor customizado.
- 🔴 **Apontador Laser Contínuo (Neon Ribbon):** Rastro fluorescente contínuo com interpolação sub-pixel e cursor de ponto quente.
- 📏 **Régua Magnética Interativa:** Ajuste de comprimento por arraste lateral, rotação por scroll ou alça de arraste (0°-360°) e alinhamento reto magnético automático.
- ① **Carimbos Numerados Sequenciais:** Clique na tela para posicionar marcadores numéricos (`1`, `2`, `3`...) para explicações passo a passo.
- 💡 **Modo Holofote (Spotlight Focus):** Escurecimento da tela com recorte iluminado no cursor e sliders de opacidade e raio.
- 🔍 **Lupa de Tela HD 2x/3x:** Ampliação de alta fidelidade sem efeito espelho para foco em códigos ou gráficos pequenos.
- 🎙️ **Gravação de Miniaulas (Vídeo + Microfone):** Grava o vídeo da tela com anotações e áudio de voz em `.webm`.
- 📸 **Print Screen & Recorte Selecionado (Crop Snipping):** Salva fotos da tela cheia ou de recortes retangulares diretamente na pasta `Pictures/EpicPenCaptures` e no Clipboard.
- ⚡ **Modo Hold-to-Draw:** Segurar a tecla `Ctrl` ou `Espaço` permite rabiscar instantaneamente no modo interativo.
- 📌 **Gaveta Lateral Retrátil (Edge Docking Drawer):** Acoplamento coladinho na borda com aba vertical (`E P I C P E N`) e expansão por hover do mouse.
- 🔔 **System Tray Nativo:** Ícone na bandeja do sistema (perto do relógio no Windows) com menu de contexto rápido.
- ⚙️ **Reconfigurador de Atalhos:** Modal para personalização de teclas de atalho com salvamento automático.

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

4. Gerar o instalador / executável de produção:
   ```bash
   npm run tauri build
   ```

---

## ⌨️ Atalhos Padrão de Teclado

| Ação | Atalho Padrão |
|---|---|
| Alternar Desenho / Interagir | `Alt + D` |
| Limpar Tela | `Alt + C` |
| Régua Magnética | `Alt + R` |
| Print Screen | `Alt + S` |
| Gravar Miniaula / GIF | `Alt + G` |
| Modo Holofote | `Alt + L` |
| Lupa de Tela | `Alt + M` |
| Quadro Negro / Branco / Tela | `Alt + B` |
| Minimizar Toolbar | `Alt + H` |

---

## 📜 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
