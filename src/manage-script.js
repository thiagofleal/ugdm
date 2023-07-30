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

function getCommands(platform, dependency) {
  if (typeof dependency.value.commands === "string") {
    return dependency.value.commands;
  }
  if (typeof dependency.value.commands === "object") {
    return dependency.value.commands[platform] || "";
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
          #!/bin/bash

          ${ mkdir.join("\n") }

          ${
            getArrayFromObject(json.dependencies || {}).map(dependency => `
              cd ${ json.source }
              git clone ${ dependency.value.link } ${ dependency.key }
              cd ${ dependency.key }
              git fetch ${ dependency.value.link } && git checkout ${ dependency.value.version }
              git pull ${ dependency.value.link } ${ dependency.value.version }
              git checkout ${ dependency.value.commit }
              ${ getCommands("linux", dependency) }
              cd ${ mkdir.map(_ => "..").join("/") }
            `.trim()).join("\n\n")
          }
        `.trim().replace(/\s+$/gm, "").replace(/^\s+/gm, "");

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
            getArrayFromObject(json.dependencies || {}).map(dependency => `
              CD ${ json.source }
              CALL git clone ${ dependency.value.link } ${ dependency.key }
              CD ${ dependency.key }
              CALL git fetch ${ dependency.value.link }
              CALL git checkout ${ dependency.value.version }
              CALL git pull ${ dependency.value.link } ${ dependency.value.version }
              CALL git checkout ${ dependency.value.commit }
              ${ getCommands("win32", dependency) }
              CD ${ mkdir.map(_ => "..").join("/") }
            `.trim()).join("\n\n")
          }
        `.trim().replace(/\s+$/gm, "").replace(/^\s+/gm, "");

        writeFileSync(batchFile, content);
      }
    }
  } catch (e) {
    console.error("Batch script generation failed...");
  }
}
