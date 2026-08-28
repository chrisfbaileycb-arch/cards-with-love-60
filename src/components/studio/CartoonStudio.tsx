import React, { useState, useEffect } from 'react';
import {
  AspectRatioId,
  CartoonDuration,
  CartoonPillar,
  CartoonProject,
  CARTOON_STYLES,
  DURATION_OPTIONS,
  PILLARS,
  SAMPLE_CARTOON_PROJECTS,
  VOICE_TONES
} from '@/data/cartoonConfig';
import { generateCartoonWithGemini, generateSceneArtwork } from '@/lib/geminiCartoon';
import { SetupStep } from './SetupStep';
import { ScriptReviewStep } from './ScriptReviewStep';
import { PlayerStep } from './PlayerStep';
import { Wand2, Edit3, Play, Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StudioTab = 'setup' | 'script' | 'player';

interface CartoonStudioProps {
  initialProject?: CartoonProject | null;
  onSavedToLibrary?: () => void;
}

export const CartoonStudio: React.FC<CartoonStudioProps> = ({ initialProject, onSavedToLibrary }) => {
  // Step navigation
  const [activeTab, setActiveTab] = useState<StudioTab>(initialProject ? 'player' : 'setup');

  // Form State
  const defaultPillar: CartoonPillar =
    initialProject?.pillar && PILLARS[initialProject.pillar] ? initialProject.pillar : 'love';
  const [pillar, setPillar] = useState<CartoonPillar>(defaultPillar);
  const [duration, setDuration] = useState<CartoonDuration>(initialProject?.target_duration_seconds || 30);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>(initialProject?.aspect_ratio || '16:9');
  const [styleId, setStyleId] = useState<string>(initialProject?.style_id || 'pixar-3d');
  const [voiceToneId, setVoiceToneId] = useState<string>(initialProject?.voice_tone_id || 'playful');
  const [characterDesc, setCharacterDesc] = useState<string>(initialProject?.character_description || '');
  const [characterPhoto, setCharacterPhoto] = useState<string | null>(initialProject?.character_photo_url || null);
  const [premise, setPremise] = useState<string>(
    initialProject?.premise || 'Re-enact our first date in the rain with my wife at the little bistro, LovAnimate it.'
  );

  // Active Project
  const [project, setProject] = useState<CartoonProject>(
    initialProject || SAMPLE_CARTOON_PROJECTS[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Synchronize when initialProject prop changes (e.g. user opens a project from Library)
  useEffect(() => {
    if (initialProject) {
      setProject(initialProject);
      const safePillar: CartoonPillar =
        initialProject.pillar && PILLARS[initialProject.pillar] ? initialProject.pillar : 'love';
      setPillar(safePillar);
      setDuration(initialProject.target_duration_seconds);
      setAspectRatio(initialProject.aspect_ratio);
      setStyleId(initialProject.style_id);
      setVoiceToneId(initialProject.voice_tone_id);
      setCharacterDesc(initialProject.character_description);
      setCharacterPhoto(initialProject.character_photo_url || null);
      setPremise(initialProject.premise);
      setActiveTab('player');
    }
  }, [initialProject]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const generated = await generateCartoonWithGemini({
        pillar,
        premise,
        durationSeconds: duration,
        styleId,
        voiceToneId,
        characterDescription: characterDesc,
        characterPhotoUrl: characterPhoto,
        aspectRatio
      });

      const scenesWithArtwork = generated.scenes.map((s) => ({
        ...s,
        imageUrl: generateSceneArtwork(s.visual_prompt, styleId, s.scene_number, generated.title, pillar)
      }));

      const newProject: CartoonProject = {
        id: `toon_${Date.now()}`,
        title: generated.title,
        pillar,
        target_duration_seconds: duration,
        aspect_ratio: aspectRatio,
        style_id: styleId,
        voice_tone_id: voiceToneId,
        character_description: characterDesc,
        character_photo_url: characterPhoto,
        character_anchor_prompt: generated.character_anchor_prompt,
        premise,
        scenes: scenesWithArtwork,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setProject(newProject);
      setActiveTab('script');
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateAll = async () => {
    await handleGenerate();
  };

  const steps = [
    { id: 'setup', label: '1. Setup & Concept', icon: Wand2 },
    { id: 'script', label: '2. Script & Storyboard', icon: Edit3 },
    { id: 'player', label: '3. Preview & Player', icon: Play }
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12" id="cartoon-studio-root">
      {/* 3-Step Wizard Navigation Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-[#EDE4D3] bg-[#FFFDF9] p-4 sm:p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE4E6] px-3 py-0.5 text-[11px] font-['Fredoka',sans-serif] font-bold text-[#E11D48] mb-1">
            <Sparkles className="h-3 w-3" />
            <span>Interactive Story Creation Engine</span>
          </div>
          <h2 className="font-['Fredoka',sans-serif] text-2xl font-bold tracking-tight text-[#1F1D1B] sm:text-3xl">
            Lov<span className="text-[#E11D48]">Animate</span> Studio
          </h2>
          <p className="mt-0.5 text-xs text-[#6D6459] font-medium">
            Direct 30, 60 &amp; 90-Second Animated Cartoons &amp; Storyboards in 3 Clicks
          </p>
        </div>

        {/* Stepper Tabs */}
        <div className="flex items-center gap-1.5 rounded-full border border-[#E0D5C2] bg-[#FAF5EE] p-1.5 shadow-inner">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeTab === s.id;
            return (
              <button
                key={s.id}
                type="button"
                id={`wizard-tab-${s.id}`}
                onClick={() => setActiveTab(s.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-storybook font-bold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-[#E11D48] to-[#EAB308] text-white shadow-md scale-105'
                    : 'text-[#6D6459] hover:text-[#1F1D1B] hover:bg-white/60'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-white' : '')} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Wizard Step */}
      {activeTab === 'setup' && (
        <SetupStep
          pillar={pillar}
          setPillar={setPillar}
          duration={duration}
          setDuration={setDuration}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          styleId={styleId}
          setStyleId={setStyleId}
          voiceToneId={voiceToneId}
          setVoiceToneId={setVoiceToneId}
          characterDesc={characterDesc}
          setCharacterDesc={setCharacterDesc}
          characterPhoto={characterPhoto}
          setCharacterPhoto={setCharacterPhoto}
          premise={premise}
          setPremise={setPremise}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}

      {activeTab === 'script' && (
        <ScriptReviewStep
          project={project}
          setProject={setProject}
          onProceedToPlayer={() => setActiveTab('player')}
          onRegenerateAll={handleRegenerateAll}
          isRegenerating={isGenerating}
        />
      )}

      {activeTab === 'player' && (
        <PlayerStep
          project={project}
          onBackToScript={() => setActiveTab('script')}
          onSaveToLibrary={onSavedToLibrary}
        />
      )}
    </div>
  );
};

export default CartoonStudio;
