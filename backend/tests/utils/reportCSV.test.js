const { Parser } = require("json2csv");
const generateCSV = require("../../src/utils/reportCSV");

jest.mock("json2csv");

describe("generateCSV util", () => {
  let mockParser;

  beforeEach(() => {
    mockParser = {
      parse: jest.fn()
    };

    Parser.mockImplementation(() => mockParser);
  });

  it("should generate valid CSV from normal data", () => {
    const data = [
      { name: "Alice", hours: 5 },
      { name: "Bob", hours: 3 }
    ];

    mockParser.parse.mockReturnValue("name,hours\nAlice,5\nBob,3");

    const result = generateCSV(data);

    expect(Parser).toHaveBeenCalledTimes(1);
    expect(mockParser.parse).toHaveBeenCalledWith(data);
    expect(result).toBe("name,hours\nAlice,5\nBob,3");
  });
  
  it("should handle empty data array", () => {
    const data = [];

    mockParser.parse.mockReturnValue("");

    const result = generateCSV(data);

    expect(mockParser.parse).toHaveBeenCalledWith([]);
    expect(result).toBe("");
  });

  it("should throw an error if json2csv parser fails", () => {
    const data = [{ name: "Test" }];

    mockParser.parse.mockImplementation(() => {
      throw new Error("CSV generation failed");
    });

    expect(() => generateCSV(data)).toThrow("CSV generation failed");
  });

  it("should throw if Parser constructor fails", () => {
    Parser.mockImplementationOnce(() => {
      throw new Error("Parser constructor error");
    });

    expect(() => generateCSV([{ a: 1 }])).toThrow("Parser constructor error");
  });
});
