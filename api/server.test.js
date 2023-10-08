const db = require("../data/dbConfig");
const request = require("supertest");
const server = require("./server");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

describe("[POST] /auth/register", () => {
  const newUser = { username: "user", password: "1234" };
  test("new users are listed in the database", async () => {
    await request(server).post("/auth/register").send(newUser);
    const rows = await db("users");
    expect(rows).toHaveLength(1);
  });
  test("returns username and hashed password", async () => {
    const res = await request(server).post("/api/auth/register").send(newUser);
    expect(res.body.username).toMatch(newUser.username);
    expect(res.body.password).not.toMatch(newUser.password);
  });

  test("requires a unique username", async () => {
    const res = await request(server).post("/auth/register").send(newUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username is already taken.");
  });

  test("requires a password", async () => {
    const res = await request(server)
      .post("/auth/register")
      .send({ username: "newUser" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username and password are required.");
  });
});

describe("[POST] /auth/login", () => {
  const newUser = { username: "user", password: "1234" };
  test("allows existing users to log in", async () => {
    const res = await request(server).post("/auth/login").send(newUser);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Welcome, user");
    expect(res.body.token).toBeDefined();
  });

  test("requires a valid username and password for login", async () => {
    const res = await request(server)
      .post("/auth/login")
      .send({ username: "invalidUser", password: "invalidPassword" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials.");
  });

  test("requires a username for login", async () => {
    const res = await request(server)
      .post("/auth/login")
      .send({ password: "password" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username and password are required.");
  });

  test("requires a password for login", async () => {
    const res = await request(server)
      .post("/auth/login")
      .send({ username: "user" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username and password are required.");
  });

  test("returns a JWT token on successful login", async () => {
    const res = await request(server).post("/auth/login").send(newUser);
    expect(res.body.token).toBeDefined();
  });
});

describe("[GET] /api/jokes (Protected Route)", () => {
  // Define a valid user and token
  const validUser = { username: "user", password: "1234" };
  let authToken;

  // Log in the user and obtain the JWT token
  beforeAll(async () => {
    const res = await request(server).post("/auth/login").send(validUser);
    authToken = res.body.token;
  });

  test("returns a list of jokes when authenticated", async () => {
    const res = await request(server)
      .get("/api/jokes")
      .set("Authorization", authToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(/* Number of jokes expected */);
  });

  test("requires authentication to access the jokes", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token required.");
  });
});
