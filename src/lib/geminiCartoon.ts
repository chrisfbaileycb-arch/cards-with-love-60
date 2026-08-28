import { GoogleGenAI } from '@google/genai';
import { CartoonDuration, CartoonPillar, CartoonProject, CartoonScene, CARTOON_STYLES, PILLARS } from '@/data/cartoonConfig';

export interface GenerateCartoonParams {
  pillar: CartoonPillar;
  premise: string;
  durationSeconds: CartoonDuration;
  styleId: string;
  voiceToneId: string;
  characterDescription?: string;
  characterPhotoUrl?: string | null;
  aspectRatio: '9:16' | '16:9' | '1:1';
}

export interface GeneratedCartoonResponse {
  title: string;
  target_duration_seconds: number;
  character_anchor_prompt: string;
  scenes: Array<{
    scene_number: number;
    duration_seconds: number;
    visual_prompt: string;
    dialogue: string;
    action_notes: string;
    sound_fx: string;
  }>;
}

// Visual art helper to generate styled SVG placeholder or canvas image for scene
export function generateSceneArtwork(
  visualPrompt: string,
  styleId: string,
  sceneNumber: number,
  title: string,
  pillar: CartoonPillar
): string {
  const style = CARTOON_STYLES.find(s => s.id === styleId) || CARTOON_STYLES[0];
  const pillarInfo = (pillar && PILLARS[pillar]) || PILLARS.love;

  const bgGradients: Record<string, [string, string]> = {
    'pixar-3d': ['#1E3A8A', '#3B82F6'],
    'flat-vector-2d': ['#064E3B', '#10B981'],
    'classic-comic': ['#78350F', '#F59E0B'],
    'retro-anime': ['#831843', '#EC4899'],
    'claymation': ['#4C1D95', '#8B5CF6'],
    'vintage-rubberhose': ['#1E293B', '#475569']
  };

  const [c1, c2] = bgGradients[styleId] || ['#1E293B', '#3B82F6'];
  const cleanPrompt = visualPrompt.slice(0, 160).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cleanTitle = title.slice(0, 50).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <rect width="1280" height="720" fill="url(#skyGrad)"/>
    <rect width="1280" height="720" fill="url(#grid)"/>
    
    <!-- Cartoon scene frame elements -->
    <circle cx="640" cy="330" r="210" fill="rgba(255,255,255,0.12)" filter="url(#glow)" />
    <circle cx="640" cy="330" r="160" fill="rgba(255,255,255,0.15)" />
    
    <!-- Character / Scene silhouette icon badge -->
    <g transform="translate(640, 310)" text-anchor="middle">
      <circle cx="0" cy="0" r="64" fill="${pillarInfo.accentColor}" stroke="#ffffff" stroke-width="4" />
      <text y="14" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" fill="#ffffff">🎬 ${sceneNumber}</text>
    </g>

    <!-- Style badge -->
    <g transform="translate(60, 60)">
      <rect width="260" height="44" rx="22" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.3)" />
      <text x="24" y="27" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#ffffff">✨ ${style.name}</text>
    </g>

    <!-- Pillar badge -->
    <g transform="translate(1220, 60)">
      <text x="0" y="27" text-anchor="end" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#FFEAA7">LOVANIMATE · ${pillarInfo.name.toUpperCase()}</text>
    </g>

    <!-- Bottom prompt caption bar -->
    <rect x="50" y="560" width="1180" height="120" rx="16" fill="rgba(0,0,0,0.75)" stroke="rgba(255,255,255,0.2)" />
    <text x="80" y="600" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#FBBF24">SCENE ${sceneNumber} : ${cleanTitle}</text>
    <text x="80" y="640" font-family="system-ui, sans-serif" font-size="16" fill="#E2E8F0">${cleanPrompt}</text>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Fallback intelligent generator tailored for 30s/60s/90s with the 4 pillars
