import React, { useContext, useEffect, useState } from "react";
import { ProfileContext } from "../../hooks/loginProvider";
import { Navbar } from "../../components/navbar/navbar";
import "./frontpage.css";
import { getHumanDate } from "../../lib/getHumanDate";
import { ArticlesApiContext } from "../../articlesApiContext";

function ArticleCard({ data, setSelectedArticle }) {
  const { userinfo } = useContext(ProfileContext);
  function selectArticle(title) {
    if (userinfo) {
      setSelectedArticle(title);
    } else {
      if (window.confirm("Log in to read articles")) {
        window.location.href = window.location.origin + "/login";
      }
    }
  }
  return (
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
  );
}

export function ArticlesList({ setSelectedArticle, selectedArticle }) {
  const { getAllArticles } = useContext(ArticlesApiContext);
  //const [selectedFilterItems, setSelectedFilterItems] = useState([]);
  const [filterItems, setFilterItems] = useState([]);
  const [data, setData] = useState([getAllArticles]);
  const ws = new WebSocket(window.location.origin.replace(/^http/, "ws"));
  /*
  useEffect(() => {
    const bufferAllTopics = [];
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

   */

  useEffect(() => {
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
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

  useEffect(async () => {
    //if (selectedFilterItems.length === 0) {
    const articles = await getAllArticles();
    setData(articles);
    /*} else {
      const items = [];
      selectedFilterItems.map((item) => {
        items.push(item.topic);
      });
      fetchJSON(`/api/articles/filter/?topics=${items}`).then((jsonData) => {
        setData(jsonData.articles);
      });
    }

     */
  }, []);

  let selectedArticleWidth = "20vw";
  if (selectedArticle === "") {
    selectedArticleWidth = "100vw";
  }
  /*
  function changeFilter(topic) {
    if (!selectedFilterItems.includes(topic)) {
      setSelectedFilterItems((prevState) => [...prevState, topic]);
    } else {
      setSelectedFilterItems(
        selectedFilterItems.filter(function (item) {
          return item.topic !== topic.topic;
        })
      );
    }
  }

 */

  return (
    <div className="article-list" style={{ width: selectedArticleWidth }}>
      {/*
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
            <div key={key}>{item.topic}</div>
          ))}
        </div>

      </div>
       */}
      {data && (
        <ArticleCard
          data={data}
          setSelectedArticle={setSelectedArticle}
        ></ArticleCard>
      )}
    </div>
  );
}

function ArticleRead({ data, setSelectedArticle }) {
  const article = data;

  function leaveArticle() {
    setSelectedArticle("");
  }
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

function ArticleReadWrite({ data, setSelectedArticle }) {
  const { userinfo } = useContext(ProfileContext);
  const { deleteArticle, updateArticleApi } = useContext(ArticlesApiContext);

  const [title, setTitle] = useState(data.title);
  const [topics, setTopics] = useState(data.topics);
  const [articleText, setArticleText] = useState(data.articleText);

  async function updateArticle(event) {
    event.preventDefault();
    const article = { title, topics, articleText, author: userinfo.name };
    await updateArticleApi(data.title, article);
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
          Created at {getHumanDate(data.date)} and last edited at:{" "}
          {getHumanDate(data.updated)}
        </p>
        <p>Author: {data.author}</p>
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
          deleteArticle(data.title);
          setSelectedArticle("");
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
  const { getSelectedArticle } = useContext(ArticlesApiContext);

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

  useEffect(async () => {
    if (selectedArticle !== "") {
      const result = await getSelectedArticle(selectedArticle);
      setData(result);
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
                <ArticleReadWrite
                  data={data}
                  setSelectedArticle={setSelectedArticle}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
