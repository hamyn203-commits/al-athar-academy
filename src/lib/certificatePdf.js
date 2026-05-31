import { jsPDF } from 'jspdf';

export async function downloadCertificatePdf({ certificate, locale = 'ar' }) {
  const ar = locale === 'ar';
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const courseTitle = certificate.course?.title?.[locale] || certificate.course?.title?.ar || 'Course';
  const studentName = certificate.student?.name || 'Student';

  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, 297, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(ar ? 'شهادة إتمام — أكاديمية الأثر' : 'Certificate — Al-Athar Academy', 148, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.text('V4.0', 148, 28, { align: 'center' });

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.text(ar ? 'تشهد هذه الشهادة بأن' : 'This certifies that', 148, 55, { align: 'center' });
  doc.setFontSize(26);
  doc.setTextColor(5, 120, 80);
  doc.text(studentName, 148, 70, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(ar ? 'قد أتم بنجاح دورة' : 'has completed', 148, 85, { align: 'center' });
  doc.setFontSize(18);
  doc.text(courseTitle, 148, 98, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`${ar ? 'التاريخ' : 'Date'}: ${new Date(certificate.issuedAt).toLocaleDateString(ar ? 'ar-EG' : 'en-US')}`, 30, 120);
  doc.text(`${ar ? 'النتيجة' : 'Score'}: ${certificate.metadata?.score || 100}%`, 30, 128);
  doc.text(`ID: ${certificate.certificateId}`, 30, 136);

  if (certificate.qrCode) {
    try {
      doc.addImage(certificate.qrCode, 'PNG', 230, 105, 45, 45);
      doc.setFontSize(9);
      doc.text(ar ? 'امسح للتحقق' : 'Scan to verify', 252, 155, { align: 'center' });
    } catch {
      /* QR optional */
    }
  }

  doc.save(`certificate-${certificate.certificateId}.pdf`);
}
