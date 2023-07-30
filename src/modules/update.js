import { existsSync, mkdirSync } from "fs";
import { jsonManager } from "./consts.js";
import { installPackage } from "./install-package.js";

export async function update(name) {
  console.log(`Updating "${ name }"...`);
	jsonManager.load();

	const path = jsonManager.load().getSourcePath().split("/");

	try {
    const content = jsonManager.content.dependencies[name];

    if (content) {
      const { link, version, commands } = content;
      let mkdirPath = "";

      for (let i = 0; i < path.length; i++) {
        mkdirPath += `${ path[i] }/`;
        if (!existsSync(mkdirPath)) {
          mkdirSync(mkdirPath);
        }
      }
      const commit = await installPackage(name, link, version, commands);
      jsonManager.setDependency(name, link, version, commit, commands || "");
      jsonManager.save();
      console.log(`Package updated: ${ name }:"${ link }"@${ version }`);
    }
	} catch (e) {
    console.error(e);
		console.error(`Failed to update dependency "${ name }"`);
		process.exit(1);
	}
}
