import { jsonManager } from "./consts.js";

export function init(path) {
  console.log("Initializing GIT Dependency Manager...");
  jsonManager.init(path);
  jsonManager.save();
  console.log(`GIT Dependency Manager initialized in path: "${ path }"`);
}