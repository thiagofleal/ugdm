import { createLinux, createWindows } from "../manage-script.js";
import { PATH } from "./consts.js";

export async function build(types) {
  if (!types) types = [ "linux", "win32" ];
  if (!Array.isArray(types)) types = [ types ];

  if (types.includes("linux")) {
    console.log("Generating shell script...");
    await createLinux(PATH);
    console.log("Shell script generated successfully");
  }
  if (types.includes("win32")) {
    console.log("Generating batch script...");
    createWindows(PATH);
    console.log("Batch script generated successfully");
  }
}
