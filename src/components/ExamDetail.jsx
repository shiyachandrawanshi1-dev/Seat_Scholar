import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Calendar, Clock, BookOpen, Trash2 } from 'lucide-react';

export default function ExamDetails() {
  const [examInfo, setExamInfo] = useState({
    exam_type: 'RGPV Exam',
    subject_name: '',
    subject_code: '',
    date: '',
    shift: 'Morning'
  });
  const [scheduledExams, setScheduledExams] = useState([]);

  
  const fetchExams = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/exams/');
      setScheduledExams(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/exams/', examInfo);
      alert("Exam Scheduled Successfully!");
      setExamInfo({ exam_type: 'RGPV Exam', subject_name: '', subject_code: '', date: '', shift: 'Morning' });
      fetchExams();
    } catch (err) { alert("Error saving exam details."); }
  };

  const deleteExam = async (id) => {
    if(window.confirm("Delete this schedule?")) {
      await axios.delete(`http://127.0.0.1:8000/api/exams/${id}/`);
      fetchExams();
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-800">
          <ClipboardList className="text-blue-600" /> Exam Scheduling
        </h1>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {['Mid-Sem Exam', 'RGPV Exam'].map((type) => (
                <button key={type} type="button" onClick={() => setExamInfo({...examInfo, exam_type: type})}
                  className={`py-3 rounded-xl font-bold border transition-all ${examInfo.exam_type === type ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Subject Name" className="p-4 bg-slate-50 border rounded-xl outline-none"
                value={examInfo.subject_name} onChange={e => setExamInfo({...examInfo, subject_name: e.target.value})} required />
              <input type="text" placeholder="Subject Code" className="p-4 bg-slate-50 border rounded-xl outline-none"
                value={examInfo.subject_code} onChange={e => setExamInfo({...examInfo, subject_code: e.target.value})} required />
              <input type="date" className="p-4 bg-slate-50 border rounded-xl outline-none"
                value={examInfo.date} onChange={e => setExamInfo({...examInfo, date: e.target.value})} required />
              <select className="p-4 bg-slate-50 border rounded-xl outline-none" value={examInfo.shift} onChange={e => setExamInfo({...examInfo, shift: e.target.value})}>
                <option>Morning</option>
                <option>Afternoon</option>
              </select>
            </div>

            <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
              Save Exam Details
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <h2 className="font-bold text-slate-600 text-lg">Recently Scheduled</h2>
          {scheduledExams.map(ex => (
            <div key={ex.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{ex.exam_type}</span>
                <h3 className="font-bold text-slate-800">{ex.subject_name} ({ex.subject_code})</h3>
                <p className="text-xs text-slate-500">{ex.date} | {ex.shift} Shift</p>
              </div>
              <button onClick={() => deleteExam(ex.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-all">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}