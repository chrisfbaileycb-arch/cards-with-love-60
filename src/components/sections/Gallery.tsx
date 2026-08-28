import React, { useMemo, useState } from 'react';
import { SAMPLE_CARTOON_PROJECTS, CartoonProject, PILLARS } from '@/data/cartoonConfig';
import { ArrowRight, Film, Heart, Pause, Play, Sparkles, Volume2, VolumeX, Wand2, X } from 'lucide-react';

interface GalleryProps {
  onSelectProject?: (project: CartoonProject) => void;
}

const CATEGORIES = [
  { id: 'All', label: 'All Samples' },
  { id: 'love', label: 'Love & First Dates' },
  { id: 'restaurant', label: 'Restaurant & Specialty' },
  { id: 'faith', label: 'Vision of Faith' },
  { id: 'imagination', label: 'Best Friends & Imagination' }
];

const EXTRA_SAMPLES: CartoonProject[] = [
  {
    id: 'sample-child-gravity',
    title: 'Buzzy the Bee Explains Gravity',
    pillar: 'imagination',
    target_duration_seconds: 30,
    aspect_ratio: '16:9',
    style_id: 'pixar-3d',
    voice_tone_id: 'playful',
    character_description: 'Buzzy the cheerful little honeybee wearing miniature aviator goggles.',
    character_anchor_prompt: '3D Pixar style: Buzzy the chubby yellow honeybee with tiny aviator goggles on his head, hovering happily in a vibrant dandelion flower garden',
    premise: 'A cute little bee explaining how gravity keeps everything on earth from floating away into space.',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-08-28T10:00:00.000Z',
    scenes: [
      {
        scene_number: 1,
        duration_seconds: 10,
        visual_prompt: 'Buzzy hovers over a garden pond, watching an apple drop gently from a branch with funny cartoon question marks.',
        dialogue: 'Ever wonder why apples always fall down instead of zooming into the moon?',
        action_notes: 'Apple drops with a gentle thud, Buzzy scratches his fuzzy head in curiosity.',
        sound_fx: 'Slide whistle down, cute cartoon boing',
        imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 2,
        duration_seconds: 10,
        visual_prompt: 'Buzzy holds an invisible magnetic globe that keeps tiny ants and flowers safely grounded while he flies in circles.',
        dialogue: 'It’s Earth’s giant invisible hug called Gravity! It keeps our shoes on the grass and water in the cup.',
        action_notes: 'Buzzy does a celebratory loop-de-loop with sparkling stardust trails.',
        sound_fx: 'Gentle whoosh, twinkling fairy chime, xylophone run',
        imageUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 3,
        duration_seconds: 10,
        visual_prompt: 'All the friendly garden bugs cheering and hugging the earth together under a rainbow.',
        dialogue: 'Stay grounded, stay curious, and keep exploring!',
        action_notes: 'Cute smiling ladybugs wave hello, rainbow shines over the garden.',
        sound_fx: 'Joyful cartoon cheer, upbeat acoustic ukulele strum',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'sample-wedding-anniversary',
    title: '10 Years of Road Trips & Burnt Dinners',
    pillar: 'love',
    target_duration_seconds: 60,
    aspect_ratio: '16:9',
    style_id: 'pixar-3d',
    voice_tone_id: 'warm',
    character_description: 'David and Sarah laughing in a vintage teal camper van packed with suitcases and smiling kids.',
    character_anchor_prompt: '3D Pixar style: Loving couple laughing inside a vintage teal camper van overlooking a sunset mountain overlook',
    premise: 'A surprise 10th anniversary animated short celebrating our greatest road trip adventures.',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-08-28T10:00:00.000Z',
    scenes: [
      {
        scene_number: 1,
        duration_seconds: 15,
        visual_prompt: 'A smoky kitchen where a burnt pizza is set on fire, but David and Sarah are cracking up laughing on the floor eating cereal instead.',
        dialogue: 'Ten years ago, our first dinner as newlyweds ended with a visit from the fire department and a box of cereal.',
        action_notes: 'Smoke alarm beeps playfully, couple shares a bowl of crunchy cereal with big smiles.',
        sound_fx: 'Funny smoke alarm beep, acoustic guitar picking, laughter',
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 2,
        duration_seconds: 15,
        visual_prompt: 'Teal camper van driving along the Pacific Coast highway with the sunset ocean glittering beside them.',
        dialogue: 'Since then, we have crossed twelve states, lost the map three times, and found paradise in every detour.',
        action_notes: 'Van drives along coastal cliffs, ocean waves sparkle in rose-gold sunset.',
        sound_fx: 'Ocean breeze, engine purr, nostalgic piano chime',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 3,
        duration_seconds: 15,
        visual_prompt: 'David and Sarah sitting by a warm campfire under a canopy of billion stars, Sarah leaning on David’s shoulder.',
        dialogue: 'There is nobody else in the universe I would rather get lost with.',
        action_notes: 'Campfire embers float upwards toward shooting stars.',
        sound_fx: 'Campfire crackle, night crickets, cello harmony',
        imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 4,
        duration_seconds: 15,
        visual_prompt: 'Animated postcard: "Happy 10th Anniversary to my favorite road trip partner! Here’s to the next 50 years."',
        dialogue: 'Happy 10th Anniversary Sarah. I love you more every single mile.',
        action_notes: 'Postcard stamps with golden heart wax seal and sparkles.',
        sound_fx: 'Warm orchestral swell, romantic chime',
        imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

const ALL_SAMPLES = [...SAMPLE_CARTOON_PROJECTS, ...EXTRA_SAMPLES];

const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Gallery: React.FC<GalleryProps> = ({ onSelectProject }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePreviewProject, setActivePreviewProject] = useState<CartoonProject | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredSamples = useMemo(() => {
    if (selectedCategory === 'All') return ALL_SAMPLES;
    return ALL_SAMPLES.filter((s) => s.pillar === selectedCategory);
  }, [selectedCategory]);

  const handleOpenStudio = (project: CartoonProject) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
    setActivePreviewProject(null);
    scrollTo('#studio');
  };

  // Playback timer for modal
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && activePreviewProject) {
      const currentScene = activePreviewProject.scenes[activeSceneIndex];
      const durationMs = (currentScene?.duration_seconds || 10) * 800; // slightly accelerated for demo preview
      timer = setTimeout(() => {
        if (activeSceneIndex < activePreviewProject.scenes.length - 1) {
          setActiveSceneIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setActiveSceneIndex(0);
        }
      }, durationMs);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeSceneIndex, activePreviewProject]);

  return (
    <section id="samples" className="bg-[#F8F5EE] py-16 sm:py-24 scroll-mt-12 border-t border-[#EFE5D5]">
      {/* Anchor for old gallery links */}
      <div id="gallery" className="sr-only" />

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Wireframe Screenshot 1 & 2 Headline */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E9DEC8] bg-[#FFF8EE] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#9E651D] shadow-sm">
            <Film className="h-3.5 w-3.5 text-[#E11D48]" /> Check Out Our Samples
          </div>

          <h2 className="mt-4 font-['Fredoka',sans-serif] text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1D1B] leading-tight">
            People Think I Hired an Animation Studio. <br />
            <span className="text-[#E11D48]">Nope!</span> I Just Use{' '}
            <span className="underline decoration-[#EAB308] decoration-4">LovAnimate!</span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#6B6155] font-medium leading-relaxed">
            Click on any sample cartoon below to watch the interactive scene storyboard or open it directly in the Studio to customize it.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-2xl px-5 py-2.5 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider transition-all shadow-xs ${
                selectedCategory === c.id
                  ? 'bg-gradient-to-r from-[#E11D48] to-[#EAB308] text-white shadow-md scale-105'
                  : 'border border-[#E2D6C0] bg-white text-[#6B6155] hover:border-[#E11D48] hover:text-[#1F1D1B]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Wireframe Card Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSamples.map((p) => {
            const pillar = PILLARS[p.pillar];
            const firstScene = p.scenes[0];
            const sceneImage = firstScene?.imageUrl || firstScene?.customUploadedImage || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80';
            const durationLabel = p.target_duration_seconds === 30 ? '00:30' : p.target_duration_seconds === 60 ? '01:00' : '01:30';

            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-[#EDE4D3] bg-[#FFFDF9] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#E11D48] hover:shadow-xl"
              >
                <div>
                  {/* Category Pill Over Top */}
                  <div className="p-4 pb-0 flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-['Fredoka',sans-serif] font-bold uppercase tracking-wider shadow-xs border border-black/5"
                      style={{ backgroundColor: pillar.badgeBg, color: pillar.badgeText }}
                    >
                      {pillar.name}
                    </span>
                    <span className="text-[11px] font-['Fredoka',sans-serif] font-bold text-[#8C8071]">
                      ⏱️ {p.scenes.length} Scenes · {p.target_duration_seconds}s
                    </span>
                  </div>

                  {/* Video Mockup Frame */}
                  <div className="relative mt-3 aspect-video overflow-hidden bg-black mx-4 rounded-2xl border border-[#EDE4D5]">
                    <img
                      src={sceneImage}
                      alt={p.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Duration Badge */}
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-black/75 px-2.5 py-0.5 text-[10px] font-['Fredoka',sans-serif] font-bold text-white tracking-wider backdrop-blur-xs">
                      {durationLabel}
                    </span>

                    {/* Big Center Play Button */}
                    <button
                      onClick={() => {
                        setActivePreviewProject(p);
                        setActiveSceneIndex(0);
                        setIsPlaying(true);
                      }}
                      className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E11D48]/90 text-white shadow-xl transition duration-300 group-hover:scale-110 group-hover:bg-[#E11D48]"
                      aria-label="Play Cartoon"
                    >
                      <Play className="h-6 w-6 fill-white ml-1" />
                    </button>

                    {/* Bottom Progress Bar Mockup */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-white/30 overflow-hidden">
                        <div className="h-full w-1/3 bg-[#EAB308]" />
                      </div>
                      <span className="text-[10px] font-['Fredoka',sans-serif] font-bold text-white/90">HD Storyboard</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 pt-4">
                    <h3 className="font-['Fredoka',sans-serif] text-lg font-bold text-[#1F1D1B] line-clamp-1 group-hover:text-[#E11D48] transition">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#6B6155] line-clamp-2">
                      {p.premise}
                    </p>

                    {/* Dialogue preview */}
                    <div className="mt-3 rounded-2xl border border-[#F0E6D8] bg-[#FAF7F0] p-3 text-[11px] italic text-[#5C5248]">
                      <span className="font-['Fredoka',sans-serif] font-bold not-italic text-[#E11D48]">Scene Dialogue: </span>
                      "{firstScene?.dialogue}"
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0 border-t border-[#F5EDE1] mt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActivePreviewProject(p);
                      setActiveSceneIndex(0);
                      setIsPlaying(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DCD0BB] bg-white py-2.5 text-xs font-['Fredoka',sans-serif] font-bold text-[#3D3730] transition hover:border-[#E11D48] hover:bg-[#FFF8EE]"
                  >
                    <Play className="h-3.5 w-3.5 text-[#E11D48]" /> Watch Scenes
                  </button>
                  <button
                    onClick={() => handleOpenStudio(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#EAB308] py-2.5 text-xs font-['Fredoka',sans-serif] font-bold text-white shadow-xs transition hover:opacity-95 hover:scale-105 active:scale-95"
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Customize
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Storyboard Player Modal */}
      {activePreviewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[#423D37] bg-[#1C1A18] text-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2E2A27] px-6 py-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#EAB308]">
                  Interactive Cartoon Player
                </span>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold text-white">
                  {activePreviewProject.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActivePreviewProject(null);
                  setIsPlaying(false);
                }}
                className="rounded-full border border-[#423D37] p-2 text-[#A89F91] hover:bg-[#2A2724] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Canvas Stage */}
            <div className="relative aspect-video w-full bg-black">
              {activePreviewProject.scenes[activeSceneIndex] && (
                <>
                  <img
                    src={
                      activePreviewProject.scenes[activeSceneIndex].imageUrl ||
                      activePreviewProject.scenes[activeSceneIndex].customUploadedImage ||
                      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={`Scene ${activeSceneIndex + 1}`}
                    className="h-full w-full object-cover transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

                  {/* Scene Badge */}
                  <span className="absolute top-4 left-4 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-[#EAB308] backdrop-blur-xs">
                    Scene {activeSceneIndex + 1} of {activePreviewProject.scenes.length}
                  </span>

                  {/* Subtitle & Dialogue Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <div className="inline-block rounded-2xl bg-black/80 backdrop-blur-md px-5 py-3 border border-white/10 shadow-xl max-w-xl">
                      <p className="text-sm font-bold text-white sm:text-base leading-relaxed">
                        "{activePreviewProject.scenes[activeSceneIndex].dialogue}"
                      </p>
                      <p className="mt-1 text-[11px] text-[#EAB308] font-medium">
                        ♫ Sound FX: {activePreviewProject.scenes[activeSceneIndex].sound_fx}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Scene Selector Scrubber Tabs */}
            <div className="flex items-center gap-2 border-t border-[#2E2A27] bg-[#24211E] px-6 py-3 overflow-x-auto">
              {activePreviewProject.scenes.map((scene, idx) => (
                <button
                  key={scene.scene_number}
                  onClick={() => {
                    setActiveSceneIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`flex-none rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeSceneIndex === idx
                      ? 'bg-[#E11D48] text-white shadow-md'
                      : 'bg-[#1C1A18] text-[#A89F91] hover:bg-[#2E2A27] hover:text-white'
                  }`}
                >
                  Scene {idx + 1} ({scene.duration_seconds}s)
                </button>
              ))}
            </div>

            {/* Modal Controls Footer */}
            <div className="flex items-center justify-between border-t border-[#2E2A27] px-6 py-4 bg-[#1C1A18]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAB308] text-black font-bold shadow-md transition hover:scale-105"
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black ml-0.5" />}
                </button>
                <span className="text-xs font-semibold text-[#A89F91]">
                  {isPlaying ? 'Playing Storyboard Sequence...' : 'Click to Play / Pause'}
                </span>
              </div>

              <button
                onClick={() => handleOpenStudio(activePreviewProject)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E11D48] to-[#EAB308] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:scale-105"
              >
                <Wand2 className="h-4 w-4" /> Customize in Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
