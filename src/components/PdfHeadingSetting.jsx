import React, { useState } from 'react';
import { FileText, Save, RefreshCw, Eye, UploadCloud } from 'lucide-react';

export default function PdfHeadingSetting() {
  const [formData, setFormData] = useState({
    instituteName: 'SAGAR INSTITUTE OF SCIENCE, TECHNOLOGY & RESEARCH',
    docTitle: 'B. Tech. V SEM EXAMINATION (Seating Plan)',
    examDate: 'Dec-2025',
    exampleRoom: '204 (Second Floor)',
    calendarDate: '2026-01-15',
    timeFrom: '10:00 AM',
    timeTo: '01:00 PM',
    footerLeft: '(Exam Supdt.)',
    footerRight: '(Observer)',
    isActive: true
  });

  const handleReset = () => {
    setFormData({
      instituteName: '', docTitle: '', examDate: '', exampleRoom: '',
      calendarDate: '', timeFrom: '', timeTo: '', footerLeft: '', footerRight: '', isActive: false
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title Breadcrumbs Navigation context */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Add / Edit PDF Heading (Attach in PDF Format)</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Upload your institute heading (Letterhead) that will be shown on top of seating plan PDF.</p>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Dashboard &gt; <span className="text-slate-600 font-bold">PDF Heading</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Interactive Configuration Block Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
          {/* File Upload Module */}
          <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl font-bold text-xs">PDF</div>
              <div>
                <div className="text-xs font-bold text-slate-800">Institute_Heading.pdf</div>
                <div className="text-[10px] text-green-600 font-bold mt-0.5">Size: 245 KB ✓</div>
              </div>
            </div>
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold px-3 py-1.5 rounded-lg text-slate-700 shadow-sm">
              Change File
            </button>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-600" /> Heading Information
            </h3>
            
            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 text-[11px]">Institute Name *</label>
                <input 
                  type="text" className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-slate-800"
                  value={formData.instituteName} onChange={e => setFormData({...formData, instituteName: e.target.value})}
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px]">Document Title *</label>
                <input 
                  type="text" className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-slate-800"
                  value={formData.docTitle} onChange={e => setFormData({...formData, docTitle: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block mb-1 text-[11px]">Exam Month-Year *</label>
                  <input type="text" className="w-full p-2.5 rounded-xl border border-slate-200 font-medium" value={formData.examDate} onChange={e => setFormData({...formData, examDate: e.target.value})}/>
                </div>
                <div className="col-span-1">
                  <label className="block mb-1 text-[11px]">Room No. Example *</label>
                  <input type="text" className="w-full p-2.5 rounded-xl border border-slate-200 font-medium" value={formData.exampleRoom} onChange={e => setFormData({...formData, exampleRoom: e.target.value})}/>
                </div>
                <div className="col-span-1">
                  <label className="block mb-1 text-[11px]">Date *</label>
                  <input type="date" className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800" value={formData.calendarDate} onChange={e => setFormData({...formData, calendarDate: e.target.value})}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[11px]">Time From *</label>
                  <input type="text" className="w-full p-2.5 rounded-xl border border-slate-200 font-medium" value={formData.timeFrom} onChange={e => setFormData({...formData, timeFrom: e.target.value})}/>
                </div>
                <div>
                  <label className="block mb-1 text-[11px]">Time To *</label>
                  <input type="text" className="w-full p-2.5 rounded-xl border border-slate-200 font-medium" value={formData.timeTo} onChange={e => setFormData({...formData, timeTo: e.target.value})}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[11px]">Footer Text (Left)</label>
                  <input type="text" className="w-full p-2.5 rounded-xl border border-slate-200 font-medium" value={formData.footerLeft} onChange={e => setFormData({...formData, footerLeft: e.target.value})}/>
                </div>
                <div>
                  <label className="block mb-1 text-[11px]">Footer Text (Right)</label>
                  <input type="text" className="w-full p-2.5 rounded-xl border border-slate-200 font-medium" value={formData.footerRight} onChange={e => setFormData({...formData, footerRight: e.target.value})}/>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" id="activeToggle" className="w-4 h-4 rounded text-blue-600"
                  checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})}
                />
                <label htmlFor="activeToggle" className="text-xs text-slate-600 cursor-pointer user-select-none">Make this heading active for PDF Generation</label>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons Grid control */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10 transition-all">
              <Save size={14} /> Save Heading
            </button>
            <button onClick={handleReset} className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all">
              <RefreshCw size={14} /> Reset
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-blue-600/10 transition-all">
              <Eye size={14} /> Preview PDF
            </button>
          </div>
        </div>

        {/* Right Live Visual Document Render Frame Panel */}
        <div className="lg:col-span-7 space-y-2">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1 pl-1">
            <Eye size={12} /> Live Heading Preview (A4 Aspect Ratio Sheet)
          </span>
          <div className="bg-slate-800 p-4 rounded-2xl shadow-inner border border-slate-700 min-h-[600px] flex items-start justify-center">
            <div className="bg-white text-black w-full max-w-[595px] p-6 min-h-[520px] shadow-2xl text-[10px] font-sans flex flex-col justify-between border border-slate-300">
              
              {/* Top Dynamic Header Preview Renders */}
              <div>
                <div className="text-center border-b border-black pb-2 mb-4">
                  <h2 className="text-[11px] font-black tracking-tight text-[#c21807] uppercase">{formData.instituteName || 'INSTITUTE NAME'}</h2>
                  <h3 className="text-[9px] font-bold uppercase mt-0.5">{formData.docTitle || 'DOCUMENT SEATING TITLE'}</h3>
                  <div className="text-[8px] font-bold text-slate-500 mt-1">{formData.examDate}</div>
                  
                  <div className="flex justify-between items-center text-[9px] font-bold mt-3 px-1">
                    <div className="border border-blue-600 px-2 py-0.5 rounded text-blue-600 font-extrabold bg-blue-50/50">Room No: {formData.exampleRoom}</div>
                    <div>Date: {formData.calendarDate ? new Date(formData.calendarDate).toLocaleDateString('en-GB') : 'DD/MM/YYYY'}</div>
                  </div>
                </div>

                {/* Simulated Grid View Layout Placeholder representation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 border-b border-dashed border-slate-200 pb-1">
                    <span>Branch Context Meta info</span>
                    <span>Timing: {formData.timeFrom} to {formData.timeTo}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 opacity-20">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="border border-slate-400 p-1.5 text-center font-mono text-[7px] font-bold bg-slate-50">0537CS231...</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Signatures Preview */}
              <div className="flex justify-between text-[8px] font-bold border-t border-slate-200 pt-3 text-slate-500 font-mono">
                <span>{formData.footerLeft || 'Footer Left'}</span>
                <span>{formData.footerRight || 'Footer Right'}</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}