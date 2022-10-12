#!/usr/bin/env node

import { createInterface } from "readline";
import yargs from "yargs";
import { ManageJSON } from "./manage-json.js";

const PATH = process.cwd();


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

const options = yargs(process.argv)
	.option("i", {
		alias: "init",
		describe: "Initialize dependencies",
		type: "string"
	})
	.option("a", {
		alias: "add",
		describe: "Add dependency",
		type: "string"
	})
	.option("r", {
		alias: "remove",
		describe: "Remove repository",
		type: "string"
	})
	.option("b", {
		alias: "build",
		describe: "Build dependencies file",
		type: "void"
	})
	.argv;

const jsonManager = new ManageJSON(PATH);

async function add(name) {
	const link = await read("Input the repository link: ");
	const version = (await read("Input the version to use (master): ")) || "master";

	jsonManager.load();
	jsonManager.setDependency(name, link, version);
	jsonManager.save();
}

function remove(name) {
	jsonManager.load();
	jsonManager.removeDependency(name);
	jsonManager.save();
}

function init(source) {
	jsonManager.init(source);
	jsonManager.save();
}

if (options.i) {
	init(options.i);
}
if (options.a) {
	add(options.a);
}
if (options.r) {
	remove(options.r);
}
if (options.b) {
	// Build
}