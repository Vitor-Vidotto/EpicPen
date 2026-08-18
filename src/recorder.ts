import { invoke } from '@tauri-apps/api/core';

export class MediaRecorderTool {
  private canvas: HTMLCanvasElement;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  public recordAudio: boolean = true; // Habilitar microfone por padrão

  private recStartTime: number = 0;
  private timerInterval: number | null = null;
  private audioStream: MediaStream | null = null;

  private recordingBadge: HTMLElement;
  private recordingTimer: HTMLElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.recordingBadge = document.getElementById('recordingBadge') as HTMLElement;
    this.recordingTimer = document.getElementById('recordingTimer') as HTMLElement;
  }

  // Capturar Print Screen da Tela Cheia
  public async takeScreenshot(): Promise<string> {
    const dataUrl = this.canvas.toDataURL('image/png');

    try {
      await invoke('copy_image_to_clipboard', { base64Data: dataUrl });
      const filename = `epic_pen_print_${Date.now()}.png`;
      const savedPath = await invoke<string>('save_file', { base64Data: dataUrl, filename });
      return savedPath;
    } catch (err) {
      console.error('Erro ao salvar screenshot:', err);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `epic_pen_print_${Date.now()}.png`;
      a.click();
      return 'download';
    }
  }

  // Capturar Print Screen de Área Selecionada (Crop Snipping)
  public async takeCropScreenshot(x: number, y: number, w: number, h: number): Promise<string> {
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = Math.max(1, Math.abs(w));
    cropCanvas.height = Math.max(1, Math.abs(h));
    const cropCtx = cropCanvas.getContext('2d')!;

    const srcX = Math.min(x, x + w);
    const srcY = Math.min(y, y + h);
    const srcW = Math.abs(w);
    const srcH = Math.abs(h);

    cropCtx.drawImage(this.canvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    const dataUrl = cropCanvas.toDataURL('image/png');

    try {
      await invoke('copy_image_to_clipboard', { base64Data: dataUrl });
      const filename = `epic_pen_crop_${Date.now()}.png`;
      const savedPath = await invoke<string>('save_file', { base64Data: dataUrl, filename });
      return savedPath;
    } catch (err) {
      console.error('Erro ao salvar crop screenshot:', err);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `epic_pen_crop_${Date.now()}.png`;
      a.click();
      return 'download';
    }
  }

  // Iniciar / Parar Gravação de Vídeo / GIF
  public toggleGifRecording(onComplete: (path: string) => void) {
    if (this.isRecording) {
      this.stopRecording(onComplete);
    } else {
      this.startRecording();
    }
  }

  public async startRecording() {
    try {
      const videoStream = this.canvas.captureStream(30); // 30 FPS
      const combinedStream = new MediaStream();

      // Adicionar trilha de vídeo do canvas
      videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));

      // Tentar capturar microfone se habilitado
      if (this.recordAudio && navigator.mediaDevices) {
        try {
          this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
        } catch (micErr) {
          console.warn('Microfone não disponível ou negado, gravando apenas vídeo:', micErr);
        }
      }

      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }

      this.mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.recStartTime = Date.now();

      this.recordingBadge.classList.remove('hidden');
      this.updateTimerUI();

      this.timerInterval = window.setInterval(() => {
        this.updateTimerUI();
      }, 1000);
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      alert('Não foi possível iniciar a gravação do Canvas!');
    }
  }

  public stopRecording(onComplete: (path: string) => void) {
    if (!this.mediaRecorder || !this.isRecording) return;

    this.isRecording = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.recordingBadge.classList.add('hidden');

    // Parar microfone
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    this.mediaRecorder.onstop = async () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const filename = `epic_pen_rec_${Date.now()}.webm`;
        try {
          const savedPath = await invoke<string>('save_file', { base64Data, filename });
          onComplete(savedPath);
        } catch (err) {
          console.error('Erro ao salvar gravação:', err);
          const a = document.createElement('a');
          a.href = base64Data;
          a.download = filename;
          a.click();
          onComplete(filename);
        }
      };
    };

    this.mediaRecorder.stop();
  }

  private updateTimerUI() {
    const elapsedSec = Math.floor((Date.now() - this.recStartTime) / 1000);
    const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const secs = String(elapsedSec % 60).padStart(2, '0');
    const micStatus = this.recordAudio ? ' 🎙️' : '';
    this.recordingTimer.innerText = `Gravando Miniaula ${mins}:${secs}${micStatus}`;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}
