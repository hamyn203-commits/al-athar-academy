import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Award, Calendar, User, BookOpen, CheckCircle, XCircle, Download, Share2 } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { useI18n } from '../../i18n';

export default function CertificateView() {
  const { certificateId } = useParams();
  const { locale } = useI18n();
  const [certificate, setCertificate] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch certificate');
      }

      setCertificate(data.certificate);
      setVerification(data.verification);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // TODO: Implement PDF generation
    alert('PDF download feature coming soon!');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = locale === 'ar' 
      ? `شهادة إتمام دورة ${certificate.course.title.ar}`
      : `Certificate of completion for ${certificate.course.title.en}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert(locale === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!');
    }
  };

  if (loading) {
    return (
      <>
        <GlobalHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
        <GlobalFooter />
      </>
    );
  }

  if (error) {
    return (
      <>
        <GlobalHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <XCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'ar' ? 'الشهادة غير موجودة' : 'Certificate Not Found'}
            </h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <GlobalFooter />
      </>
    );
  }

  const isValid = verification?.valid;
  const courseTitle = certificate.course.title[locale] || certificate.course.title.ar;
  const studentName = certificate.student.name;

  return (
    <>
      <SEOHead 
        page={{
          title: locale === 'ar' ? `شهادة ${studentName}` : `Certificate - ${studentName}`,
          description: locale === 'ar' 
            ? `شهادة إتمام دورة ${courseTitle}`
            : `Certificate of completion for ${courseTitle}`,
          url: `/verify-certificate/${certificateId}`,
          type: 'website'
        }}
      />
      
      <GlobalHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Verification Badge */}
          <div className={`mb-8 p-4 rounded-lg ${isValid ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <div className="flex items-center gap-3">
              {isValid ? (
                <>
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="font-bold text-green-800">
                      {locale === 'ar' ? 'شهادة موثقة' : 'Verified Certificate'}
                    </p>
                    <p className="text-sm text-green-600">
                      {locale === 'ar' ? 'هذه الشهادة أصلية ومعتمدة' : 'This certificate is authentic and verified'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="text-red-600" size={24} />
                  <div>
                    <p className="font-bold text-red-800">
                      {locale === 'ar' ? 'شهادة غير صالحة' : 'Invalid Certificate'}
                    </p>
                    <p className="text-sm text-red-600">
                      {verification?.reason || (locale === 'ar' ? 'هذه الشهادة غير صالحة' : 'This certificate is invalid')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Certificate Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-8 text-white text-center">
              <Award className="mx-auto mb-4" size={64} />
              <h1 className="text-4xl font-bold mb-2">
                {locale === 'ar' ? 'شهادة إتمام' : 'Certificate of Completion'}
              </h1>
              <p className="text-emerald-100">
                {locale === 'ar' ? 'أكاديمية الأثر الطيب' : 'Al-Athar Academy'}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="p-12 text-center">
              <p className="text-gray-600 mb-4">
                {locale === 'ar' ? 'تشهد هذه الشهادة بأن' : 'This is to certify that'}
              </p>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-emerald-600 inline-block pb-2">
                {studentName}
              </h2>

              <p className="text-gray-600 mb-4">
                {locale === 'ar' ? 'قد أتم بنجاح دورة' : 'has successfully completed the course'}
              </p>

              <h3 className="text-2xl font-bold text-emerald-600 mb-8">
                {courseTitle}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Calendar className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-600">
                    {locale === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(certificate.issuedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>

                <div className="text-center">
                  <BookOpen className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-600">
                    {locale === 'ar' ? 'النتيجة' : 'Score'}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {certificate.metadata?.score || 100}%
                  </p>
                </div>

                <div className="text-center">
                  <User className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-600">
                    {locale === 'ar' ? 'معرف الشهادة' : 'Certificate ID'}
                  </p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {certificate.certificateId}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              {certificate.qrCode && (
                <div className="mb-8">
                  <img 
                    src={certificate.qrCode} 
                    alt="QR Code" 
                    className="mx-auto w-48 h-48"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {locale === 'ar' ? 'امسح للتحقق من الشهادة' : 'Scan to verify certificate'}
                  </p>
                </div>
              )}
            </div>

            {/* Certificate Footer */}
            <div className="bg-gray-50 p-6 border-t">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Download size={20} />
                  {locale === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={20} />
                  {locale === 'ar' ? 'مشاركة' : 'Share'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </>
  );
}
