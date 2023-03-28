import { existsSync, mkdirSync } from "fs";
import { createInterface } from "readline";
import { jsonManager, PATH } from "./consts.js";
import { exec } from "./exec.js";

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
	jsonManager.load();

	const path = jsonManager.load().getSourcePath().split("/");
	let mkdirPath = "";

	try {
		for (let i = 0; i < path.length; i++) {
			mkdirPath += `${ path[i] }/`;
			if (!existsSync(mkdirPath)) {
				mkdirSync(mkdirPath);
			}
		}
		await exec(`git clone ${ link } ${ name }`, {
			cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
		});
		await exec(`git checkout ${ version }`, {
			cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
		});
		const ret = await exec("git rev-parse HEAD", {
			cwd: `${ PATH }/${ jsonManager.getSourcePath() }/${ name }`
		});
		const commit = ret.stdout.toString().trim();
		jsonManager.setDependency(name, link, version, commit, commands || "");
		jsonManager.save();
		console.log(`Package added: ${ name }:"${ link }"@${ version }`);
	} catch (e) {
		await exec(`rm -rf ${ name }`, {
			cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
		});
		console.error(`Failed to add: ${ name }:"${ link }"@${ version }`);
		process.exit(1);
	}
}
