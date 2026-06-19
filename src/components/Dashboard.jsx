import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import SavedReportsHistory from "./SavedReportsHistory";
import { parseStudentCsvFile } from "../utils/csvParser";
import { savePdfRecord, createPdfRecord } from "../utils/pdfStorage";
import { generateSeatingPlanPdf } from "../utils/generateSeatingPdf";

export default function Dashboard() {

  // Tabs tracking state

  const [activeTab, setActiveTab] = useState("dashboard");

  const [loading, setLoading] = useState(true);


  // Counters data

  const [counters, setCounters] = useState({ students: 0, rooms: 0, exams: 0, plans: 0 });

  const [loggedInUser, setLoggedInUser] = useState("Admin"); // Default "Admin" rakhein
  
 

  // Dynamic States for Students Data

  const [studentsList, setStudentsList] = useState([]);

  const [plansList, setPlansList] = useState([]);

  const [studentForm, setStudentForm] = useState({

    roll_no: '',

    name: '',

    branch: '',

    semester: '',

    subject_code: '',

    subject_name: ''

  });



  // Dynamic States for Rooms

  const [roomsList, setRoomsList] = useState([]);

  const [roomForm, setRoomForm] = useState({

    room_no: '',

    floor: '',

    capacity: '',

    rows: '',

    columns: ''

  });



  // Dynamic Exams States

  const [examsList, setExamsList] = useState([]);

  const [examForm, setExamForm] = useState({

    subject_code: '',

    subject_name: '',

    exam_date: '',

    exam_time: '',

    semester: ''

  });



  // Seating States

  const [selectedExam, setSelectedExam] = useState("");

  const [selectedRoom, setSelectedRoom] = useState("");

  const [seatingPattern, setSeatingPattern] = useState("Alternate Branches");

  const [startFrom, setStartFrom] = useState("Top-Left");

 

  // ─── NEW: Generated Plan State to Hold Real Matrix Data ───

  const [generatedMatrix, setGeneratedMatrix] = useState(null);



  // States for PDF Heading

  const [pdfFileName, setPdfFileName] = useState("Institute_Heading.pdf");

  const [pdfFileSize, setPdfFileSize] = useState("245 KB");

  const [pdfHeadingForm, setPdfHeadingForm] = useState({

    institute_name: "SAGAR INSTITUTE OF SCIENCE, TECHNOLOGY & RESEARCH",

    document_title: "B. Tech. V SEM EXAMINATION (Seating Plan)",

    exam_month_year: "Dec-2025",

    room_no_example: "204 (Second Floor)",

    exam_date: "2026-01-15",

    time_from: "10:00 AM",

    time_to: "01:00 PM",

    footer_text_left: "(Exam Supdt.)",

    footer_text_right: "(Observer)",

    is_active: true

  });
  // Fetch Students from Django API

  const fetchStudents = async () => {

    setLoading(true);

    try {

      const response = await axios.get('http://127.0.0.1:8000/api/students/');

      setStudentsList(response.data || []);

      setCounters(prev => ({ ...prev, students: (response.data || []).length }));

      setLoading(false);

    } catch (error) {

      console.error("Data fetch failed:", error);

      setLoading(false);

    }

  };



  // FETCH ROOMS FROM BACKEND

  const fetchRooms = async () => {

    try {

      const response = await axios.get('http://127.0.0.1:8000/api/rooms/');

      setRoomsList(response.data || []);

      setCounters(prev => ({ ...prev, rooms: (response.data || []).length }));

    } catch (error) {

      console.error("Rooms fetch failed:", error);

    }

  };



  // FETCH EXAMS FROM BACKEND

  const fetchExams = async () => {

    try {

      const response = await axios.get('http://127.0.0.1:8000/api/exams/');

      setExamsList(response.data || []);

      setCounters(prev => ({ ...prev, exams: (response.data || []).length }));

    } catch (error) {

      console.error("Exams fetch failed (Check Django URLs):", error);

      setExamsList([]);

    }

  };



  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/dashboard/");
      setCounters({
        students: res.data.total_students,
        rooms: res.data.total_rooms,
        exams: res.data.total_exams,
        plans: res.data.total_plans,
      });
    } catch (error) {
      console.error("Dashboard data fetch failed", error);
    }
  };

  const fetchSeatingPlans = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/seating-plans/");
      setPlansList(res.data || []);
    } catch (error) {
      console.error("Seating plans fetch failed", error);
      setPlansList([]);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchRooms();
    fetchExams();
    fetchDashboardData();
    fetchSeatingPlans();
    const user = localStorage.getItem("username");
    if (user) setLoggedInUser(user);
  }, []);

  // Change Handlers

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setStudentForm(prev => ({ ...prev, [name]: value }));

  };



  const handleRoomInputChange = (e) => {

    const { name, value } = e.target;

    setRoomForm(prev => ({ ...prev, [name]: value }));

  };



  const handleExamInputChange = (e) => {

    const { name, value } = e.target;

    setExamForm(prev => ({ ...prev, [name]: value }));

  };



  // Save Student

  const handleSaveStudent = async (e) => {

    e.preventDefault();

    try {

      await axios.post('http://127.0.0.1:8000/api/students/', studentForm);

      alert("Student saved successfully!");

      handleResetForm();

      fetchStudents();

    } catch (error) {

      alert("Error! Roll number should be unique or backend server is offline.");

    }

  };



  // Save Room

  const handleSaveRoom = async (e) => {

    e.preventDefault();

    try {

      await axios.post('http://127.0.0.1:8000/api/rooms/', roomForm);

      alert("Room saved successfully! 🎉");

      handleResetRoomForm();

      fetchRooms();

    } catch (error) {

      alert("Error! Room duplicate hai ya backend offline hai.");

    }

  };



  // Save Exam

  const handleSaveExam = async (e) => {

    e.preventDefault();

    try {

      await axios.post('http://127.0.0.1:8000/api/exams/', examForm);

      alert("Exam saved successfully! 📝");

      handleResetExamForm();

      fetchExams();

    } catch (error) {

      console.error("Exam post broke:", error);

      alert("Error! Exam save nahi ho paya. Backend endpoint ko check karein.");

    }

  };
  const saveToDatabase = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/save-seating-plan/', {
            exam:selectedExam.id || selectedExam,    // Yeh aapka state variable hona chahiye
            room: selectedRoom.id ||selectedRoom,    // Yeh aapka state variable hona chahiye
            plan_data: generatedMatrix // Yeh aapka seating matrix hai
        });
        
        if (response.status === 201) {
            alert("Plan successfully saved!");
        }
    } catch (error) {
        console.error("Error saving plan:", error);
        alert("Failed to save plan.");
    }
};



  // Reset Actions

  const handleResetForm = () => {

    setStudentForm({ roll_no: '', name: '', branch: '', semester: '', subject_code: '', subject_name: '' });

  };



  const handleResetRoomForm = () => {

    setRoomForm({ room_no: '', floor: '', capacity: '', rows: '', columns: '' });

  };



  const handleResetExamForm = () => {

    setExamForm({ subject_code: '', subject_name: '', exam_date: '', exam_time: '', semester: '' });

  };



  // Delete Actions

  const handleDeleteStudent = async (id) => {

    if (window.confirm("Do you want to delete this student data permanently?")) {

      try { await axios.delete(`http://127.0.0.1:8000/api/students/${id}/`); fetchStudents(); }

      catch (error) { console.error(error); }

    }

  };



  const handleDeleteRoom = async (id) => {

    if (window.confirm("Do you want to delete this room permanently?")) {

      try { await axios.delete(`http://127.0.0.1:8000/api/rooms/${id}/`); fetchRooms(); }

      catch (error) { console.error(error); }

    }

  };

  const handleDeleteExam = async (id) => {

    if (window.confirm("Do you want to delete this exam permanently?")) {

      try { await axios.delete(`http://127.0.0.1:8000/api/exams/${id}/`); fetchExams(); }

      catch (error) { console.error(error); }

    }

  };



  const handleLogout = () => {

    localStorage.removeItem("token");

    window.location.href = "/";

  };



  // ─── NEW FRONTEND SEATING ALGORITHM LOGIC ───

  const executeGenerationAlgorithm = (e) => {

    e.preventDefault();

    const activeRoom = roomsList.find(r => r.id === parseInt(selectedRoom));

    if (!activeRoom) {

      alert("Pehle koi Room select kijiye!");

      return;

    }



    const rows = parseInt(activeRoom.rows) || 1;

    const cols = parseInt(activeRoom.columns) || 1;

   

    // Group students by branches to apply 'Alternate Branches' pattern

    const groups = {};

    studentsList.forEach(student => {

      if (!groups[student.branch]) groups[student.branch] = [];

      groups[student.branch].push(student);

    });



    const branchNames = Object.keys(groups);

    if (branchNames.length === 0) {

      alert("Database mein koi students nahi hain jinka seating arrangement kiya ja sake!");

      return;

    }



    // Flat structure generation grid allocation matrix

    let matrix = Array(rows).fill(null).map(() => Array(cols).fill(null));

    let branchIndices = branchNames.reduce((acc, b) => ({ ...acc, [b]: 0 }), {});



    // Fill matrix row by row or column by column based on layout rules

    for (let r = 0; r < rows; r++) {

      for (let c = 0; c < cols; c++) {

        // Alternate pattern selection index logic

        let branchToPick = branchNames[(r + c) % branchNames.length];

        let currentIdx = branchIndices[branchToPick];



        if (groups[branchToPick] && groups[branchToPick][currentIdx]) {

          matrix[r][c] = groups[branchToPick][currentIdx];

          branchIndices[branchToPick]++;

        } else {

          // Fallback if one branch runs out of students, pick from any remaining branch

          let studentFound = false;

          for (let b of branchNames) {

            let idx = branchIndices[b];

            if (groups[b] && groups[b][idx]) {

              matrix[r][c] = groups[b][idx];

              branchIndices[b]++;

              studentFound = true;

              break;

            }

          }

          if (!studentFound) matrix[r][c] = null; // No more students left

        }

      }

    }

   

    setGeneratedMatrix(matrix);

    alert(`Seating arrangement for Room ${activeRoom.room_no} generated successfully! 🎉`);

  };



  return (

    <div style={styles.container}>

      {/* 1. SIDEBAR */}

      <div style={styles.sidebar}>

        <div>

          <div style={styles.sidebarBrand}>

            <span style={{fontSize: "24px"}}>🎓</span>

            <div>

              <div style={{fontWeight: "bold", fontSize: "16px"}}>Exam Seating</div>

              <div style={{fontSize: "11px", color: "#94a3b8"}}>Arrangement System</div>

            </div>

          </div>

         

          <nav style={{display: "flex", flexDirection: "column", gap: "5px"}}>

            <button onClick={() => setActiveTab("dashboard")} style={activeTab === "dashboard" ? styles.menuBtnActive : styles.menuBtn}>📊 Dashboard</button>

            <button onClick={() => setActiveTab("students")} style={activeTab === "students" ? styles.menuBtnActive : styles.menuBtn}>👥 Students</button>

            <button onClick={() => setActiveTab("rooms")} style={activeTab === "rooms" ? styles.menuBtnActive : styles.menuBtn}>🏫 Rooms</button>

            <button onClick={() => setActiveTab("exams")} style={activeTab === "exams" ? styles.menuBtnActive : styles.menuBtn}>📝 Exams</button>

            <button onClick={() => setActiveTab("generate")} style={activeTab === "generate" ? styles.menuBtnActive : styles.menuBtn}>⚙️ Generate Seating</button>

            <button onClick={() => setActiveTab("pdf")} style={activeTab === "pdf" ? styles.menuBtnActive : styles.menuBtn}>📄 PDF Heading</button>

          </nav>

        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>

      </div>



      {/* 2. MAIN CONTENT AREA */}

      <div style={styles.mainContent}>

        <header style={styles.header}>

          <div style={{fontWeight: "500", fontSize: "15px", color: "#fff", letterSpacing: "0.5px"}}>Exam Seating Arrangement System</div>

          <div style={{display: "flex", alignItems: "center", gap: "10px"}}><span style={styles.adminBadge}>👤 {loggedInUser
            
            
          }</span></div>

        </header>



        <div style={{padding: "2.5rem", flex: 1, backgroundColor: "#fff"}}>

          {activeTab === "dashboard" && (
            <RenderDashboardOverview
              counters={counters}
              setActiveTab={setActiveTab}
              plansList={plansList}
            />
          )}

          {activeTab === "students" && (

            <RenderStudentsPanel

              studentForm={studentForm} studentsList={studentsList} loading={loading}

              handleInputChange={handleInputChange} handleSaveStudent={handleSaveStudent}

              handleResetForm={handleResetForm} handleDeleteStudent={handleDeleteStudent} fetchStudents={fetchStudents}

            />

          )}

          {activeTab === "rooms" && (

            <RenderRoomsPanel

              roomForm={roomForm} roomsList={roomsList} handleRoomInputChange={handleRoomInputChange}

              handleSaveRoom={handleSaveRoom} handleResetRoomForm={handleResetRoomForm} handleDeleteRoom={handleDeleteRoom}

            />

          )}

          {activeTab === "exams" && (

            <RenderExamsPanel

              examForm={examForm} examsList={examsList} handleExamInputChange={handleExamInputChange}

              handleSaveExam={handleSaveExam} handleResetExamForm={handleResetExamForm} handleDeleteExam={handleDeleteExam}

            />

          )}

         

          {/* GENERATE SEATING TAB LINKED WITH DYNAMIC SEATING MATRIX AND PREVIEW */}

          {activeTab === "generate" && (

            <RenderGenerateSeatingPanel
              examsList={examsList}
              roomsList={roomsList}
              selectedExam={selectedExam}
              setSelectedExam={setSelectedExam}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
              seatingPattern={seatingPattern}
              setSeatingPattern={setSeatingPattern}
              startFrom={startFrom}
              setStartFrom={setStartFrom}
              executeGenerationAlgorithm={executeGenerationAlgorithm}
              generatedMatrix={generatedMatrix}
              pdfHeadingForm={pdfHeadingForm}
            />

          )}

         

          {activeTab === "pdf" && (

            <RenderPDFHeadingPanel

              pdfHeadingForm={pdfHeadingForm} setPdfHeadingForm={setPdfHeadingForm}

              pdfFileName={pdfFileName} pdfFileSize={pdfFileSize}

            />

          )}

        </div>

      </div>

    </div>

  );

}



