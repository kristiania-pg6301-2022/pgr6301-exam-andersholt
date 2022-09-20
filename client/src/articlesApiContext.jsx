import React from "react";
import { fetchJSON } from "./hooks/global";

const ws = new WebSocket(window.location.origin.replace(/^http/, "ws"));

export const ArticlesApiContext = React.createContext({
  async writeArticle(ws, article) {
    article.date = Date.now();
    article.updated = Date.now();

    ws.send(JSON.stringify(article));
    await fetch("/api/articles/publish", {
      method: "post",
      body: new URLSearchParams(article),
    });
  },

  async getAllArticles() {
    const result = await fetchJSON("/api/articles/all");
    return result;
  },

  async getSelectedArticle(selectedArticle) {
    const jsonData = await fetchJSON(
      "/api/articles/select/?title=" + selectedArticle
    );
    return jsonData.article[0];
  },

  async deleteArticle(title) {
    let deleteTitle = { remove: { title: title } };
    ws.send(JSON.stringify(deleteTitle));
    await fetchJSON("/api/articles/select/?title=" + title, {
      method: "delete",
    });
  },
  async updateArticleApi(originalTitle, article) {
    article.updated = Date.now();
    await fetchJSON("/api/articles/select/?originalTitle=" + originalTitle, {
      method: "put",
      body: new URLSearchParams(article),
    });
  },
});
