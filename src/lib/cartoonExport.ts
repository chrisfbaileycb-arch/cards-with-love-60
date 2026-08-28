import JSZip from 'jszip';
import { CartoonProject, CartoonScene, CARTOON_STYLES, PILLARS } from '@/data/cartoonConfig';

/**
 * Formats a project into a clean, human-readable Screenplay / Animator Script (.txt)
 */
export function formatCartoonScriptText(project: CartoonProject): string {
  const pillarInfo = PILLARS[project.pillar] || PILLARS.brand;
  const style = CARTOON_STYLES.find(s => s.id === project.style_id) || CARTOON_STYLES[0];

  let text = `========================================================================\n`;
  text += `KINDTOONS ANIMATED SCREENPLAY & STORYBOARD\n`;
  text += `Title: ${project.title}\n`;
  text += `Pillar: ${pillarInfo.name} — ${pillarInfo.tagline}\n`;
  text += `Target Duration: ${project.target_duration_seconds} Seconds\n`;
  text += `Aspect Ratio: ${project.aspect_ratio}\n`;
  text += `Animation Style: ${style.name}\n`;
  text += `Premise: ${project.premise}\n`;
  text += `Persistent Character Anchor Prompt:\n"${project.character_anchor_prompt}"\n`;
  text += `========================================================================\n\n`;

  let runningSeconds = 0;

  project.scenes.forEach((scene) => {
    const startMin = Math.floor(runningSeconds / 60);
    const startSec = runningSeconds % 60;
    const endTotal = runningSeconds + scene.duration_seconds;
    const endMin = Math.floor(endTotal / 60);
    const endSec = endTotal % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    const timecode = `[${pad(startMin)}:${pad(startSec)} - ${pad(endMin)}:${pad(endSec)}] (${scene.duration_seconds}s)`;

    text += `------------------------------------------------------------------------\n`;
    text += `SCENE ${scene.scene_number} ${timecode}\n`;
    text += `------------------------------------------------------------------------\n`;
    text += `VISUAL PROMPT:\n  ${scene.visual_prompt}\n\n`;
    text += `ACTION & CAMERA NOTES:\n  ${scene.action_notes}\n\n`;
    text += `SOUND FX & MUSIC:\n  🔊 ${scene.sound_fx}\n\n`;
    text += `VOICEOVER / DIALOGUE:\n  🗣️ "${scene.dialogue}"\n\n`;

    runningSeconds += scene.duration_seconds;
  });

  text += `========================================================================\n`;
  text += `Generated with Kindtoons · Simple & Easy Animated Cartoon Generator\n`;
  text += `========================================================================\n`;

  return text;
}

/**
 * Formats a project into standard SRT subtitle format (.srt) for video editors (CapCut, Premiere, DaVinci)
 */