function generateSmartFallback(params: GenerateCartoonParams): GeneratedCartoonResponse {
  const { pillar, premise, durationSeconds, styleId, characterDescription } = params;
  const style = CARTOON_STYLES.find(s => s.id === styleId) || CARTOON_STYLES[0];
  const pillarInfo = (pillar && PILLARS[pillar]) || PILLARS.love;

  const charDesc = characterDescription?.trim()
    ? characterDescription
    : `A friendly, animated ${pillar} protagonist full of personality, expressive eyes and warm charm`;

  const charAnchor = `${style.visualKeyword}: ${charDesc}, consistent character features across all animation keyframes, expressive emotive gestures`;

  let title = 'LovAnimate Story';
  const cleanPremise = premise.trim() || 'A joyful, unforgettable cartoon story';

  if (cleanPremise.length > 5) {
    const words = cleanPremise.split(' ').slice(0, 5).join(' ');
    title = words.charAt(0).toUpperCase() + words.slice(1);
  }

  const sceneCount = durationSeconds === 30 ? 3 : durationSeconds === 60 ? 4 : 6;
  const secondsPerScene = Math.round(durationSeconds / sceneCount);

  const scenes: GeneratedCartoonResponse['scenes'] = [];

  if (sceneCount === 3) {
    // 30-Second structure: Hook, Core Action, Punchline/CTA
    scenes.push(
      {
        scene_number: 1,
        duration_seconds: 10,
        visual_prompt: `${charAnchor}. Scene 1 Hook: High-energy opening showing the central dilemma of "${cleanPremise}". Character reacts with dramatic funny expression.`,
        dialogue: `Ever felt like you needed a magical breakthrough? Here is what happens when you decide to take action.`,
        action_notes: `Fast camera push-in, character makes surprised cartoon face, sparks burst in background.`,
        sound_fx: `Dramatic cartoon whoosh, slide whistle, cheerful piano chord`
      },
      {
        scene_number: 2,
        duration_seconds: 10,
        visual_prompt: `${charAnchor}. Scene 2 Turning Point: Character activates their secret skill or solution related to "${cleanPremise}". Dynamic motion lines and glowing aura.`,
        dialogue: `With one creative move, the problem turns into pure momentum. Look at how easy this becomes!`,
        action_notes: `Character performs acrobatic jump or confident gesture, environment lights up brightly.`,
        sound_fx: `Power-up chime, magical sparkle, energetic bassline`
      },
      {
        scene_number: 3,
        duration_seconds: 10,
        visual_prompt: `${charAnchor}. Scene 3 Climax & CTA: Glorious resolution, big smile, celebratory confetti, bold banner showing final message for ${pillarInfo.name}.`,
        dialogue: `Your story, your love, your vision. LovAnimate makes it unforgettable in just 3 clicks!`,
        action_notes: `Character winks and gives big double thumbs-up, festive fireworks burst across the sky.`,
        sound_fx: `Celebratory fanfare, pop-pop confetti, happy laughter`
      }
    );
  } else if (sceneCount === 4) {
    // 60-Second structure: Intro Hook, Rising Action, Climax, Resolution
    scenes.push(
      {
        scene_number: 1,
        duration_seconds: 15,
        visual_prompt: `${charAnchor}. Scene 1 Intro: Establishing shot of the colorful world setting the stage for "${cleanPremise}". Character looks motivated.`,
        dialogue: `Every great journey begins with a spark of an idea. But how do you bring it to life?`,
        action_notes: `Sweeping panoramic reveal, character steps onto center stage with curious eyes.`,
        sound_fx: `Soft acoustic guitar melody, morning birds, playful wind`
      },
      {
        scene_number: 2,
        duration_seconds: 15,
        visual_prompt: `${charAnchor}. Scene 2 Rising Challenge: The unexpected obstacle appears, comical chaos unfolds around "${cleanPremise}".`,
        dialogue: `It wasn't always smooth sailing. Challenges popped up at every turn!`,
        action_notes: `Comical domino effect of obstacles, character dodges playfully with elastic cartoon physics.`,
        sound_fx: `Cartoon bonk, fast drum roll, comedic brass swell`
      },
      {
        scene_number: 3,
        duration_seconds: 15,
        visual_prompt: `${charAnchor}. Scene 3 The Breakthrough: Character discovers the winning breakthrough, masterfully solving everything with flair.`,
        dialogue: `That's when everything clicked! By combining passion with heart, true magic happened.`,
        action_notes: `Golden glow emanates from character's hands, obstacles transform into golden stars.`,
        sound_fx: `Triumphant orchestral swell, crystal chime, rising synth`
      },
      {
        scene_number: 4,
        duration_seconds: 15,
        visual_prompt: `${charAnchor}. Scene 4 Celebration & Call to Action: Heartfelt triumphant finale with friends and family celebrating "${cleanPremise}".`,
        dialogue: `Celebrate what matters most. Bring your memories and specialty stories to life today with LovAnimate.`,
        action_notes: `Group hug / victory cheer, camera zooms out to showcase the complete cartoon universe.`,
        sound_fx: `Joyful applause, celebratory trumpet fanfare, warm piano`
      }
    );
  } else {
    // 90-Second structure: 6 Scenes
    const beats = [
      {
        title: 'The Humble Beginning',
        desc: 'Establishing the protagonist in their daily world facing a big dream.',
        dialogue: 'In a bustling world full of noise, one small dream was waiting to be heard.'
      },
      {
        title: 'The Great Call to Adventure',
        desc: 'An exciting challenge sparks the start of the mission.',
        dialogue: 'When opportunity knocked, there was no hesitation. It was time to build something unforgettable.'
      },
      {
        title: 'The Comical Trial',
        desc: 'First attempt with whimsical hiccups and cartoon missteps.',
        dialogue: 'Of course, the first try was a hilarious mess! But true creators never give up.'
      },
      {
        title: 'The Innovation Leap',
        desc: 'Re-grouping with upgraded tools, smarter strategy, and unstoppable energy.',
        dialogue: 'With a fresh blueprint and unwavering focus, the pieces started falling into place.'
      },
      {
        title: 'The Grand Climax',
        desc: 'The master creation in full action, exceeding everyone’s expectations.',
        dialogue: 'And just like that, what seemed impossible became an inspiring reality for everyone to witness.'
      },
      {
        title: 'The Lasting Legacy & Vision',
        desc: 'Inspiring finale with call to action and warm message for the audience.',
        dialogue: 'Your story deserves to be told. Create, inspire, and animate with LovAnimate.'
      }
    ];

    beats.forEach((beat, idx) => {
      scenes.push({
        scene_number: idx + 1,
        duration_seconds: secondsPerScene,
        visual_prompt: `${charAnchor}. Scene ${idx + 1} (${beat.title}): ${beat.desc} Centered around "${cleanPremise}". Rich lighting, dynamic composition.`,
        dialogue: beat.dialogue,
        action_notes: `Dynamic cartoon action sequence illustrating ${beat.title.toLowerCase()}.`,
        sound_fx: idx === 0 ? 'Gentle narrative strings' : idx === 4 ? 'Grand cinematic climax' : 'Playful comedic orchestral beats'
      });
    });
  }

  return {
    title,
    target_duration_seconds: durationSeconds,
    character_anchor_prompt: charAnchor,
    scenes
  };
}

