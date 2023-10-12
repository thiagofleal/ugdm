import { existsSync, mkdirSync } from "fs";
import { jsonManager } from "./consts.js";
import { installPackage } from "./install-package.js";
import { exec } from "./exec.js";
import { PATH } from "./consts.js";

export async function update(name) {
  console.log(`Updating "${ name }"...`);
	jsonManager.load();

	const path = jsonManager.load().getSourcePath().split("/");

	try {
    const content = jsonManager.content.dependencies[name];

    if (content) {
      let { link, version, commands, tag } = content;
      let mkdirPath = "";

      for (let i = 0; i < path.length; i++) {
        mkdirPath += `${ path[i] }/`;
        if (!existsSync(mkdirPath)) {
          mkdirSync(mkdirPath);
        }
      }
      if (tag) {
        const cmd = `git describe --tags --abbrev=0 $(git rev-list --branches=*${ version } --max-count=1)`;
        version = await exec(`git pull ${ link } --tags && git switch ${ version }`, {
          cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
        })
        version = await exec(cmd, {
          cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
        })
          .then(e => e.stdout.toString().trim())
          .catch(() => version);
      }
      const commit = await installPackage(name, link, version, void 0, commands);
      jsonManager.setDependency({
        name, link, version, commit: tag ? void 0 : commit, commands
      });
      jsonManager.save();
      console.log(`Package updated: ${ name }:"${ link }"@${ version }`);
    }
	} catch (e) {
    console.error(e);
		console.error(`Failed to update dependency "${ name }"`);
		process.exit(1);
	}
}
