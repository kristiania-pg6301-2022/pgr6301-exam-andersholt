import express from "express";
import * as path from "path";
import bodyParser from "body-parser";
import loginApi from "./loginApi.js";
import { MongoClient } from "mongodb";
import { ArticlesApi } from "./articlesApi.js";
import { WebSocketServer } from "ws";

const app = express();

app.use(bodyParser.urlencoded());
app.use("/api/login", loginApi);

const mongoClient = new MongoClient(process.env.MONGODB_URL);
mongoClient.connect().then(async () => {
  console.log("Connected to MongoDB");
  app.use(
    "/api/articles",
    ArticlesApi(mongoClient.db(process.env.MONGO_ARTICLEDB || "articles_app"))
  );
});

const sockets = [];

const wsServer = new WebSocketServer({ noServer: true });
wsServer.on("connect", (socket) => {
  sockets.push(socket);
  socket.on("message", (data) => {
    const { title, date, author, topic, updated, articleText, remove } =
      JSON.parse(data);

    for (const recipient of sockets) {
      recipient.send(
        JSON.stringify({
          title,
          date,
          author,
          topic,
          updated,
          articleText,
          remove,
        })
      );
    }
  });
});

app.use(express.static("../client/dist"));
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendfile(path.resolve("../client/dist/index.html"));
  } else {
    next();
  }
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("http://localhost:" + server.address().port);

  server.on("upgrade", (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, (socket) => {
      wsServer.emit("connect", socket, req);
    });
  });
});
