import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";
import { Simulate } from "react-dom/test-utils";
import { ArticleWrite } from "../src/pages/writeArticlePage/writeArticlePage";
import React from "react";
import { ProfileContext } from "../src/hooks/loginProvider";
import { ArticlesApiContext } from "../src/articlesApiContext";

describe("articleWrite", () => {
  it("displays form", () => {
    const element = document.createElement("div");
    ReactDOM.render(
      <ProfileContext.Provider value={{ userinfo: { usertype: "kristiania" } }}>
        <MemoryRouter>
          <ArticleWrite />
        </MemoryRouter>
      </ProfileContext.Provider>,
      element
    );
    expect(element.innerHTML).toMatchSnapshot();
    expect(
      Array.from(element.querySelectorAll("form label")).map((e) => e.innerHTML)
    ).toEqual(["Title:", "Topics:", "Article:"]);
  });

  it("adds article", () => {
    const writeArticle = jest.fn();
    const title = "New fancy article";
    const element = document.createElement("div");
    ReactDOM.render(
      <ProfileContext.Provider
        value={{ userinfo: { usertype: "kristiania", name: "Me" } }}
      >
        <ArticlesApiContext.Provider value={{ writeArticle: writeArticle }}>
          <MemoryRouter>
            <ArticleWrite />
          </MemoryRouter>
        </ArticlesApiContext.Provider>
      </ProfileContext.Provider>,
      element
    );

    Simulate.change(element.querySelector("form input"), {
      target: { value: title },
    });

    const article = {
      articleText: "",
      author: "Me",
      title: "New fancy article",
      topics: [],
    };

    Simulate.submit(element.querySelector("form"));
    //getting the ws parameter
    const ws = writeArticle.mock.calls[0][0];

    expect(writeArticle).toBeCalledWith(ws, article);
  });
});
