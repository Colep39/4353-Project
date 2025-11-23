jest.mock("../src/supabaseClient", () => ({
  auth: {
    getUser: jest.fn(),
  },
}));

const { auth } = require("../src/supabaseClient");
const { requireAuth } = require("../src/middleware/authMiddleware.js");

describe("requireAuth middleware", () => {
  let req, res, next;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    process.env = { ...OLD_ENV, NODE_ENV: "test" };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("should inject test user in test mode", async () => {
    await requireAuth(req, res, next);

    expect(req.user).toEqual({
      id: "test-user-id",
      role: "volunteer",
      email: "test@example.com",
    });
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if missing token", async () => {
    process.env.NODE_ENV = "production";

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if Supabase returns error", async () => {
    process.env.NODE_ENV = "production";

    req.headers.authorization = "Bearer abc";
    auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    });

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
  });

  it("should attach user and call next if token is valid", async () => {
    process.env.NODE_ENV = "production";

    req.headers.authorization = "Bearer abc";
    auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: "123",
          email: "x@test.com",
          user_metadata: { role: "admin" },
        },
      },
      error: null,
    });

    await requireAuth(req, res, next);

    expect(req.user).toEqual({
      id: "123",
      role: "admin",
      email: "x@test.com",
    });

    expect(next).toHaveBeenCalled();
  });

  it("should return 401 on thrown error", async () => {
    process.env.NODE_ENV = "production";

    req.headers.authorization = "Bearer abc";
    auth.getUser.mockRejectedValue(new Error("fail"));

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthenticated" });
  });
});
