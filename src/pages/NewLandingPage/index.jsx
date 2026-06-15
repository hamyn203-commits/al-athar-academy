import { useI18n } from '../../i18n';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import HeroSection from './sections/HeroSection';
import SocialProofStrip from './sections/SocialProofStrip';
import StatsBar from './sections/StatsBar';
import FeaturesSection from './sections/FeaturesSection';
import AlAzharHeritageSection from './sections/AlAzharHeritageSection';
import CourseTimelineSection from './sections/CourseTimelineSection';
import AISectionModern from './sections/AISectionModern';
import TeachersSection from './sections/TeachersSection';
import InteractivePlannerSection from './sections/InteractivePlannerSection';
import FAQSection from './sections/FAQSection';
import CTASection from './sections/CTASection';

export default function NewLandingPage() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead page={{ title: t.hero.title, description: t.hero.subtitle, url: '/', type: 'website' }} />
      <GlobalHeader />
      <main className="bg-white">
        <HeroSection />
        <SocialProofStrip />
        <StatsBar />
        <FeaturesSection />
        <AlAzharHeritageSection />
        <CourseTimelineSection />
        <AISectionModern />
        <TeachersSection />
        <InteractivePlannerSection />
        <FAQSection />
        <CTASection />
      </main>
      <GlobalFooter />
    </>
  );
}