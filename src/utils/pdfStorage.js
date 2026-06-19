const STORAGE_KEY = "seatScholar_pdfs";

export function getSavedPdfs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePdfRecord(record) {
  const existing = getSavedPdfs();
  const updated = [record, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("seatScholar_pdfs_updated"));
  return updated;
}

export function deletePdfRecord(id) {
  const updated = getSavedPdfs().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("seatScholar_pdfs_updated"));
  return updated;
}

export function createPdfRecord({ name, examType, pdfData }) {
  return {
    id: crypto.randomUUID?.() || `pdf_${Date.now()}`,
    name,
    date: new Date().toISOString(),
    examType,
    pdfData,
  };
}

export function downloadPdfFromData(pdfData, fileName) {
  const link = document.createElement("a");
  link.href = pdfData;
  link.download = fileName || "Seating_Plan.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function openPdfInNewTab(pdfData) {
  const newWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!newWindow) {
    alert("Pop-up blocked! Please allow pop-ups to view the PDF.");
    return;
  }

  newWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Seating Plan PDF</title>
        <style>
          html, body { margin: 0; height: 100%; background: #0f172a; }
          iframe { width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        <iframe
          title="Saved Seating Plan PDF"
          src="${pdfData}"
          sandbox="allow-same-origin allow-scripts"
        ></iframe>
      </body>
    </html>
  `);
  newWindow.document.close();
}
