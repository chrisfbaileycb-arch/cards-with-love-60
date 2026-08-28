// Single source of truth for LovAnimate cartoon configuration:
// 4 Pillars (Love & Memories, Restaurant & Brand, Faith & Vision, Pure Imagination),
// Durations (30s, 60s, 90s), Art styles, Aspect ratios, Voiceover tones, Sound FX presets, and signature templates.

export type CartoonPillar = 'love' | 'restaurant' | 'faith' | 'imagination';

export type PillarInfo = {
  id: CartoonPillar;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  samplePremises: string[];
};

export const PILLARS: Record<CartoonPillar, PillarInfo> = {
  love: {
    id: 'love',
    name: 'Love & Memories',
    tagline: 'Re-enact dates, celebrate loved ones & anniversaries',
    description: 'Turn your first date, proposal story, anniversary memories, or a love letter into a charming animated keepsake.',
    iconName: 'Heart',
    accentColor: '#E11D48',
    badgeBg: '#FFE4E6',
    badgeText: '#9F1239',
    samplePremises: [
      'Re-enact your first date with your wife at the little Italian bistro in the rain, LovAnimate it.',
      'A surprise anniversary tribute capturing 10 years of laughing through burnt dinners and road trips.',
      'A heartwarming proposal story under the glowing starlight on the beach.',
      'Our favorite weekend coffee shop ritual turned into a sweet Sunday animated short.'
    ]
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant & Brand',
    tagline: 'Spotlight your specialty & stop the social scroll',
    description: 'Bring your signature dish, secret recipe, chef story, or business specialty to life to share on Instagram and TikTok.',
    iconName: 'UtensilsCrossed',
    accentColor: '#D97706',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    samplePremises: [
      'Your favorite specialty dish at your restaurant sizzling with secret herbs and spices, LovAnimate it.',
      'Chef Marco hand-spinning fresh sourdough pizza crusts that fly playfully through the oven flames.',
      'A specialty coffee barista brewing the ultimate caramel velvet pour-over for early morning heroes.',
      'An artisanal bakery announcing fresh butter croissants dropping straight out of the hot oven.'
    ]
  },
  faith: {
    id: 'faith',
    name: 'Vision of Faith',
    tagline: 'Inspire hope, scripture stories & spiritual journeys',
    description: 'Share uplifting faith stories, biblical parables, sermons, and messages of grace with heartfelt animated scenes.',
    iconName: 'Sparkles',
    accentColor: '#4F46E5',
    badgeBg: '#EEF2FF',
    badgeText: '#3730A3',
    samplePremises: [
      'Your vision of faith: walking through life’s storms guided by steady light and gentle grace, LovAnimate it.',
      'The story of Jonah and the great ocean journey learning forgiveness and second chances.',
      'A shepherd searching across the green hills for one lost little sheep in the sunset.',
      'A quiet morning prayer bringing peaceful light to a weary heart.'
    ]
  },
  imagination: {
    id: 'imagination',
    name: 'Pure Imagination',
    tagline: 'Bedtime magic, quirky ideas & childhood wonder',
    description: 'From your dog’s secret double life to futuristic solar inventions and whimsical fairy tales, create whatever you dream up.',
    iconName: 'Wand2',
    accentColor: '#059669',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
    samplePremises: [
      'My best friend Max the golden retriever getting his own superpower cape to rescue lost tennis balls.',
      'A bedtime adventure where a toddler and their teddy bear build a rocket ship to the Moon of Cheese.',
      'A little bee explaining the wonders of gravity to funny garden bugs.',
      'SproutBot the solar drone reforesting a barren mountain valley in 90 seconds.'
    ]
  }
};

export type CartoonDuration = 30 | 60 | 90;

export type DurationOption = {
  seconds: CartoonDuration;
  label: string;
  scenesCount: number;
  badge: string;
  recommendedFor: string;
};

