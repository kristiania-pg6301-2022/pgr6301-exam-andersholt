import React from "react";
import { randomString } from "../src/lib/randomString";
import { getHumanDate } from "../src/lib/getHumanDate";

describe("randomString", () => {
  it("returns right length", async () => {
    const res = randomString(50);

    expect(res.length).toEqual(50);
  });
});

describe("human date", () => {
  it("converts to locale string", async () => {
    let res = getHumanDate(0);

    expect(res).toContain("1/1/1970");

    res = getHumanDate(1651751231000);
    expect(res).toEqual("5/5/2022, 1:47:11 PM");
  });
});
