const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const readline = require("readline");
const moment = require("moment");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const MIN_REQUIRED_ROWS = 3;
const MAX_ROWS_TO_VALIDATE = 15;

// Column rules
const COLUMN_RULES = [
  { name: "RequestedMin", required: true, type: "date", format: "YYYY-MM-DD HH:mm:ss" },
  { name: "PartnerUserId", required: true, type: "string" },
  { name: "EventType", required: true, type: "number" },
  { name: "Category", required: false, type: "string" },
  { name: "AppId", required: true, type: "string" },
  { name: "SessionDurationInMinutes", required: true, type: "number" },
  { name: "SessionPendingResourcesTimeSec", required: true, type: "number" },
];

app.post("/upload", upload.single("csv"), (req, res) => {
  const filePath = req.file.path;
  const rowNumber = parseInt(req.body.rowNumber) || 1;
  const hasHeader = req.body.hasHeader === "true";
  const errors = [];
  let currentRow = 0;
  let targetRow = null;
  let totalRows = 0;
  let firstRowContent = null;
  let headers = [];
  let rowsToValidate = [];

  // First pass: count total non-empty rows and validate first line
  const countRows = new Promise((resolve) => {
    const counter = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: "utf8" }),
    });

    let isFirstLine = true;
    let hasLeadingWhitespace = false;
    let firstNonEmptyLine = null;
    let lineNumber = 0;

    counter.on("line", (line) => {
      lineNumber++;

      // Check for whitespace at the beginning
      if (!firstNonEmptyLine && !line.trim()) {
        hasLeadingWhitespace = true;
        return; // Skip empty lines at the beginning
      }

      // Store the first non-empty line
      if (!firstNonEmptyLine && line.trim()) {
        firstNonEmptyLine = line;
      }

      if (isFirstLine) {
        isFirstLine = false;
        // Check if first non-empty line is empty
        if (!line.trim()) {
          errors.push("The first line of the file cannot be empty.");
          return;
        }
        // Check if first non-empty line has expected number of columns
        const columns = line.split(";");
        if (columns.length < 7) {
          errors.push("Your CSV file must use semicolon (;) as a separator. Please check the separator character in your file.");
          return;
        }
        firstRowContent = line;
        if (hasHeader) {
          headers = columns.map((header) => header.trim());
        } else {
          rowsToValidate.push(line);
        }
      } else if (line.trim()) {
        totalRows++;
        if (rowsToValidate.length < MAX_ROWS_TO_VALIDATE) {
          rowsToValidate.push(line);
        }
      }
    });

    counter.on("close", () => {
      // Add warning about leading whitespace if found
      if (hasLeadingWhitespace) {
        errors.push("Empty lines found at the beginning of the file. These lines will be ignored for validation.");
      }

      // Subtract header row if exists
      const effectiveRows = hasHeader ? totalRows - 1 : totalRows;
      if (effectiveRows < MIN_REQUIRED_ROWS) {
        errors.push(`File must contain at least ${MIN_REQUIRED_ROWS} rows. Current row count: ${effectiveRows}`);
      }
      resolve();
    });
  });

  // Second pass: validate the specified row and first 15 rows
  countRows.then(() => {
    if (errors.length > 0) {
      fs.unlinkSync(filePath);
      return res.json({
        valid: false,
        errors,
        totalRows: hasHeader ? totalRows - 1 : totalRows,
        hasHeader,
        headers,
      });
    }

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: "utf8" }),
    });

    let firstLine = true;
    rl.on("line", (line) => {
      if (!line.trim()) return; // Skip empty lines
      if (firstLine && hasHeader) {
        firstLine = false;
        return; // Skip header
      }
      firstLine = false;
      currentRow++;
      // If hasHeader is true, we want to check the second data row (rowNumber + 1)
      // If hasHeader is false, we want to check the exact rowNumber
      const targetRowNumber = hasHeader ? rowNumber + 1 : rowNumber;
      if (currentRow === targetRowNumber) {
        targetRow = line;
      }
    });

    rl.on("close", () => {
      fs.unlinkSync(filePath);
      if (!targetRow) {
        return res.json({
          valid: false,
          errors: [`Row ${rowNumber} not found in the file.`],
          totalRows: hasHeader ? totalRows - 1 : totalRows,
          hasHeader,
          headers,
        });
      }

      // Validate the target row
      const values = targetRow.split(";");
      if (values.length < 7) {
        errors.push("Your CSV file must use semicolon (;) as a separator. Please check the separator character in your file.");
        return res.json({
          valid: false,
          errors,
          totalRows: hasHeader ? totalRows - 1 : totalRows,
          hasHeader,
          headers,
        });
      }

      // Validate columns according to rules for target row
      COLUMN_RULES.forEach((rule, idx) => {
        const val = values[idx] !== undefined ? values[idx].trim() : "";
        if (rule.required && !val) {
          errors.push(`Column ${idx + 1} (${rule.name}) cannot be empty.`);
          return;
        }
        if (rule.type === "date" && val && !moment(val, rule.format, true).isValid()) {
          errors.push(`Column ${idx + 1} (${rule.name}) must be in a valid date format (${rule.format}).`);
        }
        if (rule.type === "number" && val) {
          const num = Number(val.replace(",", "."));
          if (isNaN(num)) {
            errors.push(`Column ${idx + 1} (${rule.name}) must be a numeric value.`);
          }
        }
      });

      // Only validate first 15 rows if separator is correct
      if (errors.length === 0) {
        rowsToValidate.forEach((row, index) => {
          const validateRowNumber = hasHeader ? index + 2 : index + 1;
          const rowValues = row.split(";");

          if (rowValues.length < 7) {
            errors.push(`Row ${validateRowNumber}: Your CSV file must use semicolon (;) as a separator.`);
            return;
          }

          COLUMN_RULES.forEach((rule, idx) => {
            const val = rowValues[idx] !== undefined ? rowValues[idx].trim() : "";
            if (rule.required && !val) {
              errors.push(`Row ${validateRowNumber}, Column ${idx + 1} (${rule.name}): Cannot be empty.`);
              return;
            }
            if (rule.type === "date" && val && !moment(val, rule.format, true).isValid()) {
              errors.push(`Row ${validateRowNumber}, Column ${idx + 1} (${rule.name}): Must be in a valid date format (${rule.format}).`);
            }
            if (rule.type === "number" && val) {
              const num = Number(val.replace(",", "."));
              if (isNaN(num)) {
                errors.push(`Row ${validateRowNumber}, Column ${idx + 1} (${rule.name}): Must be a numeric value.`);
              }
            }
          });
        });
      }

      res.json({
        valid: errors.length === 0,
        errors,
        rowData: values,
        rowNumber: rowNumber,
        totalRows: hasHeader ? totalRows - 1 : totalRows,
        hasHeader,
        headers,
      });
    });
  });
});

app.listen(3002, () => {
  console.log("✅ Express server running on port 3002...");
});
