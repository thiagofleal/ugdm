import { jsonManager } from "./consts.js";

export function remove(name) {
  console.log(`Removing package "${name}"...`);
	jsonManager.load();
	jsonManager.removeDependency(name);
	jsonManager.save();
  console.log(`Package removed: "${name}"`);
}