export const DURATION_OPTIONS: DurationOption[] = [
  {
    seconds: 30,
    label: '30 Seconds',
    scenesCount: 3,
    badge: '3 Scenes · Fast & Punchy',
    recommendedFor: 'Shorts, TikTok, Quick Ad, Instant Laugh'
  },
  {
    seconds: 60,
    label: '60 Seconds',
    scenesCount: 4,
    badge: '4 Scenes · Balanced Story',
    recommendedFor: 'Instagram Reels, Product Explainer, Family Memory'
  },
  {
    seconds: 90,
    label: '90 Seconds',
    scenesCount: 6,
    badge: '6 Scenes · Deep Narrative',
    recommendedFor: 'YouTube Showcase, Pitch Deck, Bedtime Story'
  }
];

export type CartoonStyle = {
  id: string;
  name: string;
  blurb: string;
  visualKeyword: string;
  accentColor: string;
  previewImage: string;
};

export const CARTOON_STYLES: CartoonStyle[] = [
  {
    id: 'pixar-3d',
    name: '3D Pixar & CGI',
    blurb: 'Smooth 3D animated character design with rich lighting and expressive features.',
    visualKeyword: '3D Disney Pixar animation style, volumetric lighting, vibrant soft rendering, highly expressive characters',
    accentColor: '#3B82F6',
    previewImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'flat-vector-2d',
    name: 'Modern 2D Vector',
    blurb: 'Crisp flat vector motion graphics, bold clean silhouettes and vivid color palettes.',
    visualKeyword: 'Modern 2D flat vector cartoon, clean vector lines, bold vibrant color blocking, trendy motion graphic design',
    accentColor: '#10B981',
    previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'classic-comic',
    name: 'Classic Comic Strip',
    blurb: 'Vintage ink outlines, halftone dot textures, dynamic action lines and speech balloons.',
    visualKeyword: 'Classic Sunday newspaper comic strip style, crisp ink linework, halftone Ben-Day dots, retro cartoon colors',
    accentColor: '#F59E0B',
    previewImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'retro-anime',
    name: '90s Retro Anime',
    blurb: 'Hand-drawn cel shading, dynamic anime eyes, nostalgic synthwave warmth.',
    visualKeyword: '90s classic cel animation anime style, hand-painted background, expressive eyes, retro studio anime aesthetic',
    accentColor: '#EC4899',
    previewImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'claymation',
    name: 'Tactile Claymation',
    blurb: 'Playful stop-motion plasticine feel with handcrafted fingerprints and physical depth.',
    visualKeyword: 'Stop-motion claymation style, plasticine clay characters, tactile texture, studio miniature lighting',
    accentColor: '#8B5CF6',
    previewImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'vintage-rubberhose',
    name: 'Vintage 1930s Toon',
    blurb: 'Bouncy pie-eyed cartoon characters, ink wash gradients, swing-era whimsical humor.',
    visualKeyword: '1930s rubber hose cartoon style, bouncy whimsical limbs, retro pie eyes, vintage ink and grain',
    accentColor: '#475569',
    previewImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80'
  }
];

export type AspectRatioId = '9:16' | '16:9' | '1:1';

export type AspectRatioConfig = {
  id: AspectRatioId;
  name: string;
  ratio: string;
  width: number;
  height: number;
  label: string;
  platform: string;
};

export const ASPECT_RATIOS: Record<AspectRatioId, AspectRatioConfig> = {
  '9:16': {
    id: '9:16',
    name: 'Vertical',
    ratio: '9/16',
    width: 1080,
    height: 1920,
    label: '9:16 Vertical (Shorts, Reels, TikTok)',
    platform: 'Shorts & TikTok'
  },
  '16:9': {
    id: '16:9',
    name: 'Landscape',
    ratio: '16/9',
    width: 1920,
    height: 1080,
    label: '16:9 Cinema (YouTube, Web, TV)',
    platform: 'YouTube & Web'
  },
  '1:1': {
    id: '1:1',
    name: 'Square',
    ratio: '1/1',
    width: 1080,
    height: 1080,
    label: '1:1 Square (Instagram Feed, Post)',
    platform: 'Instagram Feed'
  }
};

