import { existsSync, mkdirSync } from "fs";
import { getArrayFromObject } from "../manage-script.js";
import { PATH, jsonManager } from "./consts.js";
import { exec } from "./exec.js";

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
      if (!existsSync(`${ PATH }/${ jsonManager.getSourcePath() }/${ name }`)) {
        await exec(`git clone ${ link } ${ name }`, {
          cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
        });
      }
      await exec(`git checkout ${ version }`, {
        cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
      });
      if (commit) {
        await exec(`git checkout ${ commit }`, {
          cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
        });
      } else {
        const ret = await exec("git rev-parse HEAD", {
          cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
        });
        commit = ret.stdout.toString().trim();
      }
      if (commands) {
        await exec(commands, {
          cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
        });
      }
      jsonManager.setDependency(name, link, version, commit, commands || "");
      jsonManager.save();
      console.log(`Package installed: ${ name }:"${ link }"@${ version }`);
    }));
	} catch (e) {
		console.error(`Failed to install dependencies`);
		process.exit(1);
	}
}