/**
 * Main generator function using Gemini API (or intelligent fallback)
 */
export async function generateCartoonWithGemini(params: GenerateCartoonParams): Promise<GeneratedCartoonResponse> {
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY);

  const { pillar, premise, durationSeconds, styleId, characterDescription, voiceToneId } = params;
  const style = CARTOON_STYLES.find(s => s.id === styleId) || CARTOON_STYLES[0];
  const pillarInfo = PILLARS[pillar] || PILLARS.brand;
  const sceneCount = durationSeconds === 30 ? 3 : durationSeconds === 60 ? 4 : 6;

  if (!apiKey) {
    // Seamless smart generation without blocking
    return generateSmartFallback(params);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are the lead animated cartoon director and screenwriter at Kindtoons.
You create lively, engaging 30-second (3 scenes), 60-second (4 scenes), and 90-second (6 scenes) animated cartoon storyboards.

Your 4 Pillars are:
- Your Purpose (Mission, non-profit, teaching, inspirational, storytelling)
- Your Vision (Startup pitch, product demo, future concept, roadmap)
- Your Family (Memories, bedtime stories, birthday greetings, milestones)
- Your Brand (Promo ad, customer showcase, social media short, explainer, discounts)

Strict JSON Schema Output:
{
  "title": "Short catchy cartoon title",
  "target_duration_seconds": ${durationSeconds},
  "character_anchor_prompt": "Persistent visual style and character description to prepend to all scene image prompts",
  "scenes": [
    {
      "scene_number": 1,
      "duration_seconds": ${Math.round(durationSeconds / sceneCount)},
      "visual_prompt": "Detailed visual description of the character, background, lighting, and action for the animator/image model",
      "dialogue": "Voiceover line or speech bubble text to be spoken in this scene",
      "action_notes": "Director notes for character animation and camera movement",
      "sound_fx": "Sound effects and background audio cues"
    }
  ]
}

Ensure the scene count is EXACTLY ${sceneCount} scenes. Total duration must sum to ${durationSeconds} seconds.`;

    const userPrompt = `Create an animated cartoon storyboard for:
Pillar: ${pillarInfo.name} (${pillarInfo.tagline})
Target Duration: ${durationSeconds} seconds (${sceneCount} scenes)
Art Style: ${style.name} (${style.visualKeyword})
Voice Tone: ${voiceToneId}
Character Description: ${characterDescription || 'Create an appealing animated mascot/character'}
Premise / Story Goal: ${premise}

Return ONLY raw valid JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim();
    if (!text) return generateSmartFallback(params);

    const parsed = JSON.parse(text) as GeneratedCartoonResponse;
    if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
      return generateSmartFallback(params);
    }

    return parsed;
  } catch (err) {
    console.warn('Gemini generation fallback used:', err);
    return generateSmartFallback(params);
  }
}
