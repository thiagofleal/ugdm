import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { jsonFileName, shFileName } from "./const.js";

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

      const content = `
        #!/usr/bin/env bash

        cd ${path}
        mkdir -p ${json.source}

        ${
          getArrayFromObject(json.dependencies || {}).map(dependency => `
            cd ${json.source}
            git clone ${dependency.value.link} ${dependency.key}
            cd ${dependency.key}
            git fetch ${dependency.value.link} && git checkout ${dependency.value.version}
            git pull ${dependency.value.link} ${dependency.value.version}
            cd ${path}
          `.trim()).join("\n\n")
        }
      `.trim().replace(/\s+$/gm, "").replace(/^\s+/gm, "");

      writeFileSync(shFile, content);
    }
  }
}
