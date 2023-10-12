import { existsSync } from "fs";
import { PATH, jsonManager } from "./consts.js";
import { exec } from "./exec.js";

export async function installPackage(name, link, version, commit, commands) {
  jsonManager.load();

  const path = `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`;

  if (existsSync(path)) {
    await exec(`git reset --hard HEAD && git fetch ${ link }`, {
      cwd: path
    });
  } else {
    await exec(`git clone ${ link } ${ name }`, {
      cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
    });
  }
  await exec(`git checkout ${ version }`, {
    cwd: path
  });

  if (commit) {
    await exec(`git checkout ${ commit }`, {
      cwd: path
    });
  } else {
    const ret = await exec("git rev-parse HEAD", {
      cwd: path
    });
    commit = ret.stdout.toString().trim();
  }
  const isTag = await exec(`git show-ref --verify refs/tags/${ version }`, { cwd: path })
    .then(e => e.stdout.toString() ? true : false)
    .catch(() => false);
  
  if (isTag) {
    commit = version;
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
