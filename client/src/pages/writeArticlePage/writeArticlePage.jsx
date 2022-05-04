import React, { useContext, useState } from "react";
import { ProfileContext } from "../../hooks/loginProvider";
import "./writeArticlePage.css";
import { Navbar } from "../../components/navbar/navbar";
const ws = new WebSocket(window.location.origin.replace(/^http/, "ws"));

export function ArticleWrite() {
  const { userinfo } = useContext(ProfileContext);

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState([]);
  const [articleText, setArticleText] = useState("");

  async function publishArticle(event) {
    event.preventDefault();
    const article = {
      title,
      topic: topic,
      articleText,
      author: userinfo.name,
      date: Date.now(),
      updated: Date.now(),
    };
    ws.send(JSON.stringify(article));
    await fetch("/api/articles/publish", {
      method: "post",
      body: new URLSearchParams(article),
    });
  }

  return (
    <div className={"article-page"}>
      <Navbar />
      {userinfo && userinfo.usertype === "kristiania" && (
        <div className={"publish"}>
          <form onSubmit={publishArticle}>
            <h2>Write article</h2>
            <label>Title:</label>
            <br />
            <input
              value={title}
              type={"text"}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p>Author: {userinfo.name}</p>
            <label>Type:</label>
            <br />
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />{" "}
            <br />
            <label>Article:</label>
            <br />
            <textarea
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
            ></textarea>
            <br />
            <button formAction={"submit"}>Publish article</button>
          </form>
        </div>
      )}
    </div>
  );
}
