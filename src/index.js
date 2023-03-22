#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { init, add, remove, build } from "./modules/index.js";

yargs(hideBin(process.argv))
	.scriptName("ugdm")
	.usage("$0 <cmd> [args]")
	.command("init", "Initialize GIT dependencies", {
		path: {
			alias: "p",
			description: "Path to save dependencies",
			type: "string",
			default: "vendor/"
		}
	}, args => {
		init(args.path);
	})
	.command("add [name]", "Add GIT dependency", {
		link: {
			alias: "l",
			description: "Repository link",
			type: "string"
		},
		"checkout-version": {
			alias: "v",
			description: "Dependency version (branch | tag | commit)",
			type: "string"
		},
		commands: {
			alias: "c",
			description: "Commands to execute after install",
			type: "string"
		}
	}, args => {
		add(args.name, args.link, args["checkout-version"], args.commands);
	})
	.command("remove [name]", "Remove GIT dependency", {}, args => {
		remove(args.name);
	})
	.command("install", "Install GIT dependencies", {}, args => {})
	.command("build", "Generate shell script to install dependencies", {}, args => {
		build();
	})
	.command("config", "Configure environment", {}, args => {})
	.argv;