export function formatCartoonSrt(project: CartoonProject): string {
  let srt = '';
  let runningSeconds = 0;

  const toSrtTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.floor(totalSec % 60);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)},000`;
  };

  project.scenes.forEach((scene, index) => {
    const startTime = toSrtTime(runningSeconds);
    const endTime = toSrtTime(runningSeconds + scene.duration_seconds);

    srt += `${index + 1}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${scene.dialogue.trim()}\n\n`;

    runningSeconds += scene.duration_seconds;
  });

  return srt.trim();
}

/**
 * Downloads a raw string content as a file
 */
export function downloadTextFile(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Converts an image source (URL, DataURL, SVG DataURL) to a standard HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Converts an image source into a standard image Blob
 */
export async function imageSourceToBlob(src: string): Promise<Blob> {
  if (src.startsWith('data:')) {
    const [meta, b64] = src.split(',');
    const mime = /:(.*?);/.exec(meta)?.[1] ?? 'image/png';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  // Draw into temporary canvas to get blob
  try {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 450;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      return new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
      });
    }
  } catch {
    // Fallback simple fetch
  }

  const res = await fetch(src);
  return await res.blob();
}

/**
 * Generates a stitched Storyboard Grid Sheet / Strip (PNG) with clean header, numbered scene cards, captions & timecodes
 */
export async function generateStoryboardStripCanvas(project: CartoonProject): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const scenes = project.scenes;
  const count = scenes.length;

  const cols = count <= 3 ? count : count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);

  const cardW = 420;
  const cardH = 340;
  const gap = 24;
  const padX = 40;
  const headerH = 140;
  const footerH = 60;

  const totalW = padX * 2 + cols * cardW + (cols - 1) * gap;
  const totalH = headerH + rows * cardH + (rows - 1) * gap + footerH;

  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = '#0F172A'; // Slate dark premium storyboard paper
  ctx.fillRect(0, 0, totalW, totalH);

  // Top header banner
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, totalW, headerH - 20);

  // Accent header line
  const pillarInfo = PILLARS[project.pillar] || PILLARS.brand;
  ctx.fillStyle = pillarInfo.accentColor;
  ctx.fillRect(0, 0, totalW, 6);

  // Title & Metadata
  ctx.font = 'bold 26px "Fredoka", system-ui, sans-serif';
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(project.title, padX, 48);

  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#94A3B8';
  const metaText = `Kindtoons Storyboard · ${pillarInfo.name.toUpperCase()} · ${project.target_duration_seconds}s (${count} Scenes) · ${project.aspect_ratio}`;
  ctx.fillText(metaText, padX, 78);

  ctx.font = 'italic 13px system-ui, sans-serif';
  ctx.fillStyle = '#CBD5E1';
  const premiseSnippet = project.premise.length > 90 ? project.premise.slice(0, 90) + '...' : project.premise;
  ctx.fillText(`"${premiseSnippet}"`, padX, 102);

  let runningSec = 0;

  // Render each scene card
  for (let i = 0; i < count; i++) {
    const scene = scenes[i];
    const colIndex = i % cols;
    const rowIndex = Math.floor(i / cols);

    const x = padX + colIndex * (cardW + gap);
    const y = headerH + rowIndex * (cardH + gap);

    // Card background
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    // Scene preview image
    const imgX = x + 12;
    const imgY = y + 12;
    const imgW = cardW - 24;
    const imgH = 170;

    const imgSrc = scene.customUploadedImage || scene.imageUrl;
    if (imgSrc) {
      try {
        const img = await loadImage(imgSrc);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, 8);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
        ctx.restore();
      } catch {
        ctx.fillStyle = '#334155';
        ctx.fillRect(imgX, imgY, imgW, imgH);
      }
    } else {
      ctx.fillStyle = '#334155';
      ctx.fillRect(imgX, imgY, imgW, imgH);
    }

    // Scene badge over image
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(imgX + 8, imgY + 8, 86, 26, 6);
    ctx.fill();

    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(`SCENE ${scene.scene_number}`, imgX + 16, imgY + 25);

    // Time badge
    const startS = runningSec;
    const endS = runningSec + scene.duration_seconds;
    runningSec += scene.duration_seconds;

    ctx.fillStyle = pillarInfo.accentColor;
    ctx.beginPath();
    ctx.roundRect(imgX + imgW - 80, imgY + 8, 72, 26, 6);
    ctx.fill();

    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${startS}s - ${endS}s`, imgX + imgW - 74, imgY + 25);

    // Dialogue text area
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('Dialogue / Voiceover:', x + 16, y + 206);

    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#F1F5F9';
    wrapText(ctx, `"${scene.dialogue}"`, x + 16, y + 226, cardW - 32, 16, 2);

    // Action notes
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#94A3B8';
    wrapText(ctx, `Action: ${scene.action_notes}`, x + 16, y + 272, cardW - 32, 15, 2);

    // Sound FX tag
    ctx.font = 'italic 11px system-ui, sans-serif';
    ctx.fillStyle = '#64748B';
    const sfx = scene.sound_fx.length > 40 ? scene.sound_fx.slice(0, 40) + '...' : scene.sound_fx;
    ctx.fillText(`🔊 ${sfx}`, x + 16, y + 322);
  }

  // Footer
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Kindtoons · Purpose · Vision · Family · Brand', padX, totalH - 24);

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2
) {
  const words = text.split(' ');
  let line = '';
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      linesCount++;
      if (linesCount >= maxLines) {
        ctx.fillText(line.trim() + '...', x, y);
        return;
      }
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

/**
 * Downloads a complete ZIP bundle containing:
 * - individual scene images (frame_01.png, frame_02.png...)
 * - script.json (structured schema)
 * - script.txt (formatted screenplay)
 * - subtitles.srt (standard video timing)
 * - storyboard_strip.png (stitched strip)
 */
export async function downloadCartoonZipBundle(project: CartoonProject) {
  const zip = new JSZip();
  const folderName = `kindtoons_${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}`;
  const root = zip.folder(folderName) || zip;

  // 1. Structured JSON
  root.file('script.json', JSON.stringify(project, null, 2));

  // 2. Formatted Screenplay TXT
  root.file('script.txt', formatCartoonScriptText(project));

  // 3. SRT Subtitles
  root.file('subtitles.srt', formatCartoonSrt(project));

  // 4. Stitched Storyboard Strip
  try {
    const stripCanvas = await generateStoryboardStripCanvas(project);
    const stripBlob = await new Promise<Blob>((resolve) => stripCanvas.toBlob((b) => resolve(b || new Blob()), 'image/png'));
    root.file('storyboard_strip.png', stripBlob);
  } catch (err) {
    console.warn('Failed to stitch storyboard strip into zip:', err);
  }

  // 5. Individual Scene Frames
  const framesFolder = root.folder('scene_frames');
  for (let i = 0; i < project.scenes.length; i++) {
    const scene = project.scenes[i];
    const src = scene.customUploadedImage || scene.imageUrl;
    if (src && framesFolder) {
      try {
        const blob = await imageSourceToBlob(src);
        const padIndex = String(scene.scene_number).padStart(2, '0');
        framesFolder.file(`scene_${padIndex}_frame.png`, blob);
      } catch (err) {
        console.warn(`Failed to package scene frame ${scene.scene_number}:`, err);
      }
    }
  }

  // Generate ZIP file and trigger browser download
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folderName}_bundle.zip`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Web Audio Sound Effects Synthesizer for instant preview audio
 */
export class CartoonAudioSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a cheery cartoon pop / boing sound
  playPop() {
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio autoplay restrictions
    }
  }

  // Play a sparkling chime sound effect
  playSparkle() {
    try {
      const ctx = this.initCtx();
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.3);
      });
    } catch (e) {
      console.warn('Audio synthesis warning:', e);
    }
  }

  // Play a cinematic whoosh transition sound
  playWhoosh() {
    try {
      const ctx = this.initCtx();
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
    } catch (e) {
      console.warn('Audio synthesis warning:', e);
    }
  }
}

export const cartoonAudio = new CartoonAudioSynthesizer();
