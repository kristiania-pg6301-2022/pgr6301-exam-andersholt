import { Router } from "express";

export function articlesApi(mongoDatabase) {
  const router = new Router();
  router.get("/all", async (req, res) => {
    const articles = await mongoDatabase
      .collection("articles")
      .find()
      .sort({
        date: 1,
      })
      .map(({ title, date, author, topics, updated }) => ({
        title,
        date,
        author,
        topics,
        updated,
      }))
      .toArray();
    res.json(articles);
  });

  router.post("/publish", async (req, res) => {
    const { title, date, author, topics, articleText } = req.body;
    let results = topics.split(",");
    const topicsList = [];
    results.map((element) => {
      topicsList.push(element.trim().toLowerCase());
    });

    mongoDatabase.collection("articles").insertOne({
      title,
      date,
      author,
      topics: topicsList,
      articleText,
    });
    res.sendStatus(204);
  });

  router.get("/select/*", async (req, res) => {
    const title = req.query.title;
    console.log(title);

    const article = await mongoDatabase
      .collection("articles")
      .find({
        title,
      })
      .map(({ title, date, author, topics, articleText, updated }) => ({
        title,
        date,
        author,
        topics,
        articleText,
        updated,
      }))
      .toArray();
    if (!article) {
      res.status(404).json({ errors });
      return;
    }
    res.json({ article });
  });

  router.put("/select/*", async (req, res) => {
    const originalTitle = req.query.originalTitle;

    console.log(originalTitle);

    const { title, updated, author, topics, articleText } = req.body;
    let results = topics.split(",");
    const topicsList = [];
    results.map((element) => {
      topicsList.push(element.trim().toLowerCase());
    });

    mongoDatabase.collection("articles").updateOne(
      { title: originalTitle },
      {
        $set: {
          title,
          updated,
          author,
          topics: topicsList,
          articleText,
        },
      }
    );
    res.json({ message: "done" }).status(204);
  });

  router.delete("/select/*", async (req, res) => {
    const title = req.query.title;
    mongoDatabase.collection("articles").deleteOne({ title: title });
    res.json({ message: "done" });
  });

  router.get("/filter/*", async (req, res) => {
    const topics = req.query.topics.split(",");
    console.log(topics);
    const articles = await mongoDatabase
      .collection("articles")
      .find({
        topics: { $all: topics },
      })
      .sort({
        date: 1,
      })
      .map(({ title, date, author, topics, updated }) => ({
        title,
        date,
        author,
        topics,
        updated,
      }))
      .toArray();
    console.log(articles.length);

    if (!articles) {
      res.status(404).json({ errors });
      return;
    }
    res.json({ articles });
  });

  return router;
}
