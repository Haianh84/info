/**
 * generatePdfList.js
 * Tự động tạo file pdfList.json từ thư mục resources/pdfs
 * Nhận TẤT CẢ file .pdf (không phụ thuộc tên file)
 */

const fs = require("fs");
const path = require("path");

// Đường dẫn thư mục chứa PDF
const pdfDir = path.join(__dirname, "..", "resources", "pdfs");

// File output
const outputFile = path.join(pdfDir, "pdfList.json");

function generatePdfList() {
  // Kiểm tra thư mục PDF tồn tại
  if (!fs.existsSync(pdfDir)) {
    return;
  }

  // Đọc danh sách file
  const files = fs.readdirSync(pdfDir);

  // Lọc tất cả file .pdf (loại trừ pdfList.json)
  const pdfFiles = files.filter(
    (file) =>
      file.toLowerCase().endsWith(".pdf") &&
      file.toLowerCase() !== "pdflist.json"
  );

  // Map sang format JSON dùng cho frontend
  const pdfList = pdfFiles.map((file) => ({
    name: path.basename(file, ".pdf"),
    file: `resources/pdfs/${file}`,
  }));

  // Ghi file pdfList.json
  fs.writeFileSync(
    outputFile,
    JSON.stringify(pdfList, null, 2),
    "utf-8"
  );
}

// Chạy function
generatePdfList();
