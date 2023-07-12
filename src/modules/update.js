import { existsSync, mkdirSync } from "fs";
import { PATH, jsonManager } from "./consts.js";
import { exec } from "./exec.js";

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
      if (!existsSync(`${ PATH }/${ jsonManager.getSourcePath() }/${ name }`)) {
        await exec(`git clone ${ link } ${ name }`, {
          cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
        });
      }
      await exec(`git reset --hard && git fetch ${ link } && git pull && git checkout ${ version }`, {
        cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
      });
      const ret = await exec("git rev-parse HEAD", {
        cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
      });
      const commit = ret.stdout.toString().trim();
      jsonManager.setDependency(name, link, version, commit, commands || "");
      jsonManager.save();
      console.log(`Package installed: ${ name }:"${ link }"@${ version }`);
    }
	} catch (e) {
		console.error(`Failed to update dependency "${ name }"`);
		process.exit(1);
	}
}
