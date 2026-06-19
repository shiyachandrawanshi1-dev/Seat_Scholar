import React, { useState } from 'react';
import axios from 'axios';

export default function StudentPanel() {
  // Dynamic form state
  const [newStudent, setNewStudent] = useState({ 
    roll_no: '', 
    name: '', 
    branch: '', 
    semester: '',
    subject_code: '',
    subject_name: ''
  });

  // Handle inputs dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  // Submit to Django API
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/students/', newStudent);
      alert("Student saved successfully!");
      handleReset();
    } catch (error) {
      alert("Error saving student data. Please check connection or unique Roll No.");
    }
  };

  // Clear Form fields
  const handleReset = () => {
    setNewStudent({
      roll_no: '', 
      name: '', 
      branch: '', 
      semester: '',
      subject_code: '',
      subject_name: ''
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans select-none">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="w-64 bg-[#0B1E43] text-gray-300 flex flex-col justify-between">
        <div>
          {/* Logo Space / Buffer top left */}
          <div className="h-16 border-b border-slate-700 opacity-0"></div>
          
          {/* Navigation Items */}
          <nav className="mt-4 px-3 space-y-1">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm hover:bg-slate-800 cursor-pointer">
              <span>🏠</span> <span>Dashboard</span>
            </div>
            {/* Active State (Students Panel Blue Background) */}
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm bg-[#1E56A0] text-white font-medium cursor-pointer">
              <span>👥</span> <span>Students</span>
            </div>
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm hover:bg-slate-800 cursor-pointer">
              <span>🪑</span> <span>Rooms</span>
            </div>
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm hover:bg-slate-800 cursor-pointer">
              <span>📝</span> <span>Exams</span>
            </div>
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm hover:bg-slate-800 cursor-pointer">
              <span>⚙️</span> <span>Generate Seating</span>
            </div>
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm hover:bg-slate-800 cursor-pointer">
              <span>📄</span> <span>PDF Reports</span>
            </div>
          </nav>
        </div>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm hover:bg-red-900 cursor-pointer">
            <span>↩️</span> <span>Logout</span>
          </div>
        </div>
      </div>

      {/* RIGHT CONTAINER (HEADER + MAIN CONTENT) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 2. TOP NAVBAR */}
        <header className="h-16 bg-[#0B1E43] text-white flex items-center justify-between px-6 shadow-md z-10">
          <div className="flex items-center space-x-4">
            <span className="text-xl cursor-pointer">☰</span>
            <h1 className="text-md font-medium tracking-wide">Exam Seating Arrangement System</h1>
          </div>
          <div className="flex items-center space-x-2 cursor-pointer bg-slate-800/40 px-3 py-1.5 rounded-full">
            <div className="w-7 h-7 bg-slate-400 rounded-full flex items-center justify-center text-xs text-slate-800 font-bold">👤</div>
            <span className="text-sm font-light">Admin</span>
          </div>
        </header>

        {/* 3. MAIN FORM CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-10 bg-white">
          <div className="max-w-4xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Add Student</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              {/* Row 1: Roll No & Student Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Roll No.</label>
                  <input 
                    type="text" name="roll_no" placeholder="Enter Roll No." required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm placeholder-gray-400 shadow-sm"
                    value={newStudent.roll_no} onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Student Name</label>
                  <input 
                    type="text" name="name" placeholder="Enter Student Name" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm placeholder-gray-400 shadow-sm"
                    value={newStudent.name} onChange={handleChange}
                  />
                </div>
              </div>

              {/* Row 2: Branch & Semester */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Branch</label>
                  <select 
                    name="branch" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-600 shadow-sm" 
                    value={newStudent.branch} onChange={handleChange}
                  >
                    <option value="" disabled>Select Branch</option>
                    <option value="CS">CS</option>
                    <option value="IT">IT</option>
                    <option value="EC">EC</option>
                    <option value="ME">ME</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Semester</label>
                  <select 
                    name="semester" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-600 shadow-sm" 
                    value={newStudent.semester} onChange={handleChange}
                  >
                    <option value="" disabled>Select Semester</option>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="3rd">3rd Semester</option>
                    <option value="4th">4th Semester</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Subject Code & Subject Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Subject Code</label>
                  <input 
                    type="text" name="subject_code" placeholder="Enter Subject Code" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm placeholder-gray-400 shadow-sm"
                    value={newStudent.subject_code} onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Subject Name</label>
                  <input 
                    type="text" name="subject_name" placeholder="Enter Subject Name" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm placeholder-gray-400 shadow-sm"
                    value={newStudent.subject_name} onChange={handleChange}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-center items-center space-x-4 pt-6">
                <button type="submit" className="px-6 py-2 bg-[#1E56A0] text-white font-medium rounded-md hover:bg-blue-700 text-xs shadow-md transition-all">
                  Save Student
                </button>
                <button type="button" onClick={handleReset} className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 text-xs transition-all">
                  Reset
                </button>
              </div>

            </form>
          </div>
        </main>

      </div>
    </div>
  );
}