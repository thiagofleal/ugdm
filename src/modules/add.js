import { createInterface } from "readline";
import { jsonManager } from "./consts.js";

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
  console.log(`Package added: ${ name }:"${ link }"@${ version }`);
}
