const PDFDocument = require("pdfkit");
const exportPDF = require("../../src/utils/exportPDF");

jest.mock("pdfkit");

describe("exportPDF", () => {
  let mockDoc;
  let mockRes;

  beforeEach(() => {
    mockDoc = {
      pipe: jest.fn(),
      fontSize: jest.fn(() => mockDoc),
      text: jest.fn(() => mockDoc),
      moveDown: jest.fn(() => mockDoc),
      end: jest.fn()
    };

    PDFDocument.mockImplementation(() => mockDoc);

    mockRes = {
      setHeader: jest.fn()
    };
  });

  it("exports a PDF with correct headers and piping", () => {
    const data = [
      { name: "Alice", hours: 10 },
      { name: "Bob", hours: 5 }
    ];

    exportPDF(data, mockRes, "Report Title", "report-file");

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf"
    );

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'attachment; filename="report-file.pdf"'
    );

    expect(mockDoc.pipe).toHaveBeenCalledWith(mockRes);
    expect(mockDoc.fontSize).toHaveBeenCalled();
    expect(mockDoc.text).toHaveBeenCalled();
    expect(mockDoc.end).toHaveBeenCalled();
  });

  it("handles empty data array", () => {
    exportPDF([], mockRes, "Empty Report", "empty");

    expect(mockDoc.text).toHaveBeenCalledWith("Empty Report", { underline: true });
    expect(mockDoc.end).toHaveBeenCalled();
  });

  it("throws if PDFDocument constructor fails", () => {
    PDFDocument.mockImplementationOnce(() => {
      throw new Error("fail");
    });

    expect(() =>
      exportPDF([{ a: 1 }], mockRes, "X", "Y")
    ).toThrow("fail");
  });
});
