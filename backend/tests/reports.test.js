require("dotenv").config({ path: ".env.test" });

const mockExec = jest.fn();

const mockTable = {
  select: jest.fn(() => mockTable),
  eq: jest.fn(() => mockTable),
  gte: jest.fn(() => mockTable),
  lte: jest.fn(() => mockTable),
  ilike: jest.fn(() => mockTable),
  or: jest.fn(() => mockTable),
  contains: jest.fn(() => mockTable),
  then: (...args) => Promise.resolve(mockExec()).then(...args)
};

jest.mock("../src/supabaseNoAuth", () => ({
  from: jest.fn(() => mockTable)
}));

const mockExportCSV = jest.fn((data, res) => {
  res.status(200).send("CSV_CONTENT");
});

const mockExportPDF = jest.fn((data, res) => {
  res.status(200).send("PDF_CONTENT");
});

jest.mock("../src/utils/exportCSV", () => (...args) => mockExportCSV(...args));
jest.mock("../src/utils/exportPDF", () => (...args) => mockExportPDF(...args));

const request = require("supertest");
const app = require("../src/app");

describe("Reports API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockTable.select.mockReturnValue(mockTable);
    mockTable.eq.mockReturnValue(mockTable);
    mockTable.gte.mockReturnValue(mockTable);
    mockTable.lte.mockReturnValue(mockTable);
    mockTable.ilike.mockReturnValue(mockTable);
    mockTable.or.mockReturnValue(mockTable);
    mockTable.contains.mockReturnValue(mockTable);

    mockExec.mockResolvedValue({ data: [], error: null });
  });

  it("GET /api/reports/volunteers should return volunteer data", async () => {
    mockExec.mockResolvedValueOnce({
      data: [{ full_name: "Test User" }],
      error: null
    });

    const res = await request(app).get("/api/reports/volunteers");

    expect(res.status).toBe(200);
    expect(res.body[0].full_name).toBe("Test User");
  });

  it("should apply volunteer report filters", async () => {
    mockExec.mockResolvedValueOnce({ data: [], error: null });

    await request(app)
      .get("/api/reports/volunteers?startDate=2024-01-01&endDate=2024-12-31&search=cole&skill=python&urgency=high&minSkills=2");

    expect(mockTable.gte).toHaveBeenCalledWith("event_start_date", "2024-01-01");
    expect(mockTable.lte).toHaveBeenCalledWith("event_start_date", "2024-12-31");
    expect(mockTable.or).toHaveBeenCalled();
    expect(mockTable.contains).toHaveBeenCalledWith("user_skills", ["python"]);
    expect(mockTable.eq).toHaveBeenCalledWith("event_urgency", "high");
    expect(mockTable.gte).toHaveBeenCalledWith("user_skills_len", 2);
  });

  it("GET /api/reports/events should return event data", async () => {
    mockExec.mockResolvedValueOnce({
      data: [{ event_name: "Cleanup" }],
      error: null
    });

    const res = await request(app).get("/api/reports/events");

    expect(res.status).toBe(200);
    expect(res.body[0].event_name).toBe("Cleanup");
  });

  it("should apply event report filters", async () => {
    mockExec.mockResolvedValueOnce({ data: [], error: null });

    await request(app)
      .get("/api/reports/events?startDate=2024-01-01&endDate=2024-12-31&search=drive&skill=python&urgency=high&minSkills=3");

    expect(mockTable.gte).toHaveBeenCalledWith("event_start_date", "2024-01-01");
    expect(mockTable.lte).toHaveBeenCalledWith("event_start_date", "2024-12-31");
    expect(mockTable.ilike).toHaveBeenCalledWith("event_name", "%drive%");
    expect(mockTable.contains).toHaveBeenCalledWith("volunteer_skills", ["python"]);
    expect(mockTable.eq).toHaveBeenCalledWith("event_urgency", "high");
    expect(mockTable.gte).toHaveBeenCalledWith("volunteer_skills_len", 3);
  });

  it("GET /api/reports/export/volunteers/csv should call exportCSV", async () => {
    mockExec.mockResolvedValueOnce({ data: [{ x: 1 }], error: null });

    await request(app).get("/api/reports/export/volunteers/csv");

    expect(mockExportCSV).toHaveBeenCalled();
  });

  it("GET /api/reports/export/events/csv should call exportCSV", async () => {
    mockExec.mockResolvedValueOnce({ data: [{ x: 1 }], error: null });

    await request(app).get("/api/reports/export/events/csv");

    expect(mockExportCSV).toHaveBeenCalled();
  });

  it("GET /api/reports/export/volunteers/pdf should call exportPDF", async () => {
    mockExec.mockResolvedValueOnce({ data: [{ x: 1 }], error: null });

    await request(app).get("/api/reports/export/volunteers/pdf");

    expect(mockExportPDF).toHaveBeenCalled();
  });

  it("GET /api/reports/export/events/pdf should call exportPDF", async () => {
    mockExec.mockResolvedValueOnce({ data: [{ x: 1 }], error: null });

    await request(app).get("/api/reports/export/events/pdf");

    expect(mockExportPDF).toHaveBeenCalled();
  });

  it("Should return 500 when Supabase returns error on volunteer report", async () => {
    mockExec.mockResolvedValueOnce({
      data: null,
      error: { message: "DB error" }
    });

    const res = await request(app).get("/api/reports/volunteers");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });
});
