import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react'; // Make sure to install lucide-react

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Username ya Password galat hai.");
      }
    } catch (err) {
      setError("Backend server se connect nahi ho pa raha hai.");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.loginCard}>
        {/* Logo/Icon */}
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎓</div>
        <h2 style={{ fontSize: "20px", color: "#0b1e43", marginBottom: "5px", fontWeight: "bold" }}>
          Exam Seating<br />Arrangement System
        </h2>
        <p style={{ color: "#64748b", marginBottom: "25px", fontSize: "14px" }}>Admin Login</p>
        
        {error && <div style={styles.errorBox}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={styles.label}>Username</label>
            <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} required />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
              <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>
          <button type="submit" style={styles.loginBtn}>Login</button>
        
<button 
  type="button" 
  onClick={() => navigate('/register')} 
  className="w-full text-blue-500 font-bold text-xs mt-4"
>
  Don't have an account? Register here
</button>
        </form>
        
        <p style={{ marginTop: "20px", color: "#94a3b8", fontSize: "12px" }}></p>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { 
    height: "100vh", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#0b1e43" // Dark blue background
  },
  loginCard: { 
    backgroundColor: "#fff", 
    padding: "2.5rem", 
    borderRadius: "12px", 
    width: "100%", 
    maxWidth: "380px", 
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },
  label: { display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600", color: "#475569" },
  input: { width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" },
  passwordWrapper: { position: "relative" },
  eyeIcon: { position: "absolute", right: "12px", top: "12px", cursor: "pointer", color: "#94a3b8" },
  loginBtn: { width: "100%", padding: "12px", backgroundColor: "#1e56a0", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  errorBox: { color: "#b91c1c", backgroundColor: "#fee2e2", padding: "10px", borderRadius: "6px", marginBottom: "15px", fontSize: "13px" }
};