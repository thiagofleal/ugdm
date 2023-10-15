#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { init, add, remove, build, install, update } from "./modules/index.js";

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
	.command("install", "Install GIT dependencies", {}, args => {
		install();
	})
	.command("update [name]", "Update dependency version", {
		tag: {
			alias: "t",
			description: "Use tag",
			type: "boolean"
		},
		branch: {
			alias: "b",
			description: "Branch to get version",
			type: "string"
		}
	}, args => {
		update(args.name, args.tag, args.branch);
	})
	.command("build [os]", "Generate shell script to install dependencies", {}, args => {
		build(args.os);
	})
	.command("config", "Configure environment", {}, args => {})
	.argv;
