import ReactDOM from "react-dom";
import { ProfileContext } from "../src/hooks/loginProvider";
import { MemoryRouter } from "react-router-dom";
import { ArticleWrite } from "../src/pages/writeArticlePage/writeArticlePage";
import { ArticlesApiContext } from "../src/articlesApiContext";
import { Simulate } from "react-dom/test-utils";
import React from "react";
import { ArticlesList, FrontPage } from "../src/pages/frontpage/frontpage";
const { Response, Request, Headers, fetch } = require("whatwg-fetch");

global.fetch = fetch;
describe("frontpage", () => {
  it("displays navbar", () => {
    const element = document.createElement("div");
    ReactDOM.render(
      <ProfileContext.Provider value={{ userinfo: { usertype: "kristiania" } }}>
        <MemoryRouter>
          <FrontPage />
        </MemoryRouter>
      </ProfileContext.Provider>,
      element
    );
    expect(element.innerHTML).toMatchSnapshot();
  });

  it("displays list of articles", () => {
    const getAllarticles = jest.fn();
    const getSelectedArticle = jest.fn();

    getAllarticles.mockReturnValue([
      {
        title: "Test",
        date: "134",
        author: "Anders",
        topics: [],
        updated: "1234",
      },
      {
        title: "Test2",
        date: "134",
        author: "Anders",
        topics: [],
        updated: "1234",
      },
    ]);
    const element = document.createElement("div");
    ReactDOM.render(
      <ArticlesApiContext.Provider
        value={{
          getAllArticles: getAllarticles,
          getSelectedArticle: getSelectedArticle,
        }}
      >
        <MemoryRouter>
          <FrontPage />
        </MemoryRouter>
      </ArticlesApiContext.Provider>,
      element
    );

    expect(element.innerHTML).toMatchSnapshot();
  });
});