export type VoiceTone = {
  id: string;
  name: string;
  pitch: number;
  rate: number;
  blurb: string;
};

export const VOICE_TONES: VoiceTone[] = [
  { id: 'playful', name: 'Playful & Upbeat', pitch: 1.2, rate: 1.05, blurb: 'High-energy, friendly and enthusiastic' },
  { id: 'warm', name: 'Warm & Storyteller', pitch: 0.95, rate: 0.95, blurb: 'Gentle, comforting and emotive' },
  { id: 'comedic', name: 'Comedic & Animated', pitch: 1.3, rate: 1.15, blurb: 'Dynamic cartoon character voice with punch' },
  { id: 'heroic', name: 'Inspiring & Heroic', pitch: 0.9, rate: 1.0, blurb: 'Confident, cinematic and motivating' },
  { id: 'chill', name: 'Calm & Casual', pitch: 1.0, rate: 0.98, blurb: 'Relatable, modern and conversational' }
];

export type CartoonScene = {
  scene_number: number;
  duration_seconds: number;
  visual_prompt: string;
  dialogue: string;
  action_notes: string;
  sound_fx: string;
  imageUrl?: string;
  customUploadedImage?: string;
};

export type CartoonProject = {
  id: string;
  title: string;
  pillar: CartoonPillar;
  target_duration_seconds: CartoonDuration;
  aspect_ratio: AspectRatioId;
  style_id: string;
  voice_tone_id: string;
  character_description: string;
  character_photo_url?: string | null;
  character_anchor_prompt: string;
  premise: string;
  scenes: CartoonScene[];
  created_at: string;
  updated_at: string;
};

