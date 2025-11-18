const PDFDocument = require("pdfkit");

function exportPDF(data, res, title, filename) {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}.pdf"`
  );

  doc.pipe(res);

  doc.fontSize(20).text(title, { underline: true });
  doc.moveDown(1);

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      doc.fontSize(12).text(`${key}: ${JSON.stringify(item[key])}`);
    });
    doc.moveDown();
  });

  doc.end();
}

module.exports = exportPDF;
