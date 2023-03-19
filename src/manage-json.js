import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { jsonFileName } from "./const.js";

export class ManageJSON {
  constructor(path) {
    this.path = path || __dirname;
    this.file = jsonFileName;
    this.fileName = join(this.path, this.file);
    this.content = {};
  }

  load() {
    if (existsSync(this.fileName)) {
      const content = readFileSync(this.fileName);
      this.content = JSON.parse(content)
    }
    return this;
  }

  save() {
    writeFileSync(this.fileName, JSON.stringify(this.content, null, 2));
  }

  init(source) {
    this.content.source = source;
  }

  setDependency(name, link, version, commands) {
    if (!this.content.dependencies) {
      this.content.dependencies = Object.create(null);
    }
    this.content.dependencies[name] = { link, version, commands };
  }

  removeDependency(name) {
    if (this.content.dependencies) {
      delete this.content.dependencies[name];
    }
  }

  getSourcePath() {
    return this.content ? this.content.source || "" : "";
  }
}