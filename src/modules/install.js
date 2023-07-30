import { existsSync, mkdirSync } from "fs";
import { getArrayFromObject } from "../manage-script.js";
import { jsonManager } from "./consts.js";
import { installPackage } from "./install-package.js";

export async function install() {
  console.log("Installing dependencies...");
	jsonManager.load();

	const path = jsonManager.getSourcePath().split("/");

  try {
    await Promise.all(getArrayFromObject(jsonManager.content.dependencies).map(async e => {
      const name = e.key;
      let { link, version, commit, commands } = e.value;
      let mkdirPath = "";

      for (let i = 0; i < path.length; i++) {
        mkdirPath += `${ path[i] }/`;
        if (!existsSync(mkdirPath)) {
          mkdirSync(mkdirPath);
        }
      }
  		commit = await installPackage(name, link, version, commands);
      jsonManager.setDependency(name, link, version, commit, commands || "");
      jsonManager.save();
      console.log(`Package installed: ${ name }:"${ link }"@${ version }`);
    }));
	} catch (e) {
		console.error(`Failed to install dependencies`);
		process.exit(1);
	}
}
