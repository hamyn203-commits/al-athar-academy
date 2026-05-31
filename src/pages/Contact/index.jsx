import { useState } from 'react';
import { useI18n } from '../../i18n';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle,
  MessageCircle,
  Globe
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';

export default function Contact() {
  const { t, locale } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/contact', formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      alert(locale === 'ar' ? 'تعذر إرسال الرسالة، حاول لاحقاً' : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
      value: 'info@alathar-academy.com',
      link: 'mailto:info@alathar-academy.com',
      color: 'text-blue-600'
    },
    {
      icon: Phone,
      title: locale === 'ar' ? 'الهاتف' : 'Phone',
      value: '+20 123 456 7890',
      link: 'tel:+201234567890',
      color: 'text-green-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '+20 123 456 7890',
      link: 'https://wa.me/201234567890',
      color: 'text-green-500'
    },
    {
      icon: MapPin,
      title: locale === 'ar' ? 'العنوان' : 'Address',
      value: locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
      link: '#',
      color: 'text-red-600'
    },
    {
      icon: Clock,
      title: locale === 'ar' ? 'ساعات العمل' : 'Working Hours',
      value: locale === 'ar' ? '24/7 - متاح دائماً' : '24/7 - Always Available',
      link: '#',
      color: 'text-purple-600'
    },
    {
      icon: Globe,
      title: locale === 'ar' ? 'الموقع' : 'Website',
      value: 'alathar-academy.vercel.app',
      link: 'https://alathar-academy.vercel.app',
      color: 'text-emerald-600'
    }
  ];

  return (
    <>
      <SEOHead 
        page={{
          title: locale === 'ar' ? 'اتصل بنا' : 'Contact Us',
          description: locale === 'ar' 
            ? 'تواصل مع أكاديمية الأثر الطيب - نحن هنا لمساعدتك' 
            : 'Get in touch with Al-Athar Academy - We are here to help you',
          url: '/contact',
          keywords: 'contact, support, help, al-athar academy',
          type: 'website'
        }}
      />
      
      <GlobalHeader />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-4"
            >
              {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-emerald-100 max-w-2xl mx-auto"
            >
              {locale === 'ar' 
                ? 'نحن هنا لمساعدتك. تواصل معنا في أي وقت' 
                : 'We are here to help you. Get in touch with us anytime'
              }
            </motion.p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="container mx-auto px-4 -mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <motion.a
                key={index}
                href={info.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gray-50 ${info.color}`}>
                    <info.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{info.title}</h3>
                    <p className="text-gray-600">{info.value}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-3xl font-bold mb-6">
                {locale === 'ar' ? 'أرسل لنا رسالة' : 'Send us a message'}
              </h2>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                >
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-green-800">
                      {locale === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!'}
                    </p>
                    <p className="text-sm text-green-600">
                      {locale === 'ar' ? 'سنتواصل معك قريباً' : 'We will get back to you soon'}
                    </p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={locale === 'ar' ? 'example@email.com' : 'example@email.com'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={locale === 'ar' ? '+20 123 456 7890' : '+20 123 456 7890'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'الموضوع' : 'Subject'} *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={locale === 'ar' ? 'موضوع الرسالة' : 'Message subject'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'الرسالة' : 'Message'} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={locale === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {locale === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {locale === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Info Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Why Contact Us */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-4">
                  {locale === 'ar' ? 'لماذا تتواصل معنا؟' : 'Why Contact Us?'}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                    <span>{locale === 'ar' ? 'استفسارات عن الدورات والبرامج' : 'Inquiries about courses and programs'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                    <span>{locale === 'ar' ? 'الدعم الفني والمساعدة' : 'Technical support and assistance'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                    <span>{locale === 'ar' ? 'الشراكات والتعاون' : 'Partnerships and collaborations'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                    <span>{locale === 'ar' ? 'الاقتراحات والملاحظات' : 'Suggestions and feedback'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                    <span>{locale === 'ar' ? 'أي استفسارات أخرى' : 'Any other inquiries'}</span>
                  </li>
                </ul>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  {locale === 'ar' ? 'وقت الاستجابة' : 'Response Time'}
                </h3>
                <p className="text-emerald-100 mb-4">
                  {locale === 'ar' 
                    ? 'نحن نلتزم بالرد على جميع الرسائل في أسرع وقت ممكن' 
                    : 'We are committed to responding to all messages as quickly as possible'
                  }
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span className="font-semibold">
                      {locale === 'ar' ? 'البريد الإلكتروني: خلال 24 ساعة' : 'Email: Within 24 hours'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={20} />
                    <span className="font-semibold">
                      {locale === 'ar' ? 'واتساب: خلال ساعة' : 'WhatsApp: Within 1 hour'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={20} />
                    <span className="font-semibold">
                      {locale === 'ar' ? 'الهاتف: فوري' : 'Phone: Immediate'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <GlobalFooter />
    </>
  );
}
