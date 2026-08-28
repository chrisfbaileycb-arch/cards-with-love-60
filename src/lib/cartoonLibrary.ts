import { CartoonPillar, CartoonProject, PILLARS, SAMPLE_CARTOON_PROJECTS } from '@/data/cartoonConfig';

const STORAGE_KEY = 'kindtoons_projects_v1';

function sanitizeProject(p: Partial<CartoonProject> & Record<string, unknown>): CartoonProject {
  const pillarStr = typeof p.pillar === 'string' ? p.pillar : '';
  const validPillar: CartoonPillar =
    pillarStr && PILLARS[pillarStr as CartoonPillar]
      ? (pillarStr as CartoonPillar)
      : pillarStr === 'brand'
      ? 'restaurant'
      : pillarStr === 'family'
      ? 'love'
      : pillarStr === 'vision' || pillarStr === 'purpose'
      ? 'faith'
      : 'love';

  return {
    id: typeof p.id === 'string' ? p.id : `toon_${Date.now()}`,
    title: typeof p.title === 'string' ? p.title : 'My LovAnimate Cartoon',
    pillar: validPillar,
    target_duration_seconds: p.target_duration_seconds === 60 || p.target_duration_seconds === 90 ? p.target_duration_seconds : 30,
    aspect_ratio: p.aspect_ratio === '9:16' || p.aspect_ratio === '1:1' ? p.aspect_ratio : '16:9',
    style_id: typeof p.style_id === 'string' ? p.style_id : 'pixar-3d',
    voice_tone_id: typeof p.voice_tone_id === 'string' ? p.voice_tone_id : 'playful',
    character_description: typeof p.character_description === 'string' ? p.character_description : '',
    character_photo_url: typeof p.character_photo_url === 'string' ? p.character_photo_url : null,
    character_anchor_prompt: typeof p.character_anchor_prompt === 'string' ? p.character_anchor_prompt : '',
    premise: typeof p.premise === 'string' ? p.premise : '',
    created_at: typeof p.created_at === 'string' ? p.created_at : new Date().toISOString(),
    updated_at: typeof p.updated_at === 'string' ? p.updated_at : new Date().toISOString(),
    scenes: Array.isArray(p.scenes) ? p.scenes : []
  };
}

export function getStoredProjects(): CartoonProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with sample projects so the library is never empty
      saveStoredProjects(SAMPLE_CARTOON_PROJECTS);
      return SAMPLE_CARTOON_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(sanitizeProject);
    }
    return SAMPLE_CARTOON_PROJECTS;
  } catch {
    return SAMPLE_CARTOON_PROJECTS;
  }
}

export function saveStoredProjects(projects: CartoonProject[]) {
  try {
    const sanitized = projects.map(sanitizeProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

export function saveCartoonProject(project: CartoonProject): CartoonProject {
  const current = getStoredProjects();
  const existingIdx = current.findIndex(p => p.id === project.id);
  const now = new Date().toISOString();

  let updatedList: CartoonProject[];
  const projectToSave: CartoonProject = {
    ...project,
    updated_at: now
  };

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = projectToSave;
  } else {
    updatedList = [projectToSave, ...current];
  }

  saveStoredProjects(updatedList);
  return projectToSave;
}

export function duplicateCartoonProject(id: string): CartoonProject | null {
  const current = getStoredProjects();
  const target = current.find(p => p.id === id);
  if (!target) return null;

  const clone: CartoonProject = {
    ...target,
    id: `toon_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${target.title} (Copy)`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    scenes: target.scenes.map(s => ({ ...s }))
  };

  saveStoredProjects([clone, ...current]);
  return clone;
}

export function deleteCartoonProject(id: string): boolean {
  const current = getStoredProjects();
  const filtered = current.filter(p => p.id !== id);
  saveStoredProjects(filtered);
  return true;
}
