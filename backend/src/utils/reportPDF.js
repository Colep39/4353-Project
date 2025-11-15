const PDFDocument = require("pdfkit");

async function generateVolunteerPDF(data) {
  const doc = new PDFDocument();
  const buffers = [];

  doc.text("Volunteer Report", { align: "center", underline: true });

  data.forEach((entry) => {
    doc.moveDown().text(
      `${entry.full_name} - ${entry.hours} hours - Event: ${entry.event_name}`
    );
  });

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => resolve(Buffer.concat(buffers)));

  doc.end();
}
