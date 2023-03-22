import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { jsonFileName, shFileName } from "./const.js";
import { jsonManager } from "./modules/consts.js";

const filename = jsonFileName;
const shFile = shFileName;

function getArrayFromObject(obj) {
  return Object.keys(obj).map(key => ({ key, value: obj[key] }));
}

export function createSh(path) {
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
        #!/usr/bin/env bash

        ${ mkdir.join("\n") }

        ${
          getArrayFromObject(json.dependencies || {}).map(dependency => `
            cd ${ json.source }
            git clone ${ dependency.value.link } ${ dependency.key }
            cd ${ dependency.key }
            git fetch ${ dependency.value.link } && git checkout ${ dependency.value.version }
            git pull ${ dependency.value.link } ${ dependency.value.version }
            git checkout ${ dependency.value.commit }
            ${ dependency.value.commands || "" }
            cd ${ mkdir.map(_ => "..").join("/") }
          `.trim()).join("\n\n")
        }
      `.trim().replace(/\s+$/gm, "").replace(/^\s+/gm, "");

      writeFileSync(shFile, content);
    }
  }
}
