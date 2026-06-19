import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PAGE_MARGIN = 14;
const FOOTER_RESERVE = 22;
const GRID_BORDER = { lineColor: [0, 0, 0], lineWidth: 0.35 };
const TABLE_HEAD_FILL = [30, 27, 75];

const BASE_TABLE = {
  margin: {
    left: PAGE_MARGIN,
    right: PAGE_MARGIN,
    top: PAGE_MARGIN,
    bottom: PAGE_MARGIN + FOOTER_RESERVE,
  },
  styles: {
    font: "helvetica",
    fontSize: 8,
    cellPadding: 2,
    overflow: "linebreak",
    halign: "center",
    valign: "middle",
    ...GRID_BORDER,
  },
  headStyles: {
    fillColor: TABLE_HEAD_FILL,
    textColor: [255, 255, 255],
    fontStyle: "bold",
    halign: "center",
    ...GRID_BORDER,
  },
  rowPageBreak: "avoid",
  showHead: "everyPage",
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatIndianDate(dateStr) {
  if (!dateStr) return "N/A";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    const parts = String(dateStr).split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${pad2(parts[2])}/${pad2(parts[1])}/${parts[0]}`;
      }
      return `${pad2(parts[0])}/${pad2(parts[1])}/${parts[2]}`;
    }
    return dateStr;
  }
  return `${pad2(parsed.getDate())}/${pad2(parsed.getMonth() + 1)}/${parsed.getFullYear()}`;
}

function formatRoomLabel(room, headingForm) {
  if (headingForm?.room_no_example) return headingForm.room_no_example;
  if (!room) return "N/A";
  const floor = room.floor ? `${room.floor} Floor` : "";
  const block = room.block || "A Block";
  return `Room No: ${room.room_no}${floor ? ` (${floor})` : ""} ${block}`;
}

function collectBranchSubjects(matrix, activeExam) {
  const map = new Map();

  matrix.flat().filter(Boolean).forEach((student) => {
    const branch = student.branch || "N/A";
    if (!map.has(branch)) {
      map.set(branch, {
        branch,
        subject_code: student.subject_code || activeExam?.subject_code || "N/A",
        subject_name: student.subject_name || activeExam?.subject_name || "N/A",
      });
    }
  });

  if (map.size === 0 && activeExam) {
    map.set(activeExam.subject_code || "Exam", {
      branch: activeExam.semester ? `Sem ${activeExam.semester}` : "Exam",
      subject_code: activeExam.subject_code,
      subject_name: activeExam.subject_name,
    });
  }

  return Array.from(map.values());
}

function drawOfficialHeader(doc, { headingForm, activeExam, activeRoom, matrix }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = PAGE_MARGIN + 2;

  const institute =
    headingForm?.institute_name ||
    "SAGAR INSTITUTE OF SCIENCE, TECHNOLOGY & RESEARCH BHOPAL (SISTec-R)";
  const title =
    headingForm?.document_title ||
    "B. Tech. VIII SEM EXAMINATION (Seating Plan)";
  const monthYear = headingForm?.exam_month_year || "June-2026";
  const examDate = formatIndianDate(
    activeExam?.exam_date || headingForm?.exam_date
  );
  const timeFrom = headingForm?.time_from || "10:00 AM";
  const timeTo = headingForm?.time_to || "01:00 PM";
  const roomLabel = formatRoomLabel(activeRoom, headingForm);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(185, 28, 28);
  doc.text(institute, pageWidth / 2, y, { align: "center", maxWidth: pageWidth - PAGE_MARGIN * 2 });

  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(title, pageWidth / 2, y, { align: "center" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(monthYear, pageWidth / 2, y, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`Date: ${examDate}`, pageWidth - PAGE_MARGIN, y - 10, {
    align: "right",
  });

  y += 7;
  const boxWidth = 92;
  const boxX = (pageWidth - boxWidth) / 2;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, y - 4, boxWidth, 8, 1, 1);
  doc.text(roomLabel, pageWidth / 2, y + 1, { align: "center" });

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const branchLines = collectBranchSubjects(matrix, activeExam);
  branchLines.forEach((item) => {
    doc.text(
      `Branch ${item.branch}: ${item.subject_code} / ${item.subject_name}`,
      PAGE_MARGIN,
      y
    );
    y += 4.5;
  });

  doc.text(`Time: ${timeFrom} to ${timeTo}`, PAGE_MARGIN, y);
  y += 8;

  doc.setTextColor(0, 0, 0);
  return y;
}

function buildSeatingGridBody(matrix) {
  return matrix.map((row) =>
    row.map((cell) => (cell?.roll_no ? cell.roll_no : ""))
  );
}

function buildRollRangeRows(matrix) {
  const paperMap = new Map();

  matrix.flat().filter(Boolean).forEach((student) => {
    const paperCode = student.subject_code || student.branch || "N/A";
    if (!paperMap.has(paperCode)) paperMap.set(paperCode, []);
    paperMap.get(paperCode).push(student.roll_no);
  });

  const rows = [];
  let grandTotal = 0;

  paperMap.forEach((rolls, paperCode) => {
    const sorted = [...rolls].sort();
    rows.push([
      paperCode,
      sorted[0],
      sorted[sorted.length - 1],
      String(sorted.length),
    ]);
    grandTotal += sorted.length;
  });

  rows.push(["", "", "Total", String(grandTotal)]);
  return rows;
}

function buildAttendanceRows(matrix) {
  const branchCounts = new Map();

  matrix.flat().filter(Boolean).forEach((student) => {
    const branch = student.branch || "N/A";
    branchCounts.set(branch, (branchCounts.get(branch) || 0) + 1);
  });

  const rows = [];
  let serial = 1;
  let total = 0;

  branchCounts.forEach((count, branch) => {
    rows.push([String(serial), `${branch} - ${count}`, "00", String(count)]);
    serial += 1;
    total += count;
  });

  if (rows.length === 0) {
    rows.push(["1", "0", "00", "0"]);
    total = 0;
  }

  rows.push(["", "", "Total", String(total)]);
  return rows;
}

function buildInvigilatorRows() {
  return [
    ["1", "", "", "", ""],
    ["2", "", "", "", ""],
  ];
}

function applyChessCellStyle(data, matrix) {
  if (data.section !== "body") return;

  const student = matrix[data.row.index]?.[data.column.index];
  if (!student) {
    data.cell.styles.fillColor = [255, 255, 255];
    data.cell.styles.textColor = [180, 180, 180];
    return;
  }

  const isDark = (data.row.index + data.column.index) % 2 === 0;
  if (isDark) {
    data.cell.styles.fillColor = [0, 0, 0];
    data.cell.styles.textColor = [255, 255, 255];
    data.cell.styles.fontStyle = "bold";
  } else {
    data.cell.styles.fillColor = [255, 255, 255];
    data.cell.styles.textColor = [0, 0, 0];
    data.cell.styles.fontStyle = "normal";
  }
}

function drawPageFooters(doc, headingForm) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = doc.internal.getNumberOfPages();
  const leftFooter = headingForm?.footer_text_left || "(Exam Supdt.)";
  const rightFooter = headingForm?.footer_text_right || "(Observer)";

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    doc.text(leftFooter, PAGE_MARGIN, pageHeight - 8);
    doc.text(rightFooter, pageWidth - PAGE_MARGIN, pageHeight - 8, {
      align: "right",
    });

    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  doc.setTextColor(0, 0, 0);
}

/**
 * SISTec-R reference-style seating plan PDF:
 * official header, chess-board roll grid, roll ranges, attendance & invigilator tables.
 */
export function generateSeatingPlanPdf({
  generatedMatrix,
  activeRoom,
  activeExam,
  pdfHeadingForm = {},
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  let cursorY = drawOfficialHeader(doc, {
    headingForm: pdfHeadingForm,
    activeExam,
    activeRoom,
    matrix: generatedMatrix,
  });

  autoTable(doc, {
    ...BASE_TABLE,
    startY: cursorY,
    theme: "grid",
    head: [],
    body: buildSeatingGridBody(generatedMatrix),
    styles: {
      ...BASE_TABLE.styles,
      fontSize: 7.5,
      minCellHeight: 9,
      cellPadding: 1.8,
    },
    didParseCell: (data) => applyChessCellStyle(data, generatedMatrix),
  });

  cursorY = (doc.lastAutoTable?.finalY || cursorY) + 6;

  autoTable(doc, {
    ...BASE_TABLE,
    startY: cursorY,
    head: [["Paper Code", "Roll No. From", "Roll No. To", "Total"]],
    body: buildRollRangeRows(generatedMatrix),
    styles: {
      ...BASE_TABLE.styles,
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 28 },
      1: { halign: "left" },
      2: { halign: "left" },
      3: { halign: "center", cellWidth: 18 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === data.table.body.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
  });

  cursorY = (doc.lastAutoTable?.finalY || cursorY) + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Attendance Summary", PAGE_MARGIN, cursorY);
  cursorY += 4;

  autoTable(doc, {
    ...BASE_TABLE,
    startY: cursorY,
    head: [["S.No.", "No. of Present Student", "No. of Absent Student", "Total"]],
    body: buildAttendanceRows(generatedMatrix),
    columnStyles: {
      0: { cellWidth: 14 },
      1: { halign: "left" },
      2: { halign: "center", cellWidth: 28 },
      3: { cellWidth: 18 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === data.table.body.length - 1) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  cursorY = (doc.lastAutoTable?.finalY || cursorY) + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Invigilator Details", PAGE_MARGIN, cursorY);
  cursorY += 4;

  autoTable(doc, {
    ...BASE_TABLE,
    startY: cursorY,
    head: [["S.No.", "Name of Invigilators", "Designation", "Branch", "Signature"]],
    body: buildInvigilatorRows(),
    columnStyles: {
      0: { cellWidth: 12 },
      1: { halign: "left" },
      2: { cellWidth: 28 },
      3: { cellWidth: 20 },
      4: { cellWidth: 30 },
    },
    bodyStyles: {
      minCellHeight: 10,
    },
  });

  drawPageFooters(doc, pdfHeadingForm);

  const reportName = `Seating_Plan_Room_${activeRoom?.room_no || "NA"}_${Date.now()}.pdf`;
  const examType = activeExam
    ? `${activeExam.subject_code} - ${activeExam.subject_name}`
    : pdfHeadingForm?.document_title || "Examination Seating Plan";
  const pdfData = doc.output("datauristring");

  return { doc, reportName, examType, pdfData };
}
