jest.mock("pdfkit");

const PDFDocument = require("pdfkit");
const generatePDF = require("../../src/utils/reportPDF");

describe("PDF generation", () => {
  let mockDoc;
  let listeners;

  beforeEach(() => {
    listeners = {};

    mockDoc = {
      on: jest.fn((event, handler) => {
        listeners[event] = handler;
      }),
      pipe: jest.fn(),
      fontSize: jest.fn(() => mockDoc),
      text: jest.fn(() => mockDoc),
      moveDown: jest.fn(() => mockDoc),
      end: jest.fn(() => {
        if (listeners["end"]) listeners["end"]();
      })
    };

    PDFDocument.mockImplementation(() => mockDoc);
  });

  it("generates a PDF buffer", async () => {
    const dataChunks = [Buffer.from("A"), Buffer.from("B")];

    setTimeout(() => {
      if (listeners["data"]) listeners["data"](dataChunks[0]);
      if (listeners["data"]) listeners["data"](dataChunks[1]);
      if (listeners["end"]) listeners["end"]();
    }, 0);

    const result = await generatePDF([{ name: "Sample" }]);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe("AB");
  });
});
    it