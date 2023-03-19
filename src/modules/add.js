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
	jsonManager.setDependency(name, link, version, commands || "");
	jsonManager.save();

	const path = jsonManager.load().getSourcePath().split("/");
	let mkdirPath = "";

	try {
		for (let i = 0; i < path.length; i++) {
			mkdirPath += `${ path[i] }/`
			await exec(`mkdir -p ${ mkdirPath }`);
		}
		await exec(`git clone ${ link } ${ name } && cd ${ name } && git checkout ${ version }`, {
			cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
		});
		console.log(`Package added: ${ name }:"${ link }"@${ version }`);
	} catch (e) {
		await exec(`rm -rf ${ name }`, {
			cwd: `${ PATH }/${ jsonManager.getSourcePath() }`
		});
		console.error(`Failed to add: ${ name }:"${ link }"@${ version }`);
		process.exit(1);
	}
}
