import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Printer, Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SeatingPlan() {
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/generate/')
      .then(res => {
        setRoomsData(res.data.rooms_data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 md:p-8 bg-slate-900 min-h-screen text-slate-100 antialiased selection:bg-blue-500/30">
      {/* Action Header Panel */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8 no-print bg-slate-800 p-4 rounded-2xl border border-slate-700/50 shadow-xl">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16}/> Dashboard
        </button>
        <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">Print Preview Desk</span>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Printer size={16}/> Print Sheets
        </button>
      </div>

      {/* Main Sheets Container */}
      <div className="max-w-5xl mx-auto space-y-12 print-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
            <p className="font-medium text-sm tracking-wide">Compiling academic rosters...</p>
          </div>
        ) : roomsData.length > 0 ? (
          roomsData.map((roomData, rIdx) => (
            <div key={rIdx} className="bg-white text-black p-8 shadow-2xl rounded-none border border-slate-300 page-sheet relative overflow-hidden">
              
              {/* Report Header Institutional Metadata block */}
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h2 className="text-base font-black tracking-tight uppercase">Sagar Institute of Science, Technology & Research Bhopal (SISTec-R)</h2>
                <h3 className="text-xs font-bold uppercase mt-0.5">B. Tech. V SEM EXAMINATION (Seating Plan)</h3>
                <div className="flex justify-between items-center text-[11px] font-bold mt-4 px-1">
                  <div>ROOM NO: <span className="underline text-sm font-black">{roomData.room_no}</span> ({roomData.block})</div>
                  <div>DATE: {new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              {/* Explicit Seating Grid Representation */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full border-collapse border-2 border-black text-center text-[10px]">
                  <tbody>
                    {roomData.matrix.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((seat, colIdx) => (
                          <td 
                            key={colIdx} 
                            className={`border border-slate-400 p-2 font-mono h-12 w-28 vertical-align-middle ${
                              seat 
                                ? seat.status === 'Ex' 
                                  ? 'bg-amber-50 font-bold' 
                                  : 'bg-slate-50' 
                                : 'bg-white'
                            }`}
                          >
                            {seat ? (
                              <div>
                                <div className="font-black text-slate-900">{seat.roll_no}</div>
                                <div className="text-[8px] text-slate-500 font-sans font-semibold flex justify-center gap-1 mt-0.5">
                                  <span>{seat.subject_code}</span>
                                  {seat.status === 'Ex' && <span className="text-amber-700 font-extrabold">({seat.status})</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-sans tracking-widest text-[8px] uppercase">EMPTY</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Institutional Statistics & Roll Range Summary Table */}
              <div className="mb-6">
                <table className="w-full border-collapse border-2 border-black text-[10px]">
                  <thead className="bg-slate-100 font-bold">
                    <tr className="border-b border-black">
                      <th className="border-r border-black p-1.5 text-left pl-3 w-1/4">Paper Code</th>
                      <th className="border-r border-black p-1.5 w-1/3">From Roll No.</th>
                      <th className="border-r border-black p-1.5 w-1/3">To Roll No.</th>
                      <th className="p-1.5 text-center w-16">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomData.summary.map((sum, sIdx) => (
                      <tr key={sIdx} className="border-b border-slate-300 font-medium">
                        <td className="border-r border-black p-1.5 pl-3 font-bold text-slate-800">{sum.subject_code}</td>
                        <td className="border-r border-black p-1.5 font-mono tracking-tight text-center">{sum.from_roll}</td>
                        <td className="border-r border-black p-1.5 font-mono tracking-tight text-center">{sum.to_roll}</td>
                        <td className="p-1.5 font-bold text-center">{sum.total}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-slate-50 border-t border-black">
                      <td colSpan="3" className="border-r border-black p-1.5 text-right pr-4 tracking-wider uppercase text-[9px]">Grand Total Allocated</td>
                      <td className="p-1.5 text-center text-sm font-black underline">{roomData.total_students}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invigilator Attendance Sign-off Block */}
              <div className="grid grid-cols-3 gap-4 border border-black p-3 text-[10px] font-bold rounded-none bg-slate-50/50">
                <div className="space-y-1">
                  <div>No. of Present Students: __________________</div>
                  <div className="pt-1">No. of Absent Students: __________________</div>
                </div>
                <div className="border-l border-r border-slate-400 px-4 flex flex-col justify-between">
                  <div className="italic text-slate-400 text-[8px] uppercase tracking-wide">Invigilator Identity Verification</div>
                  <div className="text-center border-t border-dashed border-slate-400 pt-1 text-[8px] text-slate-500">Signature of Invigilator</div>
                </div>
                <div className="flex flex-col justify-between items-end h-12">
                  <span className="text-[9px] uppercase tracking-wider text-slate-700">Center Authentication</span>
                  <div className="text-[8px] text-slate-500 font-mono">Exam Supdt. / Observer Sec.</div>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-800 rounded-2xl border border-dashed border-slate-700 text-slate-500">
            <FileText className="mx-auto mb-4 opacity-40" size={48} />
            <p className="text-sm font-medium">No rooms configured to render physical layouts.</p>
          </div>
        )}
      </div>

      {/* Embedded Print Override Layer Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body, .min-h-screen { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
          .max-w-5xl { max-width: 100% !important; width: 100% !important; }
          .page-sheet { 
            box-shadow: none !important; 
            border: none !important; 
            padding: 0 !important;
            margin: 0 0 15mm 0 !important;
            page-break-after: always !important; 
            break-inside: avoid !important;
          }
          .page-sheet:last-child { margin-bottom: 0 !important; page-break-after: avoid !important; }
        }
        .page-sheet { page-break-inside: avoid; }
      `}</style>
    </div>
  );
}