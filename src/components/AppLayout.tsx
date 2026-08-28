import React, { useCallback, useState } from 'react';
import SiteHeader from '@/components/sections/SiteHeader';
import Hero from '@/components/sections/Hero';
import CartoonStudio from '@/components/studio/CartoonStudio';
import CartoonLibrary from '@/components/library/CartoonLibrary';
import Gallery from '@/components/sections/Gallery';
import HowItWorks from '@/components/sections/HowItWorks';
import Faq from '@/components/sections/Faq';
import Pricing from '@/components/pricing/Pricing';
import SiteFooter from '@/components/sections/SiteFooter';
import { CartoonProject } from '@/data/cartoonConfig';

const AppLayout: React.FC = () => {
  const [activeProject, setActiveProject] = useState<CartoonProject | null>(null);

  const handleOpenInStudio = useCallback((project: CartoonProject) => {
    setActiveProject(project);
    const el = document.querySelector('#studio');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCreateNew = useCallback(() => {
    setActiveProject(null);
    const el = document.querySelector('#studio');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2C2A29]">
      <SiteHeader />
      <main>
        <Hero />
        <section id="studio" className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <CartoonStudio
              initialProject={activeProject}
            />
          </div>
        </section>
        <CartoonLibrary
          onOpenProjectInStudio={handleOpenInStudio}
          onCreateNew={handleCreateNew}
        />
        <Gallery onSelectProject={handleOpenInStudio} />
        <HowItWorks />
        <Pricing />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
};

export default AppLayout;
