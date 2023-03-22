import { createSh } from "../manage-sh.js";
import { PATH } from "./consts.js";

export function build() {
  console.log("Generating shell script...");
  createSh(PATH);
  console.log("Shell script generated successfully");
}
