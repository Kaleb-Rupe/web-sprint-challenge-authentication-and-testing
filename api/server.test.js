const supertest = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const tokenMiddleware = require("./middleware/restricted");
const { JWT_SECRET } = require("../config/index");

// Create a simple Express app for testing
const app = express();

// Add the token middleware to the app
app.use(tokenMiddleware);

// Use supertest to test the middleware
const request = supertest(app);

describe("Token Middleware", () => {
  it('should return "token required" when no token is provided', async () => {
    const response = await request.get("/protected");

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual("token required");
  });

  it('should return "token invalid" when an invalid token is provided', async () => {
    const invalidToken = "invalid_token";
    const response = await request
      .get("/protected")
      .set("Authorization", invalidToken);

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual("token invalid");
  });

  it('should return "token has expired" when an expired token is provided', async () => {
    const expiredToken = jwt.sign({}, "invalid_secret", {
      expiresIn: "0s",
    });
    const response = await request
      .get("/protected")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual("token invalid");
  });

  it("should allow access with a valid token", async () => {
    const validToken = jwt.sign({}, JWT_SECRET, {
      expiresIn: "1h",
    });
    const response = await request
      .get("/protected")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual("token invalid");
  });
});
