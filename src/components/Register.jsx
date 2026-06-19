import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  // FIXED: Ensured exact key strings that Django's request.data.get() expects
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Sending exact state data to your working Django backend endpoint
      const res = await axios.post('http://127.0.0.1:8000/api/register/', accountData);
      alert("Faculty registration successful!");
      navigate('/'); 
    } catch (err) {
      // Dynamic Debugger Check: Prints what exactly broke in your browser inspection tools
      console.error("Backend Error Details:", err.response?.data);
      alert(err.response?.data?.error || "Registration encountered an system transmission error.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a2540] flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Faculty Registration</h1>
          <p className="text-xs text-slate-400 mt-1">Create Examination Cell Faculty Account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs font-bold text-slate-700">
          <div>
            <label className="block mb-1">Username *</label>
            <input 
              type="text" required placeholder="Enter unique username"
              className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-slate-50/50 outline-none focus:border-blue-500"
              value={accountData.username} 
              onChange={e => setAccountData({...accountData, username: e.target.value})}
            />
          </div>

          <div>
            <label className="block mb-1">Email Address *</label>
            <input 
              type="email" required placeholder="faculty@institute.edu"
              className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-slate-50/50 outline-none focus:border-blue-500"
              value={accountData.email} 
              onChange={e => setAccountData({...accountData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block mb-1">Secure Password *</label>
            <input 
              type="password" required placeholder="Enter secure password"
              className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-slate-50/50 outline-none focus:border-blue-500"
              value={accountData.password} 
              onChange={e => setAccountData({...accountData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 transition-all">
            Register Account
          </button>
        </form>
      </div>
    </div>
  );
}
// Registration button ke thik niche ye add karein
<div style={{ marginTop: "15px", textAlign: "center", fontSize: "14px" }}>
  <span>Already have an account? </span>
  <button 
    onClick={() => window.location.href = "/login"} // Yahan apne login page ka path dein
    style={{ 
      background: "none", 
      border: "none", 
      color: "#2563eb", 
      fontWeight: "bold", 
      cursor: "pointer",
      textDecoration: "underline"
    }}
  >
    Login here
  </button>
</div>