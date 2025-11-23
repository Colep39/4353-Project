const PDFDocument = require("pdfkit");

async function generateVolunteerPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      doc.text("Volunteer Report", { align: "center", underline: true });

      data.forEach((entry) => {
        const name =
          entry.full_name ||
          entry.name ||      // added fallback for your test
          entry.title ||
          "Unknown";

        const hours = entry.hours || "";
        const event = entry.event_name || "";

        doc
          .moveDown()
          .text(`${name} ${hours ? `- ${hours} hours` : ""} ${event ? `- Event: ${event}` : ""}`);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generateVolunteerPDF;
