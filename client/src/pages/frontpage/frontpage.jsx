import React, { useContext, useEffect, useState } from "react";
import { ProfileContext } from "../../hooks/loginProvider";
import { Navbar } from "../../components/navbar/navbar";
import "./frontpage.css";
import { fetchJSON, useLoader } from "../../hooks/global";
const ws = new WebSocket(window.location.origin.replace(/^http/, "ws"));

function ArticlesList({ setSelectedArticle, selectedArticle }) {
  const { userinfo } = useContext(ProfileContext);

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData((oldState) => [...oldState, newData]);
    };

    ws.onclose = () => {
      setTimeout(() => connect(), 1000);
    };
  }, [data]);

  useEffect(() => {
    if (search === "") {
      fetchJSON("/api/articles/all").then((jsonData) => {
        setData(jsonData);
      });
    } else {
      fetchJSON(`/api/articles/search/?title=${search}`).then((jsonData) => {
        setData(jsonData.articles);
      });
    }
  }, [search]);

  const { error, loading } = useLoader(async () => {
    return await fetchJSON("/api/articles/all").then((jsonData) => {
      setData(jsonData);
    });
  });

  async function handleSearch(event) {
    setSearch(event);
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error.toString()}</div>;
  }

  function selectArticle(title) {
    if (userinfo) {
      setSelectedArticle(title);
    } else {
      if (window.confirm("Log in to read articles")) {
        window.location.href = window.location.origin + "/login";
      }
    }
  }

  let selectedArticleWidth = "20vw";
  if (selectedArticle === "") {
    selectedArticleWidth = "100vw";
  }

  return (
    <div className="article-list" style={{ width: selectedArticleWidth }}>
      <label>Search:</label>
      <br />
      <input value={search} onChange={(e) => handleSearch(e.target.value)} />
      {search && <div>Results for {search}</div>}

      {data && (
        <div className={"article-cards"}>
          {data.map((article, index) => (
            <div
              key={index}
              id="article-card"
              onClick={() => selectArticle(article.title)}
            >
              <h2>{article.title}</h2>
              <p>Published on {getHumanDate(article.date)}</p>
              <p>Written by {article.author}</p>
              <p>Topics: {article.topic}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getHumanDate(timestamp) {
  const humanDate = new Date(parseInt(timestamp)).toLocaleString();
  return humanDate;
}

function ArticleRead({ data, setSelectedArticle }) {
  const article = data;

  function leaveArticle() {
    setSelectedArticle("");
  }

  return (
    <>
      <>
        <h1>{article.title}</h1>
        <p>Created: {getHumanDate(article.date)}</p>
        <p>Author: {article.author}</p>
        <p>Topics: {article.topic}</p>
        <article>{article.articleText}</article>
        <button id={"leaveArticle"} onClick={leaveArticle}>
          Leave article
        </button>
      </>
    </>
  );
}

function ArticleReadWrite(data) {
  const article = data;
  const { userinfo } = useContext(ProfileContext);

  const [title, setTitle] = useState(article.title);
  const [topic, setTopic] = useState(article.topic);
  const [articleText, setArticleText] = useState(article.articleText);

  async function updateArticle(event) {
    event.preventDefault();
    await fetch("/api/articles/select/?originalTitle=" + article.title, {
      method: "put",
      body: new URLSearchParams({
        title,
        topic,
        articleText,
        author: userinfo.name,
        updated: Date.now(),
      }),
    });
  }

  async function deleteArticle() {
    await fetch("/api/articles/select/?title=" + article.title, {
      method: "delete",
    });
  }

  return (
    <>
      <form onSubmit={updateArticle}>
        <h2>Edit mode</h2>
        <label>Title</label>
        <br />
        <input
          value={title}
          type={"text"}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p>
          Created at {getHumanDate(article.date)} and last edited at:{" "}
          {getHumanDate(article.updated)}
        </p>
        <p>Author: {article.author}</p>
        <label>Topic</label>
        <br />
        <input value={topic} onChange={(e) => setTopic(e.target.value)} />{" "}
        <br />
        <textarea
          value={articleText}
          onChange={(e) => setArticleText(e.target.value)}
        ></textarea>
        <br />
        <button formAction={"submit"}>Publish article</button>
      </form>
      <button onClick={deleteArticle}>Delete this article</button>
    </>
  );
}

function Article({ mode, selectedArticle, setSelectedArticle }) {
  const [data, setData] = useState();

  useEffect(() => {
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);

      if (newData.title === selectedArticle) {
        setData(newData);
      }
    };

    ws.onclose = () => {
      setTimeout(() => connect(), 1000);
    };
  }, [data]);

  useEffect(() => {
    if (selectedArticle !== "") {
      fetchJSON("/api/articles/select/?title=" + selectedArticle).then(
        (jsonData) => {
          if (jsonData) {
            setData(jsonData.article[0]);
          }
        }
      );
    }
  }, [selectedArticle]);

  return (
    <main>
      {mode === false && data !== undefined && selectedArticle !== "" && (
        <>
          <ArticleRead data={data} setSelectedArticle={setSelectedArticle} />
        </>
      )}
      {mode === true && data !== undefined && selectedArticle !== "" && (
        <>
          <ArticleReadWrite data={data} />
        </>
      )}
    </main>
  );
}

export function FrontPage() {
  const [editMode, setEditMode] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState("");
  const { userinfo } = useContext(ProfileContext);
  return (
    <div>
      {!userinfo && (
        <>
          <Navbar />
          <div className={"frontpage-container"}>
            <ArticlesList selectedArticle={selectedArticle} />
          </div>
        </>
      )}
      {userinfo && (
        <>
          <Navbar editMode={editMode} setEditMode={setEditMode} />
          <div className={"frontpage-container"}>
            <ArticlesList
              selectedArticle={selectedArticle}
              setSelectedArticle={setSelectedArticle}
            />
            <Article
              mode={editMode}
              selectedArticle={selectedArticle}
              setSelectedArticle={setSelectedArticle}
            />
          </div>
        </>
      )}
    </div>
  );
}