export const SAMPLE_CARTOON_PROJECTS: CartoonProject[] = [
  {
    id: 'sample-love-first-date',
    title: 'Our First Date Under The Trattoria Rain',
    pillar: 'love',
    target_duration_seconds: 60,
    aspect_ratio: '16:9',
    style_id: 'pixar-3d',
    voice_tone_id: 'warm',
    character_description: 'Chris and Elena in cozy jackets, smiling under a shared yellow umbrella outside a charming brick Italian restaurant in the rain.',
    character_anchor_prompt: '3D Pixar style: Young couple laughing under a single bright yellow umbrella in front of a warm glowing bistro with fairy lights in the evening rain',
    premise: 'Re-enacting our first date in 2016: when it poured rain, we shared one umbrella, and split the biggest bowl of spaghetti ever.',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-08-28T10:00:00.000Z',
    scenes: [
      {
        scene_number: 1,
        duration_seconds: 15,
        visual_prompt: 'A sudden evening thunderstorm in the city, raindrops sparkling under streetlights as two nervous 20-somethings huddle together under one tiny yellow umbrella outside Trattoria Roma.',
        dialogue: 'It was October 14th, 7:15 PM. The forecast said 0% chance of rain. Naturally, the heavens opened up.',
        action_notes: 'Rain splashes playfully, yellow umbrella tilts as they both look at each other and burst out laughing.',
        sound_fx: 'Gentle thunder rumble, rhythmic raindrops, soft acoustic piano chord',
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 2,
        duration_seconds: 15,
        visual_prompt: 'Inside the warm candlelight trattoria, checkered red table cloth, an enormous steaming plate of spaghetti with oversized meatballs between them.',
        dialogue: 'We were both so nervous we accidentally ordered the family-size pasta meant for four people.',
        action_notes: 'Steam swirls from the hot pasta, twirling noodles with forks, candlelight dancing in their eyes.',
        sound_fx: 'Restaurant chatter, accordion melody, clinking silverware',
        imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 3,
        duration_seconds: 15,
        visual_prompt: 'Elena telling an animated story with hands while Chris watches with a completely mesmerized, adoring smile across the table.',
        dialogue: 'You talked for an hour about your dream to rescue shelter dogs. That was the exact second I knew.',
        action_notes: 'Warm camera close-up on gentle eyes, golden bokeh highlights.',
        sound_fx: 'Soft cello melody, warm laughter',
        imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 4,
        duration_seconds: 15,
        visual_prompt: 'Floating illustrated Polaroid frame with the message: "Happy 10th Anniversary Elena! I would share that umbrella with you forever."',
        dialogue: 'Happy 10th Anniversary my love. Best rainy Tuesday of my life.',
        action_notes: 'Polaroid drops gently into place with sparkling golden hearts.',
        sound_fx: 'Camera shutter click, romantic chime swell',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'sample-restaurant-specialty',
    title: 'The Flaming Truffle Cacio e Pepe',
    pillar: 'restaurant',
    target_duration_seconds: 30,
    aspect_ratio: '9:16',
    style_id: 'pixar-3d',
    voice_tone_id: 'playful',
    character_description: 'Chef Marco with tall white toque, twirled mustache, spinning pasta tongs with theatrical passion.',
    character_anchor_prompt: '3D Pixar style: Italian Chef Marco with proud mustache in a lively rustic kitchen with flames and parmesan cheese wheel',
    premise: 'Showcasing our restaurant’s viral specialty: hand-rolled pasta swirled inside a flaming 24-month aged Pecorino cheese wheel.',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-08-28T10:00:00.000Z',
    scenes: [
      {
        scene_number: 1,
        duration_seconds: 10,
        visual_prompt: 'Chef Marco sets a giant hollowed parmesan wheel alight with a burst of golden brandy flame.',
        dialogue: 'Meet the dish that broke the internet: our Flaming Truffle Cacio e Pepe!',
        action_notes: 'Dramatic flame swoosh, parmesan sizzling and melting into velvety cream.',
        sound_fx: 'Fire whoosh, sizzling cheese crackle, energetic bass beat',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 2,
        duration_seconds: 10,
        visual_prompt: 'Fresh handmade tagliolini pasta drops into the melted cheese center, swirled with freshly shaved black winter truffles.',
        dialogue: 'Hand-rolled fresh every morning, tossed with cracked black pepper and shaved black truffles.',
        action_notes: 'Slow-motion cheese pull stretching to the sky with floating truffle flakes.',
        sound_fx: 'Mouthwatering sizzle, Italian mandolin riff',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 3,
        duration_seconds: 10,
        visual_prompt: 'Plated masterpiece served on a warm rustic table with the restaurant logo "Osteria Bella - Reserve Your Table Tonight".',
        dialogue: 'Only 30 wheels prepared per night. Tap below to reserve your front-row seat!',
        action_notes: 'Animated golden "Book Tonight" button bounces on screen with glowing star rating.',
        sound_fx: 'Wine glass clink, celebratory chime',
        imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'sample-faith-ocean-grace',
    title: 'Walking On The Waves of Faith',
    pillar: 'faith',
    target_duration_seconds: 60,
    aspect_ratio: '16:9',
    style_id: 'pixar-3d',
    voice_tone_id: 'heroic',
    character_description: 'A thoughtful wanderer with a gentle lantern stepping across stormy waters towards a brilliant sunrise.',
    character_anchor_prompt: '3D Pixar cinematic style: Serene traveler holding glowing golden lantern, walking calmly across turbulent blue ocean waves toward warm sunrise horizon',
    premise: 'A visual parable on keeping faith through life’s turbulent storms and finding peace in the sunrise.',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-08-28T10:00:00.000Z',
    scenes: [
      {
        scene_number: 1,
        duration_seconds: 15,
        visual_prompt: 'Dark churning sea with roaring stormy waves and dark clouds, but a steady beam of heavenly golden light breaking through.',
        dialogue: 'When the winds howl and the waters rise, fear tells us to look down at the depth of the storm.',
        action_notes: 'Ocean waves crash, lightning flashes softly in distance as golden rays pierce the dark.',
        sound_fx: 'Ocean roar, distant thunder, cinematic ambient synth',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 2,
        duration_seconds: 15,
        visual_prompt: 'A person taking a steady step out of a wooden boat directly onto the surface of the glowing sea.',
        dialogue: 'Faith is not the absence of the storm. Faith is the courage to take the first step onto the water anyway.',
        action_notes: 'Glowing ripples form under the footstep, glowing with radiant gold light.',
        sound_fx: 'Gentle water shimmer, violin crescendo',
        imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 3,
        duration_seconds: 15,
        visual_prompt: 'The storm clouds roll back revealing a breathtaking rose-gold sunrise with calm glass-like waters.',
        dialogue: 'Keep your eyes fixed on the light ahead. You are never walking alone.',
        action_notes: 'Warm sunrise washes over the scene, gentle breeze lifts the fabric.',
        sound_fx: 'Inspiring orchestral choir, tranquil birdsong',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 4,
        duration_seconds: 15,
        visual_prompt: 'Scripture verse title card: "Be still, and know that I am with you always." — Psalm 46:10',
        dialogue: 'Share this message of peace with someone walking through a storm this week.',
        action_notes: 'Typography glows with gentle soft bokeh particles.',
        sound_fx: 'Resonant bell chime, warm acoustic guitar',
        imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'sample-imagination-best-friend',
    title: 'My Best Friend Max: Secret Agent Pup',
    pillar: 'imagination',
    target_duration_seconds: 30,
    aspect_ratio: '1:1',
    style_id: 'pixar-3d',
    voice_tone_id: 'comedic',
    character_description: 'Max the fluffy golden retriever wearing cool aviator sunglasses and a red superhero cape.',
    character_anchor_prompt: '3D Pixar style: Fluffy golden retriever wearing sunglasses and miniature red superhero cape, sitting proudly on a suburban sofa',
    premise: 'What my dog Max really does while I am at work: top-secret squirrel surveillance and couch acrobatics.',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-08-28T10:00:00.000Z',
    scenes: [
      {
        scene_number: 1,
        duration_seconds: 10,
        visual_prompt: 'Max sits looking sad as the front door closes, then immediately slips on aviator sunglasses and jumps into superhero stance.',
        dialogue: 'Human has left the building. Mission: Protect the Living Room is now ACTIVE.',
        action_notes: 'Door click, sunglasses drop onto eyes with cartoon cool sound, tail wags at warp speed.',
        sound_fx: 'Door close, cartoon slide whistle, high-energy spy guitar riff',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 2,
        duration_seconds: 10,
        visual_prompt: 'Max investigates a suspicious robotic vacuum cleaner, barking with dramatic superhero slow-motion dodges.',
        dialogue: 'Sector 4 compromised by the Evil Dust Monster. Deploying tactical treat neutralization!',
        action_notes: 'Max leaps gracefully over the robot vacuum, grabbing a squeaky toy mid-air.',
        sound_fx: 'Laser pew-pew, squeaky toy squeak, cartoon boing',
        imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80'
      },
      {
        scene_number: 3,
        duration_seconds: 10,
        visual_prompt: 'Max curls up asleep on the forbidden big couch, dreaming with thought bubble of chasing golden tennis balls.',
        dialogue: 'Another day saving the world. Best boy duty complete.',
        action_notes: 'Max snores softly with tiny "Zzz" clouds floating upward.',
        sound_fx: 'Gentle dog snore, soft lullaby chime, tail thump',
        imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

export const BRAND_INFO = {
  name: 'LovAnimate',
  tagline: 'Create, Animate & Share What You Love in 3 Clicks',
  shortDescription: 'Turn love memories, restaurant specialties, faith visions, and pure imagination into 30, 60, and 90-second animated cartoons & storyboards. No mailing lists, no calendar setup—just pure creation, download, and instant sharing.'
};
