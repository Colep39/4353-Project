jest.mock("pdfkit");

const PDFDocument = require("pdfkit");
const generatePDF = require("../../src/utils/reportPDF");

describe("PDF generation", () => {
  let mockDoc;
  let listeners;
  let emitted;

  beforeEach(() => {
    listeners = {};
    emitted = [];

    mockDoc = {
      on: jest.fn((event, handler) => {
        listeners[event] = handler;
      }),
      pipe: jest.fn(),
      fontSize: jest.fn(() => mockDoc),
      text: jest.fn((msg) => {
        emitted.push(Buffer.from(msg));
        return mockDoc;
      }),
      moveDown: jest.fn(() => mockDoc),
      end: jest.fn(() => {
        if (listeners["data"]) {
          emitted.forEach((buf) => listeners["data"](buf));
        }
        if (listeners["end"]) {
          listeners["end"]();
        }
      })
    };

    PDFDocument.mockImplementation(() => mockDoc);
  });

  it("generates a PDF buffer", async () => {
    const result = await generatePDF([{ name: "A" }]);

    const stringOut = result.toString();

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(stringOut.includes("Volunteer Report")).toBe(true);
    expect(stringOut.includes("A")).toBe(true);
  });

  it("renders fallback name from full_name", async () => {
    const result = await generatePDF([{ full_name: "John Doe" }]);
    const str = result.toString();
    expect(str.includes("John Doe")).toBe(true);
  });

  it("renders hours field when provided", async () => {
    const result = await generatePDF([{ name: "A", hours: 5 }]);
    const str = result.toString();
    expect(str.includes("5 hours")).toBe(true);
  });

  it("renders event field when provided", async () => {
    const result = await generatePDF([{ name: "A", event_name: "Clean Up" }]);
    const str = result.toString();
    expect(str.includes("Event: Clean Up")).toBe(true);
  });

  it("renders unknown fallback when no fields provided", async () => {
    const result = await generatePDF([{}]);
    const str = result.toString();
    expect(str.includes("Unknown")).toBe(true);
  });

});
