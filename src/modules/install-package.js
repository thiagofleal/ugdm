import { existsSync } from "fs";
import { PATH, jsonManager } from "./consts.js";
import { exec } from "./exec.js";

export async function installPackage(name, link, version, commit, commands) {
  jsonManager.load();

  if (existsSync(`${ PATH }/${ jsonManager.getSourcePath() }/${ name }`)) {
    await exec(`git reset --hard HEAD && git fetch ${ link }`);
  } else {
    await exec(`git clone ${ link } ${ name }`, {
      cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
    });
  }
  await exec(`git checkout ${ version }`, {
    cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
  });

  if (commit) {
    await exec(`git checkout ${ commit }`);
  } else {
    const ret = await exec("git rev-parse HEAD", {
      cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
    });
    commit = ret.stdout.toString().trim();
  }
  if (commands) {
    let cmd = null;

    if (typeof commands === "string") {
      cmd = commands;
    } else if (commands[process.platform]) {
      cmd = commands[process.platform]
    }
    if (cmd) {
      await exec(cmd, {
        cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
      });
    }
  }
  return commit;
}
