import request from "supertest";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { ArticlesApi } from "../articlesApi.js";
import { MongoClient } from "mongodb";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();
app.use(bodyParser.json());
const url = process.env.MONGODB_URL;
const mongoClient = new MongoClient(url);

beforeAll(async () => {
  await mongoClient.connect();
  const database = mongoClient.db("aritcles_test");
  await database.collection("articles").deleteMany({});
  app.use("/api/articles", ArticlesApi(database));
});
afterAll(() => {
  mongoClient.close();
});

describe("articles", () => {
  it("adds and retrieve an article", async () => {
    const title = "My special article";
    const date = Date.now();
    const author = "Me";
    const topics = "Hello, this, is, an    , test    ";
    const articleText = "Wow, what an great article";

    await request(app)
      .post("/api/articles/publish")
      .send({ title, date, author, topics, articleText })
      .expect(204);
    expect(
      (await request(app).get("/api/articles/all").expect(200)).body.map(
        ({ title }) => title
      )
    ).toContain(title);
  });

  it("adds and retrieve an article from selected article", async () => {
    const title = "My newer article";
    const date = Date.now();
    const author = "Me";
    const topics = "Hello, this, is, an    , test    ";
    const articleText = "Wow, what an great article";

    await request(app)
      .post("/api/articles/publish")
      .send({ title: "HelloTest2", date, author, topics, articleText })
      .expect(204);

    await request(app)
      .post("/api/articles/publish")
      .send({ title, date, author, topics, articleText })
      .expect(204);

    await request(app)
      .post("/api/articles/publish")
      .send({ title: "HelloTest", date, author, topics, articleText })
      .expect(204);
    expect(
      (await request(app).get("/api/articles/all").expect(200)).body.map(
        ({ title }) => title
      )
    ).toContain(title);

    expect(
      (
        await request(app)
          .get("/api/articles/select/?title=My newer article")
          .expect(200)
      ).body.article[0].title
    ).toContain(title);
  });

  it("adds, updates and fetches", async () => {
    const title = "My Article new";
    const date = Date.now();
    const author = "Me";
    const topics = "Hello";
    const articleText = "Wow, what an great article";

    await request(app)
      .post("/api/articles/publish")
      .send({ title, date, author, topics, articleText })
      .expect(204);

    await request(app)
      .put("/api/articles/select/?originalTitle=My Article new")
      .send({
        title: "NewTitle",
        date,
        author,
        topics,
        articleText,
        updated: "13245",
      })
      .expect(200);
    const titles = (
      await request(app).get("/api/articles/all").expect(200)
    ).body.map(({ title }) => title);
    expect(titles).toContain("NewTitle");
    expect(titles).not.toContain("My Article");
  });

  it("adds and deletes", async () => {
    const title = "My Article new Special article";
    const date = Date.now();
    const author = "Me";
    const topics = "Hello";
    const articleText = "Wow, what an great article";

    await request(app)
      .post("/api/articles/publish")
      .send({ title, date, author, topics, articleText })
      .expect(204);
    let titles = (
      await request(app).get("/api/articles/all").expect(200)
    ).body.map(({ title }) => title);
    expect(titles).toContain("My Article new Special article");

    await request(app)
      .delete("/api/articles/select/?title=My Article new Special article")
      .expect(200);
    titles = (await request(app).get("/api/articles/all").expect(200)).body.map(
      ({ title }) => title
    );
    expect(titles).not.toContain("My Article new Special article");
  });
});