/* ==============================================================================

    SUB-COMPONENTS

   ============================================================================== */



function RenderDashboardOverview({ counters, setActiveTab, plansList = [] }) {
  const getPlanExamLabel = (plan) =>
    plan?.exam?.subject_name || plan?.exam_name || plan?.exam || "N/A";
  const getPlanRoomLabel = (plan) =>
    plan?.room?.room_no || plan?.room_no || plan?.room || "N/A";

  return (
    <div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem"}}>

        <div style={{...styles.card, borderLeft: "5px solid #2563eb"}}>

          <div style={{color: "#64748b", fontSize: "14px", fontWeight: "600"}}>Total Students</div>

          <div style={{fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "5px 0"}}>{counters.students}</div>

          <span onClick={() => setActiveTab("students")} style={{fontSize: "12px", color: "#2563eb", cursor: "pointer"}}>View all students →</span>

        </div>

        <div style={{...styles.card, borderLeft: "5px solid #16a34a"}}>

          <div style={{color: "#64748b", fontSize: "14px", fontWeight: "600"}}>Total Rooms</div>

          <div style={{fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "5px 0"}}>{counters.rooms}</div>

          <span onClick={() => setActiveTab("rooms")} style={{fontSize: "12px", color: "#16a34a", cursor: "pointer"}}>View all rooms →</span>

        </div>

        <div style={{...styles.card, borderLeft: "5px solid #ea580c"}}>

          <div style={{color: "#64748b", fontSize: "14px", fontWeight: "600"}}>Total Exams</div>

          <div style={{fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "5px 0"}}>{counters.exams}</div>

          <span  onClick={() => setActiveTab("exams")}style={{fontSize: "12px", color: "#ea580c", cursor: "pointer"}}>View all exams →</span>

        </div>

        <div style={{...styles.card, borderLeft: "5px solid #8b5cf6"}}>

          <div style={{color: "#64748b", fontSize: "14px", fontWeight: "600"}}>Seating Plans</div>

          <div style={{fontSize: "28px", fontWeight: "bold", color: "#1e293b", margin: "5px 0"}}>{counters.plans}</div>

          <span onClick={() => setActiveTab("plans")} style={{fontSize: "12px", color: "#8b5cf6", cursor: "pointer"}}>View all plans →</span>

        </div>

      </div>



      <div style={styles.card}>

        <h3 style={{margin: "0 0 1rem 0", color: "#1e293b"}}>Recent Seating Plans</h3>

        <table style={styles.table}>

          <thead>

            <tr style={{backgroundColor: "#f8fafc"}}>

              <th style={styles.th}>S.No</th><th style={styles.th}>Exam</th><th style={styles.th}>Room No.</th><th style={styles.th}>Date</th><th style={styles.th}>Students</th>

            </tr>

          </thead>

          <tbody>
            {plansList.length > 0 ? (
              plansList.map((plan, index) => (
                <tr key={plan.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{getPlanExamLabel(plan)}</td>
                  <td style={styles.td}>{getPlanRoomLabel(plan)}</td>
                  <td style={styles.td}>{plan.created_at || "N/A"}</td>
                  <td style={styles.td}>Generated</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: "center" }}>
                  No recent plans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SavedReportsHistory />
    </div>
  );
}



function RenderStudentsPanel({ studentForm, studentsList, loading, handleInputChange, handleSaveStudent, handleResetForm, handleDeleteStudent, fetchStudents }) {
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState([]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    setCsvFile(file || null);
    setParsedPreview([]);

    if (!file) return;

    try {
      const students = await parseStudentCsvFile(file);
      setParsedPreview(students);
    } catch (error) {
      alert(error.message || "CSV parse nahi ho payi.");
      setCsvFile(null);
      e.target.value = "";
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert("Pehle CSV file select karein!");
      return;
    }

    setUploading(true);

    try {
      let studentsJson = parsedPreview;
      if (!studentsJson.length) {
        studentsJson = await parseStudentCsvFile(csvFile);
        setParsedPreview(studentsJson);
      }

      const formData = new FormData();
      formData.append("file", csvFile);

      await axios.post(
        "http://127.0.0.1:8000/api/students/bulk-upload/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(`${studentsJson.length} students successfully imported! 🎉`);
      setCsvFile(null);
      setParsedPreview([]);
      if (fetchStudents) fetchStudents();
    } catch (error) {
      alert(error.response?.data?.error || error.message || "CSV upload failed.");
    } finally {
      setUploading(false);
    }
  };



  return (

    <div style={{display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "1100px"}}>

      <div style={{...styles.card, border: "2px dashed #cbd5e1", backgroundColor: "#f8fafc", padding: "1.5rem"}}>

        <h3 style={{fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 1rem 0"}}>📁 Bulk Import via CSV File</h3>

        <form onSubmit={handleBulkUpload} style={{display: "flex", alignItems: "center", gap: "1.5rem"}}>

          <input type="file" accept=".csv" onChange={handleFileChange} style={{fontSize: "14px", color: "#475569"}} />

          <button type="submit" disabled={uploading} style={{...styles.customSaveBtn, backgroundColor: uploading ? "#94a3b8" : "#16a34a"}}>{uploading ? "Uploading..." : "⚡ Upload CSV File"}</button>

        </form>

        <p style={{fontSize: "11px", color: "#64748b", marginTop: "12px"}}>* Note: CSV columns order: roll_no, name, branch, semester, subject_code, subject_name</p>

        {parsedPreview.length > 0 && (
          <div style={{ marginTop: "14px", padding: "12px", backgroundColor: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#166534" }}>
              ✓ {parsedPreview.length} student records parsed — Chess Board Algorithm ke liye ready JSON
            </p>
            <pre style={{ marginTop: "8px", maxHeight: "120px", overflow: "auto", fontSize: "10px", backgroundColor: "#fff", padding: "8px", borderRadius: "6px", border: "1px solid #d1fae5" }}>
              {JSON.stringify(parsedPreview.slice(0, 2), null, 2)}
              {parsedPreview.length > 2 ? "\n..." : ""}
            </pre>
          </div>
        )}
      </div>



      <div>

        <h2 style={{fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "1.5rem"}}>Add Student (Manually)</h2>

        <form onSubmit={handleSaveStudent} style={{display: "flex", flexDirection: "column", gap: "1.5rem"}}>

          <div style={styles.formRow}>

            <div style={styles.formGroup}><label style={styles.label}>Roll No.</label><input type="text" name="roll_no" placeholder="Enter Roll No." required style={styles.inputElement} value={studentForm.roll_no} onChange={handleInputChange} /></div>

            <div style={styles.formGroup}><label style={styles.label}>Student Name</label><input type="text" name="name" placeholder="Enter Student Name" required style={styles.inputElement} value={studentForm.name} onChange={handleInputChange} /></div>

          </div>

          <div style={styles.formRow}>

            <div style={styles.formGroup}>

              <label style={styles.label}>Branch</label>

              <select name="branch" required style={styles.inputElement} value={studentForm.branch} onChange={handleInputChange}>

                <option value="" disabled>Select Branch</option><option value="CS">CS</option><option value="IT">IT</option><option value="EC">EC</option><option value="ME">ME</option>

              </select>

            </div>

            <div style={styles.formGroup}>

              <label style={styles.label}>Semester</label>

              <select name="semester" required style={styles.inputElement} value={studentForm.semester} onChange={handleInputChange}>

                <option value="" disabled>Select Semester</option><option value="1st">1st Semester</option><option value="2nd">2nd Semester</option><option value="3rd">3rd Semester</option><option value="4th">4th Semester</option><option value="5th">5th Semester</option><option value="6th">6th Semester</option><option value="7th">7th Semester</option><option value="8th">8th Semester</option>

              </select>

            </div>

          </div>

          <div style={styles.formRow}>

            <div style={styles.formGroup}><label style={styles.label}>Subject Code</label><input type="text" name="subject_code" placeholder="Enter Subject Code" required style={styles.inputElement} value={studentForm.subject_code} onChange={handleInputChange} /></div>

            <div style={styles.formGroup}><label style={styles.label}>Subject Name</label><input type="text" name="subject_name" placeholder="Enter Subject Name" required style={styles.inputElement} value={studentForm.subject_name} onChange={handleInputChange} /></div>

          </div>

          <div style={{display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem"}}><button type="submit" style={styles.customSaveBtn}>Save Student</button><button type="button" onClick={handleResetForm} style={styles.customResetBtn}>Reset</button></div>

        </form>

      </div>



      <div style={{boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden"}}>

        <div style={{padding: "12px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#334155"}}>Registered Students Data List</div>

        <table style={styles.table}>

          <thead style={{backgroundColor: "#f8fafc"}}>

            <tr><th style={styles.th}>Roll No</th><th style={styles.th}>Student Name</th><th style={styles.th}>Branch</th><th style={styles.th}>Semester</th><th style={styles.th}>Subject Code</th><th style={styles.th}>Subject Name</th><th style={{...styles.th, textAlign: "center"}}>Action</th></tr>

          </thead>

          <tbody>

            {studentsList.map((s) => (

              <tr key={s.id} style={{borderBottom: "1px solid #f1f5f9"}}>

                <td style={{...styles.td, color: "#2563eb", fontWeight: "bold"}}>{s.roll_no}</td><td style={{...styles.td, fontWeight: "500"}}>{s.name}</td><td style={styles.td}>{s.branch}</td><td style={styles.td}>{s.semester}</td><td style={styles.td}>{s.subject_code || 'N/A'}</td><td style={styles.td}>{s.subject_name || 'N/A'}</td>

                <td style={{...styles.td, textAlign: "center"}}><button onClick={() => handleDeleteStudent(s.id)} style={{background: "none", border: "none", color: "#f87171"}}><Trash2 size={16} /></button></td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}



function RenderRoomsPanel({ roomForm, roomsList, handleRoomInputChange, handleSaveRoom, handleResetRoomForm, handleDeleteRoom }) {

  return (

    <div style={{display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "2rem", alignItems: "start"}}>

      <div style={styles.card}>

        <h3 style={{margin: "0 0 1.5rem 0", fontSize: "18px", color: "#1e293b", fontWeight: "700"}}>Add Room</h3>

        <form onSubmit={handleSaveRoom} style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>

          <div style={styles.formGroup}><label style={styles.label}>Room Number</label><input type="text" name="room_no" placeholder="Enter Room Number" required style={styles.inputElement} value={roomForm.room_no} onChange={handleRoomInputChange} /></div>

          <div style={styles.formGroup}><label style={styles.label}>Floor</label><input type="text" name="floor" placeholder="Enter Floor" required style={styles.inputElement} value={roomForm.floor} onChange={handleRoomInputChange} /></div>

          <div style={styles.formGroup}><label style={styles.label}>Capacity</label><input type="number" name="capacity" placeholder="Enter Capacity" required style={styles.inputElement} value={roomForm.capacity} onChange={handleRoomInputChange} /></div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem"}}>

            <div style={styles.formGroup}><label style={styles.label}>No. of Rows</label><input type="number" name="rows" placeholder="Enter Rows" required style={styles.inputElement} value={roomForm.rows} onChange={handleRoomInputChange} /></div>

            <div style={styles.formGroup}><label style={styles.label}>No. of Columns</label><input type="number" name="columns" placeholder="Enter Columns" required style={styles.inputElement} value={roomForm.columns} onChange={handleRoomInputChange} /></div>

          </div>

          <div style={{display: "flex", gap: "1rem", marginTop: "0.5rem"}}>

            <button type="submit" style={{...styles.customSaveBtn, flex: 1}}>Save Room</button><button type="button" onClick={handleResetRoomForm} style={styles.customResetBtn}>Reset</button>

          </div>

        </form>

      </div>

      <div style={styles.card}>

        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}><h3 style={{margin: 0, fontSize: "18px", color: "#1e293b", fontWeight: "700"}}>Rooms List</h3></div>

        <table style={styles.table}>

          <thead>

            <tr style={{backgroundColor: "#f8fafc"}}><th style={styles.th}>S.No</th><th style={styles.th}>Room No.</th><th style={styles.th}>Floor</th><th style={styles.th}>Capacity</th><th style={styles.th}>Rows</th><th style={styles.th}>Columns</th><th style={{...styles.th, textAlign: "center"}}>Action</th></tr>

          </thead>

          <tbody>

            {roomsList.map((room, index) => (

              <tr key={room.id} style={{borderBottom: "1px solid #f1f5f9"}}>

                <td style={styles.td}>{index + 1}</td><td style={{...styles.td, fontWeight: "600", color: "#1e56a0"}}>{room.room_no}</td><td style={styles.td}>{room.floor}</td><td style={styles.td}>{room.capacity}</td><td style={styles.td}>{room.rows || '0'}</td><td style={styles.td}>{room.columns || '0'}</td>

                <td style={{...styles.td, textAlign: "center"}}><button onClick={() => handleDeleteRoom(room.id)} style={{background: "none", border: "none", color: "#f87171"}}><Trash2 size={16} /></button></td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}



function RenderExamsPanel({ examForm, examsList, handleExamInputChange, handleSaveExam, handleResetExamForm, handleDeleteExam }) {

  return (

    <div style={{display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "2rem", alignItems: "start"}}>

      <div style={styles.card}>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>

          <h3 style={{margin: 0, fontSize: "18px", color: "#1e293b", fontWeight: "700"}}>Add Exam</h3>

        </div>

        <form onSubmit={handleSaveExam} style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>

          <div style={styles.formGroup}><label style={styles.label}>Subject Code</label><input type="text" name="subject_code" required style={styles.inputElement} value={examForm.subject_code} onChange={handleExamInputChange} /></div>

          <div style={styles.formGroup}><label style={styles.label}>Subject Name</label><input type="text" name="subject_name" required style={styles.inputElement} value={examForm.subject_name} onChange={handleExamInputChange} /></div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem"}}>

            <div style={styles.formGroup}><label style={styles.label}>Exam Date</label><input type="date" name="exam_date" required style={styles.inputElement} value={examForm.exam_date} onChange={handleExamInputChange} /></div>

            <div style={styles.formGroup}><label style={styles.label}>Exam Time</label><input type="time" name="exam_time" required style={styles.inputElement} value={examForm.exam_time} onChange={handleExamInputChange} /></div>

          </div>

          <div style={styles.formGroup}>

            <label style={styles.label}>Semester</label>

            <select name="semester" required style={styles.inputElement} value={examForm.semester} onChange={handleExamInputChange}>

              <option value="" disabled>Select Semester</option>

              {[...Array(8)].map((_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}

            </select>

          </div>

          <div style={{display: "flex", gap: "1rem", marginTop: "0.5rem"}}>

            <button type="submit" style={{...styles.customSaveBtn, flex: 1}}>Save Exam</button><button type="button" onClick={handleResetExamForm} style={styles.customResetBtn}>Reset</button>

          </div>

        </form>

      </div>

      <div style={styles.card}>

        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}><h3 style={{margin: 0, fontSize: "18px", fontWeight: "700"}}>Exams List</h3></div>

        <table style={styles.table}>

          <thead>

            <tr style={{backgroundColor: "#f8fafc"}}><th style={styles.th}>S.No</th><th style={styles.th}>Subject Code</th><th style={styles.th}>Subject Name</th><th style={styles.th}>Date</th><th style={styles.th}>Time</th><th style={{...styles.th, textAlign: "center"}}>Action</th></tr>

          </thead>

          <tbody>

            {examsList.map((exam, index) => (

              <tr key={exam.id} style={{borderBottom: "1px solid #f1f5f9"}}>

                <td style={styles.td}>{index + 1}</td><td style={{...styles.td, fontWeight: "600", color: "#1e56a0"}}>{exam.subject_code}</td><td style={styles.td}>{exam.subject_name}</td><td style={styles.td}>{exam.exam_date}</td><td style={styles.td}>{exam.exam_time}</td>

                <td style={{...styles.td, textAlign: "center"}}><button onClick={() => handleDeleteExam(exam.id)} style={{background: "none", border: "none", color: "#f87171", cursor: "pointer"}}><Trash2 size={16} /></button></td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}



// ─── GENERATE SEATING PANEL: NOW FULLY LOGICAL & FUNCTIONAL ───

function RenderGenerateSeatingPanel({
  examsList,
  roomsList,
  selectedExam,
  setSelectedExam,
  selectedRoom,
  setSelectedRoom,
  seatingPattern,
  setSeatingPattern,
  startFrom,
  setStartFrom,
  executeGenerationAlgorithm,
  generatedMatrix,
  pdfHeadingForm,
}) {
  const activeRoom = roomsList.find((r) => r.id === parseInt(selectedRoom));
  const activeExam = examsList.find((e) => e.id === parseInt(selectedExam));
  const rowsCount = activeRoom ? parseInt(activeRoom.rows) : 7;
  const colsCount = activeRoom ? parseInt(activeRoom.columns) : 6;

  const handleGenerateReport = async () => {
    if (!generatedMatrix) {
      alert("Pehle data generate kijiye!");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/save-seating-plan/", {
        exam: selectedExam,
        room: selectedRoom,
        plan_data: generatedMatrix,
      });
    } catch (error) {
      console.error("Save failed:", error);
      alert("PDF download ho jayega, par database mein save nahi ho paya.");
    }

    const { doc, reportName, examType, pdfData } = generateSeatingPlanPdf({
      generatedMatrix,
      activeRoom,
      activeExam,
      pdfHeadingForm,
    });

    savePdfRecord(
      createPdfRecord({
        name: reportName,
        examType,
        pdfData,
      })
    );

    doc.save(reportName);
    alert(
      "Stylized report download ho gayi aur Saved Reports History mein save ho gayi! 📄"
    );
  };
  const getBranchStyles = (branch) => {
    switch (branch?.toUpperCase()) {
      case "CS":
        return { bg: "#e0f2fe", color: "#0369a1" };
      case "EC":
        return { bg: "#dcfce7", color: "#15803d" };
      case "IT":
        return { bg: "#fef3c7", color: "#b45309" };
      case "ME":
        return { bg: "#fce7f3", color: "#9d174d" };
      default:
        return { bg: "#f1f5f9", color: "#334155" };
    }
  };

  return (
    <div style={{display: "grid", gridTemplateColumns: "1fr 1.8fr 1fr", gap: "1rem", alignItems: "start"}}>

      <div style={styles.card}>

        <h3 style={{margin: "0 0 1.2rem 0", fontSize: "15px", fontWeight: "700"}}>Generate Seating Arrangement</h3>

        <form onSubmit={executeGenerationAlgorithm} style={{display: "flex", flexDirection: "column", gap: "1rem"}}>

          <div style={styles.formGroup}>

            <label style={styles.label}>Select Exam</label>

            <select style={styles.inputElement} value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} required>

              <option value="">Select Exam</option>

              {examsList.map(e => <option key={e.id} value={e.id}>{e.subject_code} - {e.subject_name}</option>)}

            </select>

          </div>

          <div style={styles.formGroup}>

            <label style={styles.label}>Select Room</label>

            <select style={styles.inputElement} value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} required>

              <option value="">Select Room</option>

              {roomsList.map(r => <option key={r.id} value={r.id}>{r.room_no} (Capacity - {r.capacity})</option>)}

            </select>

          </div>

          <div style={styles.formGroup}>

            <label style={styles.label}>Seating Pattern</label>

            <select style={styles.inputElement} value={seatingPattern} onChange={(e) => setSeatingPattern(e.target.value)}>

              <option value="Alternate Branches">Alternate Branches</option>

              <option value="Branch-wise">Branch-wise</option>

              <option value="Random">Random</option>

            </select>

          </div>

          <div style={styles.formGroup}>

            <label style={styles.label}>Start From</label>

            <select style={styles.inputElement} value={startFrom} onChange={(e) => setStartFrom(e.target.value)}>

              <option value="Top-Left">Top-Left</option>

              <option value="Top-Right">Top-Right</option>

              <option value="Bottom-Left">Bottom-Left</option>

              <option value="Bottom-Right">Bottom-Right</option>

            </select>

          </div>

          <button type="submit" style={{...styles.primaryBtn, backgroundColor: "#16a34a", marginTop: "0.5rem"}}>Generate Seating</button>

        </form>

      </div>



      <div style={styles.card}>

        <h3 style={{margin: "0 0 0.5rem 0", fontSize: "15px", fontWeight: "700"}}>Seating Preview - Room No: {activeRoom?.room_no || "---"}</h3>

        <div style={{display: 'flex', gap: '6px', marginBottom: '1rem', fontSize: '10px'}}>

          <span style={styles.infoBadge}>Exam : {activeExam ? activeExam.subject_code : "N/A"}</span>

          <span style={styles.infoBadge}>Date : {activeExam ? activeExam.exam_date : "N/A"}</span>

          <span style={styles.infoBadge}>Time : {activeExam ? activeExam.exam_time : "N/A"}</span>

        </div>

        <div style={{overflowX: 'auto'}}>

          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '10px', textAlign: 'center'}}>

            <thead>

              <tr style={{backgroundColor: '#f8fafc'}}>

                <th style={{border: '1px solid #e2e8f0', padding: '5px'}}>R↓ / C→</th>

                {[...Array(colsCount)].map((_, c) => <th key={c} style={{border: '1px solid #e2e8f0', padding: '5px'}}>{c + 1}</th>)}

              </tr>

            </thead>

            <tbody>

              {[...Array(rowsCount)].map((_, r) => (

                <tr key={r}>

                  <td style={{border: '1px solid #e2e8f0', fontWeight: 'bold', padding: '5px', backgroundColor: '#f8fafc'}}>{r + 1}</td>

                  {[...Array(colsCount)].map((_, c) => {

                    // Check if algorithm matrix data exists for this specific coordinate

                    const studentSeat = generatedMatrix && generatedMatrix[r] && generatedMatrix[r][c];

                   

                    if (studentSeat) {

                      const sty = getBranchStyles(studentSeat.branch);

                      return (

                        <td key={c} style={{border: '1px solid #e2e8f0', backgroundColor: sty.bg, color: sty.color, padding: '6px 3px', fontWeight: '500'}}>

                          <div>{studentSeat.roll_no}</div>

                          <div style={{fontSize: '9px', opacity: 0.8}}>({studentSeat.branch})</div>

                        </td>

                      );

                    } else {

                      // Empty desk placeholder

                      return (

                        <td key={c} style={{border: '1px solid #e2e8f0', color: '#cbd5e1', padding: '6px 3px', backgroundColor: '#fafafa'}}>

                          <div>- Empty -</div>

                        </td>

                      );

                    }

                  })}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>



      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>

        <div style={{...styles.card, border: generatedMatrix ? '1px solid #bbf7d0' : '1px solid #e2e8f0', backgroundColor: generatedMatrix ? '#f0fdf4' : '#fff', fontSize: '11px', transition: 'all 0.3s'}}>

          {generatedMatrix ? "✓ Seating Arrangement Generated Successfully!" : "⌛ Fill out the form and click generate to process real seating mapping grids."}

        </div>

        <div style={styles.card}>

          
          <button
            type="button"
            onClick={handleGenerateReport}
            style={{
              ...styles.primaryBtn,
              backgroundColor: generatedMatrix ? "#2563eb" : "#94a3b8",
              marginBottom: "0.5rem",
              cursor: generatedMatrix ? "pointer" : "not-allowed",
            }}
            disabled={!generatedMatrix}
          >
            Generate Report
          </button>
          

        </div>

      </div>

    </div>

  );

}



// ─── PDF HEADING PANEL SUB-COMPONENT ───

function RenderPDFHeadingPanel({ pdfHeadingForm, setPdfHeadingForm, pdfFileName, pdfFileSize }) {

  const handleFormInputChange = (e) => {

    const { name, value, type, checked } = e.target;

    setPdfHeadingForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

  };



  return (

    <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>

      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem", marginBottom: "0.5rem"}}>

        <div>

          <h2 style={{margin: 0, fontSize: "20px", fontWeight: "700", color: "#1e293b"}}>Add / Edit PDF Heading (Attach in PDF Format)</h2>

          <p style={{margin: "4px 0 0 0", fontSize: "13px", color: "#64748b"}}>Upload your institute heading (Letterhead) that will be shown on top of seating plan PDF.</p>

        </div>

        <div style={{fontSize: "13px", color: "#64748b"}}><span style={{color: "#1e56a0", cursor: "pointer"}}>Dashboard</span> &gt; <span>PDF Heading</span></div>

      </div>



      <div style={{display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1.5rem", alignItems: "start"}}>

        <div style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>

          <div style={styles.card}>

            <div style={{display: "flex", gap: "12px", alignItems: "center"}}>

              <span style={{fontSize: "24px"}}>🔵</span>

              <div style={{flex: 1}}>

                <div style={{fontSize: "14px", fontWeight: "700", color: "#1e293b"}}>Upload Heading PDF</div>

                <div style={{border: "1px dashed #cbd5e1", borderRadius: "6px", backgroundColor: "#f8fafc", padding: "10px", marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>

                  <div style={{display: "flex", alignItems: "center", gap: "8px"}}>

                    <span style={{backgroundColor: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: "bold", padding: "2px 4px", borderRadius: "3px"}}>PDF</span>

                    <div style={{fontSize: "12px"}}><span style={{color: "#1e56a0", fontWeight: "600"}}>{pdfFileName}</span> <span style={{color: "#64748b"}}>Size: {pdfFileSize}</span></div>

                  </div>

                  <button type="button" style={{backgroundColor: "#fff", border: "1px solid #cbd5e1", fontSize: "12px", padding: "4px 10px", borderRadius: "4px"}}>Change File</button>

                </div>

              </div>

            </div>

          </div>



          <div style={styles.card}>

            <div style={{fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "1rem"}}>Heading Information <span>ⓘ</span></div>

            <form onSubmit={(e) => { e.preventDefault(); alert("Saved Header!"); }} style={{display: "flex", flexDirection: "column", gap: "1rem"}}>

              <div style={styles.formGroup}>

                <label style={styles.label}>Institute Name *</label>

                <input type="text" name="institute_name" required style={styles.inputElement} value={pdfHeadingForm.institute_name} onChange={handleFormInputChange} />

              </div>

              <div style={styles.formGroup}>

                <label style={styles.label}>Document Title *</label>

                <input type="text" name="document_title" required style={styles.inputElement} value={pdfHeadingForm.document_title} onChange={handleFormInputChange} />

              </div>



              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem"}}>

                <div style={styles.formGroup}><label style={styles.label}>Exam Month-Year *</label><input type="text" name="exam_month_year" required style={styles.inputElement} value={pdfHeadingForm.exam_month_year} onChange={handleFormInputChange} /></div>

                <div style={styles.formGroup}><label style={styles.label}>Room No. Example *</label><input type="text" name="room_no_example" required style={styles.inputElement} value={pdfHeadingForm.room_no_example} onChange={handleFormInputChange} /></div>

                <div style={styles.formGroup}><label style={styles.label}>Date *</label><input type="date" name="exam_date" required style={styles.inputElement} value={pdfHeadingForm.exam_date} onChange={handleFormInputChange} /></div>

              </div>



              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem"}}>

                <div style={styles.formGroup}><label style={styles.label}>Time From *</label><input type="text" name="time_from" required style={styles.inputElement} value={pdfHeadingForm.time_from} onChange={handleFormInputChange} /></div>

                <div style={styles.formGroup}><label style={styles.label}>Time To *</label><input type="text" name="time_to" required style={styles.inputElement} value={pdfHeadingForm.time_to} onChange={handleFormInputChange} /></div>

              </div>



              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem"}}>

                <div style={styles.formGroup}><label style={styles.label}>Footer Text (Left)</label><input type="text" name="footer_text_left" style={styles.inputElement} value={pdfHeadingForm.footer_text_left} onChange={handleFormInputChange} /></div>

                <div style={styles.formGroup}><label style={styles.label}>Footer Text (Right)</label><input type="text" name="footer_text_right" style={styles.inputElement} value={pdfHeadingForm.footer_text_right} onChange={handleFormInputChange} /></div>

              </div>



              <div style={{display: "flex", alignItems: "center", gap: "8px"}}>

                <input type="checkbox" id="pdfActiveChk" name="is_active" style={{width: "16px", height: "16px"}} checked={pdfHeadingForm.is_active} onChange={handleFormInputChange} />

                <label htmlFor="pdfActiveChk" style={{fontSize: "13px", fontWeight: "600", color: "#475569"}}>Make this heading active for PDF</label>

              </div>



              <div style={{display: "flex", gap: "0.75rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem", marginTop: "0.5rem"}}>

                <button type="submit" style={{...styles.customSaveBtn, backgroundColor: "#16a34a"}}>Save Heading</button>

                <button type="button" style={styles.customResetBtn}>Reset</button>

                <button type="button" style={{...styles.customSaveBtn, backgroundColor: "#1e56a0", marginLeft: "auto"}}>Preview PDF</button>

              </div>

            </form>

          </div>

        </div>



        <div style={styles.card}>

          <div style={{fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "0.75rem"}}>Heading Preview (How it will appear in PDF)</div>

          <div style={{border: "1px solid #cbd5e1", borderRadius: "4px", backgroundColor: "#fff", fontFamily: "serif", padding: "1.2rem", minHeight: "440px", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>

            <div style={{textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "8px"}}>

              <div style={{fontWeight: "bold", fontSize: "14px", color: "#dc2626"}}>{pdfHeadingForm.institute_name || "INSTITUTE NAME"}</div>

              <div style={{fontWeight: "bold", fontSize: "13px", color: "#000", marginTop: "4px"}}>{pdfHeadingForm.document_title || "DOCUMENT TITLE"}</div>

              <div style={{fontWeight: "bold", fontSize: "11px", color: "#000", marginTop: "2px"}}>{pdfHeadingForm.exam_month_year || "Month-Year"}</div>

              <div style={{display: "inline-block", border: "1px solid #1e56a0", borderRadius: "4px", padding: "2px 12px", color: "#1e56a0", fontWeight: "bold", fontSize: "12px", marginTop: "6px"}}>Room No: {pdfHeadingForm.room_no_example || "204"}</div>

              <div style={{textAlign: "right", fontSize: "11px", color: "#000", marginTop: "4px"}}>Date: {pdfHeadingForm.exam_date || "15/01/2026"}</div>

            </div>

            <div style={{margin: "10px 0", fontSize: "11px", color: "#334155", display: "flex", flexDirection: "column", gap: "4px", fontFamily: "sans-serif"}}>

              <div><strong>Branch: CE</strong> &nbsp;&nbsp;&nbsp; Sub Code/Subject Name: CE501 / Fluid Mechanics I</div>

              <div><strong>Branch: CS</strong> &nbsp;&nbsp;&nbsp; Sub Code/Subject Name: CS501 / Theory of Computation</div>

              <div><strong>Branch: EC</strong> &nbsp;&nbsp;&nbsp; Sub Code/Subject Name: EC501 / Microprocessor & its Applications</div>

              <div style={{marginTop: "4px"}}><strong>Time:</strong> {pdfHeadingForm.time_from} to {pdfHeadingForm.time_to}</div>

              <div style={{marginTop: "10px", border: "1px dashed #cbd5e1", height: "130px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", backgroundColor: "#f8fafc"}}>[ Seating Matrix Generated Area Canvas ]</div>

            </div>

            <div style={{display: "flex", justifyContent: "space-between", borderTop: "1px solid #000", paddingTop: "6px", fontSize: "12px", fontWeight: "bold"}}>

              <div>{pdfHeadingForm.footer_text_left}</div><div>{pdfHeadingForm.footer_text_right}</div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}



/* ==============================================================================

    CSS STYLES

   ============================================================================== */

const styles = {

  container: { display: "flex", height: "100vh", backgroundColor: "#f8fafc", fontFamily: "sans-serif" },

  sidebar: { width: "260px", backgroundColor: "#0b1e43", color: "#fff", padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" },

  sidebarBrand: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem", borderBottom: "1px solid #1e293b", paddingBottom: "1rem" },

  menuBtn: { width: "100%", padding: "12px 15px", textAlign: "left", backgroundColor: "transparent", color: "#94a3b8", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },

  menuBtnActive: { width: "100%", padding: "12px 15px", textAlign: "left", backgroundColor: "#1e56a0", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },

  logoutBtn: { width: "100%", padding: "12px 15px", textAlign: "left", backgroundColor: "transparent", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },

  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },

  header: { backgroundColor: "#0b1e43", padding: "1.2rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" },

  adminBadge: { color: "#fff", fontSize: "13px", fontWeight: "500" },

  card: { backgroundColor: "#fff", padding: "1.2rem", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },

  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" },

  formGroup: { display: "flex", flexDirection: "column", gap: "5px" },

  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },

  inputElement: { width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", backgroundColor: "#fff" },

  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "14px" },

  primaryBtn: { width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },

  customSaveBtn: { padding: "8px 24px", backgroundColor: "#1e56a0", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "500", cursor: "pointer", fontSize: "13px" },

  customResetBtn: { padding: "8px 24px", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "4px", fontWeight: "500", cursor: "pointer", fontSize: "13px" },

  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },

  th: { padding: "12px 15px", textAlign: "left", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontWeight: "600" },

  td: { padding: "12px 15px", color: "#334155" },

  infoBadge: { padding: "4px 8px", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: '4px', color: '#475569', fontWeight: '500' }

};