const request = require("supertest");
const express = require("express");
const router = require("../src/routes/upload.js");


jest.mock("../src/supabaseNoAuth", () => {
  const mockUpload = jest.fn();
  const mockGetPublicUrl = jest.fn();
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();

  return {
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
      }))
    },
    from: jest.fn(() => ({
      update: mockUpdate.mockReturnThis(),
      eq: mockEq
    })),
    _mocks: { mockUpload, mockGetPublicUrl, mockUpdate, mockEq }
  };
});

const supabaseNoAuth = require("../src/supabaseNoAuth");
const { mockUpload, mockGetPublicUrl, mockUpdate, mockEq } = supabaseNoAuth._mocks;

const app = express();
app.use(express.json());
app.use("/api/files", router);

describe("POST /api/files/profile-photo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if no file is provided", async () => {
    const res = await request(app)
      .post("/api/files/profile-photo")
      .field("userId", "123");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No file provided");
  });

  it("should upload file and return public URL", async () => {
    mockUpload.mockResolvedValue({ data: {}, error: null });

    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/avatar.png" }
    });

    mockEq.mockResolvedValue({ error: null });

    const res = await request(app)
      .post("/api/files/profile-photo")
      .field("userId", "123")
      .attach("file", Buffer.from("fakeimage"), "avatar.png");

    expect(res.statusCode).toBe(200);
    expect(res.body.fileUrl).toBe("https://example.com/avatar.png");
  });

  it("should return 500 on supabase upload error", async () => {
    mockUpload.mockResolvedValue({
      data: null,
      error: new Error("upload failed")
    });

    const res = await request(app)
      .post("/api/files/profile-photo")
      .field("userId", "123")
      .attach("file", Buffer.from("fakeimage"), "avatar.png");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("upload failed");
  });

  it("should return 500 on database update error", async () => {
    mockUpload.mockResolvedValue({ data: {}, error: null });

    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/avatar.png" }
    });

    mockEq.mockResolvedValue({
      error: new Error("update failed")
    });

    const res = await request(app)
      .post("/api/files/profile-photo")
      .field("userId", "123")
      .attach("file", Buffer.from("fakeimage"), "avatar.png");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("update failed");
  });
});
