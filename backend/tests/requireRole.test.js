const { requireRole } = require("../src/middleware/authMiddleware.js");

describe("requireRole middleware", () => {
  let req, res, next;
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, NODE_ENV: "test" };

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("should auto-allow in test mode", () => {
    const mw = requireRole("admin");
    mw(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if no req.user", () => {
    process.env.NODE_ENV = "production";

    const mw = requireRole("admin");
    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthenticated" });
  });

  it("should return 403 if user has wrong role", () => {
    process.env.NODE_ENV = "production";
    req.user = { role: "volunteer" };

    const mw = requireRole("admin");
    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
  });

  it("should allow if user has correct role", () => {
    process.env.NODE_ENV = "production";
    req.user = { role: "admin" };

    const mw = requireRole("admin");
    mw(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
