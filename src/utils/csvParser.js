import Papa from "papaparse";

const EXPECTED_COLUMNS = [
  "roll_no",
  "name",
  "branch",
  "semester",
  "subject_code",
  "subject_name",
];

const HEADER_ALIASES = {
  roll_no: ["roll_no", "rollno", "roll no", "roll number", "roll_number"],
  name: ["name", "student name", "student_name", "studentname"],
  branch: ["branch", "dept", "department"],
  semester: ["semester", "sem", "semester_no"],
  subject_code: ["subject_code", "subject code", "sub_code", "sub code"],
  subject_name: ["subject_name", "subject name", "sub_name", "sub name"],
};

function normalizeHeader(header) {
  const cleaned = String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, "")
    .replace(/\s+/g, "_");

  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.some((alias) => alias.replace(/\s+/g, "_") === cleaned)) {
      return field;
    }
  }

  return cleaned;
}

function cleanValue(value) {
  return String(value ?? "").trim();
}

function rowFromArray(values) {
  const row = {};
  EXPECTED_COLUMNS.forEach((field, index) => {
    row[field] = cleanValue(values[index]);
  });
  return row;
}

function normalizeStudentRow(rawRow, rowIndex) {
  const student = {};

  EXPECTED_COLUMNS.forEach((field) => {
    student[field] = cleanValue(rawRow[field]);
  });

  const missing = EXPECTED_COLUMNS.filter((field) => !student[field]);
  if (missing.length > 0) {
    throw new Error(
      `Row ${rowIndex + 1} incomplete. Missing: ${missing.join(", ")}`
    );
  }

  return student;
}

/**
 * Parses a CSV file into a clean JSON array for the seating algorithm.
 * Supports header-based CSV and fixed column order without headers.
 */
export function parseStudentCsvFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No CSV file selected."));
      return;
    }

    Papa.parse(file, {
      skipEmptyLines: "greedy",
      complete: (results) => {
        try {
          const rows = results.data || [];
          if (rows.length === 0) {
            reject(new Error("CSV file is empty."));
            return;
          }

          const firstRow = rows[0];
          const hasHeader =
            Array.isArray(firstRow) &&
            firstRow.some((cell) =>
              HEADER_ALIASES.roll_no.includes(
                cleanValue(cell).toLowerCase()
              ) ||
              HEADER_ALIASES.name.includes(cleanValue(cell).toLowerCase())
            );

          let parsedRows = [];

          if (hasHeader && Array.isArray(firstRow)) {
            const headers = firstRow.map(normalizeHeader);
            parsedRows = rows.slice(1).map((values) => {
              const row = {};
              headers.forEach((header, index) => {
                if (EXPECTED_COLUMNS.includes(header)) {
                  row[header] = cleanValue(values[index]);
                }
              });
              return row;
            });
          } else if (Array.isArray(firstRow)) {
            parsedRows = rows.map(rowFromArray);
          } else {
            parsedRows = rows.map((row) => {
              const normalized = {};
              Object.entries(row).forEach(([key, value]) => {
                normalized[normalizeHeader(key)] = cleanValue(value);
              });
              return normalized;
            });
          }

          const students = parsedRows
            .filter((row) =>
              EXPECTED_COLUMNS.some((field) => cleanValue(row[field]))
            )
            .map((row, index) => normalizeStudentRow(row, index));

          if (students.length === 0) {
            reject(new Error("No valid student records found in CSV."));
            return;
          }

          resolve(students);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error),
    });
  });
}

export { EXPECTED_COLUMNS };
