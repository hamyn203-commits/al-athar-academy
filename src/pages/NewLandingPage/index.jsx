import React from 'react';
import { useI18n } from '../../i18n';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import MobileStickyBar from '../../components/MobileStickyBar';

// ═══ الأقسام العشرة المعتمدة — Brand Identity Prompt 10 ═══
import HeroSection from './sections/HeroSection';
import PhilosophySection from './sections/PhilosophySection';
import ProgramsSection from './sections/ProgramsSection';
import StudentJourneySection from './sections/StudentJourneySection';
import WhyWahyNamaaSection from './sections/WhyWahyNamaaSection';
import TeachersSection from './sections/TeachersSection';
import TargetAudiencesSection from './sections/TargetAudiencesSection';
import LearningExperienceSection from './sections/LearningExperienceSection';
import TestimonialsSection from './sections/TestimonialsSection';
import CTASection from './sections/CTASection';

export default function NewLandingPage() {
  const { t, locale } = useI18n();
  const isAr = locale === 'ar';

  const pageTitle = isAr
    ? 'وَحْيٌ وَنَمَاء | نتعلم القرآن، نحفظه، وننمو به'
    : 'WAHY WA NAMAA | Learn the Quran. Memorize it. Grow through it.';

  const pageDesc = isAr
    ? 'أكاديمية وَحْيٌ وَنَمَاء لتعليم وتحفيظ القرآن الكريم والقراءات بالسند المتصل — القرآن مصدر التعلم، والحفظ وسيلة الإتقان، والنمو هو أثر الرحلة في الإنسان.'
    : 'Wahy Wa Namaa Quran Academy — Learn, memorize, and grow through the Holy Quran under accredited scholars with unbroken chains of transmission (Sanad).';

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
      <main className="bg-[#fdfcf9] pb-16 md:pb-0 overflow-hidden">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Philosophy Section */}
        <PhilosophySection />

        {/* 3. Programs Section */}
        <ProgramsSection />

        {/* 4. Student Journey Section */}
        <StudentJourneySection />

        {/* 5. Why Wahy Wa Namaa Section */}
        <WhyWahyNamaaSection />

        {/* 6. Teachers Section */}
        <TeachersSection />

        {/* 7. Target Audiences Section */}
        <TargetAudiencesSection />

        {/* 8. Learning Experience Section */}
        <LearningExperienceSection />

        {/* 9. Testimonials Section */}
        <TestimonialsSection />

        {/* 10. Final CTA Section */}
        <CTASection />
      </main>
      <MobileStickyBar />
      <GlobalFooter />
    </>
  );
}