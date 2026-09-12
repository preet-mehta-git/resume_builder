import html2pdf from 'html2pdf.js';

export async function downloadElementAsPdf(element, filename = 'resume.pdf') {
  if (!element) {
    throw new Error('Element to export not found');
  }

  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  return html2pdf().set(opt).from(element).save();
}
