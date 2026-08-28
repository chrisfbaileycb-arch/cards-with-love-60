import React, { useState } from 'react';
import { CartoonProject, CartoonScene, CARTOON_STYLES, PILLARS } from '@/data/cartoonConfig';
import { generateSceneArtwork } from '@/lib/geminiCartoon';
import {
  Play,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  Volume2,
  Video,
  Clapperboard,
  Edit3,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScriptReviewStepProps {
  project: CartoonProject;
  setProject: React.Dispatch<React.SetStateAction<CartoonProject>>;
  onProceedToPlayer: () => void;
  onRegenerateAll: () => void;
  isRegenerating: boolean;
}

export const ScriptReviewStep: React.FC<ScriptReviewStepProps> = ({
  project,
  setProject,
  onProceedToPlayer,
  onRegenerateAll,
  isRegenerating
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  const pillarInfo = (project.pillar && PILLARS[project.pillar]) || PILLARS.love;
  const style = CARTOON_STYLES.find((s) => s.id === project.style_id) || CARTOON_STYLES[0];

  const updateScene = (index: number, partial: Partial<CartoonScene>) => {
    setProject((prev) => {
      const nextScenes = [...prev.scenes];
      nextScenes[index] = { ...nextScenes[index], ...partial };
      return { ...prev, scenes: nextScenes };
    });
  };

  const handleSceneImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateScene(index, { customUploadedImage: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const regenerateSceneImage = (index: number) => {
    const scene = project.scenes[index];
    const newArtwork = generateSceneArtwork(
      scene.visual_prompt,
      project.style_id,
      scene.scene_number,
      project.title,
      project.pillar
    );
    updateScene(index, { imageUrl: newArtwork, customUploadedImage: undefined });
  };

  const addScene = () => {
    setProject((prev) => {
      const newSceneNum = prev.scenes.length + 1;
      const avgDuration = Math.max(5, Math.round(prev.target_duration_seconds / newSceneNum));
      const newScene: CartoonScene = {
        scene_number: newSceneNum,
        duration_seconds: avgDuration,
        visual_prompt: `${prev.character_anchor_prompt}. Scene ${newSceneNum}: Additional dynamic story beat for "${prev.premise}".`,
        dialogue: `And the exciting story continues with an inspiring breakthrough!`,
        action_notes: `Character executes next planned motion smoothly.`,
        sound_fx: `Chime, cheerful cartoon sound`
      };
      newScene.imageUrl = generateSceneArtwork(
        newScene.visual_prompt,
        prev.style_id,
        newScene.scene_number,
        prev.title,
        prev.pillar
      );
      return {
        ...prev,
        scenes: [...prev.scenes, newScene]
      };
    });
    setActiveSceneIndex(project.scenes.length);
  };

  const deleteScene = (index: number) => {
    if (project.scenes.length <= 2) {
      alert('A cartoon needs at least 2 scenes.');
      return;
    }
    setProject((prev) => {
      const filtered = prev.scenes.filter((_, i) => i !== index);
      const renumbered = filtered.map((s, i) => ({ ...s, scene_number: i + 1 }));
      return { ...prev, scenes: renumbered };
    });
    setActiveSceneIndex((prev) => Math.max(0, Math.min(prev, project.scenes.length - 2)));
  };

  const moveScene = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= project.scenes.length) return;

    setProject((prev) => {
      const scenes = [...prev.scenes];
      const temp = scenes[index];
      scenes[index] = scenes[target];
      scenes[target] = temp;
      const renumbered = scenes.map((s, i) => ({ ...s, scene_number: i + 1 }));
      return { ...prev, scenes: renumbered };
    });
    setActiveSceneIndex(target);
  };

  const totalCalculatedDuration = project.scenes.reduce((acc, s) => acc + s.duration_seconds, 0);

  return (
    <div className="space-y-8" id="script-review-step-container">
      {/* Top Title & Metadata Bar */}
      <div className="rounded-2xl border border-[#E6DCCB] bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: pillarInfo.badgeBg, color: pillarInfo.badgeText }}
              >
                {pillarInfo.name}
              </span>
              <span className="rounded-full bg-[#FAF5EE] px-3 py-1 text-[11px] font-bold text-[#78542F]">
                {totalCalculatedDuration}s Total ({project.scenes.length} Scenes)
              </span>
              <span className="rounded-full border border-[#E6DCCB] px-3 py-1 text-[11px] font-semibold text-[#5C5248]">
                {style.name} · {project.aspect_ratio}
              </span>
            </div>

            {editingTitle ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => setProject((prev) => ({ ...prev, title: e.target.value }))}
                  className="rounded-lg border border-[#2C2A29] px-3 py-1 font-serif text-2xl font-bold text-[#2C2A29] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setEditingTitle(false)}
                  className="rounded-lg bg-[#2C2A29] p-2 text-white"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <h3 className="font-serif text-2xl font-bold text-[#2C2A29] sm:text-3xl">
                  {project.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingTitle(true)}
                  className="text-[#8A7E72] hover:text-[#2C2A29]"
                  title="Rename cartoon"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="regenerate-all-btn"
              disabled={isRegenerating}
              onClick={onRegenerateAll}
              className="flex items-center gap-1.5 rounded-full border border-[#E0D5C2] bg-[#FAF5EE] px-4 py-2 text-xs font-semibold text-[#5C5248] transition hover:border-[#A4794A] hover:bg-white"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRegenerating && 'animate-spin')} />
              <span>Regenerate Script</span>
            </button>

            <button
              type="button"
              id="proceed-to-player-btn"
              onClick={onProceedToPlayer}
              className="flex items-center gap-2 rounded-full bg-[#2C2A29] px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#413D3A]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Play &amp; Preview Cartoon</span>
            </button>
          </div>
        </div>

        {/* Persistent Character Anchor */}
        <div className="mt-4 rounded-xl border border-[#F4ECE1] bg-[#FAF5EE] p-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-[#A4794A]">Persistent Character Anchor: </span>
          <span className="text-[#5C5248]">{project.character_anchor_prompt}</span>
        </div>
      </div>

      {/* Main Scene List & Active Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A9084]">
            Screenplay &amp; Storyboard Breakdown ({project.scenes.length} Scenes)
          </h4>
          <button
            type="button"
            onClick={addScene}
            className="flex items-center gap-1.5 rounded-full border border-[#C9A273] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#78542F] transition hover:bg-[#FAF5EE]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Scene</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {project.scenes.map((scene, index) => {
            const imgSrc =
              scene.customUploadedImage ||
              scene.imageUrl ||
              generateSceneArtwork(
                scene.visual_prompt,
                project.style_id,
                scene.scene_number,
                project.title,
                project.pillar
              );

            return (
              <div
                key={scene.scene_number}
                id={`scene-card-${scene.scene_number}`}
                className={cn(
                  'overflow-hidden rounded-2xl border bg-white shadow-sm transition-all',
                  activeSceneIndex === index ? 'border-[#2C2A29] ring-2 ring-[#2C2A29]/10' : 'border-[#E6DCCB]'
                )}
                onClick={() => setActiveSceneIndex(index)}
              >
                {/* Scene Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-[#F4ECE1] bg-[#FAF5EE] px-5 py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2C2A29] font-bold text-white text-[11px]">
                      {scene.scene_number}
                    </span>
                    <span className="font-bold text-[#2C2A29]">SCENE {scene.scene_number}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#8A7E72]">Duration:</span>
                      <select
                        aria-label="Scene duration in seconds"
                        value={scene.duration_seconds}
                        onChange={(e) => updateScene(index, { duration_seconds: Number(e.target.value) })}
                        className="rounded border border-[#E0D5C2] bg-white px-2 py-0.5 font-semibold text-[#2C2A29] outline-none"
                      >
                        {[3, 5, 8, 10, 12, 15, 20, 25, 30].map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}s
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveScene(index, 'up');
                      }}
                      className="rounded p-1 text-[#8A7E72] hover:bg-white hover:text-[#2C2A29] disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === project.scenes.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveScene(index, 'down');
                      }}
                      className="rounded p-1 text-[#8A7E72] hover:bg-white hover:text-[#2C2A29] disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScene(index);
                      }}
                      className="rounded p-1 text-[#8A7E72] hover:bg-white hover:text-red-600"
                      title="Delete scene"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Scene Content Grid */}
                <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[280px_1fr]">
                  {/* Left: Scene Artwork Preview & Controls */}
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#E6DCCB] bg-black shadow-inner">
                      <img
                        src={imgSrc}
                        alt={`Scene ${scene.scene_number} preview`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                        Scene {scene.scene_number} · {scene.duration_seconds}s
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => regenerateSceneImage(index)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E0D5C2] bg-[#FAF5EE] py-1.5 text-center text-xs font-semibold text-[#5C5248] transition hover:border-[#A4794A] hover:bg-white"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Regenerate Art</span>
                      </button>

                      <label
                        htmlFor={`upload-scene-img-${index}`}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-[#E0D5C2] bg-white px-2.5 py-1.5 text-xs text-[#5C5248] hover:border-[#A4794A]"
                        title="Upload custom image"
                      >
                        <Upload className="h-3 w-3" />
                      </label>
                      <input
                        id={`upload-scene-img-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSceneImageUpload(index, e)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Right: Screenplay Dialogue, Visual Prompt & Action Directions */}
                  <div className="space-y-4">
                    {/* Voiceover / Dialogue */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#A4794A]">
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Voiceover / Dialogue Line</span>
                      </label>
                      <textarea
                        rows={2}
                        value={scene.dialogue}
                        onChange={(e) => updateScene(index, { dialogue: e.target.value })}
                        className="w-full rounded-xl border border-[#E0D5C2] bg-[#FDFBF7] p-2.5 text-sm font-medium text-[#2C2A29] outline-none focus:border-[#2C2A29] focus:bg-white"
                        placeholder="Dialogue spoken or voiceover in this scene"
                      />
                    </div>

                    {/* Visual Prompt for animator/model */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#5C5248]">
                        <Video className="h-3.5 w-3.5" />
                        <span>Visual Prompt &amp; Setting</span>
                      </label>
                      <textarea
                        rows={2}
                        value={scene.visual_prompt}
                        onChange={(e) => updateScene(index, { visual_prompt: e.target.value })}
                        className="w-full rounded-xl border border-[#E0D5C2] bg-[#FDFBF7] p-2 text-xs text-[#5C5248] outline-none focus:border-[#2C2A29] focus:bg-white"
                        placeholder="Visual instructions describing characters, backgrounds, colors and lighting"
                      />
                    </div>

                    {/* Action Notes & Sound FX 2-col */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8A7E72]">
                          <Clapperboard className="h-3 w-3" />
                          <span>Action &amp; Camera Notes</span>
                        </label>
                        <input
                          type="text"
                          value={scene.action_notes}
                          onChange={(e) => updateScene(index, { action_notes: e.target.value })}
                          className="w-full rounded-lg border border-[#E0D5C2] bg-[#FDFBF7] px-2.5 py-1.5 text-xs text-[#5C5248] outline-none focus:border-[#2C2A29] focus:bg-white"
                          placeholder="e.g. Fast zoom, character winks"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8A7E72]">
                          <span>🔊 Sound FX &amp; Music Cues</span>
                        </label>
                        <input
                          type="text"
                          value={scene.sound_fx}
                          onChange={(e) => updateScene(index, { sound_fx: e.target.value })}
                          className="w-full rounded-lg border border-[#E0D5C2] bg-[#FDFBF7] px-2.5 py-1.5 text-xs text-[#5C5248] outline-none focus:border-[#2C2A29] focus:bg-white"
                          placeholder="e.g. Cartoon whoosh, chime, applause"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E6DCCB] pt-6 sm:flex-row">
        <button
          type="button"
          onClick={addScene}
          className="flex items-center gap-1.5 rounded-full border border-[#E0D5C2] bg-white px-5 py-2.5 text-xs font-bold text-[#5C5248] transition hover:border-[#A4794A]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Another Scene</span>
        </button>

        <button
          type="button"
          onClick={onProceedToPlayer}
          className="flex items-center gap-2 rounded-full bg-[#2C2A29] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#413D3A]"
        >
          <Play className="h-4 w-4 fill-current text-[#FBBF24]" />
          <span>Step 3: Studio Preview &amp; Player</span>
        </button>
      </div>
    </div>
  );
};

export default ScriptReviewStep;
