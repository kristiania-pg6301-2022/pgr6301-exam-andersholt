import React, { useContext, useState } from "react";
import { ProfileContext } from "../../hooks/loginProvider";
import "./writeArticlePage.css";
import { Navbar } from "../../components/navbar/navbar";
import { ArticlesApiContext } from "../../articlesApiContext";
const ws = new WebSocket(window.location.origin.replace(/^http/, "ws"));

export function ArticleWrite() {
  const { userinfo } = useContext(ProfileContext);
  const { writeArticle } = useContext(ArticlesApiContext);
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState([]);
  const [articleText, setArticleText] = useState("");

  async function publishArticle(event) {
    event.preventDefault();
    const article = {
      title,
      topics: topics,
      articleText,
      author: userinfo.name,
    };
    await writeArticle(ws, article);
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
            <label>Topics:</label>
            <br />
            <input
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
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
