import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Globe, 
  Award, 
  Clock, 
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            {t.hero.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/student"
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
            >
              {t.hero.cta1}
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/teachers"
              className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"
            >
              <Users size={20} />
              {t.hero.cta2}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown size={40} className="text-white/60" />
      </motion.div>
    </section>
  );
}

function StatsSection() {
  const { t } = useI18n();
  
  const stats = [
    { icon: Users, value: 5000, label: t.stats.students, suffix: '+' },
    { icon: BookOpen, value: 200, label: t.stats.teachers, suffix: '+' },
    { icon: Globe, value: 50, label: t.stats.countries, suffix: '+' },
    { icon: Clock, value: 10000, label: t.stats.sessions, suffix: '+' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <stat.icon className="text-emerald-600" size={32} />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useI18n();
  
  const features = [
    {
      icon: Award,
      title: t.features.feature1.title,
      description: t.features.feature1.description,
      color: 'emerald',
    },
    {
      icon: Clock,
      title: t.features.feature2.title,
      description: t.features.feature2.description,
      color: 'blue',
    },
    {
      icon: BookOpen,
      title: t.features.feature3.title,
      description: t.features.feature3.description,
      color: 'purple',
    },
    {
      icon: Award,
      title: t.features.feature4.title,
      description: t.features.feature4.description,
      color: 'gold',
    },
    {
      icon: Globe,
      title: t.features.feature5.title,
      description: t.features.feature5.description,
      color: 'indigo',
    },
    {
      icon: Star,
      title: t.features.feature6.title,
      description: t.features.feature6.description,
      color: 'pink',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-gradient">{t.features.title}</h2>
          <p className="section-subtitle">{t.features.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 card-hover"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${feature.color}-100 mb-6`}>
                <feature.icon className={`text-${feature.color}-600`} size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedTeachersSection() {
  const { t } = useI18n();
  
  const teachers = [
    {
      id: 1,
      name: 'الشيخ أحمد محمد',
      specialty: 'تحفيظ القرآن',
      rating: 4.9,
      reviews: 120,
      image: '/placeholder-teacher.jpg',
    },
    {
      id: 2,
      name: 'الشيخة فاطمة علي',
      specialty: 'التجويد',
      rating: 4.8,
      reviews: 95,
      image: '/placeholder-teacher.jpg',
    },
    {
      id: 3,
      name: 'الشيخ عمر حسن',
      specialty: 'اللغة العربية',
      rating: 4.9,
      reviews: 150,
      image: '/placeholder-teacher.jpg',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-gradient">{t.teachers.title}</h2>
          <p className="section-subtitle">{t.teachers.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {teachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden card-hover"
            >
              <div className="relative h-64 bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <Users size={80} className="text-white/30" />
                <div className="absolute top-4 right-4 bg-gold-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {t.teachers.featured}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{teacher.name}</h3>
                <p className="text-emerald-600 font-medium mb-3">{teacher.specialty}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="text-gold-400 fill-gold-400" size={20} />
                  <span className="font-bold">{teacher.rating}</span>
                  <span className="text-gray-500">({teacher.reviews} {t.teachers.reviews})</span>
                </div>
                <Link
                  to={`/teachers/${teacher.id}`}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {t.teachers.viewProfile}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/teachers"
            className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
          >
            <Users size={20} />
            {t.teachers.viewAll}
          </Link>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { t } = useI18n();
  
  const testimonials = [
    {
      name: 'أحمد محمود',
      country: 'مصر',
      text: 'تجربة رائعة! تعلمت القرآن بطريقة سهلة وممتعة مع معلمين محترفين.',
      rating: 5,
    },
    {
      name: 'Sarah Johnson',
      country: 'USA',
      text: 'Amazing platform! The teachers are very professional and patient.',
      rating: 5,
    },
    {
      name: 'محمد علي',
      country: 'السعودية',
      text: 'أنصح الجميع بالانضمام. المنصة ممتازة والمعلمون على مستوى عالٍ.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-gradient">{t.testimonials.title}</h2>
          <p className="section-subtitle">{t.testimonials.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="text-gold-400 fill-gold-400" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Users className="text-emerald-600" size={24} />
                </div>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.country}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-gradient">{t.faq.title}</h2>
          <p className="section-subtitle">{t.faq.subtitle}</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-lg">{faq.q}</span>
                {openIndex === index ? (
                  <ChevronUp className="text-emerald-600" size={24} />
                ) : (
                  <ChevronDown className="text-gray-400" size={24} />
                )}
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 text-gray-600 leading-relaxed"
                >
                  {faq.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { t } = useI18n();

  return (
    <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto">
            {t.cta.subtitle}
          </p>
          <Link
            to="/student"
            className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            {t.cta.button}
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function NewLandingPage() {
  const { t } = useI18n();
  
  return (
    <>
      <SEOHead 
        page={{
          title: t.hero.title,
          description: t.hero.subtitle,
          url: '/',
          keywords: 'quran, arabic, islamic education, online learning, tajweed, certified teachers',
          type: 'website'
        }}
      />
      <GlobalHeader />
      <div className="min-h-screen">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <FeaturedTeachersSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </div>
      <GlobalFooter />
    </>
  );
}
