const PDFDocument = require("pdfkit");

async function generateVolunteerPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      // Capture data BEFORE writing
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Write PDF content
      doc.text("Volunteer Report", { align: "center", underline: true });

      data.forEach((entry) => {
        doc
          .moveDown()
          .text(`${entry.full_name} - ${entry.hours} hours - Event: ${entry.event_name}`);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generateVolunteerPDF;
