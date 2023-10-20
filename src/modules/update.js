import { existsSync, mkdirSync } from "fs";
import { jsonManager } from "./consts.js";
import { installPackage } from "./install-package.js";
import { exec } from "./exec.js";
import { PATH } from "./consts.js";

export async function update(name, tag, branch) {
  console.log(`Updating "${ name }"...`);
	jsonManager.load();

	const path = jsonManager.load().getSourcePath().split("/");

	try {
    const content = jsonManager.content.dependencies[name];

    if (content) {
      let { link, version, commands } = content;
      let mkdirPath = "";

      for (let i = 0; i < path.length; i++) {
        mkdirPath += `${ path[i] }/`;
        if (!existsSync(mkdirPath)) {
          mkdirSync(mkdirPath);
        }
      }
      if (tag) {
        const cmd = `git describe --tags --abbrev=0 $(git rev-list --branches=*${ branch } --max-count=1)`;

        await exec(`git fetch ${ link } -tap`, {
          cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
        });
        if (branch) {
          await exec(`git switch ${ branch } && git pull --tags`, {
            cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
          });
        } else {
          await exec(`git checkout HEAD && git pull --tags`, {
            cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
          });
        }
        version = await exec(cmd, {
          cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
        })
          .then(e => e.stdout.toString().trim())
          .catch(() => version);
      } else if (branch) {
        version = branch;
      }
      const commit = await installPackage(name, link, version, void 0, commands);

      jsonManager.setDependency({
        name, link, version, commit: tag || commit === version ? void 0 : commit, commands
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
