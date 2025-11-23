jest.mock("../src/supabaseNoAuth");

const supabaseNoAuth = require("../src/supabaseNoAuth");
const { getSkills } = require("../src/controllers/skillsController");

describe("getSkills Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };

    supabaseNoAuth.from.mockReset();
  });

  it("returns 200 and skill list on success", async () => {
    supabaseNoAuth.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ id: 1, name: "Mock Skill" }],
        error: null
      })
    });

    await getSkills(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, name: "Mock Skill" }]);
  });

  it("returns 500 when supabase returns error", async () => {
    supabaseNoAuth.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error("DB failed")
      })
    });

    await getSkills(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Failed to load skills" });
  });

  it("returns 500 when an exception occurs", async () => {
    supabaseNoAuth.from.mockImplementation(() => {
      throw new Error("Unexpected");
    });

    await getSkills(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Failed to load skills" });
  });
});
