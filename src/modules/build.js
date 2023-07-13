import { createLinux, createWindows } from "../manage-script.js";
import { PATH } from "./consts.js";

export function build(types) {
  if (!types) types = [ "linux", "windows" ];
  if (!Array.isArray(types)) types = [ types ];

  if (types.includes("linux")) {
    console.log("Generating shell script...");
    createLinux(PATH);
    console.log("Shell script generated successfully");
  }
  if (types.includes("windows")) {
    console.log("Generating batch script...");
    createWindows(PATH);
    console.log("Batch script generated successfully");
  }
}
