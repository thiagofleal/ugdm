import { existsSync, mkdirSync } from "fs";
import { createInterface } from "readline";
import { jsonManager, PATH } from "./consts.js";
import { exec } from "./exec.js";
import { installPackage } from "./install-package.js";

function read(message) {
	const input = createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise(resolve => input.question(message, value => {
		resolve(value);
		input.close();
	}));
}

export async function add(name, link, version, commands) {
	if (!link) link = await read("Input the repository link: ");
	if (!version) version = (await read("Input the version to use [master]: ")) || "master";

  console.log(`Adding package "${ name }:'${ link }'@${ version }"...`);

	const path = jsonManager.load().getSourcePath().split("/");
	let mkdirPath = "";

	try {
		for (let i = 0; i < path.length; i++) {
			mkdirPath += `${ path[i] }/`;
			if (!existsSync(mkdirPath)) {
				mkdirSync(mkdirPath);
			}
		}
		const commit = await installPackage(name, link, version, void 0, commands);
		jsonManager.setDependency(name, link, version, commit, commands || "");
		jsonManager.save();
		console.log(`Package added: ${ name }:"${ link }"@${ version }`);
	} catch (e) {
		await exec(`rm -rf ${ name }`, {
			cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
		}).catch(() => null);
		console.error(`Failed to add: ${ name }:"${ link }"@${ version }`);
		process.exit(1);
	}
}
