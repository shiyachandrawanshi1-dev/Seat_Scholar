import React, { useEffect, useState } from "react";
import {
  getSavedPdfs,
  deletePdfRecord,
  downloadPdfFromData,
  openPdfInNewTab,
} from "../utils/pdfStorage";

export default function SavedReportsHistory() {
  const [savedPdfs, setSavedPdfs] = useState([]);
  const [previewPdf, setPreviewPdf] = useState(null);

  const refreshList = () => {
    setSavedPdfs(getSavedPdfs());
  };

  useEffect(() => {
    refreshList();

    const handleStorage = (event) => {
      if (event.key === "seatScholar_pdfs" || event.key === null) {
        refreshList();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("seatScholar_pdfs_updated", refreshList);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("seatScholar_pdfs_updated", refreshList);
    };
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Is report ko history se delete karna hai?")) return;
    setSavedPdfs(deletePdfRecord(id));
    if (previewPdf?.id === id) setPreviewPdf(null);
  };

  const handleView = (report) => {
    setPreviewPdf(report);
    openPdfInNewTab(report.pdfData);
  };

  const handleDownloadAgain = (report) => {
    downloadPdfFromData(report.pdfData, report.name);
  };

  const formatDate = (isoDate) => {
    try {
      return new Date(isoDate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="mt-8">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Saved Reports History
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              LocalStorage se saved seating plan PDFs
            </p>
          </div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            {savedPdfs.length} saved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">Report Name</th>
                <th className="px-5 py-3 font-semibold">Exam Type</th>
                <th className="px-5 py-3 font-semibold">Saved On</th>
                <th className="px-5 py-3 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {savedPdfs.length > 0 ? (
                savedPdfs.map((report, index) => (
                  <tr
                    key={report.id}
                    className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {report.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {report.examType || "N/A"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(report.date)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleView(report)}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadAgain(report)}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                        >
                          Download Again
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(report.id)}
                          className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Abhi tak koi saved report nahi hai. Generate Seating tab se
                    report banayein.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewPdf && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <div>
              <h4 className="font-semibold text-slate-800">
                Preview: {previewPdf.name}
              </h4>
              <p className="text-xs text-slate-500">
                Safe iframe layout — PDF locally render ho rahi hai
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewPdf(null)}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
            >
              Close Preview
            </button>
          </div>
          <iframe
            title={`Preview ${previewPdf.name}`}
            src={previewPdf.pdfData}
            className="h-[520px] w-full bg-slate-900"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      )}
    </div>
  );
}
