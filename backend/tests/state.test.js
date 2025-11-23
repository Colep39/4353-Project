jest.mock("../src/supabaseNoAuth");

const supabaseNoAuth = require("../src/supabaseNoAuth");
const { getStates } = require("../src/controllers/statesController");

describe("getStates Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };

    supabaseNoAuth.from.mockReset();
  });

  it("returns 200 JSON with states", async () => {
    supabaseNoAuth.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ code: "TX", name: "Texas" }],
        error: null
      })
    });

    await getStates(req, res);

    expect(res.json).toHaveBeenCalledWith([{ code: "TX", name: "Texas" }]);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 500 when Supabase returns error", async () => {
    supabaseNoAuth.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error("DB failed")
      })
    });

    await getStates(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB failed" });
  });

  it("returns 500 when an exception is thrown", async () => {
    supabaseNoAuth.from.mockImplementation(() => {
      throw new Error("Unexpected failure");
    });

    await getStates(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Unexpected failure" });
  });
});
