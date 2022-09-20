import React from "react";
import { LoginPage } from "../src/pages/loginpage/loginPage";
import { MemoryRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import { Application } from "../src/Application";

describe("login", () => {
  it("returns loadingpage", async () => {
    const location = new URL("https://www.example.com");
    delete window.location;
    window.location = location;

    const domElement = document.createElement("div");
    jest.mock("");
    ReactDOM.render(
      <MemoryRouter initialEntries={["/login/google"]}>
        <Application />
      </MemoryRouter>,
      domElement
    );
    expect(domElement.querySelector("div").className).toEqual(
      "loading-container"
    );
    expect(domElement).toMatchSnapshot();
  });
});
