const { Parser } = require("json2csv");
const exportCSV = require("../../src/utils/exportCSV");

jest.mock("json2csv");

describe("exportCSV", () => {
  let mockParser;
  let mockRes;

  beforeEach(() => {
    mockParser = {
      parse: jest.fn()
    };

    Parser.mockImplementation(() => mockParser);

    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn(() => mockRes),
      end: jest.fn(),
      json: jest.fn()
    };
  });

  it("exports CSV successfully", () => {
    const data = [{ a: 1, b: 2 }];

    mockParser.parse.mockReturnValue("a,b\n1,2");

    exportCSV(data, mockRes, "report");

    expect(Parser).toHaveBeenCalledTimes(1);
    expect(mockParser.parse).toHaveBeenCalledWith(data);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "text/csv"
    );

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'attachment; filename="report.csv"'
    );

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.end).toHaveBeenCalledWith("a,b\n1,2");
  });

  it("handles parser errors", () => {
    mockParser.parse.mockImplementation(() => {
      throw new Error("parse failed");
    });

    exportCSV([{ x: 1 }], mockRes, "bad");

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "parse failed" });
  });

  it("handles constructor errors", () => {
    Parser.mockImplementationOnce(() => {
      throw new Error("constructor broken");
    });

    exportCSV([{ x: 1 }], mockRes, "err");

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "constructor broken" });
  });
});
