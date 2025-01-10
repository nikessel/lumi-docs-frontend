import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportButtonProps {
  onClick: () => Promise<void>;
  className?: string;
  reportTitle?: string;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({ onClick, className = '', reportTitle = 'Report' }) => {
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Wait for content to expand
      await onClick();
      
      // Add PDF mode class and wait for DOM updates
      const element = document.getElementById('report-content');
      if (!element) {
        throw new Error('Report content element not found');
      }

      element.classList.add('pdf-mode');
      // Wait for any animations and state changes
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        x: 0,
        y: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      // Create PDF
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Split into pages
      let heightLeft = imgHeight;
      let position = 0;
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pageHeight;

      // Add subsequent pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const filename = `${reportTitle?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'report'}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      // Remove PDF mode class
      const element = document.getElementById('report-content');
      if (element) {
        element.classList.remove('pdf-mode');
      }
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      className={`flex items-center gap-2 ${className}`}
      variant="outline"
      disabled={exporting}
    >
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {exporting ? 'Exporting PDF...' : 'Export as PDF'}
    </Button>
  );
};

export default PDFExportButton;
