import React, { useContext, useEffect, useState } from "react";
import { ProfileContext } from "../../hooks/loginProvider";
import { Navbar } from "../../components/navbar/navbar";
import "./frontpage.css";
import { fetchJSON, useLoader } from "../../hooks/global";
import LoadingAnimation from "../loadingpage/LoadingPage";
import { getHumanDate } from "../../lib/getHumanDate";

async function deleteArticle(title, ws) {
  let deleteTitle = { remove: { title: title } };
  ws.send(JSON.stringify(deleteTitle));
  await fetchJSON("/api/articles/select/?title=" + title, {
    method: "delete",
  });
}

function ArticlesList({ setSelectedArticle, selectedArticle }) {
  const { userinfo } = useContext(ProfileContext);
  const [search, setSearch] = useState("");
  const [selectedFilterItems, setSelectedFilterItems] = useState([]);
  const [filterItems, setFilterItems] = useState([]);

  const [data, setData] = useState([]);
  const ws = new WebSocket(window.location.origin.replace(/^http/, "ws"));
  useEffect(() => {
    const bufferAllTopics = [];
    console.log(data);
    data.map((article) => {
      article.topics.map((topic) => {
        bufferAllTopics.push(topic.toLowerCase().trim());
      });
    });
    const allTopicsWithCounter = [];

    for (let i = 0; i < bufferAllTopics.length; i++) {
      const index = allTopicsWithCounter.findIndex((topic) => {
        return topic.topic === bufferAllTopics[i];
      });

      if (index !== -1) {
        allTopicsWithCounter[index].counter++;
      } else {
        allTopicsWithCounter.push({ topic: bufferAllTopics[i], counter: 1 });
      }
    }
    setFilterItems(allTopicsWithCounter);
  }, [data]);

  useEffect(() => {
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      console.log(newData);
      if (newData.remove) {
        const buffer = [];
        data.map((item) => {
          if (item.title !== newData.remove.title) {
            buffer.push(item);
          }
        });
        setData(buffer);
      } else {
        setData((oldState) => [...oldState, newData]);
      }
    };
    ws.onclose = () => {
      setTimeout(() => connect(), 1000);
    };
  }, [data]);

  useEffect(() => {
    if (selectedFilterItems.length === 0) {
      fetchJSON("/api/articles/all").then((jsonData) => {
        setData(jsonData);
        console.log(jsonData);
      });
    } else {
      const items = [];
      selectedFilterItems.map((item) => {
        items.push(item.topic);
      });
      fetchJSON(`/api/articles/filter/?topics=${items}`).then((jsonData) => {
        setData(jsonData.articles);
      });
    }
  }, [selectedFilterItems]);
  async function handleSearch(event) {
    setSearch(event);
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

  function changeFilter(topic) {
    if (!selectedFilterItems.includes(topic)) {
      setSelectedFilterItems((prevState) => [...prevState, topic]);
      setFilterItems(
        filterItems.filter(function (item) {
          return item.topic !== topic.topic;
        })
      );
    } else {
      setFilterItems((prevState) => [...prevState, topic]);

      setSelectedFilterItems(
        selectedFilterItems.filter(function (item) {
          return item.topic !== topic.topic;
        })
      );
    }
  }

  return (
    <div className="article-list" style={{ width: selectedArticleWidth }}>
      <div className={"filter-container"}>
        {filterItems.map((item, key) => (
          <button
            key={key}
            onClick={(e) => {
              changeFilter(item);
            }}
          >
            {item.topic + " (" + item.counter + ")"}
          </button>
        ))}
        <div>
          {selectedFilterItems.map((item, key) => (
            <button
              key={key}
              onClick={(e) => {
                changeFilter(item);
              }}
            >
              {item.topic}
            </button>
          ))}
        </div>
      </div>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleRead({ data, setSelectedArticle }) {
  const article = data;

  function leaveArticle() {
    setSelectedArticle("");
  }

  console.log(article.topics);
  return (
    <main>
      <h1>{article.title}</h1>
      <p>Created: {getHumanDate(article.date)}</p>
      <p>Author: {article.author}</p>
      <p>
        Topics:
        {article.topics.map((topic) => {
          return " - " + topic;
        })}
      </p>
      <article>{article.articleText}</article>
      <button id={"leaveArticle"} onClick={leaveArticle}>
        Leave article
      </button>
    </main>
  );
}

function ArticleReadWrite({ data }) {
  const article = data;

  console.log(article);
  const { userinfo } = useContext(ProfileContext);
  const ws = new WebSocket(window.location.origin.replace(/^http/, "ws"));
  console.log(article.topics);

  const [title, setTitle] = useState(article.title);
  const [topics, setTopics] = useState(article.topics);
  const [articleText, setArticleText] = useState(article.articleText);

  async function updateArticle(event) {
    event.preventDefault();
    await fetchJSON("/api/articles/select/?originalTitle=" + article.title, {
      method: "put",
      body: new URLSearchParams({
        title,
        topics,
        articleText,
        author: userinfo.name,
        updated: Date.now(),
      }),
    });
  }

  return (
    <main>
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
        <label>Topics</label>
        <br />
        <input
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
        />{" "}
        <br />
        <textarea
          value={articleText}
          onChange={(e) => setArticleText(e.target.value)}
        ></textarea>
        <br />
        <button formAction={"submit"}>Publish article</button>
      </form>
      <button
        onClick={() => {
          deleteArticle(article.title, ws);
        }}
      >
        Delete this article
      </button>
    </main>
  );
}

export function FrontPage() {
  const [editMode, setEditMode] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState("");
  const { userinfo } = useContext(ProfileContext);
  const [data, setData] = useState();
  const ws = new WebSocket(window.location.origin.replace(/^http/, "ws"));

  ws.onmessage = (event) => {
    const newData = JSON.parse(event.data);
    if (newData.title === selectedArticle) {
      setData(newData);
    }
  };

  ws.onclose = () => {
    setTimeout(() => connect(), 1000);
  };

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
            {editMode === false &&
              data !== undefined &&
              selectedArticle !== "" && (
                <>
                  <ArticleRead
                    data={data}
                    setSelectedArticle={setSelectedArticle}
                  />
                </>
              )}
            {editMode === true && data !== undefined && selectedArticle !== "" && (
              <>
                <ArticleReadWrite data={data} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
