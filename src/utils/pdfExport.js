import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to load image
const getBase64FromUrl = async (url) => {
    try {
        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                resolve(reader.result);
            }
        });
    } catch (e) {
        console.error("Error loading image", e);
        return null;
    }
}

export const generatePDFReport = async (risks, beforeImage, afterImage) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Load images
    const logoBase64 = await getBase64FromUrl('/logo-pdf.jpg');
    const beforeBase64 = beforeImage ? await getBase64FromUrl(beforeImage) : null;
    const afterBase64 = afterImage ? await getBase64FromUrl(afterImage) : null;

    // Colors
    const COLOR_ASPY_BLUE = [0, 159, 227]; // #009FE3
    const COLOR_RED_BORDER = [220, 50, 50];
    const COLOR_GREEN_BORDER = [50, 180, 80];
    const COLOR_FOOTER_BG = [0, 159, 227];

    if (!risks || risks.length === 0) {
        alert("No hay riesgos para exportar.");
        return;
    }

    // --- 1. HEADER (Page 1) ---
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, 10, 40, 15);
    }

    // Company Data
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_ASPY_BLUE);
    doc.text("Razón social", 70, 12);
    doc.setTextColor(0, 0, 0);
    doc.text("EMPRESA CLIENTE DEMO S.L.", 70, 16);

    doc.setTextColor(...COLOR_ASPY_BLUE);
    doc.text("Centro de trabajo", 70, 22);
    doc.setTextColor(0, 0, 0);
    doc.text("P.I. Las Atalayas, C/ Marco Polo", 70, 26);
    doc.text("03001 Alicante (España)", 70, 30);

    doc.setFontSize(14);
    doc.setTextColor(...COLOR_ASPY_BLUE);
    doc.text("FACTORES DE RIESGO IDENTIFICADOS", margin, 45);

    // --- 2. EVIDENCE IMAGES ---
    let yPos = 55;
    const imgWidth = 80;
    const imgHeight = 60;

    // Check if we have enough space or need new page? (Usually header + images fit on page 1)

    doc.setFontSize(10);
    doc.setTextColor(...COLOR_ASPY_BLUE);
    doc.text("Evidencia Visual (Antes)", margin + (imgWidth / 2), yPos - 3, { align: 'center' });
    doc.text("Propuesta Preventiva (Después)", pageWidth - margin - (imgWidth / 2), yPos - 3, { align: 'center' });

    // Left Image (Red)
    doc.setDrawColor(...COLOR_RED_BORDER);
    doc.setLineWidth(1);
    doc.rect(margin, yPos, imgWidth, imgHeight);
    if (beforeBase64) {
        doc.addImage(beforeBase64, 'JPEG', margin + 1, yPos + 1, imgWidth - 2, imgHeight - 2);
    }

    // Right Image (Green)
    doc.setDrawColor(...COLOR_GREEN_BORDER);
    doc.setLineWidth(1);
    doc.rect(pageWidth - margin - imgWidth, yPos, imgWidth, imgHeight);
    if (afterBase64) {
        doc.addImage(afterBase64, 'JPEG', pageWidth - margin - imgWidth + 1, yPos + 1, imgWidth - 2, imgHeight - 2);
    }

    // --- 3. SUMMARY TABLE ---
    // Prepare Data
    const tableData = risks.map(risk => [
        risk.id || '', // Added ID
        risk.factor || '',
        risk.evidencia || '',
        risk.medida || '',
        risk.fuente || ''
    ]);

    const tableStartY = yPos + imgHeight + 15;

    autoTable(doc, {
        startY: tableStartY,
        head: [['No.', 'Factor de riesgo\nidentificado', 'Evidencia visible en la imagen', 'Medida preventiva propuesta', 'Fuente preventiva\nutilizada']],
        body: tableData,
        theme: 'grid', // Uses simple lines
        headStyles: {
            fillColor: COLOR_ASPY_BLUE, // Corporate Blue background
            textColor: [255, 255, 255], // White Text
            fontStyle: 'bold',
            valign: 'middle',
            lineWidth: 0,
        },
        styles: {
            fontSize: 9,
            cellPadding: 6,
            valign: 'top',
            lineWidth: 0.1,
            lineColor: [230, 230, 230], // Very light borders
            textColor: [60, 60, 60] // Default Gray
        },
        columnStyles: {
            // 0: No. (New ID column)
            0: { fontStyle: 'bold', cellWidth: 10, halign: 'center' },
            // 1: Factor (Red)
            1: { textColor: [240, 80, 80], fontStyle: 'bold', cellWidth: 35 },
            // 2: Evidence (Gray)
            2: { textColor: [60, 60, 60], cellWidth: 'auto' },
            // 3: Measure (Green)
            3: { textColor: [40, 180, 100], cellWidth: 50 },
            // 4: Source (Blue Tag look)
            4: { textColor: [60, 100, 240], fontSize: 8, cellWidth: 35 }
        },
        didParseCell: (data) => {
            // Custom styling tweaks if needed per cell
            if (data.section === 'head') {
                // Header Border Bottom
            }
        }
    });

    // --- 4. FOOTER (Every Page) ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(...COLOR_FOOTER_BG);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        // doc.text("aspyprevencion.com", margin, pageHeight - 10);
        doc.text("Gestiona ágilmente la prevención de riesgos desde la app web de Dirección Técnica.", pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 10);
    }

    doc.save("informe_direccion_tecnica.pdf");
};
