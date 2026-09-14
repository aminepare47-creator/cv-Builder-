import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CVData } from '../types/cv';
import { exportTXT, exportMarkdown, exportDOC } from '../utils/cvExportText';

interface Props {
  cvRef: React.RefObject<HTMLDivElement | null>;
  data: CVData;
}

export default function ExportPanel({ cvRef, data }: Props) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const exportToPDF = async () => {
    if (!cvRef.current) return;
    setExporting('pdf');
    try {
      const element = cvRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      const fileName = `CV_${data.personal.firstName}_${data.personal.lastName}.pdf`.replace(/\s+/g, '_');
      pdf.save(fileName);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Une erreur est survenue lors de l\'export PDF');
    } finally {
      setExporting(null);
      setShowMenu(false);
    }
  };

  const exportToPNG = async () => {
    if (!cvRef.current) return;
    setExporting('png');
    try {
      const element = cvRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const fileName = `CV_${data.personal.firstName}_${data.personal.lastName}.png`.replace(/\s+/g, '_');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erreur lors de l\'export PNG:', error);
      alert('Une erreur est survenue lors de l\'export PNG');
    } finally {
      setExporting(null);
      setShowMenu(false);
    }
  };

  const exportToJPG = async () => {
    if (!cvRef.current) return;
    setExporting('jpg');
    try {
      const element = cvRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const fileName = `CV_${data.personal.firstName}_${data.personal.lastName}.jpg`.replace(/\s+/g, '_');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (error) {
      console.error('Erreur lors de l\'export JPG:', error);
      alert('Une erreur est survenue lors de l\'export JPG');
    } finally {
      setExporting(null);
      setShowMenu(false);
    }
  };

  const runTextExport = (kind: 'txt' | 'md' | 'doc') => {
    setExporting(kind);
    try {
      if (kind === 'txt') exportTXT(data);
      else if (kind === 'md') exportMarkdown(data);
      else exportDOC(data);
    } catch (error) {
      console.error('Erreur export texte:', error);
    } finally {
      setExporting(null);
      setShowMenu(false);
    }
  };

  const exportToJSON = () => {
    setExporting('json');
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const fileName = `CV_${data.personal.firstName}_${data.personal.lastName}.json`.replace(/\s+/g, '_');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = URL.createObjectURL(dataBlob);
      link.click();
    } catch (error) {
      console.error('Erreur lors de l\'export JSON:', error);
      alert('Une erreur est survenue lors de l\'export JSON');
    } finally {
      setExporting(null);
      setShowMenu(false);
    }
  };

  const printCV = () => {
    setShowMenu(false);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 px-3 sm:px-4 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all shadow-md shadow-indigo-200 font-semibold text-xs sm:text-sm whitespace-nowrap"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="hidden xs:inline">Exporter</span>
        <svg className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
          <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 overflow-hidden animate-fadeIn">
            <div className="p-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5">Formats</p>
              
              <button
                onClick={exportToPDF}
                disabled={exporting !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">PDF</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Document PDF</p>
                  <p className="text-[10px] text-slate-500">Idéal pour candidature</p>
                </div>
                {exporting === 'pdf' && <span className="text-xs text-indigo-600">⏳</span>}
              </button>

              <button
                onClick={exportToPNG}
                disabled={exporting !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">PNG</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Image PNG</p>
                  <p className="text-[10px] text-slate-500">Haute qualité, fond transparent</p>
                </div>
                {exporting === 'png' && <span className="text-xs text-indigo-600">⏳</span>}
              </button>

              <button
                onClick={exportToJPG}
                disabled={exporting !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">JPG</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Image JPG</p>
                  <p className="text-[10px] text-slate-500">Taille réduite</p>
                </div>
                {exporting === 'jpg' && <span className="text-xs text-indigo-600">⏳</span>}
              </button>

              <button
                onClick={exportToJSON}
                disabled={exporting !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">JSON</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Données JSON</p>
                  <p className="text-[10px] text-slate-500">Sauvegarde complète</p>
                </div>
                {exporting === 'json' && <span className="text-xs text-indigo-600">⏳</span>}
              </button>

              <button
                onClick={() => runTextExport('doc')}
                disabled={exporting !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">DOC</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Word modifiable</p>
                  <p className="text-[10px] text-slate-500">Ouvrable dans Word / Google Docs</p>
                </div>
                {exporting === 'doc' && <span className="text-xs text-indigo-600">⏳</span>}
              </button>

              <button
                onClick={() => runTextExport('txt')}
                disabled={exporting !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">TXT</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Texte brut</p>
                  <p className="text-[10px] text-slate-500">Idéal pour les formulaires ATS</p>
                </div>
                {exporting === 'txt' && <span className="text-xs text-indigo-600">⏳</span>}
              </button>

              <button
                onClick={() => runTextExport('md')}
                disabled={exporting !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">MD</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Markdown</p>
                  <p className="text-[10px] text-slate-500">Pour LinkedIn, GitHub, portfolios</p>
                </div>
                {exporting === 'md' && <span className="text-xs text-indigo-600">⏳</span>}
              </button>

              <div className="border-t border-slate-100 my-1" />
              
              <button
                onClick={printCV}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Imprimer</p>
                  <p className="text-[10px] text-slate-500">Imprimante ou PDF système</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
