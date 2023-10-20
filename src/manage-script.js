import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { jsonFileName, scriptFileName } from "./const.js";
import { jsonManager } from "./modules/consts.js";
import { exec } from "./modules/exec.js";

const filename = jsonFileName;
const shFile = `${ scriptFileName }`;
const batchFile = `${ scriptFileName }.bat`;

export function getArrayFromObject(obj) {
  return Object.keys(obj).map(key => ({ key, value: obj[key] }));
}

function getCommands(platform, commands) {
  if (typeof commands === "string") {
    return commands;
  }
  if (typeof commands === "object") {
    return commands[platform] || "";
  }
  return "";
}

export async function createLinux(path) {
  try {
    if (existsSync(path)) {
      const file = join(path, filename);

      if (existsSync(file)) {
        const json = JSON.parse(readFileSync(file));
        const path = jsonManager.load().getSourcePath().split("/");
        let mkdirPath = "";

        const mkdir = path.map((_, i) => {
          mkdirPath += `${ path[i] }/`;
          return path[i] ? `mkdir -p ${ mkdirPath }` : "";
        }).filter(e => e);

        const content = `
          #!/bin/sh

          ${ mkdir.join("\n") }

          ${
            getArrayFromObject(json.dependencies || {}).map(({ value, key }) => `
              cd ${ json.source }
              if [ -d "${ key }" ]; then
                {tab}git -C ${ key } fetch -tap
                {tab}git -C ${ key } checkout ${ value.commit || value.version }
              else
                {tab}git clone -b ${ value.version } ${ value.link } ${ key }
                ${ value.commit ? `{tab}git -C ${ key } checkout ${ value.commit }` : "" }
              fi
              ${ getCommands("linux", value.commands) }
              cd ${ mkdir.map(_ => "..").join("/") }
            `.trim()).filter(e => !!e).join("\n\n")
          }
        `.trim().replace(/\s+$/gm, "").replace(/^\s+/gm, "").replace(/{tab}/gm, "\t");

        writeFileSync(shFile, content);

        if (process.platform === "linux") {
          await exec(`chmod +x ${ shFile }`);
        }
      }
    }
  } catch (e) {
    console.error("Shell script generation failed...");
  }
}

export function createWindows(path) {
  try {
    if (existsSync(path)) {
      const file = join(path, filename);

      if (existsSync(file)) {
        const json = JSON.parse(readFileSync(file));
        const path = jsonManager.load().getSourcePath().split("/");
        let mkdirPath = "";

        const mkdir = path.map((_, i) => {
          mkdirPath += `${ path[i] }`;
          const ret = path[i] ? `IF NOT EXIST ${ mkdirPath } @MKDIR ${ mkdirPath }` : "";
          mkdirPath += "\\";
          return ret;
        }).filter(e => e);

        const content = `
          echo off

          ${ mkdir.join("\n") }

          ${
            getArrayFromObject(json.dependencies || {}).map(({ value, key }) => `
              CD "${ json.source.split("/").map(e => e.replace(/\\/g, "")).join("\\") }"
              IF EXIST ${ key } (
                {tab}CALL git -C ${ key } fetch -tap
                {tab}CALL git -C ${ key } checkout ${ value.commit || value.version }
              ) ELSE (
                {tab}CALL git clone -b ${ value.version } ${ value.link } ${ key }
                ${ value.commit ? `{tab}CALL git -C ${ key } checkout ${ value.commit }` : "" }
              )
              ${ getCommands("win32", value.commands) }
              CD ${ mkdir.map(_ => "..").join("\\") }
            `.trim()).filter(e => !!e).join("\n\n")
          }
        `.trim().replace(/\s+$/gm, "").replace(/^\s+/gm, "").replace(/{tab}/gm, "\t");

        writeFileSync(batchFile, content);
      }
    }
  } catch (e) {
    console.error("Batch script generation failed...");
  }
}
