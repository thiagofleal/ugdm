import { jsonManager, PATH } from "./consts.js";
import { exec } from "./exec.js";

export async function remove(name) {
  console.log(`Removing package "${name}"...`);
	jsonManager.load();
	jsonManager.removeDependency(name);
	jsonManager.save();

	try {
		await exec(`rm -rf ${ name }`, {
			cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
		});
		console.log(`Package removed: "${ name }"`);
	} catch (e) {
		console.error(`Fail to remove package: "${ name }"`);
		process.exit(1);
	}
}
