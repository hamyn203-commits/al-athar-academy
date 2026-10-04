import React from 'react';
import { useI18n } from '../../i18n';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import MobileStickyBar from '../../components/MobileStickyBar';

import HeroSection from './sections/HeroSection';
import ProgramsSection from './sections/ProgramsSection';
import WhyWahyNamaaSection from './sections/WhyWahyNamaaSection';
import TeachersSection from './sections/TeachersSection';
import LearningExperienceSection from './sections/LearningExperienceSection';
import StudentJourneySection from './sections/StudentJourneySection';
import TargetAudiencesSection from './sections/TargetAudiencesSection';
import CTASection from './sections/CTASection';

export default function NewLandingPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const pageTitle = isAr
    ? 'وَحْيٌ وَنَمَاء | نتعلم القرآن، نحفظه، وننمو به'
    : 'Wahy Wa Namaa Academy | Learn. Memorize. Grow.';

  const pageDesc = isAr
    ? 'أكاديمية وحي ونماء لتعليم القرآن الكريم بتجربة حديثة، هادئة، وموثوقة للأطفال والناشئة والبالغين.'
    : 'Wahy Wa Namaa Academy offers modern, trusted Quran learning for children, youth, and adults.';

  return (
    <>
      <SEOHead
        page={{
          title: pageTitle,
          description: pageDesc,
          url: '/',
          type: 'website',
        }}
      />
      <GlobalHeader />
      <main className="wn-approved-home">
        <HeroSection />
        <ProgramsSection />
        <WhyWahyNamaaSection />
        <TeachersSection />
        <LearningExperienceSection />
        <StudentJourneySection />
        <TargetAudiencesSection />
        <CTASection />
      </main>
      <MobileStickyBar />
      <GlobalFooter />
    </>
  );
}
