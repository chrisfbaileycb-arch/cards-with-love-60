import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ASPECT_RATIOS,
  AspectRatioId,
  CartoonProject,
  CARTOON_STYLES,
  PILLARS,
  VOICE_TONES
} from '@/data/cartoonConfig';
import {
  cartoonAudio,
  downloadCartoonZipBundle,
  downloadTextFile,
  formatCartoonScriptText,
  formatCartoonSrt,
  generateStoryboardStripCanvas
} from '@/lib/cartoonExport';
import { generateSceneArtwork } from '@/lib/geminiCartoon';
import { saveCartoonProject } from '@/lib/cartoonLibrary';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  FileText,
  FileCode,
  Layers,
  Sparkles,
  Check,
  Bookmark,
  Share2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerStepProps {
  project: CartoonProject;
  onBackToScript: () => void;
  onSaveToLibrary?: () => void;
}

export const PlayerStep: React.FC<PlayerStepProps> = ({ project, onBackToScript, onSaveToLibrary }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneElapsedTime, setSceneElapsedTime] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [previewRatio, setPreviewRatio] = useState<AspectRatioId>(project.aspect_ratio);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingStrip, setIsExportingStrip] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number | null>(null);
  const synthSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const pillarInfo = (project.pillar && PILLARS[project.pillar]) || PILLARS.love;
  const style = CARTOON_STYLES.find((s) => s.id === project.style_id) || CARTOON_STYLES[0];
  const voiceTone = VOICE_TONES.find((v) => v.id === project.voice_tone_id) || VOICE_TONES[0];

  const totalDuration = project.scenes.reduce((acc, s) => acc + s.duration_seconds, 0);
  const currentScene = project.scenes[currentSceneIndex] || project.scenes[0];

  // Helper to trigger voice narration for current scene
  const triggerSpeechNarration = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceTone.rate * playbackSpeed;
      utterance.pitch = voiceTone.pitch;
      synthSpeechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis issues
    }
  };

  // Play audio sound effects & narration when scene changes during active playback
  const onSceneChanged = (newIndex: number) => {
    setCurrentSceneIndex(newIndex);
    setSceneElapsedTime(0);

    if (!isMuted) {
      if (newIndex === 0) {
        cartoonAudio.playWhoosh();
      } else if (newIndex === project.scenes.length - 1) {
        cartoonAudio.playSparkle();
      } else {
        cartoonAudio.playPop();
      }
    }

    const scene = project.scenes[newIndex];
    if (scene) {
      triggerSpeechNarration(scene.dialogue);
    }
  };

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      lastTickTimeRef.current = null;
      return;
    }

    const tick = (time: number) => {
      if (lastTickTimeRef.current === null) {
        lastTickTimeRef.current = time;
      }
      const deltaSec = ((time - lastTickTimeRef.current) / 1000) * playbackSpeed;
      lastTickTimeRef.current = time;

      setSceneElapsedTime((prevSceneTime) => {
        const nextSceneTime = prevSceneTime + deltaSec;
        const targetSceneDuration = currentScene.duration_seconds;

        if (nextSceneTime >= targetSceneDuration) {
          // Advance to next scene or loop/finish
          if (currentSceneIndex < project.scenes.length - 1) {
            onSceneChanged(currentSceneIndex + 1);
            return 0;
          } else {
            // End of cartoon
            setIsPlaying(false);
            setCurrentSceneIndex(0);
            setTotalElapsedTime(0);
            return 0;
          }
        }
        return nextSceneTime;
      });

      setTotalElapsedTime((prevTotal) => Math.min(totalDuration, prevTotal + deltaSec));

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentSceneIndex, currentScene, playbackSpeed, totalDuration, isMuted]);

  const togglePlay = () => {
    if (!isPlaying) {
      if (currentSceneIndex === 0 && sceneElapsedTime === 0) {
        triggerSpeechNarration(currentScene.dialogue);
        if (!isMuted) cartoonAudio.playWhoosh();
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentSceneIndex(0);
    setSceneElapsedTime(0);
    setTotalElapsedTime(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const jumpToScene = (index: number) => {
    let running = 0;
    for (let i = 0; i < index; i++) {
      running += project.scenes[i].duration_seconds;
    }
    setCurrentSceneIndex(index);
    setSceneElapsedTime(0);
    setTotalElapsedTime(running);
    if (isPlaying) {
      triggerSpeechNarration(project.scenes[index].dialogue);
    }
  };

  // Export handlers
  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      await downloadCartoonZipBundle(project);
    } catch (err) {
      console.error('ZIP Export failed:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleDownloadStrip = async () => {
    try {
      setIsExportingStrip(true);
      const canvas = await generateStoryboardStripCanvas(project);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_storyboard.png`;
      link.click();
    } catch (err) {
      console.error('Storyboard strip failed:', err);
    } finally {
      setIsExportingStrip(false);
    }
  };

  const handleSaveToLibrary = () => {
    saveCartoonProject(project);
    setSavedSuccess(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    if (onSaveToLibrary) onSaveToLibrary();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyScript = () => {
    const text = formatCartoonScriptText(project);
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Current Scene Image
  const activeImageSrc =
    currentScene?.customUploadedImage ||
    currentScene?.imageUrl ||
    generateSceneArtwork(
      currentScene?.visual_prompt || '',
      project.style_id,
      currentScene?.scene_number || 1,
      project.title,
      project.pillar
    );

  // Aspect ratio styling
  const ratioConfig = ASPECT_RATIOS[previewRatio];

  return (
    <div className="space-y-8" id="player-step-container">
      {/* Top Bar with metadata and quick actions */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E6DCCB] bg-white p-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: pillarInfo.badgeBg, color: pillarInfo.badgeText }}
            >
              {pillarInfo.name}
            </span>
            <span className="text-xs font-semibold text-[#8A7E72]">
              {totalDuration}s Animated Storyboard · {project.scenes.length} Scenes
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#2C2A29]">{project.title}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBackToScript}
            className="rounded-full border border-[#E0D5C2] bg-[#FAF5EE] px-4 py-2 text-xs font-semibold text-[#5C5248] transition hover:bg-white"
          >
            ← Edit Script &amp; Scenes
          </button>

          <button
            type="button"
            id="save-to-library-btn"
            onClick={handleSaveToLibrary}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow transition',
              savedSuccess ? 'bg-[#059669]' : 'bg-[#2C2A29] hover:bg-[#413D3A]'
            )}
          >
            {savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span>{savedSuccess ? 'Saved in My Toons!' : 'Save Cartoon'}</span>
          </button>
        </div>
      </div>

      {/* Main Player Cinema Canvas */}
      <div className="relative mx-auto flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#2C2A29] bg-[#0A0D14] p-4 shadow-2xl sm:p-6">
        {/* Aspect Ratio Frame */}
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl transition-all duration-300',
            previewRatio === '9:16'
              ? 'h-[540px] w-[304px] sm:h-[600px] sm:w-[338px]'
              : previewRatio === '1:1'
              ? 'h-[360px] w-[360px] sm:h-[460px] sm:w-[460px]'
              : 'h-[300px] w-[533px] sm:h-[400px] sm:w-[711px] lg:h-[450px] lg:w-[800px]'
          )}
        >
          {/* Animated Cartoon Stage Artwork with Ken Burns Effect */}
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={activeImageSrc}
              alt={`Scene ${currentScene.scene_number}`}
              className={cn(
                'h-full w-full object-cover transition-transform duration-1000 ease-out',
                isPlaying ? 'scale-110' : 'scale-100'
              )}
            />
            {/* Cinematic Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Top Scene Marker & Pillar Badge */}
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                <span>Scene {currentScene.scene_number} / {project.scenes.length}</span>
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: pillarInfo.accentColor }}
              >
                {style.name}
              </span>
            </div>

            {/* Top Right Timer */}
            <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-mono font-bold text-[#FBBF24] backdrop-blur-md">
              {Math.floor(totalElapsedTime)}s / {totalDuration}s
            </div>

            {/* Animated Subtitle / Dialogue Caption Box */}
            <div className="absolute bottom-4 left-3 right-3 rounded-xl border border-white/20 bg-black/85 p-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
                <span className="flex items-center gap-1">
                  <Volume2 className="h-3 w-3" /> Voiceover Line:
                </span>
                <span className="text-white/60">
                  {Math.floor(sceneElapsedTime)}s / {currentScene.duration_seconds}s
                </span>
              </div>
              <p className="mt-1 font-serif text-sm font-medium leading-relaxed text-white sm:text-base">
                "{currentScene.dialogue}"
              </p>
              {currentScene.action_notes && (
                <p className="mt-1 text-[11px] italic text-[#94A3B8]">
                  🎬 Action: {currentScene.action_notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="mt-6 w-full max-w-2xl space-y-3">
          {/* Progress timeline scrubber */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[#94A3B8]">
              <span>{Math.floor(totalElapsedTime)}s</span>
              <span className="text-[#FBBF24]">
                Scene {currentScene.scene_number}: {Math.floor(sceneElapsedTime)}s / {currentScene.duration_seconds}s
              </span>
              <span>{totalDuration}s</span>
            </div>

            {/* Multi-segment scene progress bar */}
            <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full bg-white/10">
              {project.scenes.map((scene, idx) => {
                let fillPercent = 0;
                if (idx < currentSceneIndex) {
                  fillPercent = 100;
                } else if (idx === currentSceneIndex) {
                  fillPercent = Math.min(100, (sceneElapsedTime / scene.duration_seconds) * 100);
                }

                return (
                  <div
                    key={scene.scene_number}
                    onClick={() => jumpToScene(idx)}
                    className="relative h-full flex-1 cursor-pointer bg-white/20 transition-all hover:bg-white/40"
                    title={`Scene ${scene.scene_number} (${scene.duration_seconds}s)`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-100"
                      style={{
                        width: `${fillPercent}%`,
                        backgroundColor: pillarInfo.accentColor
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-white">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="player-toggle-btn"
                onClick={togglePlay}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="rounded-full p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                title="Restart"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                disabled={currentSceneIndex === 0}
                onClick={() => jumpToScene(Math.max(0, currentSceneIndex - 1))}
                className="rounded-full p-2 text-white/70 transition hover:bg-white/10 disabled:opacity-30"
                title="Previous Scene"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                disabled={currentSceneIndex === project.scenes.length - 1}
                onClick={() => jumpToScene(Math.min(project.scenes.length - 1, currentSceneIndex + 1))}
                className="rounded-full p-2 text-white/70 transition hover:bg-white/10 disabled:opacity-30"
                title="Next Scene"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="rounded-full p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                title={isMuted ? 'Unmute voiceover' : 'Mute voiceover'}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>

            {/* Speed & Aspect switcher */}
            <div className="flex items-center gap-2 text-xs">
              {/* Playback Speed */}
              <button
                type="button"
                onClick={() => {
                  const speeds = [1.0, 1.25, 1.5, 0.75];
                  const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                  setPlaybackSpeed(speeds[nextIdx]);
                }}
                className="rounded-lg bg-white/10 px-2.5 py-1 font-mono font-semibold text-white/90 hover:bg-white/20"
                title="Change speed"
              >
                {playbackSpeed}x
              </button>

              {/* Aspect Ratio Switcher */}
              <div className="flex rounded-lg bg-white/10 p-0.5">
                {(['9:16', '16:9', '1:1'] as AspectRatioId[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setPreviewRatio(r)}
                    className={cn(
                      'rounded px-2 py-0.5 text-[11px] font-semibold transition',
                      previewRatio === r ? 'bg-white text-black font-bold' : 'text-white/70 hover:text-white'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export & Download Hub */}
      <div className="rounded-2xl border border-[#E6DCCB] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2C2A29]">
              Export Digital Cartoon Assets
            </h3>
            <p className="text-xs text-[#6D6459]">
              Download ready-to-use bundles, frame images, SRT subtitles, and screenplays for social media or animators.
            </p>
          </div>
          <span className="rounded-full bg-[#FAF5EE] px-3 py-1 text-xs font-bold text-[#78542F]">
            100% Free · Instant Export
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Complete ZIP Bundle */}
          <div className="flex flex-col justify-between rounded-xl border border-[#2C2A29] bg-[#FAF5EE] p-4">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2C2A29] text-white">
                <Layers className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-[#2C2A29]">Full ZIP Bundle</h4>
              <p className="mt-1 text-xs text-[#6D6459]">
                All frame images + script.json + script.txt + subtitles.srt + storyboard strip.
              </p>
            </div>
            <button
              type="button"
              id="download-zip-btn"
              disabled={isExportingZip}
              onClick={handleDownloadZip}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2C2A29] py-2 text-xs font-bold text-white transition hover:bg-[#413D3A]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExportingZip ? 'Packing ZIP...' : 'Download .ZIP'}</span>
            </button>
          </div>

          {/* 2. Storyboard Sheet (PNG) */}
          <div className="flex flex-col justify-between rounded-xl border border-[#E6DCCB] bg-white p-4 hover:border-[#A4794A]">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4ECE1] text-[#A4794A]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-[#2C2A29]">Storyboard Strip</h4>
              <p className="mt-1 text-xs text-[#6D6459]">
                Stitched high-res multi-scene comic strip PNG with captions &amp; timecodes.
              </p>
            </div>
            <button
              type="button"
              id="download-strip-btn"
              disabled={isExportingStrip}
              onClick={handleDownloadStrip}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E0D5C2] bg-[#FDFBF7] py-2 text-xs font-semibold text-[#2C2A29] transition hover:border-[#A4794A] hover:bg-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExportingStrip ? 'Rendering PNG...' : 'Download Strip PNG'}</span>
            </button>
          </div>

          {/* 3. Screenplay Script (TXT & JSON) */}
          <div className="flex flex-col justify-between rounded-xl border border-[#E6DCCB] bg-white p-4 hover:border-[#A4794A]">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4ECE1] text-[#A4794A]">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-[#2C2A29]">Screenplay &amp; Script</h4>
              <p className="mt-1 text-xs text-[#6D6459]">
                Formatted script with visual notes, dialogue lines, and timing for voice actors.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    formatCartoonScriptText(project),
                    `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_script.txt`
                  )
                }
                className="flex-1 rounded-lg border border-[#E0D5C2] bg-[#FDFBF7] py-2 text-center text-xs font-semibold text-[#2C2A29] hover:bg-white"
              >
                .TXT Script
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    JSON.stringify(project, null, 2),
                    `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`,
                    'application/json'
                  )
                }
                className="flex-1 rounded-lg border border-[#E0D5C2] bg-[#FDFBF7] py-2 text-center text-xs font-semibold text-[#2C2A29] hover:bg-white"
              >
                .JSON Schema
              </button>
            </div>
          </div>

          {/* 4. Subtitles (SRT) & Clipboard */}
          <div className="flex flex-col justify-between rounded-xl border border-[#E6DCCB] bg-white p-4 hover:border-[#A4794A]">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4ECE1] text-[#A4794A]">
                <FileCode className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-[#2C2A29]">Subtitles &amp; Copy</h4>
              <p className="mt-1 text-xs text-[#6D6459]">
                Standard .SRT subtitle file for Premiere/CapCut or instant clipboard copy.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    formatCartoonSrt(project),
                    `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_subtitles.srt`
                  )
                }
                className="flex-1 rounded-lg border border-[#E0D5C2] bg-[#FDFBF7] py-2 text-center text-xs font-semibold text-[#2C2A29] hover:bg-white"
              >
                .SRT File
              </button>
              <button
                type="button"
                onClick={handleCopyScript}
                className="flex-1 rounded-lg border border-[#E0D5C2] bg-[#FDFBF7] py-2 text-center text-xs font-semibold text-[#2C2A29] hover:bg-white"
              >
                {copiedSuccess ? 'Copied!' : 'Copy Script'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStep;
