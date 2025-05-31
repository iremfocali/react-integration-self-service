const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');
const moment = require('moment');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

// Zorunlu kolon kuralları
const COLUMN_RULES = [
  { name: 'Time Stamp', required: true, type: 'date', format: 'YYYY-MM-DD HH:mm:ss' },
  { name: 'Customer ID', required: true, type: 'string' },
  { name: 'Event Type', required: true, type: 'number' },
  { name: 'Category', required: false, type: 'string' },
  { name: 'Event Name', required: true, type: 'string' },
  { name: 'Num1', required: true, type: 'number' },
  { name: 'Num2', required: true, type: 'number' },
];

app.post('/upload', upload.single('csv'), (req, res) => {
  const filePath = req.file.path;
  const rowNumber = parseInt(req.body.rowNumber) || 1;
  const hasHeader = req.body.hasHeader === 'true';
  const errors = [];
  let currentRow = 0;
  let targetRow = null;

  // Satırları tek tek oku (header varsa atla)
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' })
  });

  let firstLine = true;
  rl.on('line', (line) => {
    if (!line.trim()) return; // Boş satırı atla
    if (firstLine && hasHeader) {
      firstLine = false;
      return; // Header'ı atla
    }
    firstLine = false;
    currentRow++;
    if (currentRow === rowNumber) {
      targetRow = line;
    }
  });

  rl.on('close', () => {
    fs.unlinkSync(filePath);
    if (!targetRow) {
      return res.json({
        valid: false,
        errors: [`Dosyada ${rowNumber}. satır bulunamadı.`]
      });
    }
    // Sadece noktalı virgül ile parçala
    const values = targetRow.split(';');
    if (values.length < 7) {
      errors.push('CSV dosyanızda ayraç olarak noktalı virgül (;) kullanılmalıdır. Lütfen dosyanızdaki ayraç karakterini kontrol edin.');
      return res.json({
        valid: false,
        errors,
        rowData: values,
        rowNumber: rowNumber
      });
    }
    // İlk 7 kolonun kontrolü
    COLUMN_RULES.forEach((rule, idx) => {
      const val = values[idx] !== undefined ? values[idx].trim() : '';
      if (rule.required && !val) {
        errors.push(`${idx + 1}. sütun (${rule.name}) boş bırakılamaz.`);
        return;
      }
      if (rule.type === 'date' && val && !moment(val, rule.format, true).isValid()) {
        errors.push(`${idx + 1}. sütun (${rule.name}) geçerli bir tarih formatında olmalıdır (${rule.format}).`);
      }
      if (rule.type === 'number' && val && isNaN(Number(val))) {
        errors.push(`${idx + 1}. sütun (${rule.name}) sayısal bir değer olmalıdır.`);
      }
    });
    res.json({
      valid: errors.length === 0,
      errors,
      rowData: values,
      rowNumber: rowNumber
    });
  });
});

app.listen(3002, () => {
  console.log('✅ Express sunucu 3002 portunda çalışıyor...');
});
