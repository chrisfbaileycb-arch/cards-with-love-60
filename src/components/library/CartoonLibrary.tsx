import React, { useMemo, useState } from 'react';
import { CartoonPillar, CartoonProject, CARTOON_STYLES, PILLARS } from '@/data/cartoonConfig';
import {
  deleteCartoonProject,
  duplicateCartoonProject,
  getStoredProjects
} from '@/lib/cartoonLibrary';
import { downloadCartoonZipBundle } from '@/lib/cartoonExport';
import {
  Search,
  Play,
  Copy,
  Trash2,
  Download,
  Film,
  Sparkles,
  Clapperboard,
  Clock,
  Layers,
  HeartHandshake,
  Lightbulb,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartoonLibraryProps {
  onOpenProjectInStudio: (project: CartoonProject) => void;
  onCreateNew: () => void;
}

export const CartoonLibrary: React.FC<CartoonLibraryProps> = ({
  onOpenProjectInStudio,
  onCreateNew
}) => {
  const [projects, setProjects] = useState<CartoonProject[]>(() => getStoredProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const refreshList = () => {
    setProjects(getStoredProjects());
  };

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      if (selectedPillar !== 'All' && p.pillar !== selectedPillar) return false;
      if (selectedDuration !== 'All' && String(p.target_duration_seconds) !== selectedDuration)
        return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.premise.toLowerCase().includes(q) ||
        p.character_description?.toLowerCase().includes(q)
      );
    });
  }, [projects, searchQuery, selectedPillar, selectedDuration]);

  const handleDuplicate = (project: CartoonProject) => {
    const copy = duplicateCartoonProject(project.id);
    if (copy) {
      refreshList();
      setNotification(`“${project.title}” duplicated.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      deleteCartoonProject(id);
      refreshList();
      setNotification(`“${title}” deleted.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleQuickDownloadZip = async (project: CartoonProject) => {
    setBusyId(project.id);
    try {
      await downloadCartoonZipBundle(project);
      setNotification(`ZIP bundle downloaded for “${project.title}”.`);
    } catch (err) {
      console.error(err);
      setNotification('Failed to download ZIP.');
    } finally {
      setBusyId(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <section id="library" className="bg-[#FDFBF7] py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header Section */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#E6DCCB] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF8EE] px-3 py-1 text-xs font-['Fredoka',sans-serif] font-bold text-[#A4794A] border border-[#E8DEC9] mb-1">
              <Film className="h-3.5 w-3.5" />
              <span>Animated Story Archive</span>
            </div>
            <h2 className="font-['Fredoka',sans-serif] text-2xl font-bold tracking-tight text-[#1F1D1B] sm:text-3xl">
              My Cartoon Story Library
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6D6459] font-medium">
              Revisit, play, export, and adapt your 30s, 60s, and 90s animated storyboards.
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#EAB308] px-6 py-3 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>Create New Cartoon</span>
          </button>
        </div>

        {/* Feedback Notification */}
        {notification && (
          <div className="mt-4 rounded-2xl border border-[#C9A273] bg-[#FAF5EE] px-4 py-2.5 text-xs font-semibold text-[#78542F] shadow-sm">
            {notification}
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9084]" />
            <input
              type="text"
              placeholder="Search cartoons by title, character, premise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#E0D5C2] bg-white py-2.5 pl-10 pr-4 text-xs text-[#2C2A29] outline-none placeholder:text-[#A49A8D] focus:border-[#E11D48] focus:ring-2 focus:ring-[#FFE4E6]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pillar Filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-['Fredoka',sans-serif] font-bold text-[#8A7E72]">Category:</span>
              <select
                aria-label="Filter by Pillar"
                value={selectedPillar}
                onChange={(e) => setSelectedPillar(e.target.value)}
                className="rounded-2xl border border-[#E0D5C2] bg-white px-3 py-1.5 text-xs font-medium text-[#2C2A29] outline-none focus:border-[#E11D48]"
              >
                <option value="All">All Categories</option>
                <option value="love">Love & Memories</option>
                <option value="restaurant">Restaurant & Brand</option>
                <option value="faith">Vision of Faith</option>
                <option value="imagination">Pure Imagination</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-['Fredoka',sans-serif] font-bold text-[#8A7E72]">Duration:</span>
              <select
                aria-label="Filter by Duration"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="rounded-2xl border border-[#E0D5C2] bg-white px-3 py-1.5 text-xs font-medium text-[#2C2A29] outline-none focus:border-[#E11D48]"
              >
                <option value="All">All Lengths</option>
                <option value="30">30 Seconds (3 Scenes)</option>
                <option value="60">60 Seconds (4 Scenes)</option>
                <option value="90">90 Seconds (6 Scenes)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cartoons Grid */}
        {filteredProjects.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E6DCCB] bg-[#FFFDF9] p-12 text-center">
            <Film className="h-12 w-12 text-[#C9A273]" />
            <h3 className="mt-4 font-['Fredoka',sans-serif] text-xl font-bold text-[#1F1D1B]">No cartoons found</h3>
            <p className="mt-1 max-w-sm text-xs text-[#6D6459]">
              {searchQuery || selectedPillar !== 'All' || selectedDuration !== 'All'
                ? 'Try adjusting your filters or search terms.'
                : 'Start creating your first 30, 60, or 90-second animated cartoon story.'}
            </p>
            <button
              type="button"
              onClick={onCreateNew}
              className="mt-5 rounded-2xl bg-[#E11D48] px-6 py-2.5 text-xs font-['Fredoka',sans-serif] font-bold text-white shadow hover:scale-105 transition-transform"
            >
              Start Creating Now
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const pillarInfo = (project.pillar && PILLARS[project.pillar]) || PILLARS.love;
              const style = CARTOON_STYLES.find((s) => s.id === project.style_id) || CARTOON_STYLES[0];
              const firstScene = project.scenes[0];
              const coverImg = firstScene?.customUploadedImage || firstScene?.imageUrl;

              return (
                <div
                  key={project.id}
                  id={`cartoon-card-${project.id}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-[#EDE4D3] bg-[#FFFDF9] shadow-sm transition-all duration-300 hover:border-[#E11D48] hover:shadow-lg hover:-translate-y-1"
                >
                  <div>
                    {/* Cover Preview Image */}
                    <div
                      className="relative aspect-video w-full cursor-pointer overflow-hidden bg-[#1E293B]"
                      onClick={() => onOpenProjectInStudio(project)}
                    >
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/50">
                          <Clapperboard className="h-10 w-10" />
                        </div>
                      )}

                      {/* Collectible Badge */}
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-[#1F1D1B] shadow-md backdrop-blur-sm border border-[#EDE4D3]">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: pillarInfo.accentColor }}
                        />
                        <span>{pillarInfo.name}</span>
                      </div>

                      {/* Duration Badge */}
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/80 px-3 py-1 text-[11px] font-['Fredoka',sans-serif] font-bold text-[#FBBF24] backdrop-blur-sm shadow">
                        ⏱️ {project.target_duration_seconds}s · {project.scenes.length} Scenes
                      </span>

                      {/* Play Overlay Icon on hover */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#E11D48] shadow-2xl scale-90 transition-transform group-hover:scale-100">
                          <Play className="ml-1 h-6 w-6 fill-current" />
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Description */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[11px] font-['Fredoka',sans-serif] font-bold text-[#A4794A]">
                        <span className="rounded-md bg-[#FFF8EE] px-2 py-0.5 border border-[#E8DEC9]">{style.name}</span>
                        <span>·</span>
                        <span className="rounded-md bg-[#FFF8EE] px-2 py-0.5 border border-[#E8DEC9]">{project.aspect_ratio}</span>
                      </div>

                      <h3
                        className="mt-2.5 cursor-pointer font-['Fredoka',sans-serif] text-lg font-bold text-[#1F1D1B] group-hover:text-[#E11D48] transition-colors"
                        onClick={() => onOpenProjectInStudio(project)}
                      >
                        {project.title}
                      </h3>

                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#6D6459]">
                        {project.premise}
                      </p>

                      {/* Character Pill */}
                      {project.character_description && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#FAF5EE] px-2.5 py-1 text-[10px] font-medium text-[#78542F] border border-[#E8DEC9]">
                          <span className="font-bold">Protagonist:</span>
                          <span className="truncate max-w-[200px]">{project.character_description}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="flex items-center justify-between border-t border-[#EDE4D3] bg-[#FAF5EE] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpenProjectInStudio(project)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#1F1D1B] px-4 py-1.5 text-xs font-['Fredoka',sans-serif] font-bold text-white transition hover:bg-[#E11D48] hover:scale-105"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Open in Studio</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={busyId === project.id}
                        onClick={() => handleQuickDownloadZip(project)}
                        className="rounded-xl p-2 text-[#6D6459] transition hover:bg-white hover:text-[#1F1D1B]"
                        title="Download ZIP bundle"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(project)}
                        className="rounded-xl p-2 text-[#6D6459] transition hover:bg-white hover:text-[#1F1D1B]"
                        title="Duplicate cartoon"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(project.id, project.title)}
                        className="rounded-xl p-2 text-[#6D6459] transition hover:bg-white hover:text-red-600"
                        title="Delete cartoon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CartoonLibrary;
